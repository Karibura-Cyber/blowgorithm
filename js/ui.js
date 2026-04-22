// ═══════════════════════════════════════════════
//  MODE
// ═══════════════════════════════════════════════
function setMode(m) {
  mode = m;
  document.querySelectorAll('.tb-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === m);
  });
  wrap.className = m.startsWith('add:') ? 'adding' : '';
  const hints = {
    select: 'คลิก shape เพื่อเลือก · ลากพื้นหลังเพื่อเลื่อน · ลากจุดสีเพื่อเชื่อมต่อ',
    'add:start': 'คลิก canvas เพื่อวาง Terminal',
    'add:process': 'คลิก canvas เพื่อวาง Process',
    'add:decision': 'คลิก canvas เพื่อวาง Decision',
    'add:io': 'คลิก canvas เพื่อวาง Input',
    'add:call': 'คลิก canvas เพื่อวาง Sub-process',
    'add:output_only': 'คลิก canvas เพื่อวาง Output',
    'add:declare': 'คลิก canvas เพื่อวาง Declare (ประกาศตัวแปร)',
    'add:for_loop': 'คลิก canvas เพื่อวาง For Loop — Body=ล่าง, Exit=ขวา',
    'add:while_loop': 'คลิก canvas เพื่อวาง While Loop — Body=ล่าง, Exit=ขวา',
    'add:do_while': 'คลิก canvas เพื่อวาง Do...While — Body=ล่าง, Exit=ขวา',
    'add:turtle_forward': 'คลิก canvas เพื่อวาง Turtle Forward',
    'add:turtle_left': 'คลิก canvas เพื่อวาง Turtle Turn Left',
    'add:turtle_right': 'คลิก canvas เพื่อวาง Turtle Turn Right',
    'add:turtle_penup': 'คลิก canvas เพื่อวาง Turtle Pen Up',
    'add:turtle_pendown': 'คลิก canvas เพื่อวาง Turtle Pen Down',
    'add:turtle_pencolor': 'คลิก canvas เพื่อวาง Turtle Pen Color',
    'add:turtle_fillcolor': 'คลิก canvas เพื่อวาง Turtle Fill Color',
    'add:turtle_beginfill': 'คลิก canvas เพื่อวาง Turtle Begin Fill',
    'add:turtle_endfill': 'คลิก canvas เพื่อวาง Turtle End Fill',
    'add:turtle_home': 'คลิก canvas เพื่อวาง Turtle Home',
    'add:turtle_clear': 'คลิก canvas เพื่อวาง Turtle Clear',
  };
  statusMsg.textContent = hints[m] || '';
}

