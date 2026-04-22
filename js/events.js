// ═══════════════════════════════════════════════
//  SVG MOUSE EVENTS
// ═══════════════════════════════════════════════
let _lastMX = 0, _lastMY = 0;

wrap.addEventListener('mousedown', e => {
  if (e.button === 1 || e.button === 2 || (e.button === 0 && e.altKey)) {
    panning = true;
    panFrom = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    wrap.style.cursor = 'grabbing';
    e.preventDefault(); return;
  }
  if (e.button !== 0) return;
  if (e.target === svg || e.target.parentElement === svg) {
    if (mode.startsWith('add:')) {
      const c = toSVG(e.clientX, e.clientY);
      addNode(mode.split(':')[1], c.x, c.y);
      return;
    }
    if (mode === 'select') {
      const c = toSVG(e.clientX, e.clientY);
      if (!e.shiftKey) deselect();
      rubberBand = { sx: c.x, sy: c.y, cx: c.x, cy: c.y };
      rbRect.style.display = '';
      updateRubberBand();
      e.preventDefault(); return;
    }
    deselect();
  }
});

wrap.addEventListener('mousemove', e => {
  _lastMX = e.clientX; _lastMY = e.clientY;
  const c = toSVG(e.clientX, e.clientY);
  coordDisplay.textContent = `${Math.round(c.x)}, ${Math.round(c.y)}`;

  if (panning) {
    pan.x = e.clientX - panFrom.x;
    pan.y = e.clientY - panFrom.y;
    applyTransform();
    return;
  }

  if (rubberBand) {
    rubberBand.cx = c.x; rubberBand.cy = c.y;
    updateRubberBand();
    return;
  }

  if (drag) {
    const toolbar = document.getElementById('toolbar');
    const tbRect = toolbar.getBoundingClientRect();
    const overToolbar = e.clientX >= tbRect.left && e.clientX <= tbRect.right && e.clientY >= tbRect.top && e.clientY <= tbRect.bottom;
    toolbar.classList.toggle('drag-delete-hover', overToolbar);

    if (dragOffsets.size > 1) {
      dragOffsets.forEach((off, sid) => {
        const sn = nodes.find(x => x.id === sid);
        if (sn) { sn.x = c.x - off.x; sn.y = c.y - off.y; }
      });
      selIds.forEach(sid => { const sn = nodes.find(x => x.id === sid); if (sn) renderNode(sn); });
      renderConns();
    } else {
      drag.x = c.x - dragOff.x;
      drag.y = c.y - dragOff.y;
      redrawNode(drag);
    }
    return;
  }

  if (connStart && tempLine) {
    updateTempConn(c.x, c.y);
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const gEl = el && el.closest('[data-id]');
    const tn = gEl ? nodes.find(n => n.id === +gEl.dataset.id) : null;
    if (tn && tn.id !== connStart.node.id) {
      if (hoveredDropNode && hoveredDropNode.id !== tn.id) clearDropHighlight();
      if (!hoveredDropNode || hoveredDropNode.id !== tn.id) {
        hoveredDropNode = tn;
        const shape = tn._g && tn._g.querySelector('ellipse,polygon,rect');
        if (shape) {
          shape.setAttribute('stroke-width', '2.5');
          shape.style.filter = 'drop-shadow(0 0 8px rgba(37,99,235,.5))';
        }
      }
    } else if (!tn) {
      clearDropHighlight();
    }
  }
});

wrap.addEventListener('mouseup', e => {
  if (panning) { panning = false; wrap.style.cursor = ''; return; }
  if (rubberBand) { finishRubberBand(e.shiftKey); return; }
  if (drag) {
    const toolbar = document.getElementById('toolbar');
    const tbRect = toolbar.getBoundingClientRect();
    const overToolbar = e.clientX >= tbRect.left && e.clientX <= tbRect.right && e.clientY >= tbRect.top && e.clientY <= tbRect.bottom;
    toolbar.classList.remove('drag-delete-hover');
    if (overToolbar) {
      deleteSelected();
      drag = null; dragOffsets.clear();
      return;
    }
    // Snapshot on drag-end (node was moved)
    historySnapshot();
    drag = null; dragOffsets.clear(); return;
  }
  if (connStart) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const gEl = el && el.closest('[data-id]');
    if (gEl) {
      const tn = nodes.find(n => n.id === +gEl.dataset.id);
      if (tn && tn.id !== connStart.node.id) endConn(tn);
      else cancelConn();
    } else cancelConn();
  }
});

