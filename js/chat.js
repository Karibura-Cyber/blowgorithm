// ═══════════════════════════════════════════════
//  CHAT CONSOLE
// ═══════════════════════════════════════════════
let chatText = [];

function addChatMsg(msg, rowCls) {
  const chatMessages = document.getElementById('chat-messages');
  const row = document.createElement('div');
  row.className = 'chat-row ' + rowCls;
  if (rowCls === 'cout') {
    row.innerHTML = `<div class="chat-avatar">▶</div><div class="chat-bubble">${escHtmlC(msg)}</div>`;
  } else if (rowCls === 'cin') {
    row.innerHTML = `<div class="chat-bubble">${escHtmlC(msg)}</div><div class="chat-avatar">⌨</div>`;
  } else if (rowCls === 'cerr') {
    row.innerHTML = `<div class="chat-bubble">✖ ${escHtmlC(msg)}</div>`;
  } else if (rowCls === 'csys') {
    row.innerHTML = `<div class="chat-bubble">${escHtmlC(msg)}</div>`;
  } else if (rowCls === 'csep') {
    row.innerHTML = `<div class="chat-sep-line">${escHtmlC(msg)}</div>`;
  }
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  chatText.push(msg);
  const d = document.createElement('div');
  const lcls = rowCls === 'cout' ? 'log-out' : rowCls === 'cin' ? 'log-in' : rowCls === 'cerr' ? 'log-err' : 'log-info';
  d.className = 'log-line ' + lcls; d.textContent = msg;
  outputLog.appendChild(d); outputLog.scrollTop = outputLog.scrollHeight;
}

function escHtmlC(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function conLine(msg, cls) {
  if (cls === 'con-out') addChatMsg(msg, 'cout');
  else if (cls === 'con-in') addChatMsg(msg, 'cin');
  else if (cls === 'con-err') addChatMsg(msg, 'cerr');
  else addChatMsg(msg, 'csys');
}
function conSeparator(msg) { addChatMsg(msg, 'csep'); }

function logLine(msg, cls) {
  const d = document.createElement('div');
  d.className = 'log-line' + (cls ? ' ' + cls : '');
  d.textContent = msg;
  outputLog.appendChild(d);
  outputLog.scrollTop = outputLog.scrollHeight;
}

// ═══════════════════════════════════════════════
//  CHAT INPUT MODAL (for variable input during run)
// ═══════════════════════════════════════════════
function showModal(varName, promptText) {
  return new Promise(res => {
    modalResolve = res;
    document.getElementById('chat-input-hint-text').textContent = promptText || `ป้อนค่าสำหรับ "${varName}"`;
    document.getElementById('chat-input').value = '';
    document.getElementById('chat-input-bar').style.display = 'block';
    openChatWin();
    setTimeout(() => document.getElementById('chat-input').focus(), 60);
  });
}
function chatConfirm() {
  const v = document.getElementById('chat-input').value;
  document.getElementById('chat-input-bar').style.display = 'none';
  if (modalResolve) { modalResolve(v); modalResolve = null; }
}
function chatCancel() {
  document.getElementById('chat-input-bar').style.display = 'none';
  if (modalResolve) { modalResolve(null); modalResolve = null; }
}
document.getElementById('chat-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') chatConfirm();
  if (e.key === 'Escape') chatCancel();
});
