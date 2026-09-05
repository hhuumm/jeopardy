# Jeopardy! Home Edition

A modern Jeopardy-style browser game with solo play and synchronized multiplayer rooms. Multiplayer includes first-buzzer locking, server-owned scores and timers, Daily Doubles, reconnect support, and host controls.

## Run locally

Install the single WebSocket dependency and start the game server:

```sh
npm install
npm start
```

Open `http://localhost:4173`. To test multiplayer, create a room in one browser or device and join its four-letter code from another. Devices on the same network can use the host computer's local IP address followed by `:4173`.

## Hosting multiplayer

The app requires a Node.js host with WebSocket support; a static-only host such as GitHub Pages cannot run multiplayer rooms. Deploy the repository as one web service with `npm install` as the build command and `npm start` as the start command. The server respects the host's `PORT` environment variable and exposes `/health` for health checks. No secrets or database are required for the current ephemeral-room version.

Rooms live in server memory and are intended for active game sessions. A server restart clears active rooms but does not affect the clue archive.

## Clue archive

The game ships with 240 complete boards containing 7,200 clues. They were derived from version 42 of the [jwolle1 Jeopardy clue dataset](https://github.com/jwolle1/jeopardy_clue_dataset), spanning Seasons 1–42 through July 2026. Historical dollar values are normalized to the current $200–$1,000 board. The hand-written board in `js/nap.js` remains available as an offline fallback if `data/boards.json` cannot load.

To regenerate the bundled boards from the source TSV:

```sh
node scripts/build-boards.mjs path/to/combined_season1-42.tsv data/boards.json
```

The upstream dataset states that its clue data belongs to Jeopardy Productions, Inc. and should not be used in a public-facing product. This project uses it for local, personal play.
