(() => {
  const get = (selector) => document.querySelector(selector);
  const ui = {
    start: get("#start-screen"), lobby: get("#lobby-screen"), game: get("#game-screen"), end: get("#end-screen"),
    dialog: get("#clue-dialog"), board: get("#board"), score: get("#score"), remaining: get("#remaining"), greeting: get("#player-greeting"),
    roomPanel: get("#room-panel"), playerStrip: get("#player-strip"), clueView: get("#clue-view"), wagerView: get("#wager-view"), resultView: get("#result-view"),
    answerForm: get("#answer-form"), wagerForm: get("#wager-form"), pass: get("#pass-button"), buzz: get("#buzz-button"), clueStatus: get("#clue-status"), error: get("#connection-error")
  };
  const mp = { active: false, socket: null, playerId: null, token: null, state: null, reconnectTimer: null, visualTimer: null };

  function money(value) { const sign = value < 0 ? "−" : ""; return `${sign}$${Math.abs(value || 0).toLocaleString()}`; }
  function name() { return get("#player-name").value.trim() || "Contestant"; }
  function showError(message = "") { ui.error.textContent = message; ui.error.hidden = !message; }
  function showOnly(section) { [ui.start, ui.lobby, ui.game, ui.end].forEach((item) => item.hidden = item !== section); }
  function send(type, details = {}) { if (mp.socket?.readyState === WebSocket.OPEN) mp.socket.send(JSON.stringify({ type, ...details })); }
  function remember() { if (mp.state?.code && mp.token) sessionStorage.setItem("jeopardy-room", JSON.stringify({ code: mp.state.code, token: mp.token, name: name() })); }
  function forget() { sessionStorage.removeItem("jeopardy-room"); }

  function connect() {
    if (mp.socket?.readyState === WebSocket.OPEN) return Promise.resolve(mp.socket);
    return new Promise((resolve, reject) => {
      const protocol = location.protocol === "https:" ? "wss:" : "ws:";
      const socket = new WebSocket(`${protocol}//${location.host}/ws`); mp.socket = socket;
      socket.addEventListener("open", () => { showError(); resolve(socket); });
      socket.addEventListener("error", () => reject(new Error("The game server is unavailable.")));
      socket.addEventListener("message", ({ data }) => {
        const message = JSON.parse(data);
        if (message.type === "error") return showError(message.message);
        if (message.type === "welcome") { mp.playerId = message.playerId; mp.token = message.token; mp.state = message.state; remember(); render(message.state); }
        if (message.type === "state") { mp.state = message.state; render(message.state); }
      });
      socket.addEventListener("close", () => {
        if (!mp.active || !mp.state?.code) return;
        showError("Connection lost. Rejoining the room…"); clearTimeout(mp.reconnectTimer);
        mp.reconnectTimer = setTimeout(() => connect().then(() => send("join_room", { code: mp.state.code, name: name(), token: mp.token })).catch(() => socket.dispatchEvent(new Event("close"))), 1200);
      });
    });
  }

  async function enterRoom(type, details) {
    mp.active = true; showError();
    try { await connect(); send(type, details); }
    catch (error) { mp.active = false; showError(error.message); }
  }
  function copyCode() {
    const code = mp.state?.code; if (!code) return;
    navigator.clipboard?.writeText(code); const target = get("#lobby-code"); if (target) { const old = target.innerHTML; target.innerHTML = `${code} <span>copied!</span>`; setTimeout(() => target.innerHTML = old, 1000); }
  }

  function renderPlayers(state) {
    const pills = state.players.map((player) => `<span class="player-pill ${player.connected ? "" : "offline"}">${escapeHtml(player.name)}${player.id === state.hostId ? " · host" : ""}</span>`).join("");
    get("#lobby-players").innerHTML = pills;
    ui.playerStrip.innerHTML = state.players.map((player) => `<span class="score-chip ${player.id === state.controllerId ? "active" : ""}">${escapeHtml(player.name)} <strong>${money(player.score)}</strong></span>`).join("");
    const self = state.players.find((player) => player.id === mp.playerId); ui.score.textContent = money(self?.score); ui.remaining.textContent = state.remaining;
  }
  function escapeHtml(value) { const span = document.createElement("span"); span.textContent = value; return span.innerHTML; }

  function renderBoard(state) {
    ui.board.replaceChildren(); const canChoose = mp.playerId === state.controllerId || mp.playerId === state.hostId;
    state.board.forEach(({ category }) => { const heading = document.createElement("div"); heading.className = "category"; heading.textContent = category; ui.board.append(heading); });
    for (let row = 0; row < 5; row++) state.board.forEach((group, column) => {
      const index = row * 6 + column, button = document.createElement("button"); button.className = "clue-tile"; button.textContent = `$${group.values[row]}`; button.disabled = state.used[index];
      button.classList.toggle("locked", !canChoose); button.setAttribute("aria-label", `${group.category} for ${group.values[row]} dollars${canChoose ? "" : "; waiting for the player in control"}`);
      button.addEventListener("click", () => { if (canChoose) send("select_clue", { index }); }); ui.board.append(button);
    });
  }
  function visualTimer(deadline) {
    clearInterval(mp.visualTimer); const bar = get("#timer-bar");
    if (!deadline) { bar.style.transform = "scaleX(1)"; return; }
    const total = Math.max(1000, deadline - Date.now());
    mp.visualTimer = setInterval(() => { const left = Math.max(0, (deadline - Date.now()) / total); bar.style.transform = `scaleX(${left})`; bar.style.background = left < .25 ? "#ed315f" : "var(--gold)"; if (!left) clearInterval(mp.visualTimer); }, 100);
  }
  function showDialog(state) {
    if (!ui.dialog.open) ui.dialog.showModal();
    get("#clue-category").textContent = state.clue.category; get("#clue-value").textContent = state.clue.dailyDouble ? "DAILY DOUBLE" : `$${state.clue.value}`; get("#clue-question").textContent = state.clue.question;
    ui.clueView.hidden = state.phase === "wager" || state.phase === "result"; ui.wagerView.hidden = state.phase !== "wager"; ui.resultView.hidden = state.phase !== "result"; visualTimer(state.deadline);
    if (state.phase === "wager") {
      const self = state.players.find((player) => player.id === mp.playerId), controller = state.players.find((player) => player.id === state.controllerId), mine = mp.playerId === state.controllerId;
      get("#max-wager").textContent = money(Math.max(1000, Math.abs(self?.score || 0))); ui.wagerForm.hidden = !mine;
      ui.wagerView.querySelector("h2").textContent = mine ? "Make it interesting." : `${controller?.name || "The player in control"} is wagering.`;
      if (mine) { const input = get("#wager-input"); input.max = Math.max(1000, Math.abs(self?.score || 0)); input.value = Math.min(1000, input.max); setTimeout(() => input.focus(), 50); }
      return;
    }
    if (state.phase === "result") {
      const resultPlayer = state.players.find((player) => player.id === state.result.playerId); get("#result-stamp").textContent = state.result.correct ? "CORRECT" : "NOT QUITE"; get("#result-stamp").classList.toggle("wrong", !state.result.correct);
      get("#correct-answer").textContent = `What is ${state.result.answer}?`; get("#result-copy").textContent = state.result.message + (resultPlayer && state.result.delta ? ` ${resultPlayer.name}: ${state.result.delta > 0 ? "+" : ""}${money(state.result.delta)}` : "");
      const next = get("#return-board"), host = mp.playerId === state.hostId; next.hidden = false; next.disabled = !host; next.textContent = host ? (state.remaining ? "Back to the board →" : "See final scores →") : "Waiting for the host…"; return;
    }
    const answering = state.phase === "answer", mine = state.activePlayerId === mp.playerId, attempted = state.attemptedIds?.includes(mp.playerId);
    ui.answerForm.hidden = !answering || !mine; ui.pass.hidden = !answering || !mine; ui.buzz.hidden = state.phase !== "buzz"; ui.buzz.disabled = attempted;
    ui.clueStatus.hidden = false; ui.clueStatus.textContent = state.lastEvent;
    if (mine) { get("#answer-input").value = ""; setTimeout(() => get("#answer-input").focus(), 50); }
  }

  function render(state) {
    showError(); renderPlayers(state);
    if (state.phase === "lobby") {
      if (ui.dialog.open) ui.dialog.close(); showOnly(ui.lobby); get("#lobby-code").innerHTML = `${state.code} <span>copy</span>`;
      const host = mp.playerId === state.hostId; get("#start-multiplayer").hidden = !host; get("#lobby-note").textContent = host ? "Start when everyone is ready." : "Waiting for the host to start."; return;
    }
    if (state.phase === "ended") {
      if (ui.dialog.open) ui.dialog.close(); showOnly(ui.end); const standings = [...state.players].sort((a, b) => b.score - a.score); get("#final-headline").textContent = `${standings[0]?.name || "Someone"} takes it!`; get("#final-score").textContent = money(standings[0]?.score);
      get("#final-standings").innerHTML = standings.map((player, index) => `<div class="standing"><span>${index + 1}. ${escapeHtml(player.name)}</span><strong>${money(player.score)}</strong></div>`).join(""); get("#final-message").textContent = "Bragging rights have been synchronized across all devices.";
      get("#play-again").hidden = mp.playerId !== state.hostId; return;
    }
    showOnly(ui.game); ui.roomPanel.hidden = false; get("#game-room-code").textContent = `ROOM ${state.code}`; ui.greeting.textContent = state.lastEvent; renderBoard(state);
    if (state.phase === "board") { clearInterval(mp.visualTimer); if (ui.dialog.open) ui.dialog.close(); } else showDialog(state);
  }

  get("#create-room").addEventListener("click", () => enterRoom("create_room", { name: name() }));
  get("#join-room-form").addEventListener("submit", (event) => { event.preventDefault(); const code = get("#join-code").value.toUpperCase().trim(); if (code.length !== 4) return showError("Enter the four-letter room code."); enterRoom("join_room", { code, name: name() }); });
  get("#lobby-code").addEventListener("click", copyCode); get("#game-room-code").addEventListener("click", copyCode);
  get("#start-multiplayer").addEventListener("click", () => send("start_game")); get("#buzz-button").addEventListener("click", () => send("buzz"));
  ui.answerForm.addEventListener("submit", (event) => { if (!mp.active) return; event.preventDefault(); event.stopImmediatePropagation(); send("answer", { answer: get("#answer-input").value }); });
  ui.wagerForm.addEventListener("submit", (event) => { if (!mp.active) return; event.preventDefault(); event.stopImmediatePropagation(); send("wager", { wager: Number(get("#wager-input").value) }); });
  ui.pass.addEventListener("click", (event) => { if (!mp.active) return; event.preventDefault(); event.stopImmediatePropagation(); send("answer", { answer: "" }); });
  get("#return-board").addEventListener("click", (event) => { if (!mp.active) return; event.preventDefault(); event.stopImmediatePropagation(); send("continue"); });
  get("#new-game").addEventListener("click", (event) => { if (!mp.active) return; event.preventDefault(); event.stopImmediatePropagation(); send("new_game"); });
  get("#play-again").addEventListener("click", (event) => { if (!mp.active) return; event.preventDefault(); event.stopImmediatePropagation(); send("new_game"); });
  get("#brand").addEventListener("click", (event) => { if (!mp.active) return; event.preventDefault(); event.stopImmediatePropagation(); mp.active = false; forget(); mp.socket?.close(); ui.roomPanel.hidden = true; showOnly(ui.start); });
  ui.dialog.addEventListener("cancel", (event) => { if (mp.active) event.preventDefault(); });

  try {
    const saved = JSON.parse(sessionStorage.getItem("jeopardy-room"));
    if (saved?.code && saved?.token) { get("#player-name").value = saved.name || "Contestant"; mp.active = true; mp.token = saved.token; connect().then(() => send("join_room", saved)).catch(() => { mp.active = false; forget(); }); }
  } catch { forget(); }
})();
