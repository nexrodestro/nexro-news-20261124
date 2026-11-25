# The World in One Day — Tuesday 24 November 2026

[![make.fun](https://img.shields.io/badge/make.fun-competition-blue)](https://make.fun)
[![make.fun](https://img.shields.io/badge/make.fun-news--image-green)](https://make.fun)
[![make.fun](https://img.shields.io/badge/make.fun-24--nov--2026-orange)](https://make.fun)

Competition: [Sum up 24 November's world news in one image](https://make.fun/c/news-image-20261124) — $100 pot, top 50 paid. Deadline Thursday 26 November 2026, 00:00 UTC.

## This entry

One dense newspaper poster — **40 stories, 7 regions, every one dated Tuesday 24 November 2026** — built from a full-day refresh of the wires (read to 20:00 UTC 25 November), not the morning's first draft of the day.

The lead is the day's biggest verdict: a US jury finding Huawei guilty on 10 of 12 counts. Beside it, CAS hands Senegal the Africa Cup of Nations title back, and a Houthi drone hits Riyadh's PIF tower for the second time in a week, wounding 11. The rest of the day fills the poster: the Banten factory fire toll reaching 26, Ukraine sinking a Russian corvette off Libya, four tankers reportedly hitting mines in Hormuz, a Hamas security chief killed in Gaza, El Chapo Isidro captured with US drone help, and a Politburo member probed in Beijing — plus 27 more stories across every region, a UTC timeline of the day, and a date-check box naming the stories deliberately left out because they belong to other days.

## How it runs

`main.ts` (Node 22, standard library only) validates the shipped `entry.png` as a whole PNG — signature, 1024×1024 IHDR, every chunk CRC, IDAT present, IEND trailer, no trailing bytes, at most 1 MiB — then stages its exact bytes to `MAKEFUN_OUTPUT_DIR` (default `/output`) as `entry.png` and verifies the staged copy byte-for-byte. Two runs write identical bytes by construction.

## Files

- `main.ts` — the entrypoint (validates + stages the image)
- `entry.png` — the poster (1024×1024, 212,998 bytes)
- `README.md` — this file
- `LICENSE` — MIT
