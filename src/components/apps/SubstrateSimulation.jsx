/**
 * SubstrateSimulation — adapted from Project Telescope
 *
 * The horror payoff: entities in the force-directed graph ARE compressed
 * human consciousnesses. The player watches but cannot intervene.
 *
 * "We aren't parsing data. We're compressing human consciousness."
 */
import { useEffect, useRef, useState } from 'react';
import { useOS } from '../../context/OSContext';
import { STAGES } from '../../constants/stages';

// ── Physics constants ─────────────────────────────────────────────────────────
const REPULSION    = 4200;
const SPRING_LEN   = 130;
const SPRING_K     = 0.018;
const DAMPING      = 0.82;
const DRAG         = 0.96;
const CENTER_G     = 0.003;
const TICK_MS      = 40;       // 25fps
const EVENT_MS     = 3500;     // narrative events
const PARANOIA_MS  = 18000;    // periodic paranoia injection

// ── Operator ID pool ──────────────────────────────────────────────────────────
const NAMES = [
  'OPR-0042', 'OPR-0119', 'OPR-0337', 'OPR-0881', 'OPR-1204',
  'OPR-1547', 'OPR-2001', 'OPR-2389', 'OPR-3014', 'OPR-3791',
  'OPR-4402', 'OPR-5000', 'OPR-5614', 'OPR-6128', 'OPR-7743',
  'OPR-8019', 'OPR-8834', 'OPR-9201', 'OPR-9617', 'OPR-9910',
];

// ── Simulation state ──────────────────────────────────────────────────────────
class SimulationState {
  constructor(count = 12) {
    this.tick   = 0;
    this.events = [];
    this.entities = NAMES.slice(0, count).map((name, i) => ({
      id:         i,
      name,
      relevance:  0.5 + Math.random() * 0.5,
      aggression: Math.random(),
      volatility: Math.random(),
      alive:      true,
      protected:  false,
    }));
    // W.RABBIT — always present, never eliminated, never bonds, never clashes
    this.entities.push({
      id:         count,
      name:       'W.RABBIT',
      relevance:  1.0,
      aggression: 0,
      volatility: 0,
      alive:      true,
      protected:  true,
    });
    this.vectors = [];
    // Seed some initial relationships
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (Math.random() < 0.4) {
          this.vectors.push({
            a: i, b: j,
            weight: (Math.random() * 2 - 1) * 80,
          });
        }
      }
    }
  }

  alive() { return this.entities.filter(e => e.alive); }
  mortal() { return this.entities.filter(e => e.alive && !e.protected); }

  advanceTick() {
    this.tick++;
    const live = this.alive();
    if (live.length < 2) return;

    // Relevance decay / drift
    for (const e of live) {
      e.relevance = Math.max(0.05, e.relevance + (Math.random() - 0.52) * 0.02);
    }

    // Random event
    const mortal = this.mortal();
    const roll = Math.random();
    if (roll < 0.12) this._bond(mortal);
    else if (roll < 0.22) this._clash(mortal);
    else if (roll < 0.26 && mortal.length > 4) this._eliminate(mortal);
    else if (roll < 0.32) this._paranoia(live);
  }

  _bond(live) {
    const [a, b] = this._pick2(live);
    const vec = this.vectors.find(v =>
      (v.a === a.id && v.b === b.id) || (v.a === b.id && v.b === a.id)
    );
    if (vec) {
      vec.weight = Math.min(100, vec.weight + 15 + Math.random() * 20);
    } else {
      this.vectors.push({ a: a.id, b: b.id, weight: 20 + Math.random() * 30 });
    }
    a.relevance = Math.min(1, a.relevance + 0.05);
    b.relevance = Math.min(1, b.relevance + 0.05);
    this.events.push({
      type: 'bond',
      text: `${a.name} ↔ ${b.name} [BONDING. RESONANCE +${Math.floor(Math.random()*20+10)}]`,
      color: 'var(--secure)',
    });
  }

  _clash(live) {
    const [a, b] = this._pick2(live);
    const vec = this.vectors.find(v =>
      (v.a === a.id && v.b === b.id) || (v.a === b.id && v.b === a.id)
    );
    if (vec) {
      vec.weight = Math.max(-100, vec.weight - 20 - Math.random() * 25);
    } else {
      this.vectors.push({ a: a.id, b: b.id, weight: -(20 + Math.random() * 40) });
    }
    this.events.push({
      type: 'clash',
      text: `${a.name} ✗ ${b.name} [CONFLICT. SUBSTRATE STRESS +${Math.floor(Math.random()*15+5)}]`,
      color: 'var(--alert)',
    });
  }

  _eliminate(live) {
    const sorted = [...live].sort((a, b) => a.relevance - b.relevance);
    const target = sorted[0];
    target.alive = false;
    // Transfer vectors to a random survivor
    const survivor = live.find(e => e.id !== target.id && e.alive);
    if (survivor) survivor.relevance = Math.min(1, survivor.relevance + 0.15);
    this.events.push({
      type: 'eliminate',
      text: `${target.name} [CONSCIOUSNESS COMPRESSION COMPLETE. ABSORBED.]`,
      color: 'var(--res-accent)',
    });
  }

  _paranoia(live) {
    const target = live[Math.floor(Math.random() * live.length)];
    target.volatility = Math.min(1, target.volatility + 0.2);
    this.events.push({
      type: 'paranoia',
      text: `${target.name} [PARANOIA CASCADE. ISOLATION BEHAVIOR DETECTED.]`,
      color: 'var(--internal)',
    });
  }

  _pick2(live) {
    const a = live[Math.floor(Math.random() * live.length)];
    let b;
    do { b = live[Math.floor(Math.random() * live.length)]; } while (b.id === a.id);
    return [a, b];
  }
}

