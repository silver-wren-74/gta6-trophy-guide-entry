# Leonida Platinum — GTA VI Trophy Guide & Tracker

![Competition](https://make.fun/badge/gta6-trophy-guide-01.svg)
![Rank](https://make.fun/badge/gta6-trophy-guide-01/silver-wren-74/gta6-trophy-guide-entry/rank.svg)
![Reward](https://make.fun/badge/gta6-trophy-guide-01/silver-wren-74/gta6-trophy-guide-entry/reward.svg)

Entered on make.fun — bounty: [gta6-trophy-guide-01 — "Build the best GTA 6 trophy guide"](https://make.fun/bounty/gta6-trophy-guide-01)

## What this is

An offline web app that guides and tracks all **55 PlayStation 5 trophies of
Grand Theft Auto VI** (1 Platinum, 2 Gold, 6 Silver, 46 Bronze). Open it,
disconnect from the network, and everything still works — the app loads only
its own files.

For every trophy you get:

- the official name, description and grade, shown exactly as published;
- a guide written for this tracker in its own words — what to do, where and
  how, and when it can be missed — with its sources named on the card
  (PowerPyx, GTABase, Push Square, KeenGamer and GTAScoop, accessed
  20 November 2026);
- an honest flag where a requirement is still **unconfirmed** (5 trophies):
  the card reports what is known so far and invents no steps.

Around the guides sits a full tracker:

- **Checklist** saved in the browser (localStorage), with **export** to a
  JSON file and **import** back, plus a reset;
- **Filters** by grade, by kind (story, side missions, activities, crime,
  collectibles, completion, unconfirmed), by earned status or missable only,
  and a free-text search;
- A **spoiler shield** that hides story trophy names, descriptions and
  guides until you have earned them;
- A six-stage **roadmap to the Platinum** as a timeline, built from the
  official descriptions and counts (chapters and missions, 42 shooting-range
  challenges, 14 drone-race locations, 9 gangs, 52 areas, and more);
- The one **missable** trophy — Positive Mental Attitude, with its Chapter 1
  meditation spot at Jason's home — flagged in the header, on its card, in
  the roadmap and in the filters;
- A progress header with a ring, a total count (x of 55) and per-grade bars.

The look is an original Leonida-sunset design (dusk violet, sunset orange,
lagoon teal) drawn entirely in CSS. No Rockstar Games logo, artwork or game
screenshots are used anywhere.

## Run it

Preview locally with the small bundled server (Node 22):

```sh
node serve.ts
# then open http://localhost:8080
```

Or hand the entry in the way the grader does:

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/app/, out/screenshots/ and out/dossier.json
```

Any static file server pointed at `app/` works just as well — there is no
build step. A `?demo=1` link seeds sample progress in memory only, for trying
the filters; a normal visit always starts from your real saved checklist.

## Layout

- `app/` — the guide itself: `index.html`, `app.js`, `style.css`, and
  `app/data/trophies.json` with all 55 trophies and their guides.
- `main.ts` — copies `app/` and `screenshots/` to the output directory and
  writes `dossier.json` with the vendored make.fun library.
- `serve.ts` — a tiny local static server for `app/`.
- `screenshots/` — real renders of this app in Chrome at 1280×800;
  `shots.json` records which view each one shows.
- `vendor/makefun-frontend.ts` — the kit's library, kept byte-identical as
  the bounty rules require.

## License

MIT — see [LICENSE](LICENSE).
