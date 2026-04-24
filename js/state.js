// ═══════════════════════════════════════════════
//  SHAPE DEFINITIONS
// ═══════════════════════════════════════════════
const SHAPE_DEFS = {
  start:       {w:150,h:46, color:'#16a34a', fill:'#dcfce7', stroke:'#16a34a', label:'Start'},
  process:     {w:160,h:46, color:'#2563eb', fill:'#dbeafe', stroke:'#2563eb', label:'Process'},
  decision:    {w:160,h:60, color:'#ca8a04', fill:'#fef9c3', stroke:'#ca8a04', label:'x > 0 ?'},
  io:          {w:160,h:46, color:'#db2777', fill:'#fce7f3', stroke:'#db2777', label:'Input x'},
  call:        {w:160,h:46, color:'#7c3aed', fill:'#ede9fe', stroke:'#7c3aed', label:'SubProcess'},
  output_only: {w:160,h:46, color:'#ea580c', fill:'#fff7ed', stroke:'#ea580c', label:'Print x'},
  declare:     {w:170,h:46, color:'#0891b2', fill:'#e0f7fa', stroke:'#0891b2', label:'Declare'},
  for_loop:    {w:170,h:54, color:'#4f46e5', fill:'#eef2ff', stroke:'#4f46e5', label:'For i = 0 to 9',  defaultVars:{varName:'i',from:'0',to:'9',step:'1'}},
  while_loop:  {w:170,h:54, color:'#0d9488', fill:'#f0fdfa', stroke:'#0d9488', label:'While x > 0',    defaultVars:{cond:'x > 0'}},
  do_while:    {w:170,h:60, color:'#9333ea', fill:'#faf5ff', stroke:'#9333ea', label:'Do While x > 0', defaultVars:{cond:'x > 0'}},
  turtle_forward:   {w:152,h:44, color:'#15803d', fill:'#dcfce7', stroke:'#15803d', label:'forward 100',      defaultVars:{value:'100'}},
  turtle_left:      {w:152,h:44, color:'#059669', fill:'#d1fae5', stroke:'#059669', label:'left 90°',          defaultVars:{value:'90'}},
  turtle_right:     {w:152,h:44, color:'#059669', fill:'#d1fae5', stroke:'#059669', label:'right 90°',         defaultVars:{value:'90'}},
  turtle_penup:     {w:152,h:44, color:'#0284c7', fill:'#e0f2fe', stroke:'#0284c7', label:'pen up'},
  turtle_pendown:   {w:152,h:44, color:'#0284c7', fill:'#e0f2fe', stroke:'#0284c7', label:'pen down'},
  turtle_pencolor:  {w:152,h:44, color:'#7c3aed', fill:'#ede9fe', stroke:'#7c3aed', label:'pen color #000000', defaultVars:{color:'#000000'}},
  turtle_fillcolor: {w:152,h:44, color:'#9333ea', fill:'#faf5ff', stroke:'#9333ea', label:'fill color #ff0000', defaultVars:{color:'#ff0000'}},
  turtle_beginfill: {w:152,h:44, color:'#db2777', fill:'#fce7f3', stroke:'#db2777', label:'begin fill'},
  turtle_endfill:   {w:152,h:44, color:'#db2777', fill:'#fce7f3', stroke:'#db2777', label:'end fill'},
  turtle_home:      {w:152,h:44, color:'#d97706', fill:'#fef3c7', stroke:'#d97706', label:'home'},
  turtle_clear:     {w:152,h:44, color:'#64748b', fill:'#f1f5f9', stroke:'#64748b', label:'clear'},
};

// ═══════════════════════════════════════════════
//  MUTABLE STATE
// ═══════════════════════════════════════════════
let nodes = [], conns = [], selId = null, nextId = 1;
let mode = 'select';
let drag = null, dragOff = {x:0, y:0};
let connStart = null, tempLine = null;
let pan = {x:60, y:40}, panning = false, panFrom = {x:0, y:0};
let scale = 1;
let runHighlight = null;
let modalResolve = null;
let selIds = new Set();
let dragOffsets = new Map();
let rubberBand = null;
let clipboard = [];
let clipboardConns = [];
let currentFileName = 'flowchart';

// ═══════════════════════════════════════════════
//  DOM REFERENCES
// ═══════════════════════════════════════════════
const svg       = document.getElementById('canvas');
const nodeLayer = document.getElementById('node-layer');
const connLayer = document.getElementById('conn-layer');
const tempLayer = document.getElementById('temp-conn-layer');
const wrap      = document.getElementById('canvas-wrap');
const statusMsg = document.getElementById('status-msg');
const coordDisplay = document.getElementById('coord-display');
const zoomDisplay  = document.getElementById('zoom-display');
const outputLog    = document.getElementById('output-log');
