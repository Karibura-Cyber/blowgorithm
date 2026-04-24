// ═══════════════════════════════════════════════
//  SVG HELPER
// ═══════════════════════════════════════════════
function ns(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }

// ═══════════════════════════════════════════════
//  NODE CREATION
// ═══════════════════════════════════════════════
function addNode(type, x, y) {
  historySnapshot();
  const def = SHAPE_DEFS[type];
  const n = {
    id: nextId++, type,
    x: x - def.w / 2, y: y - def.h / 2,
    w: def.w, h: def.h,
    label: def.label,
    vars: { ...(def.defaultVars || {}) },
    _g: null
  };
  // Decision node: set default true/false exit sides
  if (type === 'decision') {
    if (!n.vars.trueDir)  n.vars.trueDir  = 'bottom';
    if (!n.vars.falseDir) n.vars.falseDir = 'right';
  }
  nodes.push(n);
  renderNode(n);
  selectNode(n.id);
  setMode('select');
  return n;
}

// ═══════════════════════════════════════════════
//  SHAPE GEOMETRY
// ═══════════════════════════════════════════════
function polyIOPts(n) {
  const sk = 12;
  return `${n.x + sk},${n.y} ${n.x + n.w},${n.y} ${n.x + n.w - sk},${n.y + n.h} ${n.x},${n.y + n.h}`;
}

function dotPositions(n) {
  return [
    { side: 'top',    x: n.x + n.w / 2, y: n.y },
    { side: 'right',  x: n.x + n.w,     y: n.y + n.h / 2 },
    { side: 'bottom', x: n.x + n.w / 2, y: n.y + n.h },
    { side: 'left',   x: n.x,           y: n.y + n.h / 2 },
  ];
}

function getDotXY(n, side) {
  return dotPositions(n).find(d => d.side === side) || { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}

// ═══════════════════════════════════════════════
//  AUTO-SIZE NODE TO LABEL
// ═══════════════════════════════════════════════
const _measureSvg = (() => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;top:-999px;left:-999px';
  document.body.appendChild(s);
  return s;
})();
const _measureTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
_measureTxt.setAttribute('font-family', "'Noto Sans Thai',sans-serif");
_measureTxt.setAttribute('font-weight', '500');
_measureSvg.appendChild(_measureTxt);

function measureLabel(label, fontSize = 12.5) {
  _measureTxt.setAttribute('font-size', String(fontSize));
  const lines = label.split('\n');
  let maxW = 0;
  lines.forEach(l => {
    _measureTxt.textContent = l;
    try { maxW = Math.max(maxW, _measureTxt.getComputedTextLength()); } catch (e) {}
  });
  return { w: maxW, lines: lines.length };
}

function fitNodeToLabel(n) {
  const def = SHAPE_DEFS[n.type];
  if (!def) return;
  const minW = def.w, minH = def.h;
  const { w: textW, lines } = measureLabel(n.label, 12.5);
  const lineH = 18;
  let padX, padY;
  if (n.type === 'decision')          { padX = 70; padY = 28; }
  else if (n.type === 'start')        { padX = 48; padY = 16; }
  else if (n.type === 'io' || n.type === 'output_only') { padX = 52; padY = 16; }
  else if (n.type === 'for_loop' || n.type === 'while_loop') { padX = 52; padY = 18; }
  else if (n.type === 'do_while')     { padX = 44; padY = 26; }
  else if (n.type === 'call')         { padX = 44; padY = 16; }
  else if (n.type.startsWith('turtle_')) { padX = 44; padY = 14; }
  else                                { padX = 32; padY = 16; }
  const newW = Math.max(minW, Math.ceil(textW + padX));
  const newH = Math.max(minH, Math.ceil(lines * lineH + padY));
  const cx = n.x + n.w / 2, cy = n.y + n.h / 2;
  n.w = newW; n.h = newH;
  n.x = cx - newW / 2; n.y = cy - newH / 2;
}

