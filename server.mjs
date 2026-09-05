import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, randomUUID } from "node:crypto";
import { WebSocketServer, WebSocket } from "ws";

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4173;
const archive = JSON.parse(await readFile(join(ROOT, "data", "boards.json"), "utf8"));
const rooms = new Map();
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".mp3": "audio/mpeg" };

function cleanName(value) { return String(value || "Contestant").replace(/[^a-z0-9 _'-]/gi, "").trim().slice(0, 18) || "Contestant"; }
function roomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code;
  do { code = Array.from(randomBytes(4), (byte) => alphabet[byte % alphabet.length]).join(""); } while (rooms.has(code));
  return code;
}
function normalizeAnswer(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/<[^>]*>/g, "")
    .replace(/^(what|who|where|when)\s+(is|are|was|were)\s+/i, "").replace(/^(a|an|the)\s+/i, "")
    .replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}
function correctAnswer(guess, answer) {
  const a = normalizeAnswer(guess), b = normalizeAnswer(answer);
  return a === b || (a.length >= 4 && b.length >= 4 && (a.includes(b) || b.includes(a)));
}
function clearRoomTimer(room) { if (room.timer) clearTimeout(room.timer); room.timer = null; }
function setRoomTimer(room, duration, handler) {
  clearRoomTimer(room); room.deadline = Date.now() + duration; room.timer = setTimeout(() => { room.timer = null; handler(); }, duration);
}
function connectedPlayers(room) { return [...room.players.values()].filter((player) => player.connected); }
function newBoard(room, resetScores = true) {
  clearRoomTimer(room); room.board = archive.boards[Math.floor(Math.random() * archive.boards.length)]; room.used = Array(30).fill(false);
  room.remaining = 30; room.dailyDouble = Math.floor(Math.random() * 30); room.current = null; room.result = null; room.attempted = new Set(); room.phase = "board"; room.deadline = null; room.lastEvent = "The board is live.";
  if (resetScores) for (const player of room.players.values()) player.score = 0;
  room.controllerId = room.hostId;
}
function publicState(room) {
  const state = {
    code: room.code, phase: room.phase, hostId: room.hostId, controllerId: room.controllerId, remaining: room.remaining,
    boardDate: room.board?.date ?? null, used: room.used ?? [], deadline: room.deadline, activePlayerId: room.activePlayerId ?? null,
    lastEvent: room.lastEvent, attemptedIds: [...(room.attempted ?? [])], players: [...room.players.values()].map(({ id, name, score, connected }) => ({ id, name, score, connected })),
    board: room.board ? room.board.categories.map((group) => ({ category: group.category, values: group.clues.map((clue) => clue[0]) })) : null
  };
  if (room.current) state.clue = { category: room.current.category, value: room.current.value, question: room.current.question, index: room.current.index, dailyDouble: room.current.dailyDouble };
  if (room.result) state.result = room.result;
  return state;
}
function send(ws, message) { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message)); }
function broadcast(room) { const message = JSON.stringify({ type: "state", state: publicState(room) }); for (const player of room.players.values()) if (player.ws?.readyState === WebSocket.OPEN) player.ws.send(message); }
function welcome(player, room) { send(player.ws, { type: "welcome", playerId: player.id, token: player.token, state: publicState(room) }); }
function fail(ws, message) { send(ws, { type: "error", message }); }
function createPlayer(ws, name) { return { id: randomUUID(), token: randomUUID(), name: cleanName(name), score: 0, connected: true, ws }; }

function reveal(room, message, playerId = null, correct = false, delta = 0) {
  clearRoomTimer(room); room.phase = "result"; room.deadline = null; room.activePlayerId = null;
  room.result = { answer: room.current.answer, message, playerId, correct, delta }; room.lastEvent = message; broadcast(room);
}
function reopenBuzz(room, message) {
  room.phase = "buzz"; room.activePlayerId = null; room.lastEvent = message;
  setRoomTimer(room, 8000, () => reveal(room, "Nobody rescued that one.")); broadcast(room);
}
function openClue(room, index) {
  if (!Number.isInteger(index) || index < 0 || index >= 30 || room.used[index]) return;
  const row = Math.floor(index / 6), column = index % 6, group = room.board.categories[column], [value, question, answers] = group.clues[row];
  room.used[index] = true; room.remaining--; room.result = null; room.attempted = new Set(); room.activePlayerId = null;
  room.current = { index, category: group.category, value, question, answer: answers[0], dailyDouble: index === room.dailyDouble };
  if (room.current.dailyDouble) {
    room.phase = "wager"; room.lastEvent = "Daily Double! Only the player in control may answer.";
    setRoomTimer(room, 30000, () => { room.wager = Math.min(1000, Math.max(5, Math.abs(room.players.get(room.controllerId)?.score || 0))); beginAnswer(room, room.controllerId); });
  } else {
    room.phase = "buzz"; room.lastEvent = "Buzz when you know it."; setRoomTimer(room, 20000, () => reveal(room, "The clue outlasted everyone."));
  }
  broadcast(room);
}
function beginAnswer(room, playerId) {
  clearRoomTimer(room); room.phase = "answer"; room.activePlayerId = playerId; room.lastEvent = `${room.players.get(playerId)?.name || "A player"} is answering.`;
  setRoomTimer(room, 15000, () => handleAnswer(room, playerId, "", true)); broadcast(room);
}
function handleAnswer(room, playerId, guess, timedOut = false) {
  if (room.phase !== "answer" || room.activePlayerId !== playerId) return;
  const player = room.players.get(playerId); if (!player) return;
  const points = room.current.dailyDouble ? room.wager : room.current.value;
  if (!timedOut && correctAnswer(guess, room.current.answer)) {
    player.score += points; room.controllerId = player.id; reveal(room, `${player.name} got it!`, player.id, true, points); return;
  }
  player.score -= points; room.attempted.add(player.id);
  if (room.current.dailyDouble) { reveal(room, `${player.name} missed the Daily Double.`, player.id, false, -points); return; }
  const eligible = connectedPlayers(room).filter((candidate) => !room.attempted.has(candidate.id));
  if (eligible.length) reopenBuzz(room, `${player.name} missed. Rebound is open.`); else reveal(room, "That one beat the room.", player.id, false, -points);
}

