import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const [, , inputPath, outputPath = "data/boards.json"] = process.argv;
if (!inputPath) {
  console.error("Usage: node scripts/build-boards.mjs <combined TSV path> [output JSON path]");
  process.exit(1);
}

const source = await readFile(resolve(inputPath), "utf8");
const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/);
const headings = lines.shift().split("\t");
const column = Object.fromEntries(headings.map((name, index) => [name, index]));
const episodes = new Map();

for (const line of lines) {
  if (!line || !line.startsWith("1\t")) continue;
  const fields = line.split("\t");
  if (fields.length !== headings.length) continue;
  const value = Number(fields[column.clue_value]);
  const category = fields[column.category].trim();
  const clue = fields[column.answer].trim();
  const response = fields[column.question].trim();
  const date = fields[column.air_date].trim();
  if (!date || !category || !clue || !response || !Number.isFinite(value) || value <= 0) continue;
  if (/<(?:a|img|audio|video)\b/i.test(clue) || /\b(?:seen|shown|heard) here\b/i.test(clue)) continue;

  const episode = episodes.get(date) ?? new Map();
  const clues = episode.get(category) ?? [];
  if (!clues.some((item) => item.value === value)) clues.push({ value, clue, response });
  episode.set(category, clues); episodes.set(date, episode);
}

const candidates = [];
for (const [date, categories] of episodes) {
  const complete = [...categories.entries()].filter(([, clues]) => clues.length >= 5);
  if (complete.length < 6) continue;
  const groups = complete.slice(0, 6).map(([category, clues]) => ({
    category,
    clues: clues.sort((a, b) => a.value - b.value).slice(0, 5).map((item, index) => [
      (index + 1) * 200,
      item.clue,
      [item.response]
    ])
  }));
  candidates.push({ date, categories: groups });
}

// Keep a broad, deterministic sample spanning the full archive without shipping the 60 MB source file.
const boardLimit = 240;
const step = Math.max(1, candidates.length / boardLimit);
const boards = Array.from({ length: Math.min(boardLimit, candidates.length) }, (_, index) => candidates[Math.floor(index * step)]);
const destination = resolve(outputPath);
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, JSON.stringify({ source: "jwolle1/jeopardy_clue_dataset v42", generatedAt: "2026-09-05", boards }), "utf8");
console.log(`Wrote ${boards.length} boards (${boards.length * 30} clues) from ${candidates.length} complete rounds to ${destination}`);