// ═══════════════════════════════════════════════
//  NODE RENDERING
// ═══════════════════════════════════════════════
function makeShape(n) {
  const def = SHAPE_DEFS[n.type];
  let el;
  if (n.type === 'start') {
    el = ns('ellipse');
    el.setAttribute('cx', n.x + n.w / 2); el.setAttribute('cy', n.y + n.h / 2);
    el.setAttribute('rx', n.w / 2); el.setAttribute('ry', n.h / 2);
  } else if (n.type === 'decision') {
    el = ns('polygon');
    const cx = n.x + n.w / 2, cy = n.y + n.h / 2;
    el.setAttribute('points', `${cx},${n.y} ${n.x + n.w},${cy} ${cx},${n.y + n.h} ${n.x},${cy}`);
  } else if (n.type === 'io' || n.type === 'output_only') {
    el = ns('polygon');
    el.setAttribute('points', polyIOPts(n));
  } else if (n.type === 'for_loop' || n.type === 'while_loop') {
    // Hexagon — pre-test loop
    el = ns('polygon');
    const sk = 16;
    el.setAttribute('points',
      `${n.x + sk},${n.y} ${n.x + n.w - sk},${n.y} ${n.x + n.w},${n.y + n.h / 2} ${n.x + n.w - sk},${n.y + n.h} ${n.x + sk},${n.y + n.h} ${n.x},${n.y + n.h / 2}`
    );
  } else if (n.type === 'do_while') {
    // Pentagon pointing down — post-test loop
    el = ns('polygon');
    const cx = n.x + n.w / 2;
    el.setAttribute('points',
      `${n.x},${n.y} ${n.x + n.w},${n.y} ${n.x + n.w},${n.y + n.h * 0.72} ${cx},${n.y + n.h} ${n.x},${n.y + n.h * 0.72}`
    );
  } else if (n.type.startsWith('turtle_')) {
    el = ns('rect');
    el.setAttribute('x', n.x); el.setAttribute('y', n.y);
    el.setAttribute('width', n.w); el.setAttribute('height', n.h);
    el.setAttribute('rx', 8);
  } else {
    el = ns('rect');
    el.setAttribute('x', n.x); el.setAttribute('y', n.y);
    el.setAttribute('width', n.w); el.setAttribute('height', n.h);
    el.setAttribute('rx', 4);
  }
  el.setAttribute('fill', def.fill);
  el.setAttribute('stroke', def.stroke);
  el.setAttribute('stroke-width', '1.5');
  el.style.transition = 'filter .15s';
  return el;
}

function makeDots(n) {
  const def = SHAPE_DEFS[n.type];
  const positions = dotPositions(n);
  const dots = [];
  positions.forEach(dp => {
    const c = ns('circle');
    c.setAttribute('cx', dp.x); c.setAttribute('cy', dp.y); c.setAttribute('r', 5);
    c.setAttribute('fill', 'white');
    c.setAttribute('stroke', def.stroke);
    c.setAttribute('stroke-width', '1.5');
    c.style.cursor = 'crosshair';
    c.style.opacity = '0';
    c.style.transition = 'opacity .1s';
    c.dataset.side = dp.side;
    c.addEventListener('mousedown', e => {
      e.stopPropagation();
      startConn(n, dp.x, dp.y, dp.side);
    });
    dots.push(c);
  });
  return dots;
}

function makeDropTarget(n) {
  const r = ns('rect');
  r.setAttribute('x', n.x - 6); r.setAttribute('y', n.y - 6);
  r.setAttribute('width', n.w + 12); r.setAttribute('height', n.h + 12);
  r.setAttribute('rx', 8);
  r.setAttribute('fill', 'transparent');
  r.setAttribute('stroke', 'none');
  r.dataset.dropId = n.id;
  return r;
}

