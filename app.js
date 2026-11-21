// The browser displays messages; the Python engine still makes every game decision.
const transcript = document.getElementById("transcript");
const command = document.getElementById("command");
const prompt = document.getElementById("prompt");
const send = document.getElementById("send");
const restart = document.getElementById("restart");
const gameStatus = document.getElementById("status");
const actions = document.getElementById("actions");
let Game;
let game;

function appendMessage(text, className = "") {
  const line = document.createElement("p");
  line.textContent = text;
  line.className = className;
  transcript.append(line);
  transcript.scrollTop = transcript.scrollHeight;
}

function renderStats() {
  const player = game.player;
  document.getElementById("player-stats").hidden = !player.name;
  document.getElementById("player-name").textContent = player.name;
  document.getElementById("knowledge").textContent = `${player.knowledge}/${player.knowledge_max}`;
  document.getElementById("specials").textContent = player.special_charges;
  document.getElementById("books").textContent = player.books;

  const opponent = document.getElementById("opponent");
  const enemy = player.enemy;
  opponent.hidden = game.phase !== "combat" && game.phase !== "boss_combat";
  opponent.textContent = opponent.hidden ? "" : `Opponent: ${enemy.name} · Knowledge ${enemy.knowledge}`;
  if (enemy) enemy.destroy();
  player.destroy(); // Release the temporary Python references used for display.
}

function render(messages) {
  for (const message of messages.toJs()) appendMessage(message);
  messages.destroy(); // Release this temporary Python list after displaying it.
  renderStats();
  prompt.textContent = game.finished ? "Session ended. Choose Restart to play again." : game.prompt;
  command.disabled = send.disabled = game.finished;
  command.placeholder = game.phase.endsWith("selection") ? "Type a number…" : "Try help or explore…";
  gameStatus.textContent = game.finished ? "Game ended" : "Ready to play";
  actions.replaceChildren();
  const choices = game.choices;
  for (const [value, label] of choices.toJs()) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", () => submitCommand(value));
    actions.append(button);
  }
  choices.destroy();
  transcript.scrollTop = transcript.scrollHeight; // Stats and buttons can change the available height.
  if (game.finished) restart.focus();
  else actions.querySelector("button").focus({ preventScroll: true });
}

function newGame() {
  if (game) game.destroy();
  game = Game();
  transcript.replaceChildren();
  command.value = "";
  document.getElementById("typing").open = false;
  render(game.start());
}

function submitCommand(text) {
  appendMessage("> " + text, "command");
  command.value = "";
  render(game.submit(text)); // Pass text as data, never as Python source code.
}

document.getElementById("command-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const text = command.value.trim();
  if (!text || command.disabled) return;
  submitCommand(text);
  if (!game.finished) command.focus(); // Only deliberate typing opens the phone keyboard.
});

restart.addEventListener("click", () => {
  if (Game) newGame();
  else window.location.reload();
});

async function loadGame() {
  try {
    const python = await loadPyodide();
    python.FS.mkdir("scripts");
    // Load the same three source files used by the terminal game.
    for (const file of ["__init__.py", "classes.py", "engine.py"]) {
      const response = await fetch("scripts/" + file);
      if (!response.ok) throw new Error("Could not load " + file);
      python.FS.writeFile("scripts/" + file, await response.text());
    }
    Game = python.runPython("from scripts.engine import Game\nGame");
    restart.disabled = false;
    newGame();
  } catch (error) {
    console.error(error);
    gameStatus.textContent = "Couldn't start the game";
    appendMessage("Check your internet connection, then choose Reload game.");
    restart.textContent = "Reload game";
    restart.disabled = false;
  }
}

loadGame();
