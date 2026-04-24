// ═══════════════════════════════════════════════
//  CONNECTIONS
// ═══════════════════════════════════════════════
function bestExitSide(n, tx, ty) {
  const cx = n.x + n.w / 2, cy = n.y + n.h / 2;
  const dx = tx - cx, dy = ty - cy;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'bottom' : 'top';
}
function bestEntrySide(n, sx, sy) {
  const cx = n.x + n.w / 2, cy = n.y + n.h / 2;
  const dx = sx - cx, dy = sy - cy;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'bottom' : 'top';
}

let hoveredDropNode = null;

function startConn(node, x, y, side) {
  connStart = { node, x, y, side };
  const p = ns('path');
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', '#2563eb');
  p.setAttribute('stroke-width', '1.8');
  p.setAttribute('stroke-dasharray', '6 3');
  p.setAttribute('marker-end', 'url(#ah-sel)');
  tempLine = p;
  tempLayer.appendChild(p);
  wrap.style.cursor = 'crosshair';
}
function updateTempConn(tx, ty) {
  if (!tempLine || !connStart) return;
  const fp = { x: connStart.x, y: connStart.y };
  const fs = connStart.side;
  let tp = { x: tx, y: ty }, ts = 'top';
  if (hoveredDropNode) {
    const dps = dotPositions(hoveredDropNode);
    let best = dps[0], bd = 1e9;
    dps.forEach(dp => { const d = Math.hypot(dp.x - tx, dp.y - ty); if (d < bd) { bd = d; best = dp; } });
    tp = { x: best.x, y: best.y }; ts = best.side;
  } else {
    ts = bestEntrySide({ x: tx - 5, y: ty - 5, w: 10, h: 10 }, fp.x, fp.y);
  }
  tempLine.setAttribute('d', bezPath(fp, fs, tp, ts));
}
function endConn(targetNode) {
  if (!connStart || connStart.node.id === targetNode.id) { cancelConn(); return; }
  const c = toSVG(_lastMX, _lastMY);
  const dps = dotPositions(targetNode);
  let best = dps[0], bd = 1e9;
  dps.forEach(dp => { const d = Math.hypot(dp.x - c.x, dp.y - c.y); if (d < bd) { bd = d; best = dp; } });
  historySnapshot();
  conns.push({ id: nextId++, from: connStart.node.id, fromSide: connStart.side, to: targetNode.id, toSide: best.side, label: '' });
  clearDropHighlight();
  cancelConn();
  renderConns();
}
function clearDropHighlight() {
  if (hoveredDropNode) {
    const shape = hoveredDropNode._g && hoveredDropNode._g.querySelector('ellipse,polygon,rect');
    if (shape) { shape.setAttribute('stroke-width', '1.5'); shape.style.filter = ''; }
    applySelStyle(hoveredDropNode);
    hoveredDropNode = null;
  }
}

// Stores the pending connStart when the picker is open
let _pendingConnStart = null;
let _pendingDropPos   = null;

function cancelConn(triggerPicker) {
  if (triggerPicker && connStart && _pendingDropPos) {
    _pendingConnStart = connStart;
    connStart = null;
    if (tempLine) { tempLayer.removeChild(tempLine); tempLine = null; }
    wrap.style.cursor = '';
    clearDropHighlight();
    document.querySelectorAll('[data-id] circle').forEach(d => d.style.opacity = '0');
    showQuickAddPicker(_pendingDropPos.cx, _pendingDropPos.cy,
                       _pendingDropPos.svgX, _pendingDropPos.svgY);
    return;
  }
  _pendingConnStart = null;
  _pendingDropPos   = null;
  if (tempLine) { tempLayer.removeChild(tempLine); tempLine = null; }
  connStart = null;
  wrap.style.cursor = '';
  clearDropHighlight();
  document.querySelectorAll('[data-id] circle').forEach(d => d.style.opacity = '0');
}