function renderNode(n) {
  fitNodeToLabel(n);
  if (n._g) nodeLayer.removeChild(n._g);
  const g = ns('g');
  g.dataset.id = n.id;
  g.style.cursor = 'move';

  const shape = makeShape(n);
  const def = SHAPE_DEFS[n.type];

  if (n.type === 'call') {
    const l1 = ns('line');
    l1.setAttribute('x1', n.x + 10); l1.setAttribute('y1', n.y + 2);
    l1.setAttribute('x2', n.x + 10); l1.setAttribute('y2', n.y + n.h - 2);
    l1.setAttribute('stroke', def.stroke); l1.setAttribute('stroke-width', '1.2');
    const l2 = ns('line');
    l2.setAttribute('x1', n.x + n.w - 10); l2.setAttribute('y1', n.y + 2);
    l2.setAttribute('x2', n.x + n.w - 10); l2.setAttribute('y2', n.y + n.h - 2);
    l2.setAttribute('stroke', def.stroke); l2.setAttribute('stroke-width', '1.2');
    g.appendChild(shape); g.appendChild(l1); g.appendChild(l2);
  } else if (n.type === 'declare') {
    const lt = ns('line');
    lt.setAttribute('x1', n.x + 4); lt.setAttribute('y1', n.y + 8);
    lt.setAttribute('x2', n.x + n.w - 4); lt.setAttribute('y2', n.y + 8);
    lt.setAttribute('stroke', def.stroke); lt.setAttribute('stroke-width', '1'); lt.setAttribute('stroke-opacity', '0.5');
    const lb = ns('line');
    lb.setAttribute('x1', n.x + 4); lb.setAttribute('y1', n.y + n.h - 8);
    lb.setAttribute('x2', n.x + n.w - 4); lb.setAttribute('y2', n.y + n.h - 8);
    lb.setAttribute('stroke', def.stroke); lb.setAttribute('stroke-width', '1'); lb.setAttribute('stroke-opacity', '0.5');
    g.appendChild(shape); g.appendChild(lt); g.appendChild(lb);
  } else if (n.type === 'do_while') {
    const dbl = ns('line');
    dbl.setAttribute('x1', n.x + 5); dbl.setAttribute('y1', n.y + n.h - 8);
    dbl.setAttribute('x2', n.x + n.w - 5); dbl.setAttribute('y2', n.y + n.h - 8);
    dbl.setAttribute('stroke', def.stroke); dbl.setAttribute('stroke-width', '1.2'); dbl.setAttribute('stroke-opacity', '0.55');
    g.appendChild(shape); g.appendChild(dbl);
  } else if (n.type.startsWith('turtle_')) {
    const icoMap = {
      turtle_forward: '▲', turtle_left: '↺', turtle_right: '↻',
      turtle_penup: '⬆', turtle_pendown: '⬇', turtle_pencolor: '●',
      turtle_fillcolor: '◆', turtle_beginfill: '▶', turtle_endfill: '◀',
      turtle_home: '⌂', turtle_clear: '✕',
    };
    const ico = ns('text');
    ico.setAttribute('x', n.x + 13); ico.setAttribute('y', n.y + n.h / 2 + 1);
    ico.setAttribute('text-anchor', 'middle'); ico.setAttribute('dominant-baseline', 'central');
    ico.setAttribute('font-size', '12'); ico.setAttribute('fill', def.color);
    ico.setAttribute('opacity', '0.55'); ico.setAttribute('pointer-events', 'none');
    ico.textContent = icoMap[n.type] || '🐢';
    g.appendChild(shape); g.appendChild(ico);
  } else {
    g.appendChild(shape);
  }

  // Label (support \n via tspan)
  const lines = n.label.split('\n');
  if (lines.length === 1) {
    const txt = ns('text');
    txt.setAttribute('x', n.x + n.w / 2);
    txt.setAttribute('y', n.y + n.h / 2);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('dominant-baseline', 'central');
    txt.setAttribute('font-size', '12.5');
    txt.setAttribute('font-family', "'Noto Sans Thai',sans-serif");
    txt.setAttribute('font-weight', '500');
    txt.setAttribute('fill', def.color);
    txt.setAttribute('pointer-events', 'none');
    txt.textContent = n.label;
    g.appendChild(txt);
  } else {
    const txt = ns('text');
    txt.setAttribute('x', n.x + n.w / 2);
    txt.setAttribute('y', n.y + n.h / 2 - (lines.length - 1) * 8);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('dominant-baseline', 'central');
    txt.setAttribute('font-size', '12');
    txt.setAttribute('font-family', "'Noto Sans Thai',sans-serif");
    txt.setAttribute('font-weight', '500');
    txt.setAttribute('fill', def.color);
    txt.setAttribute('pointer-events', 'none');
    lines.forEach((l, i) => {
      const ts = ns('tspan');
      ts.setAttribute('x', n.x + n.w / 2);
      if (i > 0) ts.setAttribute('dy', '1.3em');
      ts.textContent = l;
      txt.appendChild(ts);
    });
    g.appendChild(txt);
  }

  // True/False labels for decision
  if (n.type === 'decision') {
    const trueDir  = n.vars.trueDir  || 'bottom';
    const falseDir = n.vars.falseDir || 'right';

    function decisionLabelPos(side, isTrue) {
      const cx = n.x + n.w / 2, cy = n.y + n.h / 2;
      const off = 13;
      const positions = {
        bottom: { x: cx,          y: n.y + n.h + off, anchor: 'middle' },
        top:    { x: cx,          y: n.y - off + 4,   anchor: 'middle' },
        right:  { x: n.x + n.w + 6, y: cy,            anchor: 'start'  },
        left:   { x: n.x - 6,    y: cy,               anchor: 'end'    },
      };
      return positions[side] || positions['bottom'];
    }

    const tPos = decisionLabelPos(trueDir);
    const tl = ns('text');
    tl.setAttribute('x', tPos.x); tl.setAttribute('y', tPos.y);
    tl.setAttribute('text-anchor', tPos.anchor);
    tl.setAttribute('font-size', '10'); tl.setAttribute('fill', '#16a34a');
    tl.setAttribute('font-family', "'Noto Sans Thai',sans-serif");
    tl.setAttribute('pointer-events', 'none');
    tl.textContent = 'True';

    const fPos = decisionLabelPos(falseDir);
    const fl = ns('text');
    fl.setAttribute('x', fPos.x); fl.setAttribute('y', fPos.y);
    fl.setAttribute('text-anchor', fPos.anchor);
    fl.setAttribute('font-size', '10'); fl.setAttribute('fill', '#dc2626');
    fl.setAttribute('font-family', "'Noto Sans Thai',sans-serif");
    fl.setAttribute('pointer-events', 'none');
    fl.textContent = 'False';

    g.appendChild(tl); g.appendChild(fl);
  }

  // Body/Exit/Loop labels per loop type
  if (n.type === 'for_loop' || n.type === 'while_loop') {
    const bodyLbl = ns('text');
    bodyLbl.setAttribute('x', n.x + n.w / 2); bodyLbl.setAttribute('y', n.y + n.h + 13);
    bodyLbl.setAttribute('text-anchor', 'middle');
    bodyLbl.setAttribute('font-size', '9.5'); bodyLbl.setAttribute('fill', '#16a34a');
    bodyLbl.setAttribute('font-family', "'Noto Sans Thai',sans-serif");
    bodyLbl.setAttribute('pointer-events', 'none');
    bodyLbl.textContent = '\u25bc Body';
    const exitLbl = ns('text');
    exitLbl.setAttribute('x', n.x + n.w + 8); exitLbl.setAttribute('y', n.y + n.h / 2);
    exitLbl.setAttribute('text-anchor', 'start'); exitLbl.setAttribute('dominant-baseline', 'central');
    exitLbl.setAttribute('font-size', '9.5'); exitLbl.setAttribute('fill', '#dc2626');
    exitLbl.setAttribute('font-family', "'Noto Sans Thai',sans-serif");
    exitLbl.setAttribute('pointer-events', 'none');
    exitLbl.textContent = '\u25ba Exit';
    g.appendChild(bodyLbl); g.appendChild(exitLbl);
  }
  if (n.type === 'do_while') {
    const bodyLbl = ns('text');
    bodyLbl.setAttribute('x', n.x + n.w / 2); bodyLbl.setAttribute('y', n.y - 7);
    bodyLbl.setAttribute('text-anchor', 'middle');
    bodyLbl.setAttribute('font-size', '9.5'); bodyLbl.setAttribute('fill', '#16a34a');
    bodyLbl.setAttribute('font-family', "'Noto Sans Thai',sans-serif");
    bodyLbl.setAttribute('pointer-events', 'none');
    bodyLbl.textContent = '\u2191 Loop back';
    const exitLbl = ns('text');
    exitLbl.setAttribute('x', n.x + n.w + 8); exitLbl.setAttribute('y', n.y + n.h * 0.36);
    exitLbl.setAttribute('text-anchor', 'start'); exitLbl.setAttribute('dominant-baseline', 'central');
    exitLbl.setAttribute('font-size', '9.5'); exitLbl.setAttribute('fill', '#dc2626');
    exitLbl.setAttribute('font-family', "'Noto Sans Thai',sans-serif");
    exitLbl.setAttribute('pointer-events', 'none');
    exitLbl.textContent = '\u25ba Exit';
    g.appendChild(bodyLbl); g.appendChild(exitLbl);
  }

  // Connection dots
  const dots = makeDots(n);
  dots.forEach(d => g.appendChild(d));

  // Mouse events
  g.addEventListener('mouseenter', () => {
    dots.forEach(d => d.style.opacity = '1');
    if (!connStart) shape.style.filter = 'brightness(0.96)';
    else {
      shape.setAttribute('stroke-width', '2.5');
      shape.style.filter = 'drop-shadow(0 0 6px rgba(37,99,235,.4))';
    }
  });
  g.addEventListener('mouseleave', () => {
    if (!connStart) dots.forEach(d => d.style.opacity = '0');
    if (!connStart) { shape.style.filter = ''; applySelStyle(n); }
    else { shape.setAttribute('stroke-width', '1.5'); shape.style.filter = ''; }
  });
  g.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (e.target.dataset && e.target.dataset.side) {
      const side = e.target.dataset.side;
      const dp = dotPositions(n).find(d => d.side === side);
      if (dp) { startConn(n, dp.x, dp.y, side); return; }
    }
    if (e.shiftKey) {
      if (selIds.has(n.id)) {
        selIds.delete(n.id);
        applySelStyle(n);
        if (selId === n.id) { selId = selIds.size > 0 ? [...selIds][0] : null; }
        renderConns();
        renderProps(selIds.size === 1 ? nodes.find(x => x.id === selId) : null);
      } else {
        selIds.add(n.id);
        selId = n.id;
        applySelStyle(n);
        renderConns();
        renderProps(selIds.size === 1 ? n : null);
      }
      e.preventDefault(); return;
    }
    if (!selIds.has(n.id)) selectNode(n.id);
    else { selId = n.id; renderProps(selIds.size === 1 ? n : null); }
    const cv = toSVG(e.clientX, e.clientY);
    drag = n;
    dragOff = { x: cv.x - n.x, y: cv.y - n.y };
    dragOffsets.clear();
    selIds.forEach(sid => {
      const sn = nodes.find(x => x.id === sid);
      if (sn) dragOffsets.set(sid, { x: cv.x - sn.x, y: cv.y - sn.y });
    });
    e.preventDefault();
  });
  g.addEventListener('dblclick', e => {
    e.stopPropagation();
    selectNode(n.id);
    openPropsWin(n);
  });
  g.addEventListener('contextmenu', e => {
    e.preventDefault();
    e.stopPropagation();
    selectNode(n.id);
    showNodeCtxMenu(n, e.clientX, e.clientY);
  });

  nodeLayer.appendChild(g);
  n._g = g;
  applySelStyle(n);
}

