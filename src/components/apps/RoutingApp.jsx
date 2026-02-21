import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Network, Database, AlertCircle, AlertTriangle, Sliders, ShoppingCart,
  CheckCircle2, Skull, Asterisk, Hexagon, Globe, CircleDashed,
  Flame, Zap, Radio, Server, Cpu,
} from 'lucide-react';
import { STAGES } from '../../constants/stages';
import { UPGRADES } from '../../constants/upgrades';
import { useOS } from '../../context/OSContext';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9)  return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6)  return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3)  return (n / 1e3).toFixed(1) + 'K';
  return String(n);
};

const FACILITY_TIERS = [
  { threshold: 0,        label: 'Basement Server',  color: 'var(--dim)'        },
  { threshold: 1000,     label: 'Data Closet',       color: 'var(--text)'       },
  { threshold: 50000,    label: 'Server Farm',        color: 'var(--accent)'     },
  { threshold: 1e6,      label: 'Data Center',        color: 'var(--internal)'   },
  { threshold: 1e9,      label: 'Small Moon Array',   color: 'var(--res-accent)' },
  { threshold: 1e12,     label: 'Dyson Sphere',       color: 'var(--ready)'      },
];

const getFacility = (cycles) => {
  let tier = FACILITY_TIERS[0];
  for (const t of FACILITY_TIERS) { if (cycles >= t.threshold) tier = t; }
  return tier;
};

const DISASTERS = {
  thermal: {
    label: 'THERMAL CASCADE',
    sub:   'Click to vent heat before meltdown.',
    icon:  Flame,
    color: 'var(--alert)',
    needed: 8,
  },
  breach: {
    label: 'CONTAINMENT BREACH',
    sub:   'Click to seal substrate rupture.',
    icon:  Radio,
    color: 'var(--res-accent)',
    needed: 12,
  },
};

// ── Substrate VisualRoom ──────────────────────────────────────────────────────
function VisualRoom({ purchased, clickPower }) {
  const cpuCount = Math.min(8, Math.ceil(clickPower / 5));
  const hasThread   = purchased.includes('thread');
  const hasQuantum  = purchased.includes('quantum');
  const hasUniverse = purchased.includes('universe');
  const hasGod      = purchased.includes('god');
  const hasCthulhu  = purchased.includes('cthulhu');

  return (
    <div className="w-full grid grid-cols-8 gap-1 px-2 py-3 bg-[var(--black)] border border-[var(--dim)] rounded-lg overflow-hidden relative" style={{ minHeight: 64 }}>
      {/* CPU racks */}
      {Array.from({ length: cpuCount }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5">
          <Cpu size={14} className="text-[var(--accent)] opacity-70" />
          <div className="w-1 rounded-full bg-[var(--accent)] opacity-40 animate-pulse" style={{ height: 20, animationDelay: `${i * 120}ms` }} />
        </div>
      ))}
      {/* Thread stream */}
      {hasThread && (
        <div className="col-span-2 flex items-center justify-center">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-[var(--internal)] to-transparent animate-pulse rounded-full" />
        </div>
      )}
      {/* Quantum core */}
      {hasQuantum && (
        <div className="flex items-center justify-center">
          <Hexagon size={18} className="text-[var(--res-accent)] animate-pulse" />
        </div>
      )}
      {/* Universe bubble */}
      {hasUniverse && (
        <div className="flex items-center justify-center">
          <Globe size={16} className="text-[var(--secure)] animate-[spin_8s_linear_infinite]" />
        </div>
      )}
      {/* Lesser god */}
      {hasGod && !hasCthulhu && (
        <div className="flex items-center justify-center">
          <Asterisk size={18} className="text-[var(--internal)] animate-[spin_3s_linear_infinite]" />
        </div>
      )}
      {/* Cthulhu */}
      {hasCthulhu && (
        <div className="flex items-center justify-center">
          <Skull size={18} className="text-[var(--alert)] animate-pulse" />
        </div>
      )}
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none scanline opacity-10" />
    </div>
  );
}

