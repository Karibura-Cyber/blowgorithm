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
  p.setAttribute('stroke', '#2563eb'); p.setAttribute('stroke-width', '1.8');
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
  let tp = { x: tx, y: ty };
  let ts = 'top';
  if (hoveredDropNode) {
    const dps = dotPositions(hoveredDropNode);
    let best = dps[0], bd = 1e9;
    dps.forEach(dp => { const d = Math.hypot(dp.x - tx, dp.y - ty); if (d < bd) { bd = d; best = dp; } });
    tp = { x: best.x, y: best.y };
    ts = best.side;
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
  const toSide = best.side;
  historySnapshot();
  conns.push({ id: nextId++, from: connStart.node.id, fromSide: connStart.side, to: targetNode.id, toSide, label: '' });
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

function cancelConn() {
  if (tempLine) { tempLayer.removeChild(tempLine); tempLine = null; }
  connStart = null;
  wrap.style.cursor = '';
  clearDropHighlight();
  document.querySelectorAll('[data-id] circle').forEach(d => d.style.opacity = '0');
}

function bezPath(fp, fs, tp, ts) {
  const off = Math.max(50, Math.abs(fp.x - tp.x) * 0.45, Math.abs(fp.y - tp.y) * 0.45);
  const fc = sideCtrl(fp, fs, off);
  const tc = sideCtrl(tp, ts, off);
  return `M${fp.x},${fp.y} C${fc.x},${fc.y} ${tc.x},${tc.y} ${tp.x},${tp.y}`;
}

function sideCtrl(p, side, off) {
  const m = { top: { x: p.x, y: p.y - off }, right: { x: p.x + off, y: p.y }, bottom: { x: p.x, y: p.y + off }, left: { x: p.x - off, y: p.y } };
  return m[side] || { x: p.x, y: p.y };
}

function renderConns() {
  connLayer.innerHTML = '';
  conns.forEach(c => {
    const fn = nodes.find(n => n.id === c.from);
    const tn = nodes.find(n => n.id === c.to);
    if (!fn || !tn) return;
    const fp = getDotXY(fn, c.fromSide);
    const tp = getDotXY(tn, c.toSide);
    const isSel = selId === fn.id || selId === tn.id;
    const isRun = runHighlight === c.id;
    const clr = isRun ? '#16a34a' : isSel ? '#2563eb' : '#94a3b8';
    const mk = isRun ? 'url(#ah-run)' : isSel ? 'url(#ah-sel)' : 'url(#ah)';
    const sw = isSel || isRun ? 2 : 1.5;

    const path = ns('path');
    path.setAttribute('d', bezPath(fp, c.fromSide, tp, c.toSide));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', clr);
    path.setAttribute('stroke-width', sw);
    path.setAttribute('marker-end', mk);
    path.style.cursor = 'pointer';
    path.style.transition = 'stroke .15s';

    const hit = ns('path');
    hit.setAttribute('d', bezPath(fp, c.fromSide, tp, c.toSide));
    hit.setAttribute('fill', 'none');
    hit.setAttribute('stroke', 'transparent');
    hit.setAttribute('stroke-width', '10');
    hit.style.cursor = 'pointer';
    hit.addEventListener('click', async () => {
      if (await customConfirm('ลบการเชื่อมต่อนี้?', 'ลบการเชื่อมต่อ', 'warn')) {
        historySnapshot();
        conns = conns.filter(x => x.id !== c.id);
        renderConns();
      }
    });

    connLayer.appendChild(path);
    connLayer.appendChild(hit);

    if (c.label) {
      const mx = (fp.x + tp.x) / 2, my = (fp.y + tp.y) / 2;
      const lt = ns('text');
      lt.setAttribute('x', mx); lt.setAttribute('y', my - 2);
      lt.setAttribute('text-anchor', 'middle'); lt.setAttribute('dominant-baseline', 'central');
      lt.setAttribute('font-size', '10'); lt.setAttribute('fill', 'var(--text2)');
      lt.setAttribute('font-family', "'Noto Sans Thai',sans-serif");
      lt.textContent = c.label;
      connLayer.appendChild(lt);
    }
  });
}
