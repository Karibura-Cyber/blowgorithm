# Blowgorithm

A visual flowchart builder that lets you design algorithms and run them instantly — no coding required. Draw your logic as a flowchart, execute it step-by-step in the browser, generate Python code, and even control Turtle graphics, all from one interface.

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Node Types](#node-types)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Interface Guide](#interface-guide)
- [OS Styles](#os-styles)
- [File Format](#file-format)
- [Contributing](#contributing)

---

## Features

- **Visual flowchart editor** — drag, drop, and connect nodes on an infinite SVG canvas
- **Live execution** — run your flowchart directly in the browser with animated node highlighting
- **Step debugger** — step through your algorithm one node at a time, inspecting variables at each step (F8 / F5)
- **Python code generator** — export your flowchart as valid, runnable Python code
- **Turtle graphics** — a built-in canvas that responds to Turtle nodes during execution
- **Undo / Redo** — full history with up to 100 snapshots (Ctrl+Z / Ctrl+Y)
- **Auto-layout** — Sugiyama-style hierarchical layout arranges nodes automatically (Ctrl+L)
- **Copy, paste, duplicate** — standard clipboard operations for nodes (Ctrl+C / Ctrl+V)
- **Save & open** — persist flowcharts as `.flow` JSON files
- **OS Styles** — switch the UI between Ubuntu, Windows 11, and macOS aesthetics
- **Quick-add picker** — drag a wire onto empty canvas to instantly pick and place the next node
- **Rubber-band selection** — drag on the canvas background to select multiple nodes at once
- **No dependencies** — pure vanilla HTML, CSS, and JavaScript; no build step required

---

## Getting Started

### Running locally

Because the project uses multiple JavaScript files loaded via `<script src="js/...">`, browsers block `file://` cross-origin requests. The easiest fix is to serve the folder with a local server:

**Using Python (built-in):**
```bash
cd Blowgorithm
python -m http.server 8080
# then open http://localhost:8080
```

**Using Node.js (`npx`):**
```bash
cd Blowgorithm
npx serve .
# then open the URL shown in the terminal
```

**Using VS Code:**
Install the *Live Server* extension, right-click `index.html` → *Open with Live Server*.

> The `Unsafe attempt to load URL file://...` console warning is the browser telling you it needs a server — it is not a bug in the code.

---

## Project Structure

```
Blowgorithm/
├── index.html              # Main HTML — layout, floating windows, pickers
├── style.css               # All styling, CSS variables, OS & theme overrides
└── js/
    ├── state.js            # Global mutable state, shape definitions, DOM refs
    ├── history.js          # Undo / redo stack (up to 100 snapshots)
    ├── nodes.js            # Node creation, SVG rendering, copy/paste/duplicate
    ├── canvas.js           # Pan, zoom, fit-view, rubber-band selection
    ├── connections.js      # Connection drawing, bezier paths, quick-add picker
    ├── events.js           # Mouse & keyboard event handlers, toolbar drag-to-add
    ├── interpreter.js      # Flowchart execution engine + step debugger
    ├── python-gen.js       # Python code generator (traverses the node graph)
    ├── auto-layout.js      # Sugiyama hierarchical auto-layout algorithm
    ├── turtle.js           # Turtle graphics engine (canvas rendering)
    ├── chat.js             # Console / output window, input modal
    ├── ui.js               # Properties panel, dialogs, file I/O, window controls
    ├── style-switcher.js   # OS style switcher (Ubuntu / Windows / macOS)
    ├── tutorial-theme.js   # Tutorial system + colour theme switcher
    └── main.js             # Bootstrap: attaches layers, builds sample flowchart
```

---

## Node Types

### Flow control

| Node | Shape | Description |
|---|---|---|
| **Start / End** | Rounded rectangle (terminal) | Entry and exit points. Set `Role` to `start` or `end` in the Properties panel. |
| **Process** | Rectangle | A single assignment statement, e.g. `x = x + 1` |
| **Decision** | Diamond | Evaluates a condition. True and False exits can point to any side. |
| **Input** | Parallelogram | Prompts the user for a value at runtime and stores it in a variable. |
| **Output** | Parallelogram | Prints an expression or string to the Console. |
| **Declare** | Rectangle (double border) | Declares a typed variable (`Integer`, `Real`, `String`, `Boolean`) with an optional initial value. |
| **Sub-process** | Rectangle with double vertical bars | Calls a named sub-routine (generates a function call in Python). |

### Loops

| Node | Description |
|---|---|
| **For Loop** | Counts from `from` to `to` with a configurable `step`. Body exits from the bottom, loop exit from the right. |
| **While Loop** | Repeats while a condition is true. Body exits from the bottom, loop exit from the right. |
| **Do…While** | Executes the body first, then checks the condition. Loops back to the top, exits right. |

### Turtle Graphics

All Turtle nodes control a virtual pen on the Turtle Graphics canvas window.

| Node | Description |
|---|---|
| **Forward** | Move forward by a distance (supports variables) |
| **Turn Left / Right** | Rotate by degrees (supports variables) |
| **Pen Up / Down** | Lift or lower the drawing pen |
| **Pen Color** | Set the stroke colour (hex) |
| **Fill Color** | Set the fill colour (hex) |
| **Begin Fill / End Fill** | Wrap a path to fill it with the current fill colour |
| **Home** | Return the turtle to the origin (0, 0) |
| **Clear** | Erase all drawings and reset turtle state |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + A` | Select all nodes |
| `Ctrl + C` | Copy selected nodes |
| `Ctrl + V` | Paste nodes |
| `Ctrl + S` | Save flowchart as `.flow` file |
| `R` | Run flowchart |
| `Escape` | Cancel current action / stop step debugger |
| `Delete` / `Backspace` | Delete selected nodes |

**Canvas navigation:**
- **Scroll wheel** — zoom in / out
- **Middle-click drag** / **Alt + left-click drag** or **Right-click drag** — pan
- **Left-click drag on background** — rubber-band multi-select

---

## Interface Guide

### Adding nodes

- **Click** a shape in the left toolbar, then click on the canvas to place it.
- **Drag** a shape from the toolbar directly onto the canvas.
- **Drag a wire** from any node's connection dot onto empty canvas — a Quick-Add picker appears so you can immediately choose what node to create and connect.

### Connecting nodes

1. Hover a node to reveal its blue connection dots (top, right, bottom, left).
2. Click and drag from a dot to another node to draw a bezier arrow.
3. **Click any arrow** to delete it, or right-click for the context menu.

### Properties panel

Double-click any node (or right-click → Properties) to open the Properties panel. Edit the label, condition, variable name, loop bounds, and other type-specific fields. Changes apply live.

### Running a flowchart

Click **▶ Run** in the header (or press `R`). The interpreter highlights each node as it executes. Output and `print` values appear in the **Console** window. If an `Input` node is reached, a prompt appears in the Console for you to type a value.

### Step debugger

Click **⏭ Step** to enter step-by-step mode. Each press of **F8** advances one node. The variable table updates live. Press **F5** to run to completion or **Escape** to stop.

### Python export

Click **Python** → **Generate** to traverse the flowchart graph and emit equivalent Python code. The output window has **Copy** and **Download** buttons.

---

## OS Styles

Click the monitor icon (top-right of the header) to open the style picker.

| Style | Aesthetic |
|---|---|
| **Ubuntu** | Dark aubergine `#3d2440` header and window titlebars, orange accent `#e95420` |
| **Windows** | Fluent UI — light grey titlebars, left-aligned window titles, Win32-style `─ □ ×` controls on the right, blue accent `#0078d4`, square corners |
| **macOS** | Cupertino — frosted glass header, traffic-light dot controls, rounded corners `12px`, blue accent `#007aff` |

The chosen style is saved to `localStorage` and restored on next load.

---

## File Format

Flowcharts are saved as `.flow` files (JSON). The schema is:

```json
{
  "version": 1,
  "nextId": 42,
  "nodes": [
    {
      "id": 1,
      "type": "start",
      "x": 260, "y": 60,
      "w": 150, "h": 46,
      "label": "Start",
      "vars": { "role": "start" }
    }
  ],
  "conns": [
    {
      "id": 10,
      "from": 1, "fromSide": "bottom",
      "to": 2,   "toSide":   "top",
      "label": ""
    }
  ]
}
```

`vars` fields vary by node type — see `state.js` (`SHAPE_DEFS`) for all defaults.

---

## Contributing

The project is a single-page vanilla JS application with no build tooling. To make changes:

1. Edit the relevant file in `js/` or `style.css`.
2. Refresh the browser (served via a local server).
3. All state is in `js/state.js`; add new node types to `SHAPE_DEFS` there, then handle them in `nodes.js` (rendering), `interpreter.js` (execution), and `python-gen.js` (code generation).

To add a new OS style, add a `[data-os="yourname"]` block to `style.css` and a new option in the `#style-picker` section of `index.html`, then register the name in `OS_STYLES` inside `js/style-switcher.js`.
