// nexro-news-20261124 — entrypoint.
// Node 22, standard library only. Pure JavaScript (no TS syntax) so it runs
// under the harness's .ts handling as-is. No network, no randomness, no clock.
// It validates the shipped entry.png and stages its EXACT bytes to the output
// directory, so the two grader runs produce identical bytes by construction.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 1048576;
const WANT_W = 1024;
const WANT_H = 1024;

function fail(msg) {
  console.error("main.ts: " + msg);
  process.exit(1);
}

// CRC-32 (PNG chunk checksums), table built at startup, no dependencies.
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

// Validate that buf is one whole PNG: signature, IHDR declaring 1024x1024,
// every chunk well-formed with a valid CRC, and a proper IEND trailer.
function validatePng(buf, label) {
  if (buf.length < 8 || !buf.subarray(0, 8).equals(PNG_SIG)) fail(label + ": bad PNG signature");
  if (buf.length > MAX_BYTES) fail(label + ": " + buf.length + " bytes, over 1 MiB");
  let off = 8;
  let sawIhdr = false;
  let sawIend = false;
  let sawIdat = false;
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const dataStart = off + 8;
    const dataEnd = dataStart + len;
    if (dataEnd + 4 > buf.length) fail(label + ": truncated chunk " + type);
    const stored = buf.readUInt32BE(dataEnd);
    const computed = crc32(buf.subarray(off + 4, dataEnd));
    if (stored !== computed) fail(label + ": bad CRC in chunk " + type);
    if (type === "IHDR") {
      sawIhdr = true;
      if (len !== 13) fail(label + ": bad IHDR length");
      const w = buf.readUInt32BE(dataStart);
      const h = buf.readUInt32BE(dataStart + 4);
      if (w !== WANT_W || h !== WANT_H) fail(label + ": IHDR is " + w + "x" + h + ", want 1024x1024");
    }
    if (type === "IDAT") sawIdat = true;
    if (type === "IEND") {
      sawIend = true;
      if (len !== 0) fail(label + ": bad IEND length");
      if (dataEnd + 4 !== buf.length) fail(label + ": trailing bytes after IEND");
      break;
    }
    off = dataEnd + 4;
  }
  if (!sawIhdr) fail(label + ": missing IHDR");
  if (!sawIdat) fail(label + ": missing IDAT");
  if (!sawIend) fail(label + ": missing IEND");
}

// Locate entry.png beside this file, validate it, stage its exact bytes.
const here = dirname(fileURLToPath(import.meta.url));
const srcPath = join(here, "entry.png");
if (!existsSync(srcPath)) fail("entry.png not found beside main.ts");
const srcStat = statSync(srcPath);
if (!srcStat.isFile()) fail("entry.png is not a file");
const src = readFileSync(srcPath);
validatePng(src, "entry.png");
const digest = sha256(src);
console.log("entry.png: " + src.length + " bytes sha256=" + digest);

// Stage to the output directory (MAKEFUN_OUTPUT_DIR, default /output).
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.png");
copyFileSync(srcPath, outPath);

// Re-read the staged copy and verify it matches byte-for-byte.
const staged = readFileSync(outPath);
if (!staged.equals(src)) fail("staged copy differs from entry.png");
validatePng(staged, "staged entry.png");
if (sha256(staged) !== digest) fail("staged sha256 mismatch");
console.log("staged " + outPath + ": " + staged.length + " bytes sha256=" + digest);
console.log("OK");
