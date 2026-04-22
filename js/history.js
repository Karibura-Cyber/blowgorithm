// ═══════════════════════════════════════════════
//  HISTORY — Undo / Redo
// ═══════════════════════════════════════════════
const MAX_HISTORY = 100;
let _undoStack = [];
let _redoStack = [];

/** Call before any destructive change to snapshot current state. */
function historySnapshot() {
  const snap = {
    nodes: nodes.map(n => ({ ...n, _g: null, vars: { ...n.vars } })),
    conns: conns.map(c => ({ ...c })),
    nextId,
  };
  _undoStack.push(snap);
  if (_undoStack.length > MAX_HISTORY) _undoStack.shift();
  _redoStack = [];           // any new action clears redo
  _updateUndoRedoUI();
}

function _restoreSnap(snap) {
  // Remove all current node DOM elements
  nodes.forEach(n => { if (n._g) nodeLayer.removeChild(n._g); });
  nodeLayer.innerHTML = '';
  connLayer.innerHTML = '';

  nodes   = snap.nodes.map(n => ({ ...n, _g: null, vars: { ...n.vars } }));
  conns   = snap.conns.map(c => ({ ...c }));
  nextId  = snap.nextId;
  selIds  = new Set();
  selId   = null;

  nodes.forEach(n => renderNode(n));
  renderConns();
  renderProps(null);
  _updateUndoRedoUI();
}

function undo() {
  if (_undoStack.length === 0) return;
  // Save current state to redo
  const current = {
    nodes: nodes.map(n => ({ ...n, _g: null, vars: { ...n.vars } })),
    conns: conns.map(c => ({ ...c })),
    nextId,
  };
  _redoStack.push(current);
  const snap = _undoStack.pop();
  _restoreSnap(snap);
  statusMsg.textContent = 'Undo';
}

function redo() {
  if (_redoStack.length === 0) return;
  // Save current state to undo
  const current = {
    nodes: nodes.map(n => ({ ...n, _g: null, vars: { ...n.vars } })),
    conns: conns.map(c => ({ ...c })),
    nextId,
  };
  _undoStack.push(current);
  const snap = _redoStack.pop();
  _restoreSnap(snap);
  statusMsg.textContent = 'Redo';
}

function _updateUndoRedoUI() {
  // Update toolbar buttons if they exist
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');
  if (undoBtn) undoBtn.disabled = _undoStack.length === 0;
  if (redoBtn) redoBtn.disabled = _redoStack.length === 0;
}
