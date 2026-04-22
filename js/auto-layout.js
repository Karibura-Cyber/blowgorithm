// ═══════════════════════════════════════════════
//  AUTO LAYOUT — Sugiyama-style Hierarchical Layout
//  Organizes nodes top-to-bottom following flowchart
//  connections, with proper layer assignment,
//  crossing minimisation, and x-coordinate spacing.
// ═══════════════════════════════════════════════

const AUTO_LAYOUT = {
  // Gap between node centres on the same layer (horizontal)
  X_GAP: 60,
  // Gap between layers (vertical, node-bottom to node-top)
  Y_GAP: 70,
  // Canvas origin for the top of the layout
  ORIGIN_X: 100,
  ORIGIN_Y: 60,
};

/**
 * Main entry point — call this to auto-arrange all nodes.
 * Snapshots history first so the user can undo.
 */
function autoLayout() {
  if (nodes.length === 0) {
    statusMsg.textContent = 'ไม่มี node ให้จัด layout';
    return;
  }

  historySnapshot();

  // ── 1. Build adjacency maps ──────────────────
  const outEdges = new Map(); // id → [id, ...]
  const inEdges  = new Map(); // id → [id, ...]
  nodes.forEach(n => { outEdges.set(n.id, []); inEdges.set(n.id, []); });
  conns.forEach(c => {
    if (outEdges.has(c.from) && inEdges.has(c.to)) {
      outEdges.get(c.from).push(c.to);
      inEdges.get(c.to).push(c.from);
    }
  });

  // ── 2. Assign layers via longest-path (from sources) ──
  // Sources = nodes with no incoming edges
  const layer = new Map(); // id → layer index (0 = top)
  const queue = [];

  nodes.forEach(n => {
    if (inEdges.get(n.id).length === 0) {
      layer.set(n.id, 0);
      queue.push(n.id);
    }
  });

  // BFS / topological relaxation
  // We allow back-edges (loops) by capping iterations
  let safetyLimit = nodes.length * 4;
  let qi = 0;
  while (qi < queue.length && safetyLimit-- > 0) {
    const cur = queue[qi++];
    const curLayer = layer.get(cur) || 0;
    outEdges.get(cur).forEach(nxt => {
      const existing = layer.has(nxt) ? layer.get(nxt) : -1;
      const proposed = curLayer + 1;
      if (proposed > existing) {
        layer.set(nxt, proposed);
        queue.push(nxt); // re-enqueue to propagate further
      }
    });
  }

  // Any unreached node (disconnected or pure back-edge) gets layer 0
  nodes.forEach(n => {
    if (!layer.has(n.id)) layer.set(n.id, 0);
  });

  // ── 3. Group nodes by layer ──────────────────
  const maxLayer = Math.max(...[...layer.values()]);
  const layers = []; // layers[i] = [nodeId, ...]
  for (let i = 0; i <= maxLayer; i++) layers.push([]);
  nodes.forEach(n => layers[layer.get(n.id)].push(n.id));

  // ── 4. Order nodes within each layer to reduce crossings ──
  // Simple barycenter heuristic (2 passes down then up)
  function barycentre(ids, refLayer, useOut) {
    return ids.map(id => {
      const neighbours = useOut ? outEdges.get(id) : inEdges.get(id);
      const refPositions = neighbours
        .filter(nid => layer.get(nid) === refLayer)
        .map(nid => refLayer < maxLayer
          ? layers[refLayer].indexOf(nid)
          : layers[refLayer].indexOf(nid));
      if (refPositions.length === 0) return { id, bc: Infinity };
      const bc = refPositions.reduce((a, b) => a + b, 0) / refPositions.length;
      return { id, bc };
    });
  }

  // Sweep down
  for (let i = 1; i <= maxLayer; i++) {
    const sorted = barycentre(layers[i], i - 1, false)
      .sort((a, b) => a.bc - b.bc)
      .map(x => x.id);
    layers[i] = sorted;
  }
  // Sweep up
  for (let i = maxLayer - 1; i >= 0; i--) {
    const sorted = barycentre(layers[i], i + 1, true)
      .sort((a, b) => a.bc - b.bc)
      .map(x => x.id);
    layers[i] = sorted;
  }

  // ── 5. Compute x positions for each layer ───
  // Centre each layer and space nodes evenly.
  // We need to know node widths first (they're already set on the node objects).
  function getNode(id) { return nodes.find(n => n.id === id); }

  // Compute x for each node in each layer
  const nodeX = new Map();
  const nodeY = new Map();

  // Y: accumulated from top
  let curY = AUTO_LAYOUT.ORIGIN_Y;
  const layerH = []; // max height per layer

  layers.forEach((ids, li) => {
    const maxH = Math.max(...ids.map(id => getNode(id)?.h || 46));
    layerH.push(maxH);
  });

  layers.forEach((ids, li) => {
    // Total width of this layer
    const totalW = ids.reduce((sum, id) => sum + (getNode(id)?.w || 160), 0)
                 + AUTO_LAYOUT.X_GAP * Math.max(0, ids.length - 1);

    let cx = AUTO_LAYOUT.ORIGIN_X;
    ids.forEach(id => {
      const n = getNode(id);
      const nw = n?.w || 160;
      nodeX.set(id, cx);
      cx += nw + AUTO_LAYOUT.X_GAP;
    });

    // Centre the row — find mean x and shift all to start from ORIGIN_X
    const rowMid = (AUTO_LAYOUT.ORIGIN_X + (cx - AUTO_LAYOUT.X_GAP)) / 2;

    ids.forEach(id => {
      // Already placed left-to-right; no centring needed unless desired
      nodeY.set(id, curY);
    });

    curY += layerH[li] + AUTO_LAYOUT.Y_GAP;
  });

  // ── 6. Apply positions ──────────────────────
  nodes.forEach(n => {
    if (nodeX.has(n.id)) n.x = nodeX.get(n.id);
    if (nodeY.has(n.id)) n.y = nodeY.get(n.id);
  });

  // ── 7. Recompute connection sides to match layout ──
  _fixConnSides();

  // ── 8. Re-render everything ─────────────────
  nodes.forEach(n => renderNode(n));
  renderConns();
  fitView();

  statusMsg.textContent = `จัด Layout อัตโนมัติ — ${nodes.length} node, ${conns.length} การเชื่อมต่อ`;
}

/**
 * After repositioning, update fromSide/toSide on each connection
 * so arrows leave from a sensible side of each node.
 */
function _fixConnSides() {
  conns.forEach(c => {
    const fn = nodes.find(n => n.id === c.from);
    const tn = nodes.find(n => n.id === c.to);
    if (!fn || !tn) return;

    const fcx = fn.x + fn.w / 2, fcy = fn.y + fn.h / 2;
    const tcx = tn.x + tn.w / 2, tcy = tn.y + tn.h / 2;
    const dy = tcy - fcy;
    const dx = tcx - fcx;

    // Prefer vertical flow (bottom→top) for typical flowcharts
    if (Math.abs(dy) >= Math.abs(dx) * 0.6) {
      c.fromSide = dy > 0 ? 'bottom' : 'top';
      c.toSide   = dy > 0 ? 'top'    : 'bottom';
    } else {
      c.fromSide = dx > 0 ? 'right' : 'left';
      c.toSide   = dx > 0 ? 'left'  : 'right';
    }
  });
}
