# nexro-news-20261124

One image summing up the world's news of **Tuesday 24 November 2026**,
built for the make.fun competition `news-image-20261124`
($100 pot, top 50 share; deadline Thu 26 Nov 2026 07:00 WIB).

## The image

A dense one-day newspaper poster, 1024x1024 PNG, **40 stories across 7
regions** — every one dated Tuesday 24 November 2026:

- **Masthead + date title** — "Tuesday 24 November 2026" in 62px serif,
  the poster's 300px anchor.
- **Number strip** — six real numbers from the day: 24 dead in the Banten
  factory fire, 25 seafarers killed near Hormuz, Pant's 128 vs New Zealand,
  Lahore AQI 500+, 78 drones in the IRGC claim, 450 German schools hit by
  bomb threats.
- **Region bar** — Asia-Pacific 13, Europe 8, Middle East 6, Americas 6,
  Africa 2, Oceania 1, World 4 (sums to 40).
- **3 big illustrated cards** — the Banten rescue goes on; CAS rules on the
  AFCON title today; 'El Chapo Isidro' to face trial in Mexico.
- **10 medium illustrated cards** — N. Korea vs Swiss sanctions, Russia's
  Estonia warning, the Hormuz toll, Gaza, the burning cargo ship off
  Finland, the Kyiv drone strike, Denmark's 'ghetto law' ruling,
  Tajikistan leaving the ICC, the flogged Iranian singers, and the US
  appeals court opening a path for Trump.
- **27 more stories** in a dense two-column list, plus a schematic world
  map with numbered pins 1–13 matching the illustrated cards.
- **Date-check box** — the verification method and the stories deliberately
  left out because they belong to other days: the India–Nepal train launch
  (23 Nov), Nvidia reinstating Huang (23 Nov), COP31 ending with no deal
  (22 Nov).

All 13 card scenes are flat illustrations drawn from geometric shapes in
each region's palette. No photos, no downloaded images, no network.

## How the entry works

`main.ts` (Node 22, standard library only, no TypeScript syntax) validates
the shipped `entry.png` — PNG signature, IHDR declaring 1024x1024, every
chunk's CRC, a proper IEND trailer, at most 1 MiB — computes its sha256,
and stages its exact bytes to `$MAKEFUN_OUTPUT_DIR` (default `/output`)
as `entry.png`, re-reading the staged copy to verify it matches
byte-for-byte. The two grader runs therefore produce identical bytes by
construction. The poster itself was drawn offline with a local PIL script
(`draw.py`, build tool, not part of the entry).

## License

MIT — see `LICENSE`.
