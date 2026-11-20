[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Riaking89/gta6-trophy-guide-ria/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Riaking89/gta6-trophy-guide-ria/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Vice City Trophy Tracker — GTA VI trophy guide

An offline guide and tracker for all 55 Grand Theft Auto VI trophies on
PlayStation 5 (1 platinum, 2 gold, 6 silver, 46 bronze). Every trophy shows
its official name, description and grade as PlayStation publishes it, plus a
guide written in our own words that names its sources — what to do, where
and how, and when it can be missed.

## What it does

- **Checklist tracker** — tick trophies off; progress is saved in the
  browser (localStorage) and can be exported to a JSON file and imported
  back. No account, no network.
- **Four-stage roadmap to the platinum** — about 200 hours, difficulty
  4/10: story first, then side missions, then activities, then cleanup.
  No mission replay is needed; cheats disable trophies, so keep them off.
- **Filters** — by grade, kind (story, side, activities, collectibles,
  combat, exploration, money), roadmap stage, and missable only. The game
  lists no online trophies, so the online filter is an honest empty state.
- **Spoiler setting** — the 12 story trophies stay hidden (name and
  description) until they are earned, unless you switch spoilers on.
- **One missable trophy** — Positive Mental Attitude: meditate at the
  Chapter 1 balcony spot before the chapter ends. It is flagged in red
  everywhere it appears.
- **Honest about the unknown** — 5 trophies have no confirmed exact trigger
  yet (Bad Luck, I Guess; The Truth Is Out There; Ten Pin; In The
  Beginning…; Capital Offense) and 2 are partly unconfirmed (Catch Me If
  You Can; Challenging Tank). Their guides say so and give the best-known
  approach instead of inventing steps.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or open `app/index.html` from any static server with `app/` at its root.
The app fetches nothing from the network: its only request is its own
`app/data/trophies.json`.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored make.fun library
(`vendor/makefun-frontend.ts`, the kit's copy, unchanged).

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the tracker app.
- `app/data/trophies.json` — the 55 trophies with guides, steps, sources,
  kind, stage, spoiler and missable flags.
- `screenshots/` — 4 screenshots of the guide running (cover, silver
  filter, spoiler mode, an open guide).
- `main.ts` — builds the submission output. `serve.ts` — local dev server.

## Notes

Unofficial fan guide. Grand Theft Auto and GTA are trademarks of Take-Two
Interactive; this guide uses no Rockstar artwork, logos or game screenshots.
Trophy names and descriptions are shown as PlayStation publishes them.
