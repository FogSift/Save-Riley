/**
 * BossHose.jsx
 * SVG Verlet rope physics — 12 segments, 40ms tick
 * Player drags the plug end to disconnect it from the wall port.
 */
import { useEffect, useRef, useState, useCallback } from 'react';

const SEGMENTS    = 12;
const GRAVITY     = 0.4;
const ITERATIONS  = 8;
const SEG_LEN     = 22;
const TICK_MS     = 40;

function buildRope(ax, ay, bx, by) {
  const pts = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    pts.push({ x: ax + (bx - ax) * t, y: ay + (by - ay) * t, px: ax + (bx - ax) * t, py: ay + (by - ay) * t });
  }
  return pts;
}

function stepRope(pts, anchorX, anchorY, plugX, plugY, pinPlug) {
  // Verlet integration
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const vx = (p.x - p.px) * 0.97;
    const vy = (p.y - p.py) * 0.97;
    p.px = p.x;
    p.py = p.y;
    p.x += vx;
    p.y += vy + GRAVITY;
  }
  // Pin first point (wall anchor)
  pts[0].x = anchorX;
  pts[0].y = anchorY;
  pts[0].px = anchorX;
  pts[0].py = anchorY;
  // Pin last point (plug)
  if (pinPlug) {
    pts[pts.length - 1].x = plugX;
    pts[pts.length - 1].y = plugY;
    pts[pts.length - 1].px = plugX;
    pts[pts.length - 1].py = plugY;
  }
  // Constraint satisfaction
  for (let iter = 0; iter < ITERATIONS; iter++) {
    // First segment pinned
    pts[0].x = anchorX;
    pts[0].y = anchorY;
    if (pinPlug) {
      pts[pts.length - 1].x = plugX;
      pts[pts.length - 1].y = plugY;
    }
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const diff = (dist - SEG_LEN) / dist / 2;
      const ox = dx * diff;
      const oy = dy * diff;
      if (i > 0) { a.x += ox; a.y += oy; }
      if (i < pts.length - 2 || !pinPlug) { b.x -= ox; b.y -= oy; }
    }
  }
}

function ropePoints(pts) {
  return pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

// ── BossHose ──────────────────────────────────────────────────────────────────
// Props:
//   anchorX/Y    — wall port position (fixed)
//   apexX/Y      — boss body port position (fixed, where hose attaches to boss)
//   connected    — boolean
//   color        — css color string (hose glow)
//   onDisconnect — () => void — called when player drags far enough
//   onReconnect  — () => void — called when auto-reconnect fires (parent controls timer)
//   disabled     — boolean (after thingifier etc.)

export default function BossHose({
  anchorX = 60,
  anchorY = 200,
  apexX   = 300,
  apexY   = 140,
  connected = true,
  color   = '#ff3333',
  onDisconnect,
  disabled = false,
}) {
  const svgRef       = useRef(null);
  const ptsRef       = useRef(buildRope(anchorX, anchorY, apexX, apexY));
  const plugRef      = useRef({ x: apexX, y: apexY });
  const draggingRef  = useRef(false);
  const connectedRef = useRef(connected);
  const tickRef      = useRef(null);

  const [, forceRender] = useState(0);

  // keep ref in sync with prop
  useEffect(() => { connectedRef.current = connected; }, [connected]);

  // reset rope when reconnected
  useEffect(() => {
    if (connected) {
      draggingRef.current = false;
      ptsRef.current = buildRope(anchorX, anchorY, apexX, apexY);
      plugRef.current = { x: apexX, y: apexY };
    }
  }, [connected, anchorX, anchorY, apexX, apexY]);

  // physics tick
  useEffect(() => {
    tickRef.current = setInterval(() => {
      const plug = plugRef.current;
      stepRope(ptsRef.current, anchorX, anchorY, plug.x, plug.y, connectedRef.current || draggingRef.current);
      forceRender(n => n + 1);
    }, TICK_MS);
    return () => clearInterval(tickRef.current);
  }, [anchorX, anchorY]);

  const getSVGCoords = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (svg.viewBox.baseVal.width / rect.width),
      y: (clientY - rect.top)  * (svg.viewBox.baseVal.height / rect.height),
    };
  }, []);

  const onPointerDown = useCallback((e) => {
    if (disabled || !connected) return;
    e.preventDefault();
    draggingRef.current = true;
    svgRef.current?.setPointerCapture(e.pointerId);
  }, [disabled, connected]);

  const onPointerMove = useCallback((e) => {
    if (!draggingRef.current) return;
    const { x, y } = getSVGCoords(e);
    plugRef.current = { x, y };

    // Check disconnect distance from apex port
    const dx = x - apexX;
    const dy = y - apexY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > SEG_LEN * (SEGMENTS * 0.65)) {
      draggingRef.current = false;
      connectedRef.current = false;
      onDisconnect?.();
    }
  }, [getSVGCoords, apexX, apexY, onDisconnect]);

  const onPointerUp = useCallback(() => {
    if (draggingRef.current && connectedRef.current) {
      // Snap back if still connected
      plugRef.current = { x: apexX, y: apexY };
    }
    draggingRef.current = false;
  }, [apexX, apexY]);

  const pts = ptsRef.current;
  const plug = plugRef.current;

  // Build SVG path from rope points
  const pathD = pts.length > 1
    ? `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} ` +
      pts.slice(1).map(p => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    : '';

  const plugPt = pts[pts.length - 1];

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 300"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <defs>
        <filter id={`hose-glow-${color.replace('#','')}`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Rope shadow */}
      <polyline
        points={ropePoints(pts)}
        fill="none"
        stroke="rgba(0,0,0,0.4)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(2,3)"
      />
      {/* Main rope */}
      <polyline
        points={ropePoints(pts)}
        fill="none"
        stroke={color}
        strokeWidth={connected ? 5 : 3}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={connected ? `url(#hose-glow-${color.replace('#','')})` : undefined}
        style={{ transition: 'stroke-width 0.2s', opacity: connected ? 1 : 0.5 }}
      />

      {/* Wall anchor port */}
      <circle cx={anchorX} cy={anchorY} r={9} fill="#222" stroke={color} strokeWidth={2} />
      <circle cx={anchorX} cy={anchorY} r={4} fill={color} />

      {/* Apex port */}
      <circle cx={apexX} cy={apexY} r={9} fill="#111" stroke={connected ? color : '#444'} strokeWidth={2} />
      <circle cx={apexX} cy={apexY} r={4} fill={connected ? color : '#333'} />

      {/* Plug end — draggable */}
      {connected && (
        <g
          style={{ cursor: disabled ? 'not-allowed' : 'grab' }}
          transform={`translate(${plugPt.x.toFixed(1)},${plugPt.y.toFixed(1)})`}
        >
          <rect x={-10} y={-6} width={20} height={12} rx={3} fill="#1a1a1a" stroke={color} strokeWidth={2} />
          <rect x={-5}  y={-3} width={4}  height={6}  rx={1} fill={color} />
          <rect x={1}   y={-3} width={4}  height={6}  rx={1} fill={color} />
          {/* Invisible hit area */}
          <circle r={18} fill="transparent" />
        </g>
      )}

      {/* DISCONNECTED label */}
      {!connected && (
        <text
          x={apexX} y={apexY - 18}
          textAnchor="middle"
          fontSize={10}
          fill="#aaa"
          fontFamily="monospace"
        >DISCONNECTED</text>
      )}
    </svg>
  );
}
