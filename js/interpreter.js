// ═══════════════════════════════════════════════
//  INTERPRETER — EVAL HELPERS
// ═══════════════════════════════════════════════
function evalExpr(expr, vars) {
  const keys = Object.keys(vars), vals = keys.map(k => vars[k]);
  return new Function(...keys, `"use strict";return (${expr});`)(...vals);
}

function evalOutput(expr, vars) {
  const s = expr.trim();
  const strMatch = s.match(/^(["'])([\s\S]*)\1$/);
  if (strMatch) {
    const template = strMatch[2];
    return template.replace(/\{([^}]+)\}/g, (_, inner) => {
      const colonIdx = inner.indexOf(':');
      const varPart = colonIdx >= 0 ? inner.slice(0, colonIdx).trim() : inner.trim();
      const fmtPart = colonIdx >= 0 ? inner.slice(colonIdx + 1).trim() : '';
      let val;
      try { val = evalExpr(varPart, vars); } catch (e) { return `{${inner}}`; }
      if (fmtPart === '') return String(val);
      const fFixed = fmtPart.match(/^\.(\d+)f$/);
      if (fFixed) return Number(val).toFixed(parseInt(fFixed[1]));
      const fSci = fmtPart.match(/^\.(\d+)e$/);
      if (fSci) return Number(val).toExponential(parseInt(fSci[1]));
      const fGen = fmtPart.match(/^\.(\d+)g$/);
      if (fGen) return Number(val).toPrecision(parseInt(fGen[1])).replace(/\.?0+$/, '');
      const fInt = fmtPart.match(/^(\d*)d$/);
      if (fInt) return String(Math.trunc(Number(val)));
      if (fmtPart === ',') return Number(val).toLocaleString();
      const fFixedComma = fmtPart.match(/^,\.(\d+)f$|^\.(\d+)f,$/);
      if (fFixedComma) {
        const dp = parseInt(fFixedComma[1] || fFixedComma[2]);
        return Number(val).toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });
      }
      const fWidth = fmtPart.match(/^([<>^]?)(\d+)$/);
      if (fWidth) {
        const str = String(val), w = parseInt(fWidth[2]), align = fWidth[1] || '>';
        if (str.length >= w) return str;
        const pad = ' '.repeat(w - str.length);
        if (align === '<') return str + pad;
        if (align === '^') return ' '.repeat(Math.floor((w - str.length) / 2)) + str + ' '.repeat(Math.ceil((w - str.length) / 2));
        return pad + str;
      }
      return String(val);
    });
  }
  return String(evalExpr(s, vars));
}