function applySelStyle(n) {
  if (!n._g) return;
  const shape = n._g.querySelector('ellipse,polygon,rect');
  if (!shape) return;
  const isSel = selIds.has(n.id);
  shape.setAttribute('stroke-width', isSel ? '2.5' : '1.5');
  shape.setAttribute('filter', isSel ? 'drop-shadow(0 0 4px rgba(37,99,235,.35))' : '');
}

function redrawNode(n) {
  renderNode(n);
  renderConns();
}

// ═══════════════════════════════════════════════
//  SELECTION
// ═══════════════════════════════════════════════
function selectNode(id) {
  const oldIds = [...selIds];
  selIds = new Set(id !== null ? [id] : []);
  selId = id;
  oldIds.forEach(sid => { const n = nodes.find(x => x.id === sid); if (n) applySelStyle(n); });
  if (id !== null) { const n = nodes.find(x => x.id === id); if (n) applySelStyle(n); }
  renderConns();
}

function setSelIds(ids) {
  const oldIds = [...selIds];
  selIds = new Set(ids);
  selId = selIds.size > 0 ? [...selIds][0] : null;
  oldIds.forEach(sid => { const n = nodes.find(x => x.id === sid); if (n) applySelStyle(n); });
  selIds.forEach(sid => { const n = nodes.find(x => x.id === sid); if (n) applySelStyle(n); });
  renderConns();
}

