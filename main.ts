// nexro-news-20261124 — entrypoint (Node 22, standard library only).
// Validates the shipped entry.png as a whole PNG, then stages its exact bytes
// to MAKEFUN_OUTPUT_DIR (default /output) as entry.png and verifies the copy
// byte-for-byte. No network, no randomness, no timestamps in the output:
// two runs write identical bytes by construction.

import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1048576;
const EXPECTED_WIDTH = 1024;
const EXPECTED_HEIGHT = 1024;

function fail(message: string): never {
  console.error("entry failed: " + message);
  process.exit(1);
}

function crc32(buf: Buffer): number {
  let table = (crc32 as unknown as { table?: Uint32Array }).table;
  if (!table) {
    table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c >>> 0;
    }
    (crc32 as unknown as { table: Uint32Array }).table = table;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function validatePng(data: Buffer): void {
  if (data.length > MAX_BYTES) {
    fail("entry.png is " + data.length + " bytes, over the 1 MiB limit");
  }
  if (data.length < 8 || !data.subarray(0, 8).equals(PNG_SIGNATURE)) {
    fail("entry.png does not start with the PNG signature");
  }
  let offset = 8;
  let sawIhdr = false;
  let sawIdat = false;
  let sawIend = false;
  // The first chunk of a well-formed PNG is always IHDR.
  if (data.length >= 16 && data.toString("latin1", 12, 16) !== "IHDR") {
    fail("first PNG chunk is not IHDR");
  }
  while (offset + 8 <= data.length) {
    const length = data.readUInt32BE(offset);
    const type = data.toString("latin1", offset + 4, offset + 8);
    const chunkEnd = offset + 8 + length + 4;
    if (chunkEnd > data.length) {
      fail("truncated PNG chunk " + type);
    }
    const storedCrc = data.readUInt32BE(offset + 8 + length);
    const actualCrc = crc32(data.subarray(offset + 4, offset + 8 + length));
    if (storedCrc !== actualCrc) {
      fail("bad CRC in PNG chunk " + type);
    }
    if (type === "IHDR") {
      if (sawIhdr) {
        fail("duplicate IHDR chunk");
      }
      sawIhdr = true;
      if (length !== 13) {
        fail("IHDR has wrong length");
      }
      const width = data.readUInt32BE(offset + 8);
      const height = data.readUInt32BE(offset + 12);
      if (width !== EXPECTED_WIDTH || height !== EXPECTED_HEIGHT) {
        fail("IHDR declares " + width + "x" + height + ", expected 1024x1024");
      }
    }
    if (type === "IDAT") {
      sawIdat = true;
    }
    if (type === "IEND") {
      sawIend = true;
      if (length !== 0) {
        fail("IEND chunk is not empty");
      }
      if (chunkEnd !== data.length) {
        fail("trailing bytes after IEND");
      }
      break;
    }
    offset = chunkEnd;
  }
  if (!sawIhdr) {
    fail("missing IHDR chunk");
  }
  if (!sawIdat) {
    fail("missing IDAT chunk");
  }
  if (!sawIend) {
    fail("missing IEND trailer");
  }
}

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const source = join(here, "entry.png");
  let data: Buffer;
  try {
    data = readFileSync(source);
  } catch {
    fail("cannot read entry.png beside main.ts");
  }
  validatePng(data);
  const sha = createHash("sha256").update(data).digest("hex");
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const dest = join(outDir, "entry.png");
  copyFileSync(source, dest);
  const staged = readFileSync(dest);
  if (!staged.equals(data)) {
    fail("staged copy differs from entry.png");
  }
  const stagedSha = createHash("sha256").update(staged).digest("hex");
  if (stagedSha !== sha) {
    fail("staged sha256 mismatch");
  }
  console.log("entry.png staged: " + data.length + " bytes sha256=" + sha);
}

main();