// ═══════════════════════════════════════════════
//  RUN FLOWCHART
// ═══════════════════════════════════════════════
async function runFlowchart() {
  outputLog.innerHTML = '';
  document.getElementById('chat-messages').innerHTML = '';
  chatText = [];
  runHighlight = null; renderConns();

  turtleDraw = [];
  Object.assign(turtleState, { x: 0, y: 0, angle: 0, penDown: true, penColor: '#000000', penWidth: 1.5, fillColor: '#ff0000', filling: false, fillPath: [], visible: true });

  const startNode = nodes.find(n => n.type === 'start' && (!n.vars.role || n.vars.role === 'start'));
  if (!startNode) { openChatWin(); conLine('ไม่พบ Start node', 'con-err'); return; }

  conSeparator('── เริ่มทำงาน ──');
  const vars = {};
  const loopState = new Map();
  let cur = startNode, steps = 0, MAX = 5000;
  let turtleOpened = false;
  let chatOpened = false;

  while (cur && steps++ < MAX) {
    if (cur._g) {
      const shape = cur._g.querySelector('ellipse,polygon,rect');
      if (shape) {
        shape.setAttribute('filter', 'drop-shadow(0 0 6px rgba(22,163,74,.8))');
        await new Promise(r => setTimeout(r, 80));
        shape.setAttribute('filter', '');
      }
    }

    if (cur.type === 'start') {
      if (cur.vars.role === 'end') { conSeparator('── สิ้นสุด ──'); break; }

    } else if (cur.type === 'io') {
      if (!chatOpened) { openChatWin(); chatOpened = true; }
      const vn = cur.vars.varName || 'x';
      const val = await showModal(vn, `ป้อนค่าสำหรับตัวแปร "${vn}":`);
      if (val === null) { conLine('ยกเลิกการรับค่า', 'con-err'); break; }
      const num = parseFloat(val);
      vars[vn] = isNaN(num) ? val : num;
      conLine(`${vn} = ${vars[vn]}`, 'con-in');

    } else if (cur.type === 'output_only') {
      if (!chatOpened) { openChatWin(); chatOpened = true; }
      const expr = cur.vars.expr || cur.vars.varName;
      if (expr) {
        try { conLine(evalOutput(expr, vars), 'con-out'); }
        catch (e) { conLine(`Output error: ${e.message}`, 'con-err'); }
      } else conLine('(ไม่ได้กำหนดนิพจน์)', 'con-err');

    } else if (cur.type === 'process') {
      const expr = cur.vars.expr;
      if (expr) {
        try {
          const m = expr.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=(.+)$/s);
          if (m) { const k = m[1].trim(), v = evalExpr(m[2].trim(), vars); vars[k] = v; }
          else { evalExpr(expr, vars); }
        } catch (e) { conLine(`Process error: ${e.message}`, 'con-err'); }
      }

    } else if (cur.type === 'decision') {
      const cond = cur.vars.cond || 'false';
      let result = false;
      try { result = !!evalExpr(cond, vars); }
      catch (e) { conLine(`Decision error: ${e.message}`, 'con-err'); break; }
      const outs = conns.filter(c => c.from === cur.id);
      const chosen = result ? outs.find(c => c.fromSide === 'bottom') : outs.find(c => c.fromSide !== 'bottom');
      if (chosen) runHighlight = chosen.id;
      renderConns();
      cur = nodes.find(n => n.id === (chosen && chosen.to)) || null;
      continue;

    } else if (cur.type === 'for_loop') {
      const vn = cur.vars.varName || 'i';
      const stepVal = parseFloat(cur.vars.step || '1');
      if (!loopState.has(cur.id)) {
        try { vars[vn] = evalExpr(cur.vars.from || '0', vars); } catch (e) { vars[vn] = 0; }
        loopState.set(cur.id, true);
      } else {
        vars[vn] = (vars[vn] || 0) + stepVal;
      }
      let toVal = 0;
      try { toVal = evalExpr(cur.vars.to || '9', vars); } catch (e) {}
      const inRange = stepVal >= 0 ? vars[vn] <= toVal : vars[vn] >= toVal;
      if (inRange) {
        const bodyC = conns.find(c => c.from === cur.id && c.fromSide === 'bottom');
        if (bodyC) runHighlight = bodyC.id; renderConns();
        cur = nodes.find(n => n.id === (bodyC && bodyC.to)) || null;
      } else {
        loopState.delete(cur.id);
        const exitC = conns.find(c => c.from === cur.id && c.fromSide !== 'bottom');
        if (exitC) runHighlight = exitC.id; renderConns();
        cur = nodes.find(n => n.id === (exitC && exitC.to)) || null;
      }
      continue;

    } else if (cur.type === 'while_loop') {
      const cond = cur.vars.cond || 'false';
      let result = false;
      try { result = !!evalExpr(cond, vars); }
      catch (e) { conLine(`While error: ${e.message}`, 'con-err'); break; }
      if (result) {
        const bodyC = conns.find(c => c.from === cur.id && c.fromSide === 'bottom');
        if (bodyC) runHighlight = bodyC.id; renderConns();
        cur = nodes.find(n => n.id === (bodyC && bodyC.to)) || null;
      } else {
        const exitC = conns.find(c => c.from === cur.id && c.fromSide !== 'bottom');
        if (exitC) runHighlight = exitC.id; renderConns();
        cur = nodes.find(n => n.id === (exitC && exitC.to)) || null;
      }
      continue;

    } else if (cur.type === 'do_while') {
      if (!loopState.has(cur.id)) {
        loopState.set(cur.id, true);
        const bodyC = conns.find(c => c.from === cur.id && c.fromSide === 'bottom');
        if (bodyC) runHighlight = bodyC.id; renderConns();
        cur = nodes.find(n => n.id === (bodyC && bodyC.to)) || null;
      } else {
        const cond = cur.vars.cond || 'false';
        let result = false;
        try { result = !!evalExpr(cond, vars); }
        catch (e) { conLine(`Do-While error: ${e.message}`, 'con-err'); break; }
        if (result) {
          const bodyC = conns.find(c => c.from === cur.id && c.fromSide === 'bottom');
          if (bodyC) runHighlight = bodyC.id; renderConns();
          cur = nodes.find(n => n.id === (bodyC && bodyC.to)) || null;
        } else {
          loopState.delete(cur.id);
          const exitC = conns.find(c => c.from === cur.id && c.fromSide !== 'bottom');
          if (exitC) runHighlight = exitC.id; renderConns();
          cur = nodes.find(n => n.id === (exitC && exitC.to)) || null;
        }
      }
      continue;

    } else if (cur.type === 'turtle_forward') {
      if (!turtleOpened) { openTurtleWin(); turtleOpened = true; }
      try { const d = parseFloat(evalExpr(cur.vars.value || '100', vars)); turtleForward(d); }
      catch (e) { conLine(`Turtle error: ${e.message}`, 'con-err'); }
    } else if (cur.type === 'turtle_left') {
      if (!turtleOpened) { openTurtleWin(); turtleOpened = true; }
      try { const a = parseFloat(evalExpr(cur.vars.value || '90', vars)); turtleTurnLeft(a); }
      catch (e) { conLine(`Turtle error: ${e.message}`, 'con-err'); }
    } else if (cur.type === 'turtle_right') {
      if (!turtleOpened) { openTurtleWin(); turtleOpened = true; }
      try { const a = parseFloat(evalExpr(cur.vars.value || '90', vars)); turtleTurnRight(a); }
      catch (e) { conLine(`Turtle error: ${e.message}`, 'con-err'); }
    } else if (cur.type === 'turtle_penup') {
      if (!turtleOpened) { openTurtleWin(); turtleOpened = true; }
      turtleState.penDown = false;
    } else if (cur.type === 'turtle_pendown') {
      if (!turtleOpened) { openTurtleWin(); turtleOpened = true; }
      turtleState.penDown = true;
    } else if (cur.type === 'turtle_pencolor') {
      if (!turtleOpened) { openTurtleWin(); turtleOpened = true; }
      turtleState.penColor = cur.vars.color || '#000000'; renderTurtleCanvas();
    } else if (cur.type === 'turtle_fillcolor') {
      if (!turtleOpened) { openTurtleWin(); turtleOpened = true; }
      turtleState.fillColor = cur.vars.color || '#ff0000';
    } else if (cur.type === 'turtle_beginfill') {
      if (!turtleOpened) { openTurtleWin(); turtleOpened = true; }
      turtleState.filling = true; turtleState.fillPath = [{ x: turtleState.x, y: turtleState.y }];
    } else if (cur.type === 'turtle_endfill') {
      if (!turtleOpened) { openTurtleWin(); turtleOpened = true; }
      if (turtleState.filling && turtleState.fillPath.length > 2) {
        turtleDraw.push({ type: 'fill', path: [...turtleState.fillPath], color: turtleState.fillColor });
        renderTurtleCanvas();
      }
      turtleState.filling = false; turtleState.fillPath = [];
    } else if (cur.type === 'turtle_home') {
      if (!turtleOpened) { openTurtleWin(); turtleOpened = true; }
      homeTurtle();
    } else if (cur.type === 'turtle_clear') {
      if (!turtleOpened) { openTurtleWin(); turtleOpened = true; }
      turtleDraw = []; renderTurtleCanvas();
    } else if (cur.type === 'declare') {
      const vn = cur.vars.varName;
      if (vn) {
        let iv = cur.vars.initVal || '';
        if (iv !== '') { const num = parseFloat(iv); vars[vn] = isNaN(num) ? iv : num; }
        else {
          const t = cur.vars.varType || 'Integer';
          if (t === 'Integer' || t === 'Real') vars[vn] = 0;
          else if (t === 'Boolean') vars[vn] = false;
          else vars[vn] = '';
        }
      }
    } else if (cur.type === 'call') {
      // sub-process call — no log
    }

    const nextConn = conns.find(c => c.from === cur.id);
    if (nextConn) runHighlight = nextConn.id;
    renderConns();
    cur = nodes.find(n => n.id === (nextConn && nextConn.to)) || null;
    await new Promise(r => setTimeout(r, 60));
  }
  if (steps >= MAX) conLine('หยุด: loop ซ้ำมากเกินไป (>5000 steps)', 'con-err');
  runHighlight = null; renderConns();
}

