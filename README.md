# Owl Town RPG — browser edition

A small browser interface for the original Python game: a transcript, tap
buttons, and Restart. No frontend framework or JavaScript rewrite of the rules.

Play at [rpg.parkerm.net](https://rpg.parkerm.net/).

## Play locally on Windows

Open PowerShell in this folder and run:

```powershell
python -m http.server 8000
```

Open [localhost:8000](http://localhost:8000). Use the server rather than opening
`index.html` directly: the browser needs to fetch the Python files. Internet is
required to load the pinned Pyodide runtime on first launch.

Tap a character to begin. Buttons change for exploration, combat, and library
choices, so you can play on a phone without opening the keyboard. For the original
commands, expand **Type a command instead**. First-letter shortcuts work;
`u` or `use special` uses a special attack. Library choices also use 1–5, or 0 to
leave. Restart or reloading the page begins a new game. There are no saves yet.

The terminal version still works with `python main.py`.

## Read the code

- `index.html` defines the transcript, action buttons, optional input, and Restart.
- `style.css` makes the terminal-style layout fit desktop and phone screens.
- `app.js` loads Python, passes commands to the engine, and displays its messages.
- `scripts/engine.py` handles each turn; `scripts/classes.py` contains the rules.

The engine's small `choices` property supplies button commands and labels. Buttons
and the optional text form both call the same `game.submit(text)` method.

[Pyodide](https://pyodide.org/en/stable/) runs Python in the browser. The page
downloads a pinned runtime from jsDelivr and loads the local `scripts/` files.
Input is passed directly to `game.submit(text)`, never inserted into Python code.
Game text is displayed as text, not HTML.

The original Python rules and 18 tests came from
[pythonRPG at d2d7d00](https://github.com/iamparkerm/pythonRPG/tree/d2d7d000d07f58dac6205d75f69306c8ee3eabe7).
The original repository remains separate. Rule changes here won't automatically
sync back to it; keep them in Python so browser and terminal play share the rules
within this repository.

## Check the game

```powershell
python -B -m unittest discover -s tests -v
```

For a browser check: select a character, try `help`, `backpack`, `read`, and
`explore`, choose a book if you find a library, then try `quit` and Restart.
The existing Python tests run in one Windows GitHub Actions job.

GitHub Pages publishes the root of `main` to the custom domain after merging.
LLM agents come later.