// ═══════════════════════════════════════════════
//  PROPERTIES PANEL
// ═══════════════════════════════════════════════
const typeNames = {
  start: 'Terminal', process: 'Process', decision: 'Decision', io: 'Input',
  call: 'Sub-process', output_only: 'Output (Print)', declare: 'Declare',
  for_loop: 'For Loop', while_loop: 'While Loop', do_while: 'Do...While',
  turtle_forward: 'Turtle Forward', turtle_left: 'Turtle Left', turtle_right: 'Turtle Right',
  turtle_penup: 'Turtle Pen Up', turtle_pendown: 'Turtle Pen Down', turtle_pencolor: 'Turtle Pen Color',
  turtle_fillcolor: 'Turtle Fill Color', turtle_beginfill: 'Turtle Begin Fill', turtle_endfill: 'Turtle End Fill',
  turtle_home: 'Turtle Home', turtle_clear: 'Turtle Clear',
};
const typeColors = {
  start: '#dcfce7', process: '#dbeafe', decision: '#fef9c3', io: '#fce7f3',
  call: '#ede9fe', output_only: '#fff7ed', declare: '#e0f7fa',
  for_loop: '#eef2ff', while_loop: '#f0fdfa', do_while: '#faf5ff',
  turtle_forward: '#dcfce7', turtle_left: '#d1fae5', turtle_right: '#d1fae5',
  turtle_penup: '#e0f2fe', turtle_pendown: '#e0f2fe', turtle_pencolor: '#ede9fe',
  turtle_fillcolor: '#faf5ff', turtle_beginfill: '#fce7f3', turtle_endfill: '#fce7f3',
  turtle_home: '#fef3c7', turtle_clear: '#f1f5f9',
};
const typeTextColors = {
  start: '#16a34a', process: '#2563eb', decision: '#92400e', io: '#9d174d',
  call: '#5b21b6', output_only: '#9a3412', declare: '#0891b2',
  for_loop: '#4338ca', while_loop: '#0f766e', do_while: '#7e22ce',
  turtle_forward: '#15803d', turtle_left: '#059669', turtle_right: '#059669',
  turtle_penup: '#0284c7', turtle_pendown: '#0284c7', turtle_pencolor: '#7c3aed',
  turtle_fillcolor: '#9333ea', turtle_beginfill: '#db2777', turtle_endfill: '#db2777',
  turtle_home: '#d97706', turtle_clear: '#475569',
};

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function openPropsWin(n) {
  const win = document.getElementById('props-win');
  win.classList.add('open');
  if (!win._placed) {
    const cw = wrap.clientWidth, ch = wrap.clientHeight;
    win.style.left = (wrap.getBoundingClientRect().left + cw - 280) + 'px';
    win.style.top = (wrap.getBoundingClientRect().top + 60) + 'px';
    win.style.right = 'auto'; win.style.bottom = 'auto';
    win._placed = true;
  }
  renderProps(n);
}

function closePropsWin() {
  document.getElementById('props-win').classList.remove('open');
}