// ═══════════════════════════════════════════════
//  STEP DEBUGGER
// ═══════════════════════════════════════════════
let _stepState = null;

function startStepRun() {
  outputLog.innerHTML = '';
  document.getElementById('chat-messages').innerHTML = '';
  chatText = [];
  runHighlight = null; renderConns();
  clearNodeHighlight();

  turtleDraw = [];
  Object.assign(turtleState, { x: 0, y: 0, angle: 0, penDown: true, penColor: '#000000', penWidth: 1.5, fillColor: '#ff0000', filling: false, fillPath: [], visible: true });

  const startNode = nodes.find(n => n.type === 'start' && (!n.vars.role || n.vars.role === 'start'));
  if (!startNode) { openChatWin(); conLine('ไม่พบ Start node', 'con-err'); return; }

  conSeparator('── Step Debug เริ่มต้น ──');

  _stepState = {
    cur: startNode,
    vars: {},
    loopState: new Map(),
    steps: 0,
    MAX: 5000,
    turtleOpened: false,
    chatOpened: false,
    waitingInput: false,
    finished: false,
    prevVars: {},
    updatedVars: new Set(),
  };

  document.getElementById('step-bar').classList.add('active');
  document.getElementById('run-main').disabled = true;
  document.getElementById('step-main').disabled = true;

  _highlightCurNode();
  _updateStepBar();
}

