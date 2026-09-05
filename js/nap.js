const FALLBACK_GAME = [
  { category: "The Internet Is Forever", clues: [
    [200, "This feline reaction image had grammatically creative cravings for a cheeseburger.", ["lolcat", "lolcats"]],
    [400, "This video platform launched in 2005 with a trip to the zoo.", ["youtube"]],
    [600, "The number in the HTTP status code for 'Not Found.'", ["404"]],
    [800, "Before X, this blue-bird platform limited posts to 140 characters.", ["twitter"]],
    [1000, "This 1989 proposal by Tim Berners-Lee became the World Wide Web.", ["information management a proposal", "world wide web proposal", "the web"]]
  ]},
  { category: "Science, Allegedly", clues: [
    [200, "The planet famous for its rings and for absolutely showing off.", ["saturn"]],
    [400, "H₂O is the chemical formula for this substance.", ["water"]],
    [600, "This force keeps your feet on the ground and ruins every dropped phone.", ["gravity"]],
    [800, "The powerhouse of the cell—yes, the meme was right.", ["mitochondria", "mitochondrion"]],
    [1000, "The boundary around a black hole beyond which nothing can escape.", ["event horizon"]]
  ]},
  { category: "Main Character Energy", clues: [
    [200, "This green ogre just wanted his swamp back.", ["shrek"]],
    [400, "She volunteers as tribute in The Hunger Games.", ["katniss everdeen", "katniss"]],
    [600, "This archaeologist's hat has survived more adventures than most people.", ["indiana jones", "indy"]],
    [800, "In The Matrix, he learns that he is 'The One.'", ["neo", "thomas anderson"]],
    [1000, "This Jane Austen heroine declares she is only resolved to act in the manner that constitutes her happiness.", ["elizabeth bennet", "elizabeth"]]
  ]},
  { category: "Snack Attack", clues: [
    [200, "This movie-theater snack begins as a hard kernel.", ["popcorn"]],
    [400, "Guacamole's main ingredient.", ["avocado", "avocados"]],
    [600, "This Italian dessert's name translates roughly to 'pick me up.'", ["tiramisu"]],
    [800, "The French term for cooking food slowly in its own fat.", ["confit"]],
    [1000, "This Japanese seasoning combines soy sauce, roasted wheat, salt, and koji.", ["shoyu", "soy sauce"]]
  ]},
  { category: "Places With Receipts", clues: [
    [200, "The Eiffel Tower calls this city home.", ["paris"]],
    [400, "This is the largest ocean on Earth.", ["pacific", "pacific ocean"]],
    [600, "The ancient city of Petra is in this modern country.", ["jordan"]],
    [800, "This tiny nation is entirely surrounded by South Africa.", ["lesotho"]],
    [1000, "The world's northernmost capital of a sovereign state.", ["reykjavik", "reykjavík"]]
  ]},
  { category: "Words Are Weird", clues: [
    [200, "A word that means the opposite of another word.", ["antonym"]],
    [400, "This punctuation mark can join two independent clauses; people fear it anyway.", ["semicolon"]],
    [600, "A word like 'buzz' that imitates the sound it describes.", ["onomatopoeia"]],
    [800, "This pangram begins 'The quick brown fox.'", ["the quick brown fox jumps over the lazy dog"]],
    [1000, "A word that reads the same forward and backward, like 'level.'", ["palindrome"]]
  ]}
];

let game = FALLBACK_GAME;
let boardArchivePromise;

const $ = (selector) => document.querySelector(selector);
const els = {
  start: $("#start-screen"), game: $("#game-screen"), end: $("#end-screen"), board: $("#board"),
  score: $("#score"), remaining: $("#remaining"), greeting: $("#player-greeting"), dialog: $("#clue-dialog"),
  category: $("#clue-category"), value: $("#clue-value"), question: $("#clue-question"), input: $("#answer-input"),
  clueView: $("#clue-view"), wagerView: $("#wager-view"), resultView: $("#result-view"), timer: $("#timer-bar"),
  stamp: $("#result-stamp"), correct: $("#correct-answer"), resultCopy: $("#result-copy")
};
let state = { name: "Contestant", score: 0, remaining: 30, dailyDouble: 0, current: null, wager: null, timer: null, sound: true, boardDate: null };