function renderProps(n) {
  const body = document.getElementById('props-body');
  if (!n) {
    body.innerHTML = `<div id="props-empty">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="4" y="10" width="32" height="20" rx="4" stroke="#6b6860" stroke-width="1.5"/><path d="M14 20h12M20 14v12" stroke="#6b6860" stroke-width="1.5" stroke-linecap="round"/></svg>
      <div style="font-size:12px;color:var(--text3);margin-top:4px">ดับเบิลคลิก shape เพื่อแก้ไข</div>
    </div>`;
    return;
  }
  document.getElementById('props-win-title').textContent = (typeNames[n.type] || n.type) + ' #' + n.id;
  let html = `
    <div class="prop-group">
      <div class="prop-label">Label</div>
      <textarea class="prop-textarea" id="pp-label" rows="2">${esc(n.label)}</textarea>
    </div>`;

  if (n.type === 'start') {
    html += `<div class="prop-group">
      <div class="prop-label">Role</div>
      <select class="prop-select" id="pp-role">
        <option value="start"${(!n.vars.role || n.vars.role === 'start') ? ' selected' : ''}>Start</option>
        <option value="end"${n.vars.role === 'end' ? ' selected' : ''}>End</option>
      </select>
    </div>`;
  }
  if (n.type === 'io') {
    html += `<div class="prop-group">
      <div class="prop-label">ชื่อตัวแปร</div>
      <input class="prop-input" id="pp-var" value="${esc(n.vars.varName || '')}" placeholder="เช่น x, name">
    </div>`;
  }
  if (n.type === 'output_only') {
    html += `<div class="prop-group">
      <div class="prop-label">นิพจน์ที่แสดง</div>
      <input class="prop-input" id="pp-expr-out" value="${esc(n.vars.expr || '')}" placeholder="เช่น x, x*2, 'hello'">
    </div>`;
  }
  if (n.type === 'process') {
    html += `<div class="prop-group">
      <div class="prop-label">การกำหนดค่า</div>
      <input class="prop-input" id="pp-expr" value="${esc(n.vars.expr || '')}" placeholder="เช่น x = x + 1">
      <div class="prop-hint">รูปแบบ: <code>ตัวแปร = นิพจน์</code></div>
    </div>`;
  }
  if (n.type === 'decision') {
    html += `<div class="prop-group">
      <div class="prop-label">เงื่อนไข (JavaScript)</div>
      <input class="prop-input" id="pp-cond" value="${esc(n.vars.cond || '')}" placeholder="เช่น x > 0">
      <div class="prop-hint">ออก True = ล่าง · ออก False = ซ้าย/ขวา</div>
    </div>`;
  }
  if (n.type === 'call') {
    html += `<div class="prop-group">
      <div class="prop-label">ชื่อ Subroutine</div>
      <input class="prop-input" id="pp-call" value="${esc(n.vars.callName || '')}" placeholder="ชื่อฟังก์ชัน">
    </div>`;
  }
  if (n.type === 'declare') {
    const typeOpts = ['Integer', 'Real', 'String', 'Boolean'].map(t => `<option value="${t}"${(n.vars.varType || 'Integer') === t ? ' selected' : ''}>${t}</option>`).join('');
    html += `<div class="prop-group">
      <div class="prop-label">ชื่อตัวแปร</div>
      <input class="prop-input" id="pp-decl-name" value="${esc(n.vars.varName || '')}" placeholder="เช่น x, total">
    </div>
    <div class="prop-group">
      <div class="prop-label">ชนิดข้อมูล</div>
      <select class="prop-select" id="pp-decl-type">${typeOpts}</select>
    </div>
    <div class="prop-group">
      <div class="prop-label">ค่าเริ่มต้น (ไม่บังคับ)</div>
      <input class="prop-input" id="pp-decl-init" value="${esc(n.vars.initVal || '')}" placeholder="เช่น 0, 'hello'">
    </div>`;
  }
  if (n.type === 'for_loop') {
    html += `<div class="prop-group">
      <div class="prop-label">ตัวแปร</div>
      <input class="prop-input" id="pp-for-var" value="${esc(n.vars.varName || 'i')}" placeholder="เช่น i">
    </div>
    <div class="prop-group">
      <div class="prop-label">เริ่มต้น (From)</div>
      <input class="prop-input" id="pp-for-from" value="${esc(n.vars.from || '0')}" placeholder="เช่น 0">
    </div>
    <div class="prop-group">
      <div class="prop-label">สิ้นสุด (To)</div>
      <input class="prop-input" id="pp-for-to" value="${esc(n.vars.to || '9')}" placeholder="เช่น 9, n">
    </div>
    <div class="prop-group">
      <div class="prop-label">ขั้นตอน (Step)</div>
      <input class="prop-input" id="pp-for-step" value="${esc(n.vars.step || '1')}" placeholder="เช่น 1, -1">
      <div class="prop-hint">Body ออก Bottom · Exit ออก Right</div>
    </div>`;
  }
  if (n.type === 'while_loop') {
    html += `<div class="prop-group">
      <div class="prop-label">เงื่อนไข (Condition)</div>
      <input class="prop-input" id="pp-while-cond" value="${esc(n.vars.cond || '')}" placeholder="เช่น x > 0">
      <div class="prop-hint">Body ออก Bottom · Exit ออก Right</div>
    </div>`;
  }
  if (n.type === 'do_while') {
    html += `<div class="prop-group">
      <div class="prop-label">เงื่อนไข (Condition)</div>
      <input class="prop-input" id="pp-dw-cond" value="${esc(n.vars.cond || '')}" placeholder="เช่น x > 0">
      <div class="prop-hint">ทำ Body ก่อน แล้วตรวจ · Exit ออก Right</div>
    </div>`;
  }
  if (['turtle_forward', 'turtle_left', 'turtle_right'].includes(n.type)) {
    const lbl = n.type === 'turtle_forward' ? 'ระยะทาง (Distance)' : 'มุม (Angle degrees)';
    html += `<div class="prop-group">
      <div class="prop-label">${lbl}</div>
      <input class="prop-input" id="pp-t-val" value="${esc(n.vars.value || '100')}" placeholder="เช่น 100, 90, x">
      <div class="prop-hint">รองรับตัวแปรใน flowchart</div>
    </div>`;
  }
  if (['turtle_pencolor', 'turtle_fillcolor'].includes(n.type)) {
    const defC = n.type === 'turtle_pencolor' ? '#000000' : '#ff0000';
    html += `<div class="prop-group">
      <div class="prop-label">สี (Color)</div>
      <div style="display:flex;gap:6px;align-items:center">
        <input type="color" id="pp-t-color" value="${esc(n.vars.color || defC)}" style="width:38px;height:30px;padding:2px;border:1px solid var(--border);border-radius:var(--radius);cursor:pointer">
        <input class="prop-input" id="pp-t-color-txt" value="${esc(n.vars.color || defC)}" placeholder="#000000" style="flex:1">
      </div>
    </div>`;
  }
  body.innerHTML = html;

  // Wire up input handlers
  const lb = document.getElementById('pp-label');
  if (lb) lb.oninput = e => { n.label = e.target.value; redrawNode(n); };
  const rl = document.getElementById('pp-role');
  if (rl) rl.onchange = e => {
    n.vars.role = e.target.value;
    n.label = e.target.value === 'end' ? 'End' : 'Start';
    const lbEl = document.getElementById('pp-label'); if (lbEl) lbEl.value = n.label;
    redrawNode(n);
  };
  const vr = document.getElementById('pp-var');
  if (vr) vr.oninput = e => {
    n.vars.varName = e.target.value;
    n.label = e.target.value ? `Input ${e.target.value}` : 'Input';
    const lbEl = document.getElementById('pp-label'); if (lbEl) lbEl.value = n.label;
    redrawNode(n);
  };
  const exo = document.getElementById('pp-expr-out');
  if (exo) exo.oninput = e => {
    n.vars.expr = e.target.value;
    n.label = e.target.value ? `Print ${e.target.value}` : 'Output';
    const lbEl = document.getElementById('pp-label'); if (lbEl) lbEl.value = n.label;
    redrawNode(n);
  };
  const ex = document.getElementById('pp-expr');
  if (ex) ex.oninput = e => {
    n.vars.expr = e.target.value;
    n.label = e.target.value.trim() || 'Process';
    const lbEl = document.getElementById('pp-label'); if (lbEl) lbEl.value = n.label;
    redrawNode(n);
  };
  const cd = document.getElementById('pp-cond');
  if (cd) cd.oninput = e => {
    n.vars.cond = e.target.value;
    n.label = e.target.value ? `${e.target.value} ?` : 'Decision';
    const lbEl = document.getElementById('pp-label'); if (lbEl) lbEl.value = n.label;
    redrawNode(n);
  };
  const cl = document.getElementById('pp-call');
  if (cl) cl.oninput = e => {
    n.vars.callName = e.target.value;
    n.label = e.target.value || 'SubProcess';
    const lbEl = document.getElementById('pp-label'); if (lbEl) lbEl.value = n.label;
    redrawNode(n);
  };
  const dn = document.getElementById('pp-decl-name');
  if (dn) dn.oninput = e => {
    n.vars.varName = e.target.value;
    const t = n.vars.varType || 'Integer';
    const iv = n.vars.initVal || '';
    n.label = e.target.value ? `${t} ${e.target.value}${iv ? ' = ' + iv : ''}` : 'Declare';
    const lbEl = document.getElementById('pp-label'); if (lbEl) lbEl.value = n.label;
    redrawNode(n);
  };
  const dt = document.getElementById('pp-decl-type');
  if (dt) dt.onchange = e => {
    n.vars.varType = e.target.value;
    const nm = n.vars.varName || '';
    const iv = n.vars.initVal || '';
    if (nm) n.label = `${e.target.value} ${nm}${iv ? ' = ' + iv : ''}`;
    const lbEl = document.getElementById('pp-label'); if (lbEl) lbEl.value = n.label;
    redrawNode(n);
  };
  const di = document.getElementById('pp-decl-init');
  if (di) di.oninput = e => {
    n.vars.initVal = e.target.value;
    const t = n.vars.varType || 'Integer';
    const nm = n.vars.varName || '';
    n.label = nm ? `${t} ${nm}${e.target.value ? ' = ' + e.target.value : ''}` : 'Declare';
    const lbEl = document.getElementById('pp-label'); if (lbEl) lbEl.value = n.label;
    redrawNode(n);
  };
  // For Loop handlers
  function _forLabel() {
    const step = n.vars.step || '1';
    const stepSuffix = step !== '1' ? ` step ${step}` : '';
    n.label = `For ${n.vars.varName || 'i'} = ${n.vars.from || '0'} to ${n.vars.to || '9'}${stepSuffix}`;
    const l = document.getElementById('pp-label'); if (l) l.value = n.label;
    redrawNode(n);
  }
  const fv = document.getElementById('pp-for-var');
  if (fv) fv.oninput = e => { n.vars.varName = e.target.value; _forLabel(); };
  const ff = document.getElementById('pp-for-from');
  if (ff) ff.oninput = e => { n.vars.from = e.target.value; _forLabel(); };
  const ft = document.getElementById('pp-for-to');
  if (ft) ft.oninput = e => { n.vars.to = e.target.value; _forLabel(); };
  const fs = document.getElementById('pp-for-step');
  if (fs) fs.oninput = e => { n.vars.step = e.target.value; _forLabel(); };
  const wc = document.getElementById('pp-while-cond');
  if (wc) wc.oninput = e => {
    n.vars.cond = e.target.value;
    n.label = `While ${e.target.value}`;
    const l = document.getElementById('pp-label'); if (l) l.value = n.label;
    redrawNode(n);
  };
  const dwc = document.getElementById('pp-dw-cond');
  if (dwc) dwc.oninput = e => {
    n.vars.cond = e.target.value;
    n.label = `Do...While ${e.target.value}`;
    const l = document.getElementById('pp-label'); if (l) l.value = n.label;
    redrawNode(n);
  };
  const ptv = document.getElementById('pp-t-val');
  if (ptv) ptv.oninput = e => {
    n.vars.value = e.target.value;
    n.label = getTurtleLabel(n);
    const l = document.getElementById('pp-label'); if (l) l.value = n.label;
    redrawNode(n);
  };
  const ptcp = document.getElementById('pp-t-color');
  if (ptcp) ptcp.oninput = e => {
    n.vars.color = e.target.value;
    const txt = document.getElementById('pp-t-color-txt'); if (txt) txt.value = e.target.value;
    n.label = getTurtleLabel(n);
    const l = document.getElementById('pp-label'); if (l) l.value = n.label;
    redrawNode(n);
  };
  const ptct = document.getElementById('pp-t-color-txt');
  if (ptct) ptct.oninput = e => {
    n.vars.color = e.target.value;
    const pick = document.getElementById('pp-t-color'); if (pick) pick.value = e.target.value;
    n.label = getTurtleLabel(n);
    const l = document.getElementById('pp-label'); if (l) l.value = n.label;
    redrawNode(n);
  };
}