// ── Path helpers ─────────────────────────────────
function sideCtrl(p, side, off) {
  const m = { top: { x: p.x, y: p.y - off }, right: { x: p.x + off, y: p.y }, bottom: { x: p.x, y: p.y + off }, left: { x: p.x - off, y: p.y } };
  return m[side] || { x: p.x, y: p.y };
}

function bezPath(fp, fs, tp, ts) {
  const off = Math.max(50, Math.abs(fp.x - tp.x) * 0.45, Math.abs(fp.y - tp.y) * 0.45);
  const fc = sideCtrl(fp, fs, off);
  const tc = sideCtrl(tp, ts, off);
  return `M${fp.x},${fp.y} C${fc.x},${fc.y} ${tc.x},${tc.y} ${tp.x},${tp.y}`;
}

// Legacy alias
function multiPointPath(fp, fs, tp, ts, _pts) {
  return bezPath(fp, fs, tp, ts);
}

// ── Connection context menu (remove only) ───────
let _connCtxId = null;

function showConnCtxMenu(connId, cx, cy) {
  _connCtxId = connId;
  const menu = document.getElementById('conn-ctx-menu');
  menu.style.left = '0px'; menu.style.top = '0px';
  menu.classList.add('open');
  const mw = menu.offsetWidth || 170, mh = menu.offsetHeight || 80;
  menu.style.left = Math.min(cx, window.innerWidth  - mw - 8) + 'px';
  menu.style.top  = Math.min(cy, window.innerHeight - mh - 8) + 'px';
}
function hideConnCtxMenu() {
  document.getElementById('conn-ctx-menu').classList.remove('open');
  _connCtxId = null;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('conn-ctx-remove').addEventListener('click', () => {
    if (_connCtxId === null) return;
    historySnapshot();
    conns = conns.filter(x => x.id !== _connCtxId);
    renderConns();
    hideConnCtxMenu();
  });
  document.addEventListener('mousedown', e => {
    const menu = document.getElementById('conn-ctx-menu');
    if (menu.classList.contains('open') && !menu.contains(e.target)) hideConnCtxMenu();
  }, { capture: true });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') hideConnCtxMenu();
  }, { capture: true });
});

// ── Render ───────────────────────────────────────
function renderConns() {
  connLayer.innerHTML = '';
  conns.forEach(c => {
    const fn = nodes.find(n => n.id === c.from);
    const tn = nodes.find(n => n.id === c.to);
    if (!fn || !tn) return;

    const fp  = getDotXY(fn, c.fromSide);
    const tp  = getDotXY(tn, c.toSide);
    const isSel = selId === fn.id || selId === tn.id;
    const isRun = runHighlight === c.id;
    const clr = isRun ? '#16a34a' : isSel ? '#2563eb' : '#94a3b8';
    const mk  = isRun ? 'url(#ah-run)' : isSel ? 'url(#ah-sel)' : 'url(#ah)';
    const sw  = isSel || isRun ? 2 : 1.5;
    const d   = bezPath(fp, c.fromSide, tp, c.toSide);

    // Visible path
    const path = ns('path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', clr);
    path.setAttribute('stroke-width', sw);
    path.setAttribute('marker-end', mk);
    path.style.transition = 'stroke .15s';

    // Wide invisible hit area — left-click removes, right-click menu
    const hit = ns('path');
    hit.setAttribute('d', d);
    hit.setAttribute('fill', 'none');
    hit.setAttribute('stroke', 'transparent');
    hit.setAttribute('stroke-width', '14');
    hit.style.cursor = 'pointer';

    const onEnter = () => {
      path.setAttribute('stroke-width', sw + 0.8);
      path.setAttribute('stroke', '#ef4444');
      path.setAttribute('stroke-dasharray', '6 3');
    };
    const onLeave = () => {
      path.setAttribute('stroke-width', sw);
      path.setAttribute('stroke', clr);
      path.removeAttribute('stroke-dasharray');
    };
    hit.addEventListener('mouseenter', onEnter);
    hit.addEventListener('mouseleave', onLeave);
    path.addEventListener('mouseenter', onEnter);
    path.addEventListener('mouseleave', onLeave);

    // Left-click → remove connection
    hit.addEventListener('click', e => {
      if (connStart) return; // don't fire while drawing a new wire
      e.stopPropagation();
      historySnapshot();
      conns = conns.filter(x => x.id !== c.id);
      renderConns();
    });
    path.addEventListener('click', e => {
      if (connStart) return;
      e.stopPropagation();
      historySnapshot();
      conns = conns.filter(x => x.id !== c.id);
      renderConns();
    });

    hit.addEventListener('contextmenu', e => {
      e.preventDefault(); e.stopPropagation();
      showConnCtxMenu(c.id, e.clientX, e.clientY);
    });
    path.addEventListener('contextmenu', e => {
      e.preventDefault(); e.stopPropagation();
      showConnCtxMenu(c.id, e.clientX, e.clientY);
    });

    connLayer.appendChild(path);
    connLayer.appendChild(hit);

    // Label
    if (c.label) {
      const mid = { x: (fp.x + tp.x) / 2, y: (fp.y + tp.y) / 2 };
      const lt = ns('text');
      lt.setAttribute('x', mid.x); lt.setAttribute('y', mid.y - 8);
      lt.setAttribute('text-anchor', 'middle'); lt.setAttribute('dominant-baseline', 'central');
      lt.setAttribute('font-size', '10'); lt.setAttribute('fill', 'var(--text2)');
      lt.setAttribute('font-family', "'Noto Sans Thai',sans-serif");
      lt.textContent = c.label;
      connLayer.appendChild(lt);
    }
  });
}