function handleMessage(ws, raw) {
  if (raw.length > 4096) return fail(ws, "That message was too large.");
  let message; try { message = JSON.parse(raw); } catch { return fail(ws, "I couldn't read that message."); }
  if (message.type === "create_room") {
    if (ws.roomCode) return; const player = createPlayer(ws, message.name); const code = roomCode();
    const room = { code, hostId: player.id, controllerId: player.id, players: new Map([[player.id, player]]), phase: "lobby", remaining: 30, lastEvent: "Waiting for contestants.", createdAt: Date.now() };
    rooms.set(code, room); ws.roomCode = code; ws.playerId = player.id; welcome(player, room); broadcast(room); return;
  }
  if (message.type === "join_room") {
    if (ws.roomCode) return; const code = String(message.code || "").toUpperCase().replace(/[^A-Z]/g, ""); const room = rooms.get(code);
    if (!room) return fail(ws, "That room doesn't exist—or it has returned to the void.");
    let player = [...room.players.values()].find((item) => item.token === message.token);
    if (player) { player.ws = ws; player.connected = true; if (message.name) player.name = cleanName(message.name); }
    else { if (room.players.size >= 8) return fail(ws, "That room is full."); player = createPlayer(ws, message.name); room.players.set(player.id, player); }
    ws.roomCode = code; ws.playerId = player.id; welcome(player, room); broadcast(room); return;
  }
  const room = rooms.get(ws.roomCode), player = room?.players.get(ws.playerId); if (!room || !player) return fail(ws, "Join a room first.");
  const isHost = player.id === room.hostId;
  if (message.type === "start_game" && isHost && ["lobby", "ended"].includes(room.phase)) { newBoard(room); broadcast(room); return; }
  if (message.type === "select_clue" && room.phase === "board" && (isHost || player.id === room.controllerId)) { openClue(room, Number(message.index)); return; }
  if (message.type === "buzz" && room.phase === "buzz" && !room.attempted.has(player.id)) { beginAnswer(room, player.id); return; }
  if (message.type === "wager" && room.phase === "wager" && player.id === room.controllerId) {
    const max = Math.max(1000, Math.abs(player.score)), wager = Number(message.wager); if (!Number.isFinite(wager) || wager < 5 || wager > max) return fail(ws, `Choose a wager from $5 to $${max.toLocaleString()}.`);
    room.wager = Math.round(wager); beginAnswer(room, player.id); return;
  }
  if (message.type === "answer") { handleAnswer(room, player.id, message.answer); return; }
  if (message.type === "continue" && room.phase === "result" && isHost) {
    if (room.remaining === 0) { room.phase = "ended"; room.current = null; room.result = null; room.lastEvent = "That's the board!"; }
    else { room.phase = "board"; room.current = null; room.result = null; room.lastEvent = `${room.players.get(room.controllerId)?.name || "The room"} has control.`; }
    broadcast(room); return;
  }
  if (message.type === "new_game" && isHost) { newBoard(room); broadcast(room); }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`); let pathname = decodeURIComponent(url.pathname); if (pathname === "/") pathname = "/index.html";
    if (pathname === "/health") { response.writeHead(200, { "Content-Type": "application/json" }); response.end('{"ok":true}'); return; }
    const filePath = resolve(ROOT, `.${pathname}`), relativePath = relative(ROOT, filePath);
    if (relativePath.startsWith("..") || isAbsolute(relativePath)) { response.writeHead(403).end("Forbidden"); return; }
    const details = await stat(filePath); if (!details.isFile()) throw new Error("Not a file");
    const body = await readFile(filePath); response.writeHead(200, { "Content-Type": mime[extname(filePath)] || "application/octet-stream", "Cache-Control": pathname.endsWith("boards.json") ? "public, max-age=3600" : "no-cache" }); response.end(body);
  } catch { response.writeHead(404, { "Content-Type": "text/plain" }); response.end("Not found"); }
});
const sockets = new WebSocketServer({ noServer: true });
server.on("upgrade", (request, socket, head) => {
  if (new URL(request.url, `http://${request.headers.host}`).pathname !== "/ws") return socket.destroy();
  sockets.handleUpgrade(request, socket, head, (ws) => sockets.emit("connection", ws));
});
sockets.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });
  ws.on("message", (data) => handleMessage(ws, data.toString()));
  ws.on("close", () => {
    const room = rooms.get(ws.roomCode), player = room?.players.get(ws.playerId); if (!room || !player) return;
    player.connected = false; player.ws = null;
    if (room.hostId === player.id) { const replacement = connectedPlayers(room)[0]; if (replacement) room.hostId = replacement.id; }
    broadcast(room);
  });
});
setInterval(() => {
  for (const ws of sockets.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false; ws.ping();
  }
}, 25000).unref();
setInterval(() => { const cutoff = Date.now() - 6 * 60 * 60 * 1000; for (const [code, room] of rooms) if (room.createdAt < cutoff && !connectedPlayers(room).length) { clearRoomTimer(room); rooms.delete(code); } }, 60000).unref();
server.listen(PORT, "0.0.0.0", () => console.log(`Jeopardy is live at http://localhost:${PORT}`));