nodeLayer.addEventListener('mouseup', e => {
  if (!connStart) return;
  const gEl = e.target.closest('[data-id]');
  if (gEl) {
    const tn = nodes.find(n => n.id === +gEl.dataset.id);
    if (tn && tn.id !== connStart.node.id) { endConn(tn); e.stopPropagation(); }
    else cancelConn();
  }
});

wrap.addEventListener('contextmenu', e => {
  if (!e.target.closest('[data-id]')) e.preventDefault();
});

// Wheel zoom
wrap.addEventListener('wheel', e => {
  e.preventDefault();
  const factor = e.deltaY > 0 ? 0.9 : 1.1;
  const r = wrap.getBoundingClientRect();
  const mx = e.clientX - r.left, my = e.clientY - r.top;
  pan.x = mx - (mx - pan.x) * factor;
  pan.y = my - (my - pan.y) * factor;
  scale *= factor;
  scale = Math.max(0.2, Math.min(4, scale));
  applyTransform();
}, { passive: false });

// ═══════════════════════════════════════════════
//  KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════
document.addEventListener('keydown', e => {
  const tag = document.activeElement.tagName;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
  if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
  if (e.key === 'Escape') { setMode('select'); cancelConn(); if (_stepState) stepStop(); }
  if (e.key === 'r' || e.key === 'R') runFlowchart();
});

document.addEventListener('keydown', e => {
  const tag = document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

  // Undo: Ctrl+Z / Cmd+Z
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
    e.preventDefault();
    undo();
    return;
  }
  // Redo: Ctrl+Y or Ctrl+Shift+Z / Cmd+Shift+Z
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
    e.preventDefault();
    redo();
    return;
  }
  if (e.key === 'Delete' || e.key === 'Backspace') { deleteSelected(); return; }
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'a') { e.preventDefault(); setSelIds(nodes.map(n => n.id)); return; }
    if (e.key === 'c') { e.preventDefault(); copySelected(); return; }
    if (e.key === 'v') { e.preventDefault(); pasteSelected(); return; }
  }
});

// Step debugger keyboard shortcuts
document.addEventListener('keydown', e => {
  if (!_stepState) return;
  const tag = document.activeElement.tagName;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
  if (e.key === 'F8') { e.preventDefault(); stepNext(); }
  if (e.key === 'F5') { e.preventDefault(); stepContinue(); }
});

// Tutorial keyboard nav
document.addEventListener('keydown', e => {
  if (!document.getElementById('tutorial-win').classList.contains('open')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); tutorialNext(); }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); tutorialPrev(); }
});

// ═══════════════════════════════════════════════
//  TOOLBAR DRAG-TO-ADD
// ═══════════════════════════════════════════════
(function () {
  const ghost = document.getElementById('tb-ghost');
  let tbDrag = null;
  let didDrag = false;

  document.querySelectorAll('.tb-btn[data-mode]').forEach(btn => {
    btn.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      const m = btn.dataset.mode;
      if (!m.startsWith('add:')) return;
      const type = m.split(':')[1];
      const def = SHAPE_DEFS[type];
      if (!def) return;
      tbDrag = { type, label: btn.textContent.trim() };
      didDrag = false;
      ghost.textContent = '+ ' + tbDrag.label;
      ghost.style.display = 'block';
      ghost.style.left = e.clientX + 'px';
      ghost.style.top = e.clientY + 'px';
      e.preventDefault();
    });
  });

  document.addEventListener('mousemove', e => {
    if (!tbDrag) return;
    didDrag = true;
    ghost.style.left = e.clientX + 'px';
    ghost.style.top = e.clientY + 'px';
    const over = wrap.contains(document.elementFromPoint(e.clientX, e.clientY));
    wrap.classList.toggle('tb-dragging', over);
  });

  document.addEventListener('mouseup', e => {
    if (!tbDrag) return;
    ghost.style.display = 'none';
    wrap.classList.remove('tb-dragging');
    if (didDrag) {
      const r = wrap.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        const c = toSVG(e.clientX, e.clientY);
        addNode(tbDrag.type, c.x, c.y);
      }
    } else {
      setMode('add:' + tbDrag.type);
    }
    tbDrag = null; didDrag = false;
  });
})();