// ═══════════════════════════════════════════════
//  CUSTOM DIALOG
// ═══════════════════════════════════════════════
let _dialogResolve = null;

function showDialog({ title = 'แจ้งเตือน', msg = '', icon = 'info', okText = 'ตกลง', cancelText = null }) {
  return new Promise(res => {
    _dialogResolve = res;
    const overlay = document.getElementById('dialog-overlay');
    const iconEl = document.getElementById('dialog-icon');
    iconEl.className = ''; iconEl.classList.add(icon);
    const icons = { info: 'ℹ', warn: '⚠', err: '✖' };
    iconEl.textContent = icons[icon] || 'ℹ';
    document.getElementById('dialog-title').textContent = title;
    document.getElementById('dialog-msg').textContent = msg;
    const okBtn = document.getElementById('dialog-ok-btn');
    okBtn.textContent = okText;
    okBtn.className = 'dlg-btn ' + (icon === 'err' || icon === 'warn' ? 'danger' : 'primary');
    const cancelBtn = document.getElementById('dialog-cancel-btn');
    cancelBtn.textContent = cancelText || 'ยกเลิก';
    cancelBtn.style.display = cancelText !== null ? '' : 'none';
    overlay.classList.add('open');
    setTimeout(() => okBtn.focus(), 50);
  });
}