function deselect() {
  const oldIds = [...selIds];
  selIds = new Set();
  selId = null;
  oldIds.forEach(sid => { const n = nodes.find(x => x.id === sid); if (n) applySelStyle(n); });
  renderConns();
}

// ═══════════════════════════════════════════════
//  ACTIONS: DELETE / COPY / PASTE / DUPLICATE / CLEAR
// ═══════════════════════════════════════════════
function deleteSelected() {
  if (selIds.size === 0) return;
  historySnapshot();
  selIds.forEach(sid => {
    const n = nodes.find(x => x.id === sid);
    if (n && n._g) nodeLayer.removeChild(n._g);
  });
  nodes = nodes.filter(x => !selIds.has(x.id));
  conns = conns.filter(c => !selIds.has(c.from) && !selIds.has(c.to));
  selIds.clear(); selId = null;
  renderConns();
  renderProps(null);
}

async function clearAll() {
  if (!await customConfirm('ล้างทั้งหมดใช่ไหม? การกระทำนี้ไม่สามารถย้อนกลับได้', 'ล้าง Canvas', 'warn')) return;
  historySnapshot();
  nodeLayer.innerHTML = ''; connLayer.innerHTML = '';
  nodes = []; conns = []; selId = null; selIds = new Set();
  renderProps(null);
}

