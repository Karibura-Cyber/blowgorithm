// ═══════════════════════════════════════════════
//  TURTLE LABEL HELPER
// ═══════════════════════════════════════════════
function getTurtleLabel(n) {
  const v = n.vars.value || '100';
  const c = n.vars.color || '#000000';
  const map = {
    turtle_forward: `forward ${v}`,
    turtle_left: `left ${v}°`,
    turtle_right: `right ${v}°`,
    turtle_penup: 'pen up',
    turtle_pendown: 'pen down',
    turtle_pencolor: `pen color ${c}`,
    turtle_fillcolor: `fill color ${c}`,
    turtle_beginfill: 'begin fill',
    turtle_endfill: 'end fill',
    turtle_home: 'home',
    turtle_clear: 'clear',
  };
  return map[n.type] || n.label || n.type;
}

// ═══════════════════════════════════════════════
//  TURTLE GRAPHICS ENGINE
// ═══════════════════════════════════════════════
const turtleState = {
  x: 0, y: 0,
  angle: 0,
  penDown: true,
  penColor: '#000000', penWidth: 1.5,
  fillColor: '#ff0000',
  filling: false, fillPath: [],
  visible: true,
};
let turtleDraw = [];

let turtleZoom = 1.0;
let turtlePan = { x: 0, y: 0 };
let turtleCanvasDragging = false;
let turtleCanvasDragStart = { x: 0, y: 0 };
let turtleCanvasPanStart = { x: 0, y: 0 };

function resizeTurtleCanvas() {
  const canvas = document.getElementById('turtle-canvas');
  const body = document.getElementById('turtle-win-body');
  if (!canvas || !body) return;
  const w = body.clientWidth || 400;
  const h = body.clientHeight || 400;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  renderTurtleCanvas();
}

function renderTurtleCanvas() {
  const canvas = document.getElementById('turtle-canvas');
  if (!canvas) return;
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(W / 2 + turtlePan.x, H / 2 + turtlePan.y);
  ctx.scale(turtleZoom, turtleZoom);

  ctx.save();
  ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1 / turtleZoom;
  ctx.beginPath(); ctx.moveTo(-2000, 0); ctx.lineTo(2000, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -2000); ctx.lineTo(0, 2000); ctx.stroke();
  ctx.restore();

  for (const op of turtleDraw) {
    if (op.type === 'line') {
      ctx.beginPath(); ctx.moveTo(op.x1, op.y1); ctx.lineTo(op.x2, op.y2);
      ctx.strokeStyle = op.color; ctx.lineWidth = op.width || 1.5; ctx.lineCap = 'round'; ctx.stroke();
    } else if (op.type === 'fill') {
      ctx.beginPath();
      op.path.forEach((pt, i) => { if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y); });
      ctx.closePath(); ctx.fillStyle = op.color; ctx.fill();
    }
  }
  if (turtleState.visible) {
    ctx.save();
    ctx.translate(turtleState.x, turtleState.y);
    ctx.rotate(turtleState.angle * Math.PI / 180);
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(-7, 8); ctx.lineTo(7, 8); ctx.closePath();
    ctx.fillStyle = '#15803d'; ctx.fill();
    ctx.strokeStyle = '#166534'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function turtleForward(dist) {
  const rad = turtleState.angle * Math.PI / 180;
  const nx = turtleState.x + dist * Math.sin(rad);
  const ny = turtleState.y - dist * Math.cos(rad);
  if (turtleState.penDown)
    turtleDraw.push({ type: 'line', x1: turtleState.x, y1: turtleState.y, x2: nx, y2: ny, color: turtleState.penColor, width: turtleState.penWidth });
  if (turtleState.filling) turtleState.fillPath.push({ x: nx, y: ny });
  turtleState.x = nx; turtleState.y = ny;
  renderTurtleCanvas();
}
function turtleTurnLeft(deg) { turtleState.angle = (turtleState.angle - deg + 360) % 360; renderTurtleCanvas(); }
function turtleTurnRight(deg) { turtleState.angle = (turtleState.angle + deg) % 360; renderTurtleCanvas(); }

function turtleFitView() {
  const canvas = document.getElementById('turtle-canvas');
  if (!canvas) return;
  if (!turtleDraw.length && !turtleState.visible) { turtleZoom = 1; turtlePan = { x: 0, y: 0 }; renderTurtleCanvas(); return; }
  const pts = [];
  turtleDraw.forEach(op => {
    if (op.type === 'line') { pts.push({ x: op.x1, y: op.y1 }, { x: op.x2, y: op.y2 }); }
    else if (op.type === 'fill') { pts.push(...op.path); }
  });
  pts.push({ x: turtleState.x, y: turtleState.y }, { x: 0, y: 0 });
  if (!pts.length) { turtleZoom = 1; turtlePan = { x: 0, y: 0 }; renderTurtleCanvas(); return; }
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pad = 40;
  const W = canvas.width, H = canvas.height;
  const rw = maxX - minX || 1, rh = maxY - minY || 1;
  turtleZoom = Math.min((W - pad * 2) / rw, (H - pad * 2) / rh, 4);
  turtlePan.x = -((minX + maxX) / 2) * turtleZoom;
  turtlePan.y = -((minY + maxY) / 2) * turtleZoom;
  renderTurtleCanvas();
}

function clearTurtle() {
  turtleDraw = [];
  Object.assign(turtleState, { x: 0, y: 0, angle: 0, penDown: true, penColor: '#000000', penWidth: 1.5, fillColor: '#ff0000', filling: false, fillPath: [], visible: true });
  turtleZoom = 1.0;
  turtlePan = { x: 0, y: 0 };
  renderTurtleCanvas();
}
function homeTurtle() { turtleState.x = 0; turtleState.y = 0; turtleState.angle = 0; renderTurtleCanvas(); }
function toggleTurtleVisible() { turtleState.visible = !turtleState.visible; renderTurtleCanvas(); }

// ═══════════════════════════════════════════════
//  TURTLE WINDOW CONTROLS
// ═══════════════════════════════════════════════
let twMinimized = false, twSavedH = '440px';
function closeTurtleWin() { document.getElementById('turtle-win').classList.remove('open'); }
function minimizeTurtleWin() {
  const tw = document.getElementById('turtle-win');
  if (twMinimized) { tw.style.height = twSavedH; twMinimized = false; resizeTurtleCanvas(); }
  else { twSavedH = tw.style.height || '440px'; tw.style.height = '32px'; twMinimized = true; }
}
function maximizeTurtleWin() {
  const tw = document.getElementById('turtle-win');
  tw.style.width = '560px'; tw.style.height = '580px'; twSavedH = '580px'; twMinimized = false;
  setTimeout(resizeTurtleCanvas, 30);
}
function openTurtleWin() {
  const tw = document.getElementById('turtle-win');
  if (twMinimized) { tw.style.height = twSavedH; twMinimized = false; }
  tw.classList.add('open');
  setTimeout(resizeTurtleCanvas, 50);
}