// ── Disaster Overlay ──────────────────────────────────────────────────────────
function DisasterOverlay({ disaster, onDismiss }) {
  if (!disaster) return null;
  const def = DISASTERS[disaster.type];
  const Icon = def.icon;
  const pct = Math.round((disaster.clicks / def.needed) * 100);

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 p-6 rounded-lg animate-in fade-in duration-200"
      style={{ background: 'color-mix(in srgb, var(--black) 85%, transparent)' }}
    >
      <div className="absolute inset-0 scanline opacity-20 pointer-events-none rounded-lg" />
      <Icon size={48} style={{ color: def.color }} className="animate-pulse relative z-10" />
      <h3 className="text-lg font-black uppercase tracking-widest relative z-10" style={{ color: def.color }}>
        {def.label}
      </h3>
      <p className="text-xs font-mono text-[var(--text)] uppercase tracking-widest relative z-10">{def.sub}</p>
      <button
        onClick={onDismiss}
        className="relative z-10 w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center font-black uppercase text-xs gap-1 transition-all active:scale-95 shadow-lg"
        style={{ borderColor: def.color, color: def.color }}
      >
        <Icon size={28} />
        <span>{disaster.clicks}/{def.needed}</span>
      </button>
      {/* Progress bar */}
      <div className="w-full max-w-xs h-2 bg-[var(--dim)] rounded-full overflow-hidden relative z-10">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: def.color }}
        />
      </div>
    </div>
  );
}