function dialogOk() {
  document.getElementById('dialog-overlay').classList.remove('open');
  if (_dialogResolve) { _dialogResolve(true); _dialogResolve = null; }
}
function dialogCancel() {
  document.getElementById('dialog-overlay').classList.remove('open');
  if (_dialogResolve) { _dialogResolve(false); _dialogResolve = null; }
}
document.getElementById('dialog-overlay').addEventListener('mousedown', e => {
  if (e.target === document.getElementById('dialog-overlay')) dialogCancel();
});
document.addEventListener('keydown', e => {
  if (!document.getElementById('dialog-overlay').classList.contains('open')) return;
  if (e.key === 'Enter') { e.preventDefault(); dialogOk(); }
  if (e.key === 'Escape') { e.preventDefault(); dialogCancel(); }
}, { capture: true });

function customAlert(msg, title = 'แจ้งเตือน', icon = 'info') {
  return showDialog({ title, msg, icon, okText: 'ตกลง', cancelText: null });
}
function customConfirm(msg, title = 'ยืนยัน', icon = 'warn') {
  return showDialog({ title, msg, icon, okText: 'ตกลง', cancelText: 'ยกเลิก' });
}

// ═══════════════════════════════════════════════
//  FLOATING WINDOW DRAG
// ═══════════════════════════════════════════════
function makeDraggable(win, bar) {
  let ox = 0, oy = 0, mx = 0, my = 0, dragging = false;
  bar.addEventListener('mousedown', e => {
    if (e.target.classList.contains('fw-dot')) return;
    dragging = true;
    mx = e.clientX; my = e.clientY;
    const r = win.getBoundingClientRect();
    ox = mx - r.left; oy = my - r.top;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    win.style.left = (e.clientX - ox) + 'px';
    win.style.top = (e.clientY - oy) + 'px';
    win.style.right = 'auto'; win.style.bottom = 'auto';
  });
  document.addEventListener('mouseup', () => { dragging = false; });
}