// ═══════════════════════════════════════════════
//  QUICK-ADD NODE PICKER
// ═══════════════════════════════════════════════
const _QA_GROUPS = [
  { label: 'Flow',    types: ['start', 'process', 'decision', 'io', 'output_only', 'declare', 'call'] },
  { label: 'Loops',   types: ['for_loop', 'while_loop', 'do_while'] },
  { label: 'Turtle',  types: ['turtle_forward','turtle_left','turtle_right','turtle_penup','turtle_pendown',
                               'turtle_pencolor','turtle_fillcolor','turtle_beginfill','turtle_endfill',
                               'turtle_home','turtle_clear'] },
];

const _QA_NAMES = {
  start:'Start / End', process:'Process', decision:'Decision', io:'Input',
  output_only:'Output', declare:'Declare', call:'Sub-process',
  for_loop:'For loop', while_loop:'While loop', do_while:'Do…While',
  turtle_forward:'Forward', turtle_left:'Turn Left', turtle_right:'Turn Right',
  turtle_penup:'Pen Up', turtle_pendown:'Pen Down', turtle_pencolor:'Pen Color',
  turtle_fillcolor:'Fill Color', turtle_beginfill:'Begin Fill',
  turtle_endfill:'End Fill', turtle_home:'Home', turtle_clear:'Clear',
};

let _qaFocusIdx = -1;
let _qaItems    = [];

function showQuickAddPicker(clientX, clientY, svgX, svgY) {
  const picker = document.getElementById('quick-add-picker');
  const search = document.getElementById('quick-add-search');
  picker.dataset.svgX = svgX;
  picker.dataset.svgY = svgY;
  _buildPickerList('');
  picker.style.left = '0px'; picker.style.top = '0px';
  picker.classList.add('open');
  const pw = picker.offsetWidth  || 260;
  const ph = picker.offsetHeight || 300;
  let px = clientX + 10, py = clientY + 10;
  if (px + pw > window.innerWidth  - 8) px = clientX - pw - 10;
  if (py + ph > window.innerHeight - 8) py = clientY - ph - 10;
  picker.style.left = Math.max(8, px) + 'px';
  picker.style.top  = Math.max(8, py) + 'px';
  search.value = '';
  _qaFocusIdx  = -1;
  setTimeout(() => search.focus(), 30);
}

function hideQuickAddPicker() {
  document.getElementById('quick-add-picker').classList.remove('open');
  _pendingConnStart = null;
  _pendingDropPos   = null;
  _qaItems = [];
  _qaFocusIdx = -1;
}