function _highlightCurNode(pulse = true) {
  clearNodeHighlight();
  if (!_stepState || !_stepState.cur) return;
  const n = _stepState.cur;
  if (n._g) {
    const shape = n._g.querySelector('ellipse,polygon,rect');
    if (shape) {
      shape.setAttribute('filter', 'drop-shadow(0 0 8px rgba(59,130,246,.9))');
      shape.setAttribute('stroke', '#3b82f6');
      shape.setAttribute('stroke-width', '2.5');
    }
    const cx = n.x + n.w / 2, cy = n.y + n.h / 2;
    const wx = cx * scale + pan.x, wy = cy * scale + pan.y;
    const vw = wrap.clientWidth, vh = wrap.clientHeight;
    const margin = 100;
    if (wx < margin || wx > vw - margin || wy < margin || wy > vh - margin) {
      pan.x = vw / 2 - cx * scale;
      pan.y = vh / 2 - cy * scale;
      applyTransform();
    }
  }
}

function clearNodeHighlight() {
  nodes.forEach(n => {
    if (!n._g) return;
    const shape = n._g.querySelector('ellipse,polygon,rect');
    if (shape) {
      const def = SHAPE_DEFS[n.type];
      shape.setAttribute('stroke', def ? def.stroke : '#999');
      const isSel = selIds.has(n.id);
      shape.setAttribute('stroke-width', isSel ? '2.5' : '1.5');
      shape.setAttribute('filter', isSel ? 'drop-shadow(0 0 4px rgba(37,99,235,.35))' : '');
    }
  });
}

