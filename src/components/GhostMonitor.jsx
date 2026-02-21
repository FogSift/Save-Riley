/**
 * GhostMonitor.jsx
 *
 * CRT canvas replay component — renders a miniature phosphor-green surveillance
 * feed showing the player's recent mouse movements, clicks, and app navigation
 * from the ActivityTracker ring buffer.
 *
 * Inspired by The Matrix Architect scene: multiple monitors showing the same
 * person from slightly different angles, slightly different times.
 *
 * USAGE IN BOSS FIGHT:
 *   A.P.E.X. dialogue: "I see you. I have seen everything you've done here."
 *   The GhostMonitor is showing the player's ACTUAL recent movements.
 *   Theory A: A.P.E.X. has been surveilling for containment.
 *   Theory B: Nexus/Riley was learning from you the entire time.
 *
 * PROPS:
 *   width       {number}  — canvas pixel width (default 200)
 *   height      {number}  — canvas pixel height (default 150)
 *   windowMs    {number}  — how many ms of history to replay (default 30s)
 *   label       {string}  — overlay label (default "SURVEILLANCE_FEED")
 *   showStats   {boolean} — show event count + click count in corner
 *   className   {string}  — additional class names
 *
 * NOT YET WIRED:
 *   App.jsx must call activityTracker.mount() for events to be recorded.
 *   Without mounting, the canvas shows an idle "NO SIGNAL" pattern.
 */

import { useEffect, useRef, useCallback } from 'react';
import { EVT, useActivityTracker } from '../telemetry/ActivityTracker';

// ── Visual constants ───────────────────────────────────────────────────────────
const PHOSPHOR     = '#39ff14';    // classic green phosphor
const PHOSPHOR_DIM = '#1a6b09';
const SCANLINE_ALPHA = 0.25;
const TRAIL_DURATION = 4000;      // ms — how long the trail fades over
const CLICK_RING_MS  = 800;       // ms — click flare expansion duration
const FPS            = 24;

