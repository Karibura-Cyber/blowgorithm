// ═══════════════════════════════════════════════
//  TUTORIAL SYSTEM
// ═══════════════════════════════════════════════
const TUTORIAL_STEPS = [
  {
    label: 'Step 1 of 9',
    title: 'Welcome to Blowgorithm! 👋',
    desc: 'Blowgorithm is a visual flowchart builder that lets you design algorithms and run them instantly — no coding needed. This tutorial walks you through everything in just a few steps.',
    tips: [],
    illustration: `<svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="45" width="200" height="50" rx="8" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
      <rect x="25" y="55" width="50" height="30" rx="4" fill="#dcfce7" stroke="#16a34a" stroke-width="1.2"/>
      <text x="50" y="75" text-anchor="middle" font-size="9" fill="#16a34a" font-family="sans-serif">Start</text>
      <rect x="90" y="55" width="50" height="30" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
      <text x="115" y="75" text-anchor="middle" font-size="9" fill="#2563eb" font-family="sans-serif">Process</text>
      <ellipse cx="180" cy="70" rx="25" ry="15" fill="#dcfce7" stroke="#16a34a" stroke-width="1.2"/>
      <text x="180" y="74" text-anchor="middle" font-size="9" fill="#16a34a" font-family="sans-serif">End</text>
      <path d="M75 70 L90 70" stroke="#94a3b8" stroke-width="1.3" marker-end="url(#tah)"/>
      <path d="M140 70 L155 70" stroke="#94a3b8" stroke-width="1.3" marker-end="url(#tah)"/>
      <defs><marker id="tah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/></marker></defs>
      <text x="105" y="28" text-anchor="middle" font-size="13" fill="#2563eb" font-family="sans-serif" font-weight="600">Blowgorithm</text>
      <text x="105" y="42" text-anchor="middle" font-size="8.5" fill="#6b6860" font-family="sans-serif">Visual Flowchart Builder</text>
    </svg>`,
  },
  {
    label: 'Step 2 of 9',
    title: 'The Interface Layout',
    desc: 'The app is divided into four main zones. Understanding where everything lives will help you work faster.',
    tips: [
      '🔵 <b>Header (top)</b> — File, zoom, run controls & window toggles',
      '🟣 <b>Left Sidebar</b> — Shape palette to add nodes',
      '⬜ <b>Canvas (centre)</b> — Your flowchart workspace',
      '🟢 <b>Right Panel</b> — Output log from running your chart',
    ],
    illustration: `<svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="8" width="200" height="114" rx="0" fill="#f5f5f2" stroke="#e0ddd8" stroke-width="1.2"/>
      <rect x="10" y="8" width="200" height="20" rx="0" fill="#2563eb" opacity=".85"/>
      <rect x="10" y="28" width="200" height="11" rx="0" fill="#2563eb" opacity=".6"/>
      <rect x="10" y="28" width="46" height="94" rx="0" fill="#7c3aed" opacity=".12" stroke="#7c3aed" stroke-width=".8"/>
      <rect x="170" y="28" width="40" height="94" rx="0" fill="#16a34a" opacity=".1" stroke="#16a34a" stroke-width=".8"/>
      <rect x="56" y="28" width="114" height="94" rx="0" fill="#fff" opacity=".6"/>
      <text x="110" y="18" text-anchor="middle" font-size="8" fill="#fff" font-family="sans-serif" font-weight="600">Header</text>
      <text x="33" y="80" text-anchor="middle" font-size="7.5" fill="#5b21b6" font-family="sans-serif" font-weight="600">Side-</text>
      <text x="33" y="90" text-anchor="middle" font-size="7.5" fill="#5b21b6" font-family="sans-serif" font-weight="600">bar</text>
      <text x="113" y="78" text-anchor="middle" font-size="9" fill="#6b6860" font-family="sans-serif">Canvas</text>
      <text x="190" y="78" text-anchor="middle" font-size="7" fill="#15803d" font-family="sans-serif">Out-</text>
      <text x="190" y="88" text-anchor="middle" font-size="7" fill="#15803d" font-family="sans-serif">put</text>
      <text x="110" y="36" text-anchor="middle" font-size="7" fill="#1d4ed8" font-family="sans-serif">Status Bar</text>
    </svg>`,
  },
  {
    label: 'Step 3 of 9',
    title: 'Adding Shapes',
    desc: 'There are two ways to add a node to the canvas. Pick whichever feels natural to you.',
    tips: [
      '🖱️ <b>Click a shape</b> in the sidebar, then click on the canvas to place it',
      '✋ <b>Drag a shape</b> directly from the sidebar and drop it anywhere on the canvas',
      '🔄 Press <b>Escape</b> to cancel placement and return to Select mode',
    ],
    illustration: `<svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="20" width="52" height="90" rx="4" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1.2"/>
      <rect x="14" y="30" width="40" height="18" rx="3" fill="#dbeafe" stroke="#2563eb" stroke-width="1"/>
      <text x="34" y="43" text-anchor="middle" font-size="7.5" fill="#2563eb" font-family="sans-serif">Process</text>
      <rect x="14" y="52" width="40" height="18" rx="3" fill="#fef9c3" stroke="#ca8a04" stroke-width="1"/>
      <text x="34" y="65" text-anchor="middle" font-size="7.5" fill="#ca8a04" font-family="sans-serif">Decision</text>
      <rect x="14" y="74" width="40" height="18" rx="3" fill="#fce7f3" stroke="#db2777" stroke-width="1"/>
      <text x="34" y="87" text-anchor="middle" font-size="7.5" fill="#db2777" font-family="sans-serif">Input</text>
      <path d="M63 65 L85 65" stroke="#94a3b8" stroke-width="1.3" stroke-dasharray="3,2" marker-end="url(#tah2)"/>
      <rect x="88" y="48" width="55" height="34" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
      <text x="115" y="69" text-anchor="middle" font-size="10" fill="#2563eb" font-family="sans-serif" font-weight="500">Process</text>
      <circle cx="88" cy="48" r="5" fill="#2563eb" opacity=".2" stroke="#2563eb" stroke-width="1"/>
      <circle cx="88" cy="48" r="2.5" fill="#2563eb"/>
      <defs><marker id="tah2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/></marker></defs>
      <text x="155" y="55" font-size="7.5" fill="#6b6860" font-family="sans-serif">← drop</text>
      <text x="155" y="67" font-size="7.5" fill="#6b6860" font-family="sans-serif">   here</text>
    </svg>`,
  },
  {
    label: 'Step 4 of 9',
    title: 'Connecting Nodes',
    desc: 'Connections define the flow of your algorithm. Each node has coloured dots on its edges — these are connection ports.',
    tips: [
      '🔵 <b>Hover</b> a node to reveal the blue connection dots',
      '➡️ <b>Click and drag</b> from a dot to another node to create an arrow',
      '🟢 <b>Decision nodes</b> have True (bottom) and False (right) outputs',
      '🗑️ <b>Click any arrow</b> to delete that connection',
    ],
    illustration: `<svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="37" cy="65" rx="32" ry="18" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
      <text x="37" y="69" text-anchor="middle" font-size="9" fill="#16a34a" font-family="sans-serif">Start</text>
      <circle cx="70" cy="65" r="4.5" fill="#2563eb" opacity=".9"/>
      <path d="M70 65 L95 65" stroke="#2563eb" stroke-width="1.5" marker-end="url(#tah3)"/>
      <rect x="98" y="50" width="55" height="30" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
      <text x="125" y="69" text-anchor="middle" font-size="9" fill="#2563eb" font-family="sans-serif">x = 10</text>
      <path d="M153 65 L175 65" stroke="#94a3b8" stroke-width="1.3" marker-end="url(#tah3)"/>
      <ellipse cx="197" cy="65" rx="20" ry="14" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
      <text x="198" y="69" text-anchor="middle" font-size="9" fill="#16a34a" font-family="sans-serif">End</text>
      <circle cx="5" cy="65" r="4.5" fill="#2563eb" opacity=".3"/>
      <circle cx="38" cy="47" r="4.5" fill="#2563eb" opacity=".3"/>
      <circle cx="38" cy="83" r="4.5" fill="#2563eb" opacity=".3"/>
      <defs><marker id="tah3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/></marker></defs>
      <text x="115" y="110" text-anchor="middle" font-size="8" fill="#6b6860" font-family="sans-serif">Drag from blue dot to connect</text>
    </svg>`,
  },
  {
    label: 'Step 5 of 9',
    title: 'Editing Node Properties',
    desc: 'Every node has properties you can customise — labels, variable names, conditions, and more.',
    tips: [
      '🖱️ <b>Double-click</b> any node to open its Properties panel',
      '🖱️ <b>Right-click</b> a node for a quick menu: Properties, Duplicate, Remove',
      '✏️ Edit the <b>Label</b> to change what text appears on the shape',
      '⚙️ Extra fields appear depending on node type (e.g. variable name for Input)',
    ],
    illustration: `<svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="45" width="70" height="40" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
      <text x="47" y="69" text-anchor="middle" font-size="9" fill="#2563eb" font-family="sans-serif">x = x + 1</text>
      <text x="47" y="80" text-anchor="middle" font-size="7" fill="#2563eb" font-family="sans-serif" opacity=".6">double-click</text>
      <path d="M83 65 L110 65" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3,2" marker-end="url(#tah4)"/>
      <rect x="112" y="18" width="96" height="94" rx="6" fill="#fff" stroke="#e0ddd8" stroke-width="1.2" filter="url(#sh4)"/>
      <rect x="112" y="18" width="96" height="24" rx="3" fill="#f9f9f7" stroke="#e0ddd8" stroke-width="1.2"/>
      <!-- <rect x="112" y="30" width="96" height="10" rx="0" fill="#f9f9f7"/> -->
      <text x="160" y="33" text-anchor="middle" font-size="8" fill="#6b6860" font-family="sans-serif" font-weight="600">Process #3</text>
      <text x="120" y="58" font-size="7" fill="#6b6860" font-family="sans-serif">Label</text>
      <rect x="120" y="62" width="80" height="14" rx="3" fill="#fff" stroke="#ccc9c3" stroke-width="1"/>
      <text x="126" y="72.5" font-size="7.5" fill="#1a1a18" font-family="sans-serif">x = x + 1</text>
      <text x="120" y="88" font-size="7" fill="#6b6860" font-family="sans-serif">Assign</text>
      <rect x="120" y="92" width="80" height="14" rx="3" fill="#fff" stroke="#2563eb" stroke-width="1"/>
      <text x="126" y="102.5" font-size="7.5" fill="#1a1a18" font-family="sans-serif">x = x + 1</text>
      <defs>
        <marker id="tah4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/></marker>
        <filter id="sh4"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity=".12"/></filter>
      </defs>
    </svg>`,
  },
  {
    label: 'Step 6 of 9',
    title: 'Running Your Flowchart',
    desc: 'Once your flowchart is built you can execute it. The interpreter follows your arrows and runs the logic step by step.',
    tips: [
      '▶️ Click <b>Run</b> in the header to execute the full flowchart',
      '⏯️ Click <b>Step</b> to walk through one node at a time (great for debugging)',
      '📟 The <b>Console</b> window shows output, input prompts and errors',
      '🟢 The currently executing node glows green during a run',
    ],
    illustration: `<svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="35" cy="65" rx="28" ry="16" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
      <text x="35" y="69" text-anchor="middle" font-size="9" fill="#16a34a" font-family="sans-serif">Start</text>
      <path d="M63 65 L82 65" stroke="#16a34a" stroke-width="2" marker-end="url(#tah5)"/>
      <rect x="84" y="50" width="52" height="30" rx="4" fill="#dcfce7" stroke="#16a34a" stroke-width="2.5" filter="url(#glow5)"/>
      <text x="110" y="69" text-anchor="middle" font-size="9" fill="#16a34a" font-family="sans-serif" font-weight="600">x = 42</text>
      <path d="M136 65 L155 65" stroke="#94a3b8" stroke-width="1.3" marker-end="url(#tah5)"/>
      <ellipse cx="175" cy="65" rx="28" ry="16" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
      <text x="175" y="69" text-anchor="middle" font-size="9" fill="#16a34a" font-family="sans-serif">End</text>
      <rect x="60" y="92" width="100" height="28" rx="4" fill="#1e1e2e" stroke="#3b82f6" stroke-width="1"/>
      <text x="68" y="104" font-size="7.5" fill="#a6e3a1" font-family="monospace">▶ x = 42</text>
      <text x="68" y="114" font-size="7.5" fill="#6c7086" font-family="monospace"># Output log</text>
      <defs>
        <marker id="tah5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round"/></marker>
        <filter id="glow5"><feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#16a34a" flood-opacity=".5"/></filter>
      </defs>
    </svg>`,
  },
  {
    label: 'Step 7 of 9',
    title: 'Loops & Decisions',
    desc: 'Blowgorithm supports all common control-flow structures. These are found in the Loops section of the sidebar.',
    tips: [
      '🔷 <b>Decision</b> — True path goes down, False path goes right',
      '🔵 <b>For Loop</b> — set variable, start, end and step in Properties',
      '🟢 <b>While Loop</b> — loops while a condition is true',
      '🟣 <b>Do…While</b> — always runs once, then checks condition',
    ],
    illustration: `<svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="60,20 100,45 60,70 20,45" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
      <text x="60" y="49" text-anchor="middle" font-size="8" fill="#92400e" font-family="sans-serif">x &gt; 0 ?</text>
      <path d="M60 70 L60 95" stroke="#16a34a" stroke-width="1.3" marker-end="url(#tah6)"/>
      <text x="65" y="86" font-size="7.5" fill="#16a34a" font-family="sans-serif">True</text>
      <path d="M100 45 L140 45" stroke="#dc2626" stroke-width="1.3" marker-end="url(#tah6r)"/>
      <text x="108" y="40" font-size="7.5" fill="#dc2626" font-family="sans-serif">False</text>
      <rect x="30" y="97" width="60" height="24" rx="4" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
      <text x="60" y="113" text-anchor="middle" font-size="8" fill="#2563eb" font-family="sans-serif">print x</text>
      <ellipse cx="168" cy="45" rx="25" ry="15" fill="#dcfce7" stroke="#16a34a" stroke-width="1.2"/>
      <text x="168" y="49" text-anchor="middle" font-size="8" fill="#16a34a" font-family="sans-serif">End</text>
      <defs>
        <marker id="tah6" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round"/></marker>
        <marker id="tah6r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round"/></marker>
      </defs>
    </svg>`,
  },
  {
    label: 'Step 8 of 9',
    title: 'Keyboard Shortcuts',
    desc: 'Blowgorithm has a full set of shortcuts to keep your hands on the keyboard and work fast.',
    tips: [
      '<kbd>Del</kbd> / <kbd>Backspace</kbd> — Delete selected node(s)',
      '<kbd>Ctrl+C</kbd> / <kbd>Ctrl+V</kbd> — Copy & paste selected nodes',
      '<kbd>Ctrl+Z</kbd> / <kbd>Ctrl+Y</kbd> — Undo & redo',
      '<kbd>Ctrl+A</kbd> — Select all nodes',
      '<kbd>Escape</kbd> — Cancel current action / close window',
      '<kbd>R</kbd> — Run the flowchart',
      '<kbd>Scroll wheel</kbd> — Zoom in/out on canvas',
      '<kbd> Right-click drag </kbd> / <kbd>Middle-click drag</kbd> / <kbd>Alt+drag</kbd> — Pan the canvas',
    ],
    illustration: `<svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="25" width="180" height="88" rx="8" fill="#f5f5f2" stroke="#e0ddd8" stroke-width="1.2"/>
      <rect x="30" y="35" width="28" height="18" rx="3" fill="#fff" stroke="#ccc9c3" stroke-width="1.2"/>
<text x="44" y="48" text-anchor="middle" font-size="8" fill="#1a1a18" font-family="sans-serif">Del</text>
      <rect x="63" y="35" width="28" height="18" rx="3" fill="#fff" stroke="#ccc9c3" stroke-width="1.2"/>
<text x="77" y="48" text-anchor="middle" font-size="8" fill="#1a1a18" font-family="sans-serif">Esc</text>
      <rect x="96" y="35" width="28" height="18" rx="3" fill="#dbeafe" stroke="#2563eb" stroke-width="1.2"/>
<text x="110" y="48" text-anchor="middle" font-size="8" fill="#2563eb" font-family="sans-serif">R</text>
      <rect x="129" y="35" width="28" height="18" rx="3" fill="#fff" stroke="#ccc9c3" stroke-width="1.2"/>
<text x="143" y="48" text-anchor="middle" font-size="8" fill="#1a1a18" font-family="sans-serif">Ctrl</text>
      <rect x="162" y="35" width="28" height="18" rx="3" fill="#dcfce7" stroke="#16a34a" stroke-width="1.2"/>
<text x="176" y="48" text-anchor="middle" font-size="8" fill="#16a34a" font-family="sans-serif">A</text>
      <rect x="30" y="60" width="28" height="18" rx="3" fill="#dcfce7" stroke="#16a34a" stroke-width="1.2"/>
<text x="44" y="73" text-anchor="middle" font-size="8" fill="#16a34a" font-family="sans-serif">C</text>
      <rect x="63" y="60" width="28" height="18" rx="3" fill="#dcfce7" stroke="#16a34a" stroke-width="1.2"/>
<text x="77" y="73" text-anchor="middle" font-size="8" fill="#16a34a" font-family="sans-serif">V</text>

      <rect x="96" y="60" width="28" height="18" rx="3" fill="#dcfce7" stroke="#16a34a" stroke-width="1.2"/>
<text x="110" y="72" text-anchor="middle" font-size="8" fill="#16a34a" font-family="sans-serif">Z</text>
      <rect x="129" y="60" width="28" height="18" rx="3" fill="#dcfce7" stroke="#16a34a" stroke-width="1.2"/>
<text x="143" y="72" text-anchor="middle" font-size="8" fill="#16a34a" font-family="sans-serif">Y</text>

      <rect x="30" y="85" width="68" height="18" rx="3" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.2"/>
<text x="63" y="97" text-anchor="middle" font-size="8" fill="#92400e" font-family="sans-serif">Scroll = Zoom</text>
      <rect x="103" y="85" width="87" height="18" rx="3" fill="#fff" stroke="#ccc9c3" stroke-width="1.2"/>
<text x="147" y="96" text-anchor="middle" font-size="7" fill="#6b6860" font-family="sans-serif">Space / Middle drag = Pan</text>
    </svg>`,
  },
  {
    label: 'Step 9 of 9',
    title: "You're All Set! 🎉",
    desc: "You now know everything you need to build and run flowcharts in Blowgorithm. Start with a simple algorithm and work your way up!",
    tips: [
      '💡 Start with <b>Start → Process → End</b> as a template',
      '🐢 Try the <b>Turtle</b> shapes to draw graphics with code',
      '🐍 Use <b>Python</b> to export your flowchart as runnable Python code',
      '💾 Use <b>Save / Open</b> to persist your work as a <code>.flow</code> file',
    ],
    illustration: `<svg viewBox="0 0 220 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="40" cy="65" rx="30" ry="17" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
      <text x="40" y="69" text-anchor="middle" font-size="9" fill="#16a34a" font-family="sans-serif">Start</text>
      <path d="M70 65 L88 65" stroke="#94a3b8" stroke-width="1.2" marker-end="url(#tah9)"/>
      <polygon points="105,47 135,65 105,83 75,65" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
      <text x="105" y="69" text-anchor="middle" font-size="8" fill="#92400e" font-family="sans-serif">n &gt; 1?</text>
      <path d="M105 83 L105 105" stroke="#16a34a" stroke-width="1.2" marker-end="url(#tah9)"/>
      <rect x="75" y="107" width="60" height="18" rx="4" fill="#fff7ed" stroke="#ea580c" stroke-width="1.2"/>
      <text x="105" y="120" text-anchor="middle" font-size="8" fill="#ea580c" font-family="sans-serif">print n</text>
      <path d="M135 65 L165 65" stroke="#dc2626" stroke-width="1.2" marker-end="url(#tah9r)"/>
      <ellipse cx="185" cy="65" rx="28" ry="17" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
      <text x="185" y="69" text-anchor="middle" font-size="9" fill="#16a34a" font-family="sans-serif">End</text>
      <text x="110" y="18" text-anchor="middle" font-size="11" fill="#2563eb" font-family="sans-serif" font-weight="700">Happy Coding! 🚀</text>
      <defs>
        <marker id="tah9" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/></marker>
        <marker id="tah9r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-linecap="round"/></marker>
      </defs>
    </svg>`,
  },
];