function newFile() { clearAll(); }

function copySelected() {
  if (selIds.size === 0) return;
  const ids = [...selIds];
  clipboard = ids.map(id => ({ ...nodes.find(n => n.id === id), _g: null }));
  clipboardConns = conns.filter(c => ids.includes(c.from) && ids.includes(c.to)).map(c => ({ ...c }));
  statusMsg.textContent = `คัดลอก ${clipboard.length} node`;
}

function pasteSelected() {
  if (clipboard.length === 0) return;
  historySnapshot();
  const idMap = new Map();
  clipboard.forEach(n => { idMap.set(n.id, nextId++); });
  const newNodes = clipboard.map(n => {
    const nn = { ...n, id: idMap.get(n.id), x: n.x + 24, y: n.y + 24, vars: { ...n.vars }, _g: null };
    nodes.push(nn);
    renderNode(nn);
    return nn;
  });
  clipboardConns.forEach(c => {
    const nc = { ...c, id: nextId++, from: idMap.get(c.from), to: idMap.get(c.to) };
    conns.push(nc);
  });
  renderConns();
  setSelIds(newNodes.map(n => n.id));
  statusMsg.textContent = `วาง ${newNodes.length} node`;
}

function duplicateNode(n) {
  historySnapshot();
  const nn = { ...n, id: nextId++, x: n.x + 24, y: n.y + 24, vars: { ...n.vars }, _g: null };
  nodes.push(nn);
  renderNode(nn);
  renderConns();
  selectNode(nn.id);
  statusMsg.textContent = 'Duplicated node #' + n.id;
}