export default function GhostMonitor({
  width     = 200,
  height    = 150,
  windowMs  = 30_000,
  label     = 'SURVEILLANCE_FEED',
  showStats = true,
  className = '',
}) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const tracker   = useActivityTracker();

  // ── Draw one frame ──────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const now = Date.now();

    // Background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    const frames = tracker.ghostFrames(windowMs);

    if (frames.length < 2) {
      // No-signal state: static noise pattern
      drawNoSignal(ctx, W, H, now);
    } else {
      drawGhost(ctx, W, H, frames, now, windowMs);
    }

    // Scanlines overlay
    drawScanlines(ctx, W, H);

    // Label
    drawLabel(ctx, W, H, label, showStats ? tracker.summary() : null);

    // Border flicker
    ctx.strokeStyle = PHOSPHOR;
    ctx.globalAlpha = 0.4 + 0.15 * Math.sin(now / 700);
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }, [tracker, windowMs, label, showStats]);

  // ── Ghost path + click flares ───────────────────────────────────────────────
  function drawGhost(ctx, W, H, frames, now, windowMs) {
    const moveFrames  = frames.filter(f => f.type === EVT.MOVE);
    const clickFrames = frames.filter(f => f.type === EVT.CLICK);
    const navFrames   = frames.filter(f => f.type === EVT.NAV);
    const totalDur    = frames[frames.length - 1]?.t || 1;

    // Current replaying offset: frames play back in real-time relative to now
    // t=0 is the oldest event; t=totalDur is the most recent
    const replayHead = (now % windowMs);

    // Draw mouse trail — fades from PHOSPHOR_DIM → PHOSPHOR as it approaches present
    if (moveFrames.length > 1) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 1; i < moveFrames.length; i++) {
        const prev = moveFrames[i - 1];
        const curr = moveFrames[i];
        const age  = totalDur - curr.t;  // ms since this event
        const alpha = Math.max(0, 1 - age / TRAIL_DURATION);

        ctx.beginPath();
        ctx.moveTo(prev.x * W, prev.y * H);
        ctx.lineTo(curr.x * W, curr.y * H);
        ctx.strokeStyle = PHOSPHOR;
        ctx.globalAlpha = alpha * 0.6;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Current cursor dot
      const last = moveFrames[moveFrames.length - 1];
      ctx.globalAlpha = 1;
      ctx.fillStyle = PHOSPHOR;
      ctx.beginPath();
      ctx.arc(last.x * W, last.y * H, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Cursor crosshair
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = PHOSPHOR;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(last.x * W - 6, last.y * H);
      ctx.lineTo(last.x * W + 6, last.y * H);
      ctx.moveTo(last.x * W, last.y * H - 6);
      ctx.lineTo(last.x * W, last.y * H + 6);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Click flares — expanding rings
    for (const click of clickFrames) {
      const age      = totalDur - click.t;
      const progress = Math.min(1, age / CLICK_RING_MS);
      const radius   = progress * 18;
      const alpha    = (1 - progress) * 0.8;

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = PHOSPHOR;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.arc(click.x * W, click.y * H, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner dot
      ctx.globalAlpha = alpha * 0.6;
      ctx.fillStyle = PHOSPHOR;
      ctx.beginPath();
      ctx.arc(click.x * W, click.y * H, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // App navigation labels — bottom strip
    if (navFrames.length > 0) {
      const latest = navFrames[navFrames.length - 1];
      const age    = totalDur - latest.t;
      const alpha  = Math.max(0, 1 - age / 5000);
      ctx.globalAlpha = alpha * 0.7;
      ctx.fillStyle   = PHOSPHOR_DIM;
      ctx.font        = `7px monospace`;
      ctx.fillText(`→ ${latest.app}`, 4, H - 4);
      ctx.globalAlpha = 1;
    }
  }

  // ── No-signal static ────────────────────────────────────────────────────────
  function drawNoSignal(ctx, W, H, now) {
    // Subtle noise pattern
    const imageData = ctx.createImageData(W, H);
    const seed = Math.floor(now / 100);  // changes every 100ms
    for (let i = 0; i < imageData.data.length; i += 4) {
      const v = Math.random() < 0.04 ? Math.floor(Math.random() * 40) : 0;
      imageData.data[i]     = v * 0.2;   // R
      imageData.data[i + 1] = v;          // G (phosphor bias)
      imageData.data[i + 2] = v * 0.1;   // B
      imageData.data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    // "NO SIGNAL" text
    ctx.fillStyle   = PHOSPHOR_DIM;
    ctx.globalAlpha = 0.5 + 0.2 * Math.sin(now / 500);
    ctx.font        = `bold 10px monospace`;
    ctx.textAlign   = 'center';
    ctx.fillText('NO SIGNAL', W / 2, H / 2);
    ctx.textAlign   = 'left';
    ctx.globalAlpha = 1;
  }

  // ── CRT scanlines ────────────────────────────────────────────────────────────
  function drawScanlines(ctx, W, H) {
    ctx.globalAlpha = SCANLINE_ALPHA;
    ctx.fillStyle   = '#000';
    for (let y = 0; y < H; y += 3) {
      ctx.fillRect(0, y, W, 1);
    }
    ctx.globalAlpha = 1;
  }

  // ── Overlay label ────────────────────────────────────────────────────────────
  function drawLabel(ctx, W, H, label, stats) {
    ctx.font        = `bold 7px monospace`;
    ctx.fillStyle   = PHOSPHOR;
    ctx.globalAlpha = 0.8;

    // Top label
    ctx.fillText(label, 4, 10);

    // Session time
    if (stats) {
      const timeStr = `${stats.sessionMinutes}m`;
      ctx.font        = `6px monospace`;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle   = PHOSPHOR_DIM;
      ctx.fillText(`${stats.bufferUsage} evt · ${stats.totalClicks} clicks · ${timeStr}`, 4, H - 14);
    }

    ctx.globalAlpha = 1;
  }

  // ── Animation loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    let lastFrame = 0;
    const interval = 1000 / FPS;

    const loop = (timestamp) => {
      if (timestamp - lastFrame >= interval) {
        lastFrame = timestamp;
        draw();
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        width,
        height,
        background: '#000',
        boxShadow: `0 0 12px rgba(57,255,20,0.15), inset 0 0 20px rgba(0,0,0,0.8)`,
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
          imageRendering: 'pixelated',
          // Subtle CRT warp via CSS filter
          filter: 'contrast(1.1) brightness(0.9)',
        }}
      />
      {/* CSS scanline overlay (complements canvas scanlines) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
          pointerEvents: 'none',
        }}
      />
      {/* Corner reflection flare */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '30%', height: '25%',
          background: 'radial-gradient(ellipse at top left, rgba(57,255,20,0.06), transparent)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
