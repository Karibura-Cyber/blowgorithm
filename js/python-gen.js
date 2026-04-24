// ═══════════════════════════════════════════════
//  PYTHON CODE GENERATOR — WINDOW CONTROLS
// ═══════════════════════════════════════════════
let pyMinimized = false, pySavedH = '520px';
function closePyWin() { document.getElementById('py-win').classList.remove('open'); }
function minimizePyWin() {
  const pw = document.getElementById('py-win');
  if (pyMinimized) { pw.style.height = pySavedH; pyMinimized = false; }
  else { pySavedH = pw.style.height || '520px'; pw.style.height = '32px'; pyMinimized = true; }
}
function maximizePyWin() {
  const pw = document.getElementById('py-win');
  pw.style.width = '640px'; pw.style.height = '700px'; pySavedH = '700px'; pyMinimized = false;
}
function openPyWin() {
  const pw = document.getElementById('py-win');
  if (pyMinimized) { pw.style.height = pySavedH; pyMinimized = false; }
  pw.classList.add('open');
}
function copyPython() {
  const code = document.getElementById('py-code').textContent;
  if (!code) return;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('py-copy-btn');
    const orig = btn.textContent; btn.textContent = '✓ Copied!';
    setTimeout(() => btn.textContent = orig, 1500);
  }).catch(() => {});
}
function downloadPython() {
  const code = document.getElementById('py-code').textContent;
  if (!code) return;
  const blob = new Blob([code], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (currentFileName || 'flowchart') + '.py';
  a.click(); URL.revokeObjectURL(a.href);
}
function clearPython() {
  document.getElementById('py-code').textContent = '';
  document.getElementById('py-placeholder').style.display = 'flex';
  document.getElementById('py-copy-btn').disabled = true;
  document.getElementById('py-dl-btn').disabled = true;
}

// ═══════════════════════════════════════════════
//  PYTHON CODE GENERATOR — CORE
// ═══════════════════════════════════════════════
function generatePython() {
  const startNode = nodes.find(n => n.type === 'start' && (!n.vars.role || n.vars.role === 'start'));
  if (!startNode) {
    statusMsg.textContent = 'ไม่พบ Start node — ไม่สามารถสร้างโค้ดได้';
    return;
  }
  openPyWin();
  try {
    const lines = [];
    const hasTurtle = nodes.some(n => n.type.startsWith('turtle_'));
    if (hasTurtle) {
      lines.push('import turtle');
      lines.push('');
      lines.push('t = turtle.Turtle()');
      lines.push('t.speed(0)');
      lines.push('');
    }
    const visited = new Set();
    genBlock(startNode, 0, lines, visited);
    if (hasTurtle) {
      lines.push('');
      lines.push('turtle.done()');
    }
    const code = lines.join('\n');
    const el = document.getElementById('py-code');
    el.textContent = code;
    document.getElementById('py-placeholder').style.display = 'none';
    document.getElementById('py-copy-btn').disabled = false;
    document.getElementById('py-dl-btn').disabled = false;
    highlightPython(el);
  } catch (err) {
    const el = document.getElementById('py-code');
    el.textContent = '# Error generating code:\n# ' + err.message;
    document.getElementById('py-placeholder').style.display = 'none';
    document.getElementById('py-copy-btn').disabled = false;
  }
}

function ind(n) { return '    '.repeat(n); }

function genBlock(node, depth, lines, visited, stopAtId = null) {
  let cur = node;
  const MAX = 2000; let steps = 0;
  while (cur && steps++ < MAX) {
    if (cur.id === stopAtId) return cur;
    if (visited.has(cur.id)) return cur;
    visited.add(cur.id);

    const t = cur.type;

    if (t === 'start') {
      if (cur.vars.role === 'end') { lines.push(ind(depth) + '# End'); return null; }
    } else if (t === 'io') {
      const vn = cur.vars.varName || 'x';
      lines.push(ind(depth) + `${vn} = input("${vn}: ")`);
    } else if (t === 'output_only') {
      const expr = pyExpr(cur.vars.expr || '');
      lines.push(ind(depth) + `print(${expr})`);
    } else if (t === 'process') {
      const expr = cur.vars.expr || '';
      lines.push(ind(depth) + pyAssign(expr));
    } else if (t === 'declare') {
      const vn = cur.vars.varName || 'var';
      const vt = cur.vars.varType || 'Integer';
      const iv = cur.vars.initVal;
      let val = '0';
      if (iv !== undefined && iv !== '') val = pyLiteral(iv, vt);
      else if (vt === 'Integer' || vt === 'Real') val = '0';
      else if (vt === 'Boolean') val = 'False';
      else val = "''";
      lines.push(ind(depth) + `${vn} = ${val}`);
    } else if (t === 'call') {
      const fn = cur.vars.callName || cur.label || 'sub_process';
      lines.push(ind(depth) + `${pyIdent(fn)}()`);
    } else if (t === 'decision') {
      // Collect the full if / elif / else chain before emitting
      const merge = _findDecisionMerge(cur, visited);
      _genIfChain(cur, depth, lines, visited, merge);
      cur = merge || null; continue;
    } else if (t === 'for_loop') {
      const vn = pyIdent(cur.vars.varName || 'i');
      const from = pyExpr(cur.vars.from || '0');
      const to   = pyExpr(cur.vars.to   || '9');
      const step = pyExpr(cur.vars.step || '1');
      const toExpr = `int(${to})+1`;
      const stepStr = step === '1' ? '' : ', ' + step;
      lines.push(ind(depth) + `for ${vn} in range(${from}, ${toExpr}${stepStr}):`);
      const bodyConn = conns.find(c => c.from === cur.id && c.fromSide === 'bottom');
      const exitConn = conns.find(c => c.from === cur.id && c.fromSide !== 'bottom');
      const bodyNode = bodyConn ? nodes.find(n => n.id === bodyConn.to) : null;
      const exitNode = exitConn ? nodes.find(n => n.id === exitConn.to) : null;
      if (bodyNode) {
        const subV = new Set(visited); subV.add(cur.id);
        genBlock(bodyNode, depth + 1, lines, subV, cur.id);
      } else { lines.push(ind(depth + 1) + 'pass'); }
      cur = exitNode || null; continue;
    } else if (t === 'while_loop') {
      const cond = pyExpr(cur.vars.cond || 'False');
      lines.push(ind(depth) + `while ${cond}:`);
      const bodyConn = conns.find(c => c.from === cur.id && c.fromSide === 'bottom');
      const exitConn = conns.find(c => c.from === cur.id && c.fromSide !== 'bottom');
      const bodyNode = bodyConn ? nodes.find(n => n.id === bodyConn.to) : null;
      const exitNode = exitConn ? nodes.find(n => n.id === exitConn.to) : null;
      if (bodyNode) {
        const subV = new Set(visited); subV.add(cur.id);
        genBlock(bodyNode, depth + 1, lines, subV, cur.id);
      } else { lines.push(ind(depth + 1) + 'pass'); }
      cur = exitNode || null; continue;
    } else if (t === 'do_while') {
      const cond = pyExpr(cur.vars.cond || 'False');
      lines.push(ind(depth) + 'while True:');
      const bodyConn = conns.find(c => c.from === cur.id && c.fromSide === 'bottom');
      const exitConn = conns.find(c => c.from === cur.id && c.fromSide !== 'bottom');
      const bodyNode = bodyConn ? nodes.find(n => n.id === bodyConn.to) : null;
      const exitNode = exitConn ? nodes.find(n => n.id === exitConn.to) : null;
      if (bodyNode) {
        const subV = new Set(visited); subV.add(cur.id);
        genBlock(bodyNode, depth + 1, lines, subV, cur.id);
      } else { lines.push(ind(depth + 1) + 'pass'); }
      lines.push(ind(depth + 1) + `if not (${cond}): break`);
      cur = exitNode || null; continue;
    } else if (t === 'turtle_forward') {
      lines.push(ind(depth) + `t.forward(${pyExpr(cur.vars.value || '100')})`);
    } else if (t === 'turtle_left') {
      lines.push(ind(depth) + `t.left(${pyExpr(cur.vars.value || '90')})`);
    } else if (t === 'turtle_right') {
      lines.push(ind(depth) + `t.right(${pyExpr(cur.vars.value || '90')})`);
    } else if (t === 'turtle_penup') {
      lines.push(ind(depth) + 't.penup()');
    } else if (t === 'turtle_pendown') {
      lines.push(ind(depth) + 't.pendown()');
    } else if (t === 'turtle_pencolor') {
      lines.push(ind(depth) + `t.pencolor("${cur.vars.color || '#000000'}")`);
    } else if (t === 'turtle_fillcolor') {
      lines.push(ind(depth) + `t.fillcolor("${cur.vars.color || '#ff0000'}")`);
    } else if (t === 'turtle_beginfill') {
      lines.push(ind(depth) + 't.begin_fill()');
    } else if (t === 'turtle_endfill') {
      lines.push(ind(depth) + 't.end_fill()');
    } else if (t === 'turtle_home') {
      lines.push(ind(depth) + 't.home()');
    } else if (t === 'turtle_clear') {
      lines.push(ind(depth) + 't.clear()');
    }

    const nextConn = conns.find(c => c.from === cur.id);
    cur = nextConn ? nodes.find(n => n.id === nextConn.to) || null : null;
  }
  return null;
}

// ── If / elif / else chain generator ──────────────
// Walk a chain of decision nodes connected false→decision
// and emit proper if / elif / else blocks.

function _getDecisionBranches(decNode) {
  const outs     = conns.filter(c => c.from === decNode.id);
  const trueDir  = decNode.vars.trueDir  || 'bottom';
  const falseDir = decNode.vars.falseDir || 'right';
  const trueConn  = outs.find(c => c.fromSide === trueDir);
  const falseConn = outs.find(c => c.fromSide === falseDir);
  return {
    trueNode:  trueConn  ? nodes.find(n => n.id === trueConn.to)  : null,
    falseNode: falseConn ? nodes.find(n => n.id === falseConn.to) : null,
  };
}

// Find the single merge point for the entire if/elif/else chain
// starting at decNode.
function _findDecisionMerge(decNode, visited) {
  // Collect all branch-entry nodes across the whole chain
  const branchHeads = [];
  let d = decNode;
  while (d && d.type === 'decision') {
    const { trueNode, falseNode } = _getDecisionBranches(d);
    if (trueNode)  branchHeads.push(trueNode);
    // If the false branch IS another decision, keep walking; otherwise it's the final else-body
    if (falseNode && falseNode.type !== 'decision') {
      branchHeads.push(falseNode);
      break;
    }
    d = falseNode;
  }
  if (branchHeads.length < 2) return null;

  // BFS successors of branchHeads[0]
  const aSucc = new Set();
  const qa = [branchHeads[0]]; let safeA = 0;
  while (qa.length && safeA++ < 400) {
    const n = qa.shift();
    if (!n || aSucc.has(n.id)) continue;
    aSucc.add(n.id);
    conns.filter(c => c.from === n.id).forEach(c => {
      const nx = nodes.find(x => x.id === c.to);
      if (nx && !aSucc.has(nx.id)) qa.push(nx);
    });
  }
  // Walk BFS from every other head; first node in aSucc wins
  for (let i = 1; i < branchHeads.length; i++) {
    const qb = [branchHeads[i]]; const bSeen = new Set(); let safeB = 0;
    while (qb.length && safeB++ < 400) {
      const n = qb.shift();
      if (!n || bSeen.has(n.id)) continue;
      bSeen.add(n.id);
      if (aSucc.has(n.id)) return n;
      conns.filter(c => c.from === n.id).forEach(c => {
        const nx = nodes.find(x => x.id === c.to);
        if (nx) qb.push(nx);
      });
    }
  }
  return null;
}

// Emit if/elif/else for a chain of decision nodes.
// keyword: 'if' for the first call, 'elif' for recursion.
function _genIfChain(decNode, depth, lines, visited, merge, keyword = 'if') {
  visited.add(decNode.id);
  const cond = pyExpr(decNode.vars.cond || 'False');
  const { trueNode, falseNode } = _getDecisionBranches(decNode);

  lines.push(ind(depth) + `${keyword} ${cond}:`);

  // True branch
  if (trueNode) {
    const subV = new Set(visited);
    genBlock(trueNode, depth + 1, lines, subV, merge ? merge.id : null);
  } else {
    lines.push(ind(depth + 1) + 'pass');
  }

  // False branch — chain as elif if it's another bare decision
  if (falseNode) {
    if (falseNode.type === 'decision' && !visited.has(falseNode.id)) {
      // Recurse as elif — do NOT add an else: wrapper
      _genIfChain(falseNode, depth, lines, visited, merge, 'elif');
    } else {
      lines.push(ind(depth) + 'else:');
      const subV = new Set(visited);
      genBlock(falseNode, depth + 1, lines, subV, merge ? merge.id : null);
    }
  }
}


function findMerge(nodeA, nodeB, visited) {
  if (!nodeA || !nodeB) return null;
  const aSucc = new Set();
  const qa = [nodeA]; let safeA = 0;
  while (qa.length && safeA++ < 300) {
    const n = qa.shift();
    if (!n || aSucc.has(n.id)) continue;
    aSucc.add(n.id);
    conns.filter(c => c.from === n.id).forEach(c => {
      const nx = nodes.find(x => x.id === c.to);
      if (nx && !aSucc.has(nx.id)) qa.push(nx);
    });
  }
  const qb = [nodeB]; const bSeen = new Set(); let safeB = 0;
  while (qb.length && safeB++ < 300) {
    const n = qb.shift();
    if (!n || bSeen.has(n.id)) continue;
    bSeen.add(n.id);
    if (aSucc.has(n.id)) return n;
    conns.filter(c => c.from === n.id).forEach(c => {
      const nx = nodes.find(x => x.id === c.to);
      if (nx) qb.push(nx);
    });
  }
  return null;
}

function pyExpr(expr) {
  if (!expr) return 'None';
  return expr
    .replace(/\bTrue\b/g, 'True').replace(/\bFalse\b/g, 'False')
    .replace(/\btrue\b/g, 'True').replace(/\bfalse\b/g, 'False')
    .replace(/&&/g, ' and ').replace(/\|\|/g, ' or ').replace(/!/g, 'not ')
    .replace(/\^/g, '**')
    .replace(/\bmod\b/g, '%')
    .trim();
}

function pyAssign(expr) {
  if (!expr) return 'pass';
  const m = expr.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=(.+)$/s);
  if (m) return `${m[1].trim()} = ${pyExpr(m[2].trim())}`;
  return pyExpr(expr);
}

function pyIdent(s) { return (s || 'func').trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''); }

function pyLiteral(val, type) {
  if (type === 'String') return `"${val}"`;
  if (type === 'Boolean') return (val === 'true' || val === 'True' || val === '1') ? 'True' : 'False';
  const n = parseFloat(val);
  return isNaN(n) ? `"${val}"` : String(n);
}

function highlightPython(el) {
  const kw = ['import', 'from', 'as', 'def', 'class', 'return', 'if', 'elif', 'else',
    'for', 'while', 'in', 'range', 'break', 'continue', 'pass', 'True', 'False', 'None',
    'not', 'and', 'or', 'print', 'input', 'try', 'except', 'turtle'];
  let code = el.textContent;
  code = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  code = code.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="py-str">$1</span>');
  code = code.replace(/(#[^\n]*)/g, '<span class="py-comment">$1</span>');
  code = code.replace(/\b(\d+\.?\d*)\b/g, '<span class="py-num">$1</span>');
  kw.forEach(k => {
    const re = new RegExp(`\\b(${k})\\b(?![^<]*</span>)`, 'g');
    code = code.replace(re, '<span class="py-kw">$1</span>');
  });
  el.innerHTML = code;
}