function _updateStepBar() {
  if (!_stepState) return;
  const { cur, vars, updatedVars } = _stepState;
  const badge = document.getElementById('step-node-badge');
  const labelEl = document.getElementById('step-node-label');
  const varsEl = document.getElementById('step-vars');

  if (cur) {
    const typeName = (typeNames && typeNames[cur.type]) || cur.type;
    badge.textContent = typeName;
    labelEl.textContent = cur.label || '';
  } else {
    badge.textContent = 'Done';
    labelEl.textContent = '';
  }

  varsEl.innerHTML = '';
  const keys = Object.keys(vars);
  if (keys.length === 0) {
    varsEl.innerHTML = '<span style="font-size:11px;color:#475569;font-style:italic">ยังไม่มีตัวแปร</span>';
  } else {
    keys.forEach(k => {
      const chip = document.createElement('span');
      chip.className = 'step-var-chip' + (updatedVars.has(k) ? ' updated' : '');
      chip.textContent = `${k} = ${JSON.stringify(vars[k])}`;
      varsEl.appendChild(chip);
    });
  }
}

async function stepNext() {
  if (!_stepState || _stepState.finished || _stepState.waitingInput) return;
  await _executeOneStep();
}

async function stepContinue() {
  if (!_stepState || _stepState.finished) return;
  document.getElementById('step-btn-next').disabled = true;
  document.getElementById('step-btn-continue').disabled = true;
  while (_stepState && !_stepState.finished && !_stepState.waitingInput) {
    await _executeOneStep();
    if (_stepState && !_stepState.finished && !_stepState.waitingInput)
      await new Promise(r => setTimeout(r, 80));
  }
  document.getElementById('step-btn-next').disabled = false;
  document.getElementById('step-btn-continue').disabled = false;
}

function stepStop() {
  clearNodeHighlight();
  runHighlight = null; renderConns();
  _stepState = null;
  document.getElementById('step-bar').classList.remove('active');
  document.getElementById('run-main').disabled = false;
  document.getElementById('step-main').disabled = false;
  conSeparator('── หยุด Step Debug ──');
}