// ═══════════════════════════════════════════════
//  NODE CONTEXT MENU
// ═══════════════════════════════════════════════
let _ctxNode = null;
const ctxMenu = document.getElementById('node-ctx-menu');

function showNodeCtxMenu(n, cx, cy) {
  _ctxNode = n;
  ctxMenu.style.left = '0px'; ctxMenu.style.top = '0px';
  ctxMenu.classList.add('open');
  const mw = ctxMenu.offsetWidth || 170, mh = ctxMenu.offsetHeight || 120;
  const vw = window.innerWidth, vh = window.innerHeight;
  ctxMenu.style.left = Math.min(cx, vw - mw - 8) + 'px';
  ctxMenu.style.top = Math.min(cy, vh - mh - 8) + 'px';
}

function hideNodeCtxMenu() {
  ctxMenu.classList.remove('open');
  _ctxNode = null;
}

document.getElementById('ctx-properties').addEventListener('click', () => {
  if (!_ctxNode) return;
  openPropsWin(_ctxNode);
  hideNodeCtxMenu();
});
document.getElementById('ctx-duplicate').addEventListener('click', () => {
  if (!_ctxNode) return;
  duplicateNode(_ctxNode);
  hideNodeCtxMenu();
});
document.getElementById('ctx-remove').addEventListener('click', () => {
  if (!_ctxNode) return;
  if (!selIds.has(_ctxNode.id)) selectNode(_ctxNode.id);
  hideNodeCtxMenu();
  deleteSelected();
});
document.addEventListener('mousedown', e => {
  if (ctxMenu.classList.contains('open') && !ctxMenu.contains(e.target)) hideNodeCtxMenu();
}, { capture: true });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && ctxMenu.classList.contains('open')) hideNodeCtxMenu();
}, { capture: true });