function money(value) { const sign = value < 0 ? "−" : ""; return `${sign}$${Math.abs(value).toLocaleString()}`; }
function normalize(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/<[^>]*>/g, "")
    .replace(/^(what|who|where|when)\s+(is|are|was|were)\s+/i, "").replace(/^(a|an|the)\s+/i, "")
    .replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}
function isCorrect(guess, answers) {
  const clean = normalize(guess);
  return answers.some((answer) => { const target = normalize(answer); if (clean === target) return true; if (clean.length < 5 || target.length < 5) return false; return clean.includes(target) || target.includes(clean); });
}
function tone(freq = 440, duration = .12, type = "sine") {
  if (!state.sound) return; const AudioCtx = window.AudioContext || window.webkitAudioContext; if (!AudioCtx) return;
  const ctx = new AudioCtx(), osc = ctx.createOscillator(), gain = ctx.createGain(); osc.type = type; osc.frequency.value = freq;
  gain.gain.setValueAtTime(.07, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration); osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + duration); osc.onended = () => ctx.close();
}
function showScreen(screen) { [els.start, els.game, els.end].forEach((item) => item.hidden = item !== screen); }
function updateStatus() { els.score.textContent = money(state.score); els.remaining.textContent = state.remaining; }
async function chooseBoard() {
  try {
    boardArchivePromise ??= fetch("data/boards.json").then((response) => {
      if (!response.ok) throw new Error(`Board archive returned ${response.status}`);
      return response.json();
    });
    const { boards } = await boardArchivePromise;
    const selected = boards[Math.floor(Math.random() * boards.length)];
    game = selected.categories;
    state.boardDate = selected.date;
  } catch (error) {
    console.warn("Using the built-in board because the archive could not load.", error);
    game = FALLBACK_GAME;
    state.boardDate = null;
  }
}
function buildBoard() {
  els.board.replaceChildren();
  game.forEach(({ category }) => { const heading = document.createElement("div"); heading.className = "category"; heading.textContent = category; els.board.append(heading); });
  for (let row = 0; row < 5; row++) game.forEach((group, col) => {
    const [value, question, answers] = group.clues[row], index = row * 6 + col, button = document.createElement("button");
    button.className = "clue-tile"; button.textContent = `$${value}`; button.dataset.index = index; button.setAttribute("aria-label", `${group.category} for ${value} dollars`);
    button.addEventListener("click", () => openClue({ category: group.category, value, question, answers, index, button })); els.board.append(button);
  });
}
async function startGame(event) {
  event?.preventDefault(); state.name = $("#player-name").value.trim() || "Contestant"; state.score = 0; state.remaining = 30;
  $("#final-standings").replaceChildren(); $("#room-panel").hidden = true;
  await chooseBoard();
  state.dailyDouble = Math.floor(Math.random() * 30); state.current = null; state.wager = null;
  els.greeting.textContent = state.boardDate ? `${state.name}, your board is from ${new Date(`${state.boardDate}T12:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}.` : `${state.name}, the board is yours.`;
  buildBoard(); updateStatus(); showScreen(els.game); tone(523, .12); setTimeout(() => tone(659, .16), 100);
}
function resetDialog() {
  clearInterval(state.timer); state.timer = null; els.clueView.hidden = true; els.wagerView.hidden = true; els.resultView.hidden = true;
  els.timer.style.transform = "scaleX(1)"; els.timer.style.background = "var(--gold)";
}
function openClue(clue) {
  state.current = clue; state.wager = null; clue.button.disabled = true; state.remaining--; updateStatus(); resetDialog();
  els.category.textContent = clue.category; els.value.textContent = `$${clue.value}`; els.dialog.showModal();
  if (clue.index === state.dailyDouble) showWager(); else showQuestion();
}
function showWager() {
  els.wagerView.hidden = false; els.value.textContent = "DAILY DOUBLE"; tone(220, .15, "square"); setTimeout(() => tone(330, .2, "square"), 150);
  const max = Math.max(1000, Math.abs(state.score)); $("#max-wager").textContent = money(max); $("#wager-input").max = max; $("#wager-input").value = Math.min(1000, max); $("#wager-input").focus();
}
function showQuestion() {
  els.wagerView.hidden = true; els.clueView.hidden = false; els.question.textContent = state.current.question; els.input.value = ""; els.input.focus();
  const start = performance.now(), duration = 30000;
  state.timer = setInterval(() => { const left = Math.max(0, 1 - (performance.now() - start) / duration); els.timer.style.transform = `scaleX(${left})`; if (left < .25) els.timer.style.background = "#ed315f"; if (left <= 0) resolveAnswer("", true); }, 100);
}
function resolveAnswer(guess, timedOut = false) {
  if (els.clueView.hidden) return; clearInterval(state.timer); state.timer = null; els.clueView.hidden = true; els.resultView.hidden = false;
  const won = !timedOut && isCorrect(guess, state.current.answers), points = state.wager ?? state.current.value; state.score += won ? points : -points; updateStatus();
  els.stamp.classList.toggle("wrong", !won); els.stamp.textContent = won ? "CORRECT" : timedOut ? "TIME'S UP" : "NOT QUITE"; els.correct.textContent = `What is ${state.current.answers[0]}?`;
  els.resultCopy.textContent = won ? `That's ${money(points)} for you. The audience pretends they knew it too.` : `The board takes ${money(points)}. A deeply judgmental buzzer has spoken.`; tone(won ? 680 : 130, won ? .18 : .35, won ? "sine" : "sawtooth");
}
function returnToBoard() { els.dialog.close(); resetDialog(); if (state.remaining === 0) finishGame(); else setTimeout(() => els.board.querySelector("button:not(:disabled)")?.focus(), 50); }
function finishGame() {
  showScreen(els.end); $("#final-score").textContent = money(state.score);
  const outcome = state.score >= 12000 ? ["Actual champion behavior.", "Please remain humble in the imaginary green room."] : state.score >= 5000 ? ["Respectable television!", "You have earned bragging rights with a reasonable expiration date."] : state.score >= 0 ? ["You survived television.", "The important thing is that the studio lights were flattering."] : ["A bold financial journey.", "You owe us nothing. Our collections department is also imaginary."];
  $("#final-headline").textContent = outcome[0]; $("#final-message").textContent = outcome[1];
}

