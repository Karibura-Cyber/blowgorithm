// ═══════════════════════════════════════════════
//  MAIN — INITIALIZATION
// ═══════════════════════════════════════════════

// Attach rubber-band rect to the temp layer (must happen after DOM is ready)
tempLayer.appendChild(rbRect);

// ═══════════════════════════════════════════════
//  SAMPLE FLOWCHART
// ═══════════════════════════════════════════════
function buildSample() {
  const s = addNode('start', 260, 60); s.label = 'Start'; s.vars.role = 'start'; redrawNode(s);
  const i = addNode('io', 260, 155); i.label = 'รับค่า x'; i.vars.varName = 'x'; redrawNode(i);
  const d = addNode('decision', 260, 270); d.label = 'x > 0 ?'; d.vars.cond = 'x > 0'; redrawNode(d);
  const p = addNode('process', 440, 370); p.label = 'x = x * 2'; p.vars.expr = 'x = x * 2'; redrawNode(p);
  const o = addNode('output_only', 260, 480); o.label = 'แสดง x'; o.vars.expr = 'x'; redrawNode(o);
  const n2 = addNode('process', 80, 370); n2.label = 'x = -x'; n2.vars.expr = 'x = -x'; redrawNode(n2);
  const e = addNode('start', 260, 575); e.label = 'End'; e.vars.role = 'end'; redrawNode(e);

  conns.push({ id: nextId++, from: s.id,  fromSide: 'bottom', to: i.id,  toSide: 'top',   label: '' });
  conns.push({ id: nextId++, from: i.id,  fromSide: 'bottom', to: d.id,  toSide: 'top',   label: '' });
  conns.push({ id: nextId++, from: d.id,  fromSide: 'bottom', to: p.id,  toSide: 'top',   label: '' });
  conns.push({ id: nextId++, from: d.id,  fromSide: 'left',   to: n2.id, toSide: 'top',   label: '' });
  conns.push({ id: nextId++, from: p.id,  fromSide: 'bottom', to: o.id,  toSide: 'right', label: '' });
  conns.push({ id: nextId++, from: n2.id, fromSide: 'bottom', to: o.id,  toSide: 'left',  label: '' });
  conns.push({ id: nextId++, from: o.id,  fromSide: 'bottom', to: e.id,  toSide: 'top',   label: '' });
  renderConns();
  deselect();

  // Clear the undo stack that was filled during sample build
  _undoStack.length = 0;
  _redoStack.length = 0;
  _updateUndoRedoUI();

  statusMsg.textContent = 'โปรแกรมตัวอย่างโหลดแล้ว — กด ▶ Run เพื่อทดสอบ';
}

// ── Bootstrap ──
applyTransform();
initWindows();
buildSample();