// ═══════════════════════════════════════════════
//  CLICK OUTSIDE TO CLOSE FLOATING WINDOWS
// ═══════════════════════════════════════════════
document.addEventListener('mousedown', e => {
  const floatingWins = [
    { id: 'chat-win',   close: closeChatWin },
    { id: 'turtle-win', close: closeTurtleWin },
    { id: 'py-win',     close: closePyWin },
    { id: 'props-win',  close: closePropsWin },
  ];
  floatingWins.forEach(({ id, close }) => {
    const win = document.getElementById(id);
    if (!win || !win.classList.contains('open')) return;
    if (!win.contains(e.target)) close();
  });
});

// Theme picker close on outside click
document.addEventListener('mousedown', e => {
  const picker = document.getElementById('theme-picker');
  const btn = document.getElementById('theme-toggle-btn');
  if (picker.classList.contains('open') && !picker.contains(e.target) && btn && !btn.contains(e.target)) {
    picker.classList.remove('open');
  }
});

// ═══════════════════════════════════════════════
//  FILE OPERATIONS
// ═══════════════════════════════════════════════
function saveFile() {
  openSaveDialog();
}

function openSaveDialog() {
  const overlay = document.getElementById('save-overlay');
  const input = document.getElementById('save-filename-input');
  input.value = currentFileName || 'flowchart';
  overlay.classList.add('open');
  // Select all text so the user can immediately type a new name
  setTimeout(() => { input.focus(); input.select(); }, 60);
}

function closeSaveDialog() {
  document.getElementById('save-overlay').classList.remove('open');
}

