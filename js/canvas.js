// ═══════════════════════════════════════════════
//  COORDINATE HELPERS
// ═══════════════════════════════════════════════
function toSVG(ex, ey) {
  const r = wrap.getBoundingClientRect();
  return { x: (ex - r.left - pan.x) / scale, y: (ey - r.top - pan.y) / scale };
}

function applyTransform() {
  nodeLayer.setAttribute('transform', `translate(${pan.x},${pan.y}) scale(${scale})`);
  connLayer.setAttribute('transform', `translate(${pan.x},${pan.y}) scale(${scale})`);
  tempLayer.setAttribute('transform', `translate(${pan.x},${pan.y}) scale(${scale})`);
  zoomDisplay.textContent = Math.round(scale * 100) + '%';
}

function zoom(f) {
  const cx = wrap.clientWidth / 2, cy = wrap.clientHeight / 2;
  pan.x = cx - (cx - pan.x) * f;
  pan.y = cy - (cy - pan.y) * f;
  scale *= f;
  scale = Math.max(0.2, Math.min(4, scale));
  applyTransform();
}

function fitView() {
  if (!nodes.length) return;
  const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y);
  const x2 = nodes.map(n => n.x + n.w), y2 = nodes.map(n => n.y + n.h);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const maxX = Math.max(...x2), maxY = Math.max(...y2);
  const pad = 60;
  const fw = wrap.clientWidth - pad * 2, fh = wrap.clientHeight - pad * 2;
  scale = Math.min(fw / (maxX - minX), fh / (maxY - minY), 2);
  pan.x = pad - (minX * scale);
  pan.y = pad - (minY * scale);
  applyTransform();
}

// ═══════════════════════════════════════════════
//  RUBBER-BAND SELECTION
// ═══════════════════════════════════════════════
const rbRect = ns('rect');
rbRect.setAttribute('fill', 'rgba(37,99,235,0.06)');
rbRect.setAttribute('stroke', '#2563eb');
rbRect.setAttribute('stroke-width', '1');
rbRect.setAttribute('stroke-dasharray', '5,3');
rbRect.setAttribute('pointer-events', 'none');
rbRect.style.display = 'none';
// Appended to tempLayer after DOM is ready (done in main.js)

function updateRubberBand() {
  if (!rubberBand) return;
  const { sx, sy, cx, cy } = rubberBand;
  const x = Math.min(sx, cx), y = Math.min(sy, cy);
  const w = Math.abs(cx - sx), h = Math.abs(cy - sy);
  rbRect.setAttribute('x', x); rbRect.setAttribute('y', y);
  rbRect.setAttribute('width', w); rbRect.setAttribute('height', h);
}

function finishRubberBand(additive) {
  if (!rubberBand) return;
  const { sx, sy, cx, cy } = rubberBand;
  const x1 = Math.min(sx, cx), y1 = Math.min(sy, cy);
  const x2 = Math.max(sx, cx), y2 = Math.max(sy, cy);
  rubberBand = null;
  rbRect.style.display = 'none';
  rbRect.setAttribute('width', '0'); rbRect.setAttribute('height', '0');
  const hit = nodes.filter(n => (n.x < x2 && n.x + n.w > x1 && n.y < y2 && n.y + n.h > y1)).map(n => n.id);
  const combined = additive ? [...new Set([...selIds, ...hit])] : hit;
  setSelIds(combined);
}
