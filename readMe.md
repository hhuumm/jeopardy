# Jeopardy! Home Edition

A modern, single-player Jeopardy-style browser game with timed responses, scorekeeping, Daily Doubles, sound effects, and keyboard-friendly controls.

## Run locally

Serve the repository with any static web server, then open the printed local URL. For example:

```sh
python -m http.server 4173
```

## Clue archive

The game ships with 240 complete boards containing 7,200 clues. They were derived from version 42 of the [jwolle1 Jeopardy clue dataset](https://github.com/jwolle1/jeopardy_clue_dataset), spanning Seasons 1–42 through July 2026. Historical dollar values are normalized to the current $200–$1,000 board. The hand-written board in `js/nap.js` remains available as an offline fallback if `data/boards.json` cannot load.

To regenerate the bundled boards from the source TSV:

```sh
node scripts/build-boards.mjs path/to/combined_season1-42.tsv data/boards.json
```

The upstream dataset states that its clue data belongs to Jeopardy Productions, Inc. and should not be used in a public-facing product. This project uses it for local, personal play.