function confirmSaveFile() {
  const raw = document.getElementById('save-filename-input').value.trim();
  const name = raw || 'flowchart';
  // Sanitise: remove characters that are unsafe in file names
  const safe = name.replace(/[\\/:*?"<>|]/g, '_');
  currentFileName = safe;
  document.title = 'Blowgorithm — ' + safe;
  closeSaveDialog();

  const data = { version: 1, nextId, nodes: nodes.map(n => ({ ...n, _g: undefined })), conns };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = safe + '.flow';
  a.click();
  URL.revokeObjectURL(a.href);
  statusMsg.textContent = 'บันทึกไฟล์: ' + safe + '.flow';
}

// Close save dialog on overlay click or Escape
document.getElementById('save-overlay').addEventListener('mousedown', e => {
  if (e.target === document.getElementById('save-overlay')) closeSaveDialog();
});
document.addEventListener('keydown', e => {
  const overlay = document.getElementById('save-overlay');
  if (!overlay.classList.contains('open')) return;
  if (e.key === 'Escape') { e.preventDefault(); closeSaveDialog(); }
  if (e.key === 'Enter')  { e.preventDefault(); confirmSaveFile(); }
});

function openFile() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.flow';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.nodes || !data.conns) throw new Error('ไฟล์ไม่ถูกต้อง');
        historySnapshot();
        nodes = data.nodes.map(n => ({ ...n, _g: null }));
        conns = data.conns;
        nextId = data.nextId || Math.max(0, ...nodes.map(n => n.id)) + 1;
        selId = null;
        currentFileName = file.name.replace(/\.flow$/, '');
        document.title = 'Blowgorithm — ' + currentFileName;
        nodeLayer.innerHTML = ''; connLayer.innerHTML = '';
        selIds = new Set(); selId = null;
        nodes.forEach(n => renderNode(n));
        renderConns();
        selectNode(null);
        fitView();
        statusMsg.textContent = 'เปิดไฟล์: ' + file.name;
      } catch (err) {
        customAlert('เปิดไฟล์ไม่ได้: ' + err.message, 'เกิดข้อผิดพลาด', 'err');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function clearOutput() { outputLog.innerHTML = ''; }

// ═══════════════════════════════════════════════
//  WINDOW POSITION & INIT
// ═══════════════════════════════════════════════
function initWindows() {
  const cw = document.getElementById('chat-win');
  const tw = document.getElementById('turtle-win');
  const pw = document.getElementById('py-win');
  cw.style.right = '240px'; cw.style.bottom = '60px';
  cw.style.left = 'auto'; cw.style.top = 'auto';
  tw.style.right = '245px'; tw.style.top = '50px';
  tw.style.left = 'auto'; tw.style.bottom = 'auto';
  pw.style.right = '260px'; pw.style.top = '80px';
  pw.style.left = 'auto'; pw.style.bottom = 'auto';
  makeDraggable(cw, document.getElementById('chat-win-bar'));
  makeDraggable(tw, document.getElementById('turtle-win-bar'));
  makeDraggable(pw, document.getElementById('py-win-bar'));
  makeDraggable(document.getElementById('props-win'), document.getElementById('props-win-bar'));

  // Turtle canvas events
  const turtleCanvas = document.getElementById('turtle-canvas');
  if (turtleCanvas) {
    turtleCanvas.addEventListener('wheel', e => {
      e.preventDefault();
      const rect = turtleCanvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - turtleCanvas.width / 2;
      const my = e.clientY - rect.top - turtleCanvas.height / 2;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const newZoom = Math.max(0.1, Math.min(20, turtleZoom * factor));
      turtlePan.x = mx - (mx - turtlePan.x) * (newZoom / turtleZoom);
      turtlePan.y = my - (my - turtlePan.y) * (newZoom / turtleZoom);
      turtleZoom = newZoom;
      renderTurtleCanvas();
    }, { passive: false });

    turtleCanvas.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      turtleCanvasDragging = true;
      turtleCanvasDragStart = { x: e.clientX, y: e.clientY };
      turtleCanvasPanStart = { x: turtlePan.x, y: turtlePan.y };
      turtleCanvas.style.cursor = 'grabbing';
      e.preventDefault();
    });

    turtleCanvas.addEventListener('dblclick', () => { turtleFitView(); });

    document.addEventListener('mousemove', e => {
      if (!turtleCanvasDragging) return;
      const dx = e.clientX - turtleCanvasDragStart.x;
      const dy = e.clientY - turtleCanvasDragStart.y;
      turtlePan.x = turtleCanvasPanStart.x + dx;
      turtlePan.y = turtleCanvasPanStart.y + dy;
      renderTurtleCanvas();
    });

    document.addEventListener('mouseup', () => {
      turtleCanvasDragging = false;
      turtleCanvas.style.cursor = 'grab';
    });
  }

  const turtleBody = document.getElementById('turtle-win-body');
  if (turtleBody && window.ResizeObserver) {
    new ResizeObserver(() => resizeTurtleCanvas()).observe(turtleBody);
  }
}

// ═══════════════════════════════════════════════
//  CHAT WINDOW CONTROLS
// ═══════════════════════════════════════════════
let cwMinimized = false, cwSavedH = '480px';
function closeChatWin() { document.getElementById('chat-win').classList.remove('open'); }
function minimizeChatWin() {
  const cw = document.getElementById('chat-win');
  if (cwMinimized) { cw.style.height = cwSavedH; cwMinimized = false; }
  else { cwSavedH = cw.style.height || '480px'; cw.style.height = '32px'; cwMinimized = true; }
}
function maximizeChatWin() {
  const cw = document.getElementById('chat-win');
  cw.style.width = '520px'; cw.style.height = '600px';
  cwSavedH = '600px'; cwMinimized = false;
}
function openChatWin() {
  const cw = document.getElementById('chat-win');
  if (cwMinimized) { cw.style.height = cwSavedH; cwMinimized = false; }
  cw.classList.add('open');
}
function clearChat() {
  document.getElementById('chat-messages').innerHTML = '';
  chatText = [];
}
function copyChat() {
  navigator.clipboard.writeText(chatText.join('\n')).catch(() => {});
}