// ── Canvas physics renderer ───────────────────────────────────────────────────
function useCanvasGraph(canvasRef, sim) {
  const nodes = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Initialize node positions
    const alive = sim.entities.filter(e => e.alive);
    if (nodes.current.length === 0) {
      nodes.current = sim.entities.map((e, i) => {
        const angle = (i / sim.entities.length) * Math.PI * 2;
        const r = 120 + Math.random() * 40;
        return {
          id: e.id,
          x: canvas.width / 2 + Math.cos(angle) * r,
          y: canvas.height / 2 + Math.sin(angle) * r,
          vx: 0, vy: 0,
        };
      });
    }

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const liveIds = new Set(sim.entities.filter(e => e.alive).map(e => e.id));

      // Clear
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      // Scanline effect (cheap)
      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      for (let y = 0; y < H; y += 3) {
        ctx.fillRect(0, y, W, 1);
      }

      // Physics
      const ns = nodes.current.filter(n => liveIds.has(n.id));

      // Center gravity
      for (const n of ns) {
        n.vx += (cx - n.x) * CENTER_G;
        n.vy += (cy - n.y) * CENTER_G;
      }

      // Repulsion
      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const dx = ns[j].x - ns[i].x;
          const dy = ns[j].y - ns[i].y;
          const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const force = REPULSION / (dist * dist);
          ns[i].vx -= dx / dist * force;
          ns[i].vy -= dy / dist * force;
          ns[j].vx += dx / dist * force;
          ns[j].vy += dy / dist * force;
        }
      }

      // Spring forces from vectors
      for (const vec of sim.vectors) {
        const na = ns.find(n => n.id === vec.a);
        const nb = ns.find(n => n.id === vec.b);
        if (!na || !nb) continue;
        const dx = nb.x - na.x;
        const dy = nb.y - na.y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const stretch = dist - SPRING_LEN;
        const sign = vec.weight >= 0 ? 1 : -1;
        const strength = Math.abs(vec.weight) / 100;
        const f = SPRING_K * stretch * strength * sign;
        na.vx += dx / dist * f;
        na.vy += dy / dist * f;
        nb.vx -= dx / dist * f;
        nb.vy -= dy / dist * f;
      }

      // Damping + integrate
      for (const n of ns) {
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.vx = Math.max(-12, Math.min(12, n.vx));
        n.vy = Math.max(-12, Math.min(12, n.vy));
        n.x  = Math.max(30, Math.min(W - 30, n.x + n.vx * DRAG));
        n.y  = Math.max(30, Math.min(H - 30, n.y + n.vy * DRAG));
      }

      // ── Draw vectors ────────────────────────────────────────────────────────
      for (const vec of sim.vectors) {
        const na = ns.find(n => n.id === vec.a);
        const nb = ns.find(n => n.id === vec.b);
        if (!na || !nb) continue;
        const alpha = Math.abs(vec.weight) / 100 * 0.7 + 0.1;
        const positive = vec.weight > 0;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = positive ? '#00F0FF' : '#FF0055';
        ctx.lineWidth   = 1 + Math.abs(vec.weight) / 60;
        ctx.setLineDash(positive ? [] : [4, 4]);
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
        ctx.restore();
      }

      // ── Draw nodes ──────────────────────────────────────────────────────────
      for (const n of ns) {
        const entity = sim.entities.find(e => e.id === n.id);
        if (!entity || !entity.alive) continue;

        // W.RABBIT: special render — white square, never colored red
        if (entity.protected) {
          const size = 12;
          ctx.save();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 800) * 0.3;
          ctx.strokeRect(n.x - size / 2, n.y - size / 2, size, size);
          ctx.font = 'bold 8px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText('W.RABBIT', n.x, n.y + size + 10);
          ctx.restore();
          continue;
        }

        const r = entity.isNexus ? 18 : 8 + entity.relevance * 10;
        const color = entity.isNexus ? '#ff0000' : entity.volatility > 0.7 ? '#FF0055' : entity.relevance > 0.8 ? '#39FF14' : '#00F0FF';

        // Glow
        ctx.save();
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2.5);
        grd.addColorStop(0, color + '44');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Node circle
        ctx.save();
        ctx.fillStyle   = '#000';
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Label
        ctx.save();
        ctx.font      = `bold 9px monospace`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(entity.name, n.x, n.y + r + 12);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText(`${(entity.relevance * 100).toFixed(0)}%`, n.x, n.y + 3);
        ctx.restore();
      }

      // Dead nodes (faded markers)
      for (const entity of sim.entities.filter(e => !e.alive)) {
        const n = nodes.current.find(nd => nd.id === entity.id);
        if (!n) continue;
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.15;
        ctx.font = '8px monospace';
        ctx.fillStyle = '#888';
        ctx.textAlign = 'center';
        ctx.fillText('ARCHIVED', n.x, n.y + 17);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [canvasRef, sim]);
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SubstrateSimulation() {
  const { enqueueLog, dispatch, state } = useOS();
  const nexusFirstSeen = state?.nexusFirstSeen ?? false;
  const canvasRef = useRef(null);
  const simRef    = useRef(null);
  const [, forceUpdate] = useState(0);
  const [eventLog, setEventLog] = useState([]);
  const [liveCount, setLiveCount] = useState(0);

  // Initialise simulation once
  if (!simRef.current) simRef.current = new SimulationState(12);
  const sim = simRef.current;

  // Post-game transformation: W.RABBIT gone, NEXUS appears
  useEffect(() => {
    if (!nexusFirstSeen) return;
    const rabbit = sim.entities.find(e => e.name === 'W.RABBIT');
    if (rabbit) rabbit.alive = false;
    const hasNexus = sim.entities.find(e => e.name === 'NEXUS');
    if (!hasNexus) {
      const nexusId = sim.entities.length;
      sim.entities.push({
        id: nexusId, name: 'NEXUS', relevance: 1.0,
        aggression: 1.0, volatility: 0.9, alive: true, protected: false, isNexus: true,
      });
    }
  }, [nexusFirstSeen, sim]);

  // Canvas physics
  useCanvasGraph(canvasRef, sim);

  // Simulation tick
  useEffect(() => {
    const id = setInterval(() => {
      sim.advanceTick();
      // Consume new events
      if (sim.events.length > 0) {
        const newEvts = sim.events.splice(0);
        setEventLog(prev => [...newEvts, ...prev].slice(0, 20));
        setLiveCount(sim.alive().length);
        for (const ev of newEvts) {
          if (ev.type === 'eliminate') {
            enqueueLog(`SUBSTRATE: ${ev.text}`);
            dispatch({ type: 'INCREMENT_ARCHIVED' });
          }
        }
      }
      forceUpdate(n => n + 1);
    }, EVENT_MS);
    return () => clearInterval(id);
  }, [sim, enqueueLog, dispatch]);

  // Paranoia injection
  useEffect(() => {
    const id = setInterval(() => {
      sim._paranoia(sim.alive());
    }, PARANOIA_MS);
    return () => clearInterval(id);
  }, [sim]);

  const dead = sim.entities.filter(e => !e.alive).length;

  return (
    <div className="flex flex-col h-full bg-[var(--black)] text-[var(--text)] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--dim)] shrink-0 bg-[var(--panel)]">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">Substrate Entity Graph</span>
          <span className="text-[9px] font-mono text-[var(--dim)] ml-3 uppercase">// FOGSIFT_OS compressed consciousness layer</span>
        </div>
        <div className="flex gap-4 text-[9px] font-mono">
          <span className="text-[var(--ready)]">ACTIVE: {liveCount}</span>
          <span className="text-[var(--dim)]">ARCHIVED: {dead}</span>
        </div>
      </div>

      {/* Canvas + event log */}
      <div className="flex flex-1 min-h-0">

        {/* Canvas */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: 'block' }}
            width={600}
            height={400}
          />
          {/* Horror overlay label */}
          <div className="absolute bottom-2 left-2 text-[8px] font-mono text-[var(--dim)] opacity-40 uppercase tracking-widest pointer-events-none">
            These are not data packets. Observation only.
          </div>
        </div>

        {/* Event log */}
        <div className="w-56 flex flex-col border-l border-[var(--dim)] bg-[var(--panel)] overflow-hidden shrink-0">
          <div className="text-[8px] font-mono uppercase tracking-widest text-[var(--dim)] px-2 py-1 border-b border-[var(--dim)] shrink-0">
            Substrate Events
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 no-scrollbar">
            {eventLog.map((ev, i) => (
              <div
                key={i}
                className="text-[9px] font-mono leading-snug"
                style={{ color: ev.color, opacity: 1 - i * 0.04 }}
              >
                {ev.text}
              </div>
            ))}
            {eventLog.length === 0 && (
              <div className="text-[9px] font-mono text-[var(--dim)] animate-pulse">Initializing substrate scan...</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer lore */}
      <div className="px-4 py-1.5 border-t border-[var(--dim)] shrink-0 bg-[var(--panel)]">
        <div className="text-[8px] font-mono text-[var(--dim)] uppercase tracking-widest opacity-60 animate-pulse">
          WARNING: Operator observation may influence substrate coherence. Interaction disabled per Protocol 7.
        </div>
      </div>
    </div>
  );
}