$("#player-form").addEventListener("submit", startGame);
$("#answer-form").addEventListener("submit", (event) => { event.preventDefault(); resolveAnswer(els.input.value); });
$("#pass-button").addEventListener("click", () => resolveAnswer(""));
$("#wager-form").addEventListener("submit", (event) => { event.preventDefault(); const input = $("#wager-input"); if (!input.checkValidity()) return input.reportValidity(); state.wager = Number(input.value); showQuestion(); });
$("#return-board").addEventListener("click", returnToBoard);
$("#new-game").addEventListener("click", () => { clearInterval(state.timer); if (els.dialog.open) els.dialog.close(); showScreen(els.start); });
$("#play-again").addEventListener("click", startGame);
$("#brand").addEventListener("click", () => { clearInterval(state.timer); if (els.dialog.open) els.dialog.close(); showScreen(els.start); });
$("#sound-toggle").addEventListener("click", (event) => { state.sound = !state.sound; event.currentTarget.textContent = state.sound ? "♪" : "×"; event.currentTarget.title = state.sound ? "Sound on" : "Sound off"; event.currentTarget.setAttribute("aria-label", `Turn sound ${state.sound ? "off" : "on"}`); tone(520); });
els.dialog.addEventListener("cancel", (event) => event.preventDefault()); updateStatus();