// ── Substrate Core visual (center background) ─────────────────────────────────
function SubstrateCore({ purchased }) {
  if (purchased.includes('cthulhu'))  return <Skull     className="text-[var(--alert)]    animate-pulse"                    size={120} />;
  if (purchased.includes('god'))      return <Asterisk  className="text-[var(--internal)] animate-[spin_3s_linear_infinite]" size={120} />;
  if (purchased.includes('universe')) return <Globe     className="text-[var(--secure)]   animate-[spin_10s_linear_infinite]" size={120} />;
  if (purchased.includes('quantum'))  return <Hexagon   className="text-[var(--res-accent)] animate-pulse"                  size={120} />;
  return <CircleDashed className="text-[var(--dim)] opacity-20 animate-[spin_20s_linear_infinite]" size={120} />;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RoutingApp() {
  const { state, dispatch, enqueueLog } = useOS();

  const [particles, setParticles]   = useState([]);
  const [disaster,  setDisaster]    = useState(null);
  const [overdrive, setOverdrive]   = useState(false);
  const [overdriveEnd, setOverdriveEnd] = useState(0);
  const clickTimesRef = useRef([]);
  const overdriveTimerRef = useRef(null);

  const isOnline   = state.stage >= STAGES.ROUTING_MANUAL;
  const isUnlocked = state.stage >= STAGES.UNLOCKED;
  const isLocked   = !isOnline || state.stage === STAGES.SOFTWARE_FAULT || state.stage === STAGES.HOSTILE_LOCKDOWN;
  const hasDisaster = disaster !== null;

  const facility = getFacility(state.routingCycles);

  // ── Overdrive detector ──────────────────────────────────────────────────────
  const triggerOverdrive = useCallback(() => {
    if (overdrive) return;
    setOverdrive(true);
    const end = Date.now() + 10000;
    setOverdriveEnd(end);
    enqueueLog('OVERDRIVE: SUBSTRATE FREQUENCY SPIKING. OUTPUT x2 FOR 10s.');
    clearTimeout(overdriveTimerRef.current);
    overdriveTimerRef.current = setTimeout(() => {
      setOverdrive(false);
      enqueueLog('OVERDRIVE: Frequency normalizing.');
    }, 10000);
  }, [overdrive, enqueueLog]);

  // ── Disaster trigger (random, when auto-routing) ────────────────────────────
  useEffect(() => {
    if (state.routingAutoRate === 0 || !isOnline || isUnlocked) return;
    const id = setInterval(() => {
      if (disaster) return;
      if (Math.random() < 0.18) {
        const type = Math.random() < 0.5 ? 'thermal' : 'breach';
        setDisaster({ type, clicks: 0 });
        enqueueLog(`ALERT: ${DISASTERS[type].label} DETECTED.`);
      }
    }, 10000);
    return () => clearInterval(id);
  }, [state.routingAutoRate, isOnline, isUnlocked, disaster, enqueueLog]);

  // ── Overdrive expiry countdown ─────────────────────────────────────────────
  useEffect(() => {
    if (!overdrive) return;
    const id = setInterval(() => {
      if (Date.now() >= overdriveEnd) {
        setOverdrive(false);
        clearInterval(id);
      }
    }, 500);
    return () => clearInterval(id);
  }, [overdrive, overdriveEnd]);

  // ── Manual ingest ──────────────────────────────────────────────────────────
  const handleIngest = () => {
    if (isLocked || hasDisaster) return;
    dispatch({ type: 'INGEST_DATA' });
    if (overdrive) dispatch({ type: 'INGEST_DATA' }); // 2x during overdrive

    // Particle spark
    const id = Date.now() + Math.random();
    setParticles(p => [...p, { id, y: 12 + (Math.random() * 20 - 10) }]);
    setTimeout(() => setParticles(p => p.filter(pt => pt.id !== id)), 600);

    // Log (rarely)
    if (Math.random() < 0.1 && state.stage < STAGES.UNLOCKED) {
      enqueueLog(`LOG: PACKET PROCESSED. CYCLES: ${state.routingCycles + 1}`);
    }
    if (state.stage === STAGES.ROUTING_MANUAL && state.routingCycles + 1 >= 15) {
      enqueueLog('SUCCESS: MANUAL QUOTA REACHED. AUTO-ROUTER ONLINE.');
    }

    // Overdrive detection: 20 clicks in 2s
    const now = Date.now();
    clickTimesRef.current = [...clickTimesRef.current, now].filter(t => now - t < 2000);
    if (clickTimesRef.current.length >= 20) {
      clickTimesRef.current = [];
      triggerOverdrive();
    }
  };

  // ── Disaster click-to-dismiss ──────────────────────────────────────────────
  const handleDisasterClick = () => {
    if (!disaster) return;
    const def = DISASTERS[disaster.type];
    const next = disaster.clicks + 1;
    if (next >= def.needed) {
      setDisaster(null);
      enqueueLog(`RESOLVED: ${def.label} contained. Substrate stable.`);
    } else {
      setDisaster({ ...disaster, clicks: next });
    }
  };

  // ── Upgrade purchase ───────────────────────────────────────────────────────
  const buyUpgrade = (id) => {
    dispatch({ type: 'BUY_UPGRADE', payload: id });
    if (id === 'god') dispatch({ type: 'TRIGGER_EGG', payload: 'created_god' });
  };

  const popPacket = () => dispatch({ type: 'TRIGGER_EGG', payload: 'packet_pop' });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-full bg-[var(--panel)] p-6 flex flex-col gap-4 relative overflow-y-auto">
      <div className="absolute inset-0 crt-bg opacity-10 pointer-events-none" />

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b-2 border-[var(--dim)] pb-4 shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <Network className="text-[var(--accent)]" size={24} />
          <div>
            <h2 className="text-xl font-black uppercase text-[var(--text-strong)] tracking-widest">Routing Telemetry</h2>
            <div className="text-[10px] font-mono uppercase tracking-widest mt-0.5" style={{ color: facility.color }}>
              {facility.label}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[var(--text)] uppercase">{isUnlocked ? 'Currency (c)' : 'Total Cycles'}</div>
          <div className={`text-2xl font-mono font-black transition-colors ${overdrive ? 'text-[var(--ready)] animate-pulse' : 'text-[var(--internal)]'}`}>
            {fmt(isUnlocked ? state.currency : state.routingCycles)}
          </div>
          {overdrive && (
            <div className="text-[9px] font-black uppercase tracking-widest text-[var(--ready)] animate-pulse flex items-center gap-1 justify-end">
              <Zap size={9} /> OVERDRIVE x2
            </div>
          )}
        </div>
      </div>

      {/* ── Status banners ── */}
      {!isOnline && (
        <div className="bg-[var(--alert-dim)] border-2 border-[var(--alert)] p-4 flex items-center gap-4 relative z-10 rounded-lg">
          <AlertCircle className="text-[var(--alert)]" size={32} />
          <div>
            <h3 className="text-[var(--alert)] font-bold uppercase text-sm">System Pipeline Locked</h3>
            <p className="text-[10px] text-[var(--text)]">Complete Vibe Thermal Task before routing data.</p>
          </div>
        </div>
      )}
      {state.stage === STAGES.SOFTWARE_FAULT && (
        <div className="bg-[var(--alert-dim)] border-2 border-[var(--alert)] p-4 flex items-center gap-4 relative z-10 rounded-lg animate-pulse">
          <AlertTriangle className="text-[var(--alert)]" size={32} />
          <div>
            <h3 className="text-[var(--alert)] font-bold uppercase text-sm">Software Overload</h3>
            <p className="text-[10px] text-[var(--text)]">API Gateway Unreachable. Check Backend Configuration.</p>
          </div>
        </div>
      )}

      {/* ── Substrate VisualRoom ── */}
      {isOnline && (
        <div className="relative z-10 shrink-0">
          <VisualRoom purchased={state.purchasedUpgrades} clickPower={state.clickPower} />
        </div>
      )}

      {/* ── Main ingest area ── */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 gap-6 min-h-[200px] overflow-hidden">

        {/* Disaster overlay */}
        <div className="absolute inset-0">
          <DisasterOverlay disaster={disaster} onDismiss={handleDisasterClick} />
        </div>

        {/* Substrate core background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <SubstrateCore purchased={state.purchasedUpgrades} />
        </div>

        {/* Animated trace line */}
        <div className="w-full h-12 relative flex items-center justify-center opacity-70 z-10">
          {isOnline && state.stage !== STAGES.SOFTWARE_FAULT && (
            <svg className="w-full h-full absolute inset-0 overflow-visible">
              <path
                d="M 0,24 L 800,24"
                fill="none"
                stroke={overdrive ? 'var(--ready)' : 'var(--dim)'}
                strokeWidth={overdrive ? 6 : 4}
                className={state.routingAutoRate > 0 ? 'trace-data' : 'trace-glow'}
              />
              {state.routingAutoRate > 0 && (
                <circle
                  cx="50%" cy="24" r="8"
                  fill={overdrive ? 'var(--ready)' : 'var(--accent)'}
                  className="cursor-crosshair hover:scale-150 transition-transform animate-ping pointer-events-auto"
                  onClick={popPacket}
                />
              )}
              {particles.map(p => (
                <circle key={p.id} cx="10%" cy={p.y} r="4" fill={overdrive ? 'var(--ready)' : 'var(--ready)'} className="packet-spark drop-shadow-[0_0_8px_var(--ready)]" />
              ))}
            </svg>
          )}
        </div>

        {/* Ingest button */}
        <button
          onClick={handleIngest}
          disabled={isLocked || hasDisaster}
          className={`w-36 h-36 shrink-0 rounded-full border-4 flex flex-col items-center justify-center font-black uppercase text-sm gap-2 transition-all z-10 ${
            isLocked || hasDisaster
              ? 'bg-[var(--panel)] border-[var(--dim)] text-[var(--dim)] opacity-50 cursor-not-allowed'
              : overdrive
              ? 'bg-[var(--panel)] border-[var(--ready)] text-[var(--ready)] hover:bg-[var(--ready)] hover:text-black active:scale-95 shadow-[0_0_24px_var(--ready)]'
              : 'bg-[var(--panel)] border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-text)] active:scale-95 shadow-[var(--shadow-accent-md)]'
          }`}
        >
          <Database size={28} />
          <span>{overdrive ? 'x2 INGEST' : 'Ingest Data'}</span>
          {overdrive && <span className="text-[8px] opacity-70 font-mono">OVERDRIVE</span>}
        </button>

        {/* Overdrive hint (before first trigger) */}
        {!overdrive && isOnline && !hasDisaster && (
          <p className="text-[9px] font-mono text-[var(--dim)] uppercase tracking-widest z-10 opacity-60">
            Click fast enough to trigger overdrive
          </p>
        )}
      </div>

      {/* ── Stats strip ── */}
      {isOnline && (
        <div className="grid grid-cols-3 gap-2 relative z-10 shrink-0">
          {[
            { label: 'Click Power', value: fmt(state.clickPower), icon: Cpu },
            { label: 'Auto RPS', value: fmt(state.routingAutoRate), icon: Server },
            { label: 'Total Packets', value: fmt(state.routingCycles), icon: Database },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-[var(--bg)] border border-[var(--dim)] rounded p-2 text-center">
              <div className="text-[8px] font-mono uppercase tracking-widest text-[var(--dim)] flex items-center justify-center gap-1 mb-1">
                <Icon size={8} /> {label}
              </div>
              <div className="text-sm font-black font-mono text-[var(--text-strong)]">{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Auto-router slider ── */}
      {state.stage >= STAGES.ROUTING_AUTO && !isUnlocked && (
        <div className="bg-[var(--bg)] border-2 border-[var(--dim)] p-4 rounded-lg relative z-10 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[var(--text-strong)] font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <Sliders size={14} /> Auto-Router
            </h3>
            <span className="text-[10px] text-[var(--accent)] font-bold font-mono">{state.routingAutoRate} RPS</span>
          </div>
          <input
            type="range" min="0" max="20" value={state.routingAutoRate}
            onChange={e => dispatch({ type: 'SET_AUTO_RATE', payload: Number(e.target.value) })}
            disabled={state.stage === STAGES.SOFTWARE_FAULT || state.stage === STAGES.HOSTILE_LOCKDOWN}
            className="fogsift-slider"
          />
          {state.routingAutoRate > 0 && !isUnlocked && (
            <p className="text-[9px] font-mono text-[var(--dim)] mt-2 uppercase tracking-widest opacity-60">
              Warning: auto-routing at high throughput may trigger substrate events
            </p>
          )}
        </div>
      )}

      {/* ── Substrate Marketplace ── */}
      {isUnlocked && (
        <div className="bg-[var(--bg)] border-2 border-[var(--dim)] p-4 md:p-6 rounded-lg relative z-10 animate-in fade-in slide-in-from-bottom-4 shrink-0">
          <div className="flex justify-between items-center mb-4 border-b border-[var(--dim)] pb-2">
            <h3 className="text-[var(--text-strong)] font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <ShoppingCart size={14} /> Substrate Marketplace
            </h3>
            <div className="flex gap-4">
              <span className="text-[10px] text-[var(--accent)] font-bold font-mono">PWR: {fmt(state.clickPower)}</span>
              <span className="text-[10px] text-[var(--ready)]  font-bold font-mono">AUTO: {fmt(state.routingAutoRate)} RPS</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[260px] overflow-y-auto pr-2 no-scrollbar">
            {UPGRADES.map(u => {
              const canAfford   = state.currency >= u.cost;
              const isPurchased = state.purchasedUpgrades.includes(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => buyUpgrade(u.id)}
                  disabled={!canAfford || isPurchased || state.stage === STAGES.HOSTILE_LOCKDOWN}
                  className={`p-3 rounded border text-left flex flex-col gap-1 transition-all ${
                    isPurchased   ? 'bg-[var(--panel)] border-[var(--dim)] opacity-50' :
                    canAfford     ? 'bg-[var(--secure-dim)] border-[var(--secure)] hover:bg-[var(--secure)] text-white shadow-md' :
                                    'bg-[var(--black)] border-[var(--dim)] opacity-70 cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between w-full">
                    <span className="font-bold text-xs">{u.name}</span>
                    {isPurchased
                      ? <CheckCircle2 size={12} />
                      : <span className="font-mono text-[9px]">{fmt(u.cost)} c</span>
                    }
                  </div>
                  <span className="text-[10px] opacity-80">{u.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
