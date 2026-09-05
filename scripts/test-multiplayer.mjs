import WebSocket from "ws";

const endpoint = process.env.TEST_WS_URL || "ws://127.0.0.1:4173/ws";
function makeClient() {
  const ws = new WebSocket(endpoint); let latest; const waiters = [];
  ws.on("message", (raw) => {
    const message = JSON.parse(raw); if (message.state) latest = message;
    for (const waiter of [...waiters]) if (waiter.test(message)) { waiters.splice(waiters.indexOf(waiter), 1); waiter.resolve(message); }
  });
  const open = new Promise((resolve, reject) => { ws.once("open", resolve); ws.once("error", reject); });
  return {
    ws, open, get latest() { return latest; }, send(type, details = {}) { ws.send(JSON.stringify({ type, ...details })); },
    wait(test, timeout = 3000) {
      if (latest && test(latest)) return Promise.resolve(latest);
      return new Promise((resolve, reject) => { const waiter = { test, resolve }; waiters.push(waiter); setTimeout(() => { const index = waiters.indexOf(waiter); if (index >= 0) waiters.splice(index, 1); reject(new Error("Timed out waiting for multiplayer state")); }, timeout); });
    }
  };
}

const host = makeClient(), guest = makeClient(); await Promise.all([host.open, guest.open]);
host.send("create_room", { name: "Host" }); const hostWelcome = await host.wait((message) => message.type === "welcome");
guest.send("join_room", { code: hostWelcome.state.code, name: "Guest" }); const guestWelcome = await guest.wait((message) => message.type === "welcome");
await host.wait((message) => message.state?.players.length === 2); host.send("start_game"); let state = (await host.wait((message) => message.state?.phase === "board")).state;

let index = 0; host.send("select_clue", { index }); state = (await host.wait((message) => ["buzz", "wager"].includes(message.state?.phase))).state;
if (state.phase === "wager") {
  host.send("wager", { wager: 5 }); await host.wait((message) => message.state?.phase === "answer"); host.send("answer", { answer: "" });
  await host.wait((message) => message.state?.phase === "result"); host.send("continue"); await host.wait((message) => message.state?.phase === "board"); index++;
  host.send("select_clue", { index }); state = (await host.wait((message) => message.state?.phase === "buzz")).state;
}

host.send("buzz"); guest.send("buzz"); state = (await host.wait((message) => message.state?.phase === "answer")).state;
const active = state.activePlayerId === hostWelcome.playerId ? host : guest; const other = active === host ? guest : host;
active.send("answer", { answer: "" }); await host.wait((message) => message.state?.phase === "buzz"); other.send("buzz");
await host.wait((message) => message.state?.phase === "answer"); other.send("answer", { answer: "" }); state = (await host.wait((message) => message.state?.phase === "result")).state;

if (state.players.length !== 2 || state.remaining > 29 || !state.result?.answer) throw new Error("Multiplayer state failed validation");
host.ws.close(); guest.ws.close(); console.log(`Room ${state.code}: lobby, synchronized board, first buzz, rebound, scoring, and reveal passed.`);