async function _executeOneStep() {
  if (!_stepState) return;
  const s = _stepState;
  if (s.finished) { _finishStep(); return; }
  if (s.steps++ >= s.MAX) {
    conLine('หยุด: loop ซ้ำมากเกินไป (>5000 steps)', 'con-err');
    _finishStep(); return;
  }

  const cur = s.cur;
  if (!cur) { _finishStep(); return; }

  s.updatedVars = new Set();
  let jumped = false;

  if (cur.type === 'start') {
    if (cur.vars.role === 'end') { conSeparator('── สิ้นสุด ──'); _finishStep(); return; }

  } else if (cur.type === 'io') {
    if (!s.chatOpened) { openChatWin(); s.chatOpened = true; }
    const vn = cur.vars.varName || 'x';
    s.waitingInput = true; _updateStepBar();
    const val = await showModal(vn, `ป้อนค่าสำหรับตัวแปร "${vn}":`);
    s.waitingInput = false;
    if (val === null) { conLine('ยกเลิกการรับค่า', 'con-err'); _finishStep(); return; }
    const num = parseFloat(val);
    s.vars[vn] = isNaN(num) ? val : num;
    s.updatedVars.add(vn);
    conLine(`${vn} = ${s.vars[vn]}`, 'con-in');

  } else if (cur.type === 'output_only') {
    if (!s.chatOpened) { openChatWin(); s.chatOpened = true; }
    const expr = cur.vars.expr || cur.vars.varName;
    if (expr) {
      try { conLine(evalOutput(expr, s.vars), 'con-out'); }
      catch (e) { conLine(`Output error: ${e.message}`, 'con-err'); }
    } else conLine('(ไม่ได้กำหนดนิพจน์)', 'con-err');

  } else if (cur.type === 'process') {
    const expr = cur.vars.expr;
    if (expr) {
      try {
        const m = expr.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=(.+)$/s);
        if (m) { const k = m[1].trim(), v = evalExpr(m[2].trim(), s.vars); s.vars[k] = v; s.updatedVars.add(k); }
        else evalExpr(expr, s.vars);
      } catch (e) { conLine(`Process error: ${e.message}`, 'con-err'); }
    }

  } else if (cur.type === 'decision') {
    const cond = cur.vars.cond || 'false';
    let result = false;
    try { result = !!evalExpr(cond, s.vars); }
    catch (e) { conLine(`Decision error: ${e.message}`, 'con-err'); _finishStep(); return; }
    const outs = conns.filter(c => c.from === cur.id);
    const chosen = result ? outs.find(c => c.fromSide === 'bottom') : outs.find(c => c.fromSide !== 'bottom');
    if (chosen) runHighlight = chosen.id; renderConns();
    s.cur = nodes.find(n => n.id === (chosen && chosen.to)) || null;
    jumped = true;

  } else if (cur.type === 'for_loop') {
    const vn = cur.vars.varName || 'i';
    const stepVal = parseFloat(cur.vars.step || '1');
    if (!s.loopState.has(cur.id)) {
      try { s.vars[vn] = evalExpr(cur.vars.from || '0', s.vars); } catch (e) { s.vars[vn] = 0; }
      s.loopState.set(cur.id, true);
    } else { s.vars[vn] = (s.vars[vn] || 0) + stepVal; }
    s.updatedVars.add(vn);
    let toVal = 0;
    try { toVal = evalExpr(cur.vars.to || '9', s.vars); } catch (e) {}
    const inRange = stepVal >= 0 ? s.vars[vn] <= toVal : s.vars[vn] >= toVal;
    if (inRange) {
      const bodyC = conns.find(c => c.from === cur.id && c.fromSide === 'bottom');
      if (bodyC) runHighlight = bodyC.id; renderConns();
      s.cur = nodes.find(n => n.id === (bodyC && bodyC.to)) || null;
    } else {
      s.loopState.delete(cur.id);
      const exitC = conns.find(c => c.from === cur.id && c.fromSide !== 'bottom');
      if (exitC) runHighlight = exitC.id; renderConns();
      s.cur = nodes.find(n => n.id === (exitC && exitC.to)) || null;
    }
    jumped = true;

  } else if (cur.type === 'while_loop') {
    const cond = cur.vars.cond || 'false';
    let result = false;
    try { result = !!evalExpr(cond, s.vars); }
    catch (e) { conLine(`While error: ${e.message}`, 'con-err'); _finishStep(); return; }
    if (result) {
      const bodyC = conns.find(c => c.from === cur.id && c.fromSide === 'bottom');
      if (bodyC) runHighlight = bodyC.id; renderConns();
      s.cur = nodes.find(n => n.id === (bodyC && bodyC.to)) || null;
    } else {
      const exitC = conns.find(c => c.from === cur.id && c.fromSide !== 'bottom');
      if (exitC) runHighlight = exitC.id; renderConns();
      s.cur = nodes.find(n => n.id === (exitC && exitC.to)) || null;
    }
    jumped = true;

  } else if (cur.type === 'do_while') {
    if (!s.loopState.has(cur.id)) {
      s.loopState.set(cur.id, true);
      const bodyC = conns.find(c => c.from === cur.id && c.fromSide === 'bottom');
      if (bodyC) runHighlight = bodyC.id; renderConns();
      s.cur = nodes.find(n => n.id === (bodyC && bodyC.to)) || null;
    } else {
      const cond = cur.vars.cond || 'false';
      let result = false;
      try { result = !!evalExpr(cond, s.vars); }
      catch (e) { conLine(`Do-While error: ${e.message}`, 'con-err'); _finishStep(); return; }
      if (result) {
        const bodyC = conns.find(c => c.from === cur.id && c.fromSide === 'bottom');
        if (bodyC) runHighlight = bodyC.id; renderConns();
        s.cur = nodes.find(n => n.id === (bodyC && bodyC.to)) || null;
      } else {
        s.loopState.delete(cur.id);
        const exitC = conns.find(c => c.from === cur.id && c.fromSide !== 'bottom');
        if (exitC) runHighlight = exitC.id; renderConns();
        s.cur = nodes.find(n => n.id === (exitC && exitC.to)) || null;
      }
    }
    jumped = true;

  } else if (cur.type === 'declare') {
    const vn = cur.vars.varName;
    if (vn) {
      let iv = cur.vars.initVal || '';
      if (iv !== '') { const num = parseFloat(iv); s.vars[vn] = isNaN(num) ? iv : num; }
      else {
        const t = cur.vars.varType || 'Integer';
        if (t === 'Integer' || t === 'Real') s.vars[vn] = 0;
        else if (t === 'Boolean') s.vars[vn] = false;
        else s.vars[vn] = '';
      }
      s.updatedVars.add(vn);
    }

  } else if (cur.type.startsWith('turtle_')) {
    if (!s.turtleOpened) { openTurtleWin(); s.turtleOpened = true; }
    try {
      if (cur.type === 'turtle_forward') { const d = parseFloat(evalExpr(cur.vars.value || '100', s.vars)); turtleForward(d); }
      else if (cur.type === 'turtle_left') { const a = parseFloat(evalExpr(cur.vars.value || '90', s.vars)); turtleTurnLeft(a); }
      else if (cur.type === 'turtle_right') { const a = parseFloat(evalExpr(cur.vars.value || '90', s.vars)); turtleTurnRight(a); }
      else if (cur.type === 'turtle_penup') { turtleState.penDown = false; }
      else if (cur.type === 'turtle_pendown') { turtleState.penDown = true; }
      else if (cur.type === 'turtle_pencolor') { turtleState.penColor = cur.vars.color || '#000000'; renderTurtleCanvas(); }
      else if (cur.type === 'turtle_fillcolor') { turtleState.fillColor = cur.vars.color || '#ff0000'; }
      else if (cur.type === 'turtle_beginfill') { turtleState.filling = true; turtleState.fillPath = [{ x: turtleState.x, y: turtleState.y }]; }
      else if (cur.type === 'turtle_endfill') {
        if (turtleState.filling && turtleState.fillPath.length > 2)
          turtleDraw.push({ type: 'fill', path: [...turtleState.fillPath], color: turtleState.fillColor });
        turtleState.filling = false; turtleState.fillPath = []; renderTurtleCanvas();
      }
      else if (cur.type === 'turtle_home') { homeTurtle(); }
      else if (cur.type === 'turtle_clear') { turtleDraw = []; renderTurtleCanvas(); }
    } catch (e) { conLine(`Turtle error: ${e.message}`, 'con-err'); }
  }

  if (!jumped) {
    const nextConn = conns.find(c => c.from === cur.id);
    if (nextConn) runHighlight = nextConn.id; renderConns();
    s.cur = nodes.find(n => n.id === (nextConn && nextConn.to)) || null;
  }

  if (!s.cur) { _finishStep(); return; }
  _highlightCurNode();
  _updateStepBar();
}

function _finishStep() {
  if (!_stepState) return;
  _stepState.finished = true;
  clearNodeHighlight();
  runHighlight = null; renderConns();
  document.getElementById('step-btn-next').disabled = true;
  document.getElementById('step-btn-continue').disabled = true;
  conSeparator('── จบ Step Debug ──');
  setTimeout(() => { if (_stepState && _stepState.finished) stepStop(); }, 2000);
}