function _buildPickerList(filter) {
  const list = document.getElementById('quick-add-list');
  list.innerHTML = '';
  _qaItems = [];
  _qaFocusIdx = -1;
  const q = filter.trim().toLowerCase();
  _QA_GROUPS.forEach(group => {
    const matching = group.types.filter(t => {
      if (!SHAPE_DEFS[t]) return false;
      if (!q) return true;
      const name = (_QA_NAMES[t] || SHAPE_DEFS[t].label || t).toLowerCase();
      return name.includes(q) || t.includes(q);
    });
    if (!matching.length) return;
    if (!q) {
      const gl = document.createElement('div');
      gl.className = 'qa-group-label';
      gl.textContent = group.label;
      list.appendChild(gl);
    }
    matching.forEach(type => {
      const def  = SHAPE_DEFS[type];
      const name = _QA_NAMES[type] || def.label || type;
      const item = document.createElement('div');
      item.className = 'qa-item';
      item.dataset.type = type;
      item.innerHTML = `<span class="qa-item-dot" style="background:${def.fill};border-color:${def.stroke}"></span><span class="qa-item-label">${name}</span>`;
      item.addEventListener('mousedown', e => { e.preventDefault(); _qaCommit(type); });
      item.addEventListener('mouseenter', () => {
        _qaItems.forEach(el => el.classList.toggle('qa-focused', el === item));
        _qaFocusIdx = _qaItems.indexOf(item);
      });
      list.appendChild(item);
      _qaItems.push(item);
    });
  });
  if (_qaItems.length > 0) { _qaFocusIdx = 0; _qaItems[0].classList.add('qa-focused'); }
}

function _qaCommit(type) {
  const picker = document.getElementById('quick-add-picker');
  const svgX   = parseFloat(picker.dataset.svgX) || 0;
  const svgY   = parseFloat(picker.dataset.svgY) || 0;
  const pending = _pendingConnStart;
  hideQuickAddPicker();
  const newNode = addNode(type, svgX, svgY);
  if (pending) {
    const dps = dotPositions(newNode);
    const fp  = getDotXY(pending.node, pending.side);
    let best = dps[0], bd = Infinity;
    dps.forEach(dp => { const d = Math.hypot(dp.x - fp.x, dp.y - fp.y); if (d < bd) { bd = d; best = dp; } });
    conns.push({ id: nextId++, from: pending.node.id, fromSide: pending.side, to: newNode.id, toSide: best.side, label: '' });
    renderConns();
  }
}

document.addEventListener('keydown', e => {
  const picker = document.getElementById('quick-add-picker');
  if (!picker.classList.contains('open')) return;
  if (e.key === 'Escape') { e.preventDefault(); hideQuickAddPicker(); return; }
  if (e.key === 'Enter') {
    e.preventDefault();
    if (_qaFocusIdx >= 0 && _qaItems[_qaFocusIdx]) _qaCommit(_qaItems[_qaFocusIdx].dataset.type);
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (!_qaItems.length) return;
    _qaFocusIdx = (_qaFocusIdx + 1) % _qaItems.length;
    _qaItems.forEach((el, i) => el.classList.toggle('qa-focused', i === _qaFocusIdx));
    _qaItems[_qaFocusIdx].scrollIntoView({ block: 'nearest' });
    return;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (!_qaItems.length) return;
    _qaFocusIdx = (_qaFocusIdx - 1 + _qaItems.length) % _qaItems.length;
    _qaItems.forEach((el, i) => el.classList.toggle('qa-focused', i === _qaFocusIdx));
    _qaItems[_qaFocusIdx].scrollIntoView({ block: 'nearest' });
    return;
  }
}, { capture: true });

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('quick-add-search').addEventListener('input', e => {
    _buildPickerList(e.target.value);
  });
  document.addEventListener('mousedown', e => {
    const picker = document.getElementById('quick-add-picker');
    if (picker.classList.contains('open') && !picker.contains(e.target)) hideQuickAddPicker();
  }, { capture: true });
});