let _tutorialStep = 0;

function openTutorialWin() {
  _tutorialStep = 0;
  renderTutorialStep();
  document.getElementById('tutorial-win').classList.add('open');
}

function closeTutorialWin() {
  document.getElementById('tutorial-win').classList.remove('open');
}

function tutorialNext() {
  if (_tutorialStep < TUTORIAL_STEPS.length - 1) {
    _tutorialStep++;
    renderTutorialStep();
  } else {
    closeTutorialWin();
  }
}

function tutorialPrev() {
  if (_tutorialStep > 0) {
    _tutorialStep--;
    renderTutorialStep();
  }
}

function tutorialGoTo(i) {
  _tutorialStep = i;
  renderTutorialStep();
}

function renderTutorialStep() {
  const s = TUTORIAL_STEPS[_tutorialStep];
  const total = TUTORIAL_STEPS.length;
  const pct = ((_tutorialStep + 1) / total) * 100;

  // Progress bar
  document.getElementById('tutorial-progress-bar').style.width = pct + '%';

  // Step dots (in footer)
  const dotsEl = document.getElementById('tutorial-dots');
  dotsEl.innerHTML = TUTORIAL_STEPS.map((_, i) =>
    `<button class="tut-dot${i === _tutorialStep ? ' active' : ''}" onclick="tutorialGoTo(${i})" title="Step ${i + 1}"></button>`
  ).join('');

  // Left pane
  document.getElementById('tutorial-illustration').innerHTML = s.illustration || '';
  document.getElementById('tutorial-step-label').textContent = `${_tutorialStep + 1} / ${total} — ${s.label.split(' of ')[0].replace(/Step \d+/, '').trim() || s.label}`;
  document.getElementById('tutorial-step-label').textContent = s.label;

  // Right pane
  document.getElementById('tutorial-title').textContent = s.title;
  document.getElementById('tutorial-desc').textContent = s.desc;

  const tipsEl = document.getElementById('tutorial-tips');
  if (s.tips && s.tips.length) {
    tipsEl.innerHTML = s.tips.map(t => `<div class="tut-tip">${t}</div>`).join('');
    tipsEl.style.display = '';
  } else {
    tipsEl.innerHTML = '';
    tipsEl.style.display = 'none';
  }

  // Buttons
  const prevBtn = document.getElementById('tutorial-btn-prev');
  const nextBtn = document.getElementById('tutorial-btn-next');
  prevBtn.disabled = _tutorialStep === 0;
  const isLast = _tutorialStep === total - 1;
  nextBtn.innerHTML = isLast
    ? `Done <svg viewBox="0 0 14 14" fill="none" width="11" height="11"><path d="M2 7l4 4 6-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    : `Next <svg viewBox="0 0 14 14" fill="none" width="11" height="11"><path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// ═══════════════════════════════════════════════
//  THEME SYSTEM
// ═══════════════════════════════════════════════
const THEMES = ['light', 'dark', 'dracula', 'rich'];
let _currentTheme = 'light';

function setTheme(name) {
  if (!THEMES.includes(name)) name = 'light';
  _currentTheme = name;
  // Apply to <html> so all CSS selectors [data-theme=...] work
  document.documentElement.setAttribute('data-theme', name);
  // Remove attribute for light (it's the default :root)
  if (name === 'light') document.documentElement.removeAttribute('data-theme');
  // Update active state on picker options
  document.querySelectorAll('.theme-opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.theme === name);
  });
  // Persist to localStorage
  try { localStorage.setItem('blowgorithm-theme', name); } catch (e) { }
  // Re-render canvas connections so arrow/dot colours match
  renderConns();
}

function toggleThemePicker() {
  const picker = document.getElementById('theme-picker');
  if (!picker) return;
  picker.classList.toggle('open');
}

// Close theme picker on outside click
document.addEventListener('mousedown', e => {
  const picker = document.getElementById('theme-picker');
  const btn = document.getElementById('theme-toggle-btn');
  if (!picker) return;
  if (picker.classList.contains('open') && !picker.contains(e.target) && btn && !btn.contains(e.target)) {
    picker.classList.remove('open');
  }
});

// Restore saved theme on load
(function () {
  try {
    const saved = localStorage.getItem('blowgorithm-theme');
    if (saved && THEMES.includes(saved)) setTheme(saved);
  } catch (e) { }
})();

// Close tutorial when clicking the overlay background
document.getElementById('tutorial-overlay').addEventListener('click', closeTutorialWin);

// Keyboard nav for tutorial
document.addEventListener('keydown', e => {
  if (!document.getElementById('tutorial-win').classList.contains('open')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); tutorialNext(); }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); tutorialPrev(); }
});
