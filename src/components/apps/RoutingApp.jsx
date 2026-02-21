import { useState } from 'react';
import { Network, Database, AlertCircle, AlertTriangle, Sliders, ShoppingCart, CheckCircle2, Skull, Asterisk, Hexagon, Globe, CircleDashed } from 'lucide-react';
import { STAGES } from '../../constants/stages';
import { UPGRADES } from '../../constants/upgrades';
import { useOS } from '../../context/OSContext';

export default function RoutingApp() {
  const { state, dispatch, enqueueLog } = useOS();
  const [particles, setParticles] = useState([]);

  const handleIngest = () => {
    if (state.stage < STAGES.ROUTING_MANUAL) return;
    dispatch({ type: 'INGEST_DATA' });

    const id = Date.now() + Math.random();
    setParticles(p => [...p, { id, y: 12 + (Math.random() * 20 - 10) }]);
    setTimeout(() => setParticles(p => p.filter(part => part.id !== id)), 600);

    if (Math.random() < 0.1 && state.stage < STAGES.UNLOCKED) {
      enqueueLog(`LOG: PACKET PROCESSED. CYCLES: ${state.routingCycles + 1}`);
    }
    if (state.stage === STAGES.ROUTING_MANUAL && state.routingCycles + 1 >= 15) {
      enqueueLog('SUCCESS: MANUAL QUOTA REACHED. AUTO-ROUTER ONLINE.');
    }
  };

  const buyUpgrade = (id) => {
    dispatch({ type: 'BUY_UPGRADE', payload: id });
    if (id === 'god') dispatch({ type: 'TRIGGER_EGG', payload: 'created_god' });
  };

  const popPacket = () => {
    dispatch({ type: 'TRIGGER_EGG', payload: 'packet_pop' });
  };

  const isOnline   = state.stage >= STAGES.ROUTING_MANUAL;
  const isUnlocked = state.stage >= STAGES.UNLOCKED;

  const renderSubstrateCore = () => {
    if (state.purchasedUpgrades.includes('cthulhu'))  return <Skull     className="text-[var(--alert)]    animate-pulse"                    size={120} />;
    if (state.purchasedUpgrades.includes('god'))      return <Asterisk  className="text-[var(--internal)] animate-[spin_3s_linear_infinite]" size={120} />;
    if (state.purchasedUpgrades.includes('universe')) return <Globe     className="text-[var(--secure)]   animate-[spin_10s_linear_infinite]" size={120} />;
    if (state.purchasedUpgrades.includes('quantum'))  return <Hexagon   className="text-[var(--res-accent)] animate-pulse"                   size={120} />;
    return <CircleDashed className="text-[var(--dim)] opacity-20 animate-[spin_20s_linear_infinite]" size={120} />;
  };

  return (
    <div className="h-full bg-[var(--panel)] p-6 flex flex-col gap-6 relative overflow-y-auto">
      <div className="absolute inset-0 crt-bg opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[var(--dim)] pb-4 shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <Network className="text-[var(--accent)]" size={24} />
          <h2 className="text-xl font-black uppercase text-[var(--text-strong)] tracking-widest">Routing Telemetry</h2>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-[var(--text)] uppercase">{isUnlocked ? 'Total Cycles (Currency)' : 'Total Cycles'}</div>
          <div className="text-2xl font-mono font-black text-[var(--internal)]">
            {isUnlocked ? state.currency.toLocaleString() : state.routingCycles}
          </div>
        </div>
      </div>

      {/* Status banners */}
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

      {/* Ingest area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 gap-8 min-h-[250px] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          {renderSubstrateCore()}
        </div>

        {/* Animated trace line */}
        <div className="w-full h-12 relative flex items-center justify-center opacity-70 z-10">
          {isOnline && state.stage !== STAGES.SOFTWARE_FAULT && (
            <svg className="w-full h-full absolute inset-0 overflow-visible">
              <path
                d="M 0,24 L 800,24"
                fill="none"
                stroke="var(--dim)"
                strokeWidth="4"
                className={state.routingAutoRate > 0 ? 'trace-data' : 'trace-glow'}
              />
              {state.routingAutoRate > 0 && (
                <circle
                  cx="50%" cy="24" r="8"
                  fill="var(--accent)"
                  className="cursor-crosshair hover:scale-150 transition-transform animate-ping pointer-events-auto"
                  onClick={popPacket}
                />
              )}
              {particles.map(p => (
                <circle key={p.id} cx="10%" cy={p.y} r="4" fill="var(--ready)" className="packet-spark drop-shadow-[0_0_8px_var(--ready)]" />
              ))}
            </svg>
          )}
        </div>

        {/* Ingest button */}
        <button
          onClick={handleIngest}
          disabled={!isOnline || state.stage === STAGES.SOFTWARE_FAULT || state.stage === STAGES.HOSTILE_LOCKDOWN}
          className={`w-40 h-40 shrink-0 rounded-full border-4 flex flex-col items-center justify-center font-black uppercase text-sm gap-2 transition-all shadow-[var(--shadow-os-window)] z-10 ${
            !isOnline || state.stage === STAGES.SOFTWARE_FAULT || state.stage === STAGES.HOSTILE_LOCKDOWN
              ? 'bg-[var(--panel)] border-[var(--dim)] text-[var(--dim)] opacity-50 cursor-not-allowed'
              : 'bg-[var(--panel)] border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-text)] active:scale-95 shadow-[var(--shadow-accent-md)]'
          }`}
        >
          <Database size={32} /> Ingest Data
        </button>
      </div>

      {/* Auto-router slider */}
      {state.stage >= STAGES.ROUTING_AUTO && !isUnlocked && (
        <div className="bg-[var(--bg)] border-2 border-[var(--dim)] p-6 rounded-lg relative z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[var(--text-strong)] font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <Sliders size={14} /> Auto-Router Control
            </h3>
            <span className="text-[10px] text-[var(--accent)] font-bold">{state.routingAutoRate} RPS</span>
          </div>
          <input
            type="range" min="0" max="20" value={state.routingAutoRate}
            onChange={e => dispatch({ type: 'SET_AUTO_RATE', payload: Number(e.target.value) })}
            disabled={state.stage === STAGES.SOFTWARE_FAULT || state.stage === STAGES.HOSTILE_LOCKDOWN}
            className="fogsift-slider"
          />
        </div>
      )}

      {/* Substrate Marketplace (unlocked after backend patch) */}
      {isUnlocked && (
        <div className="bg-[var(--bg)] border-2 border-[var(--dim)] p-4 md:p-6 rounded-lg relative z-10 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-4 border-b border-[var(--dim)] pb-2">
            <h3 className="text-[var(--text-strong)] font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <ShoppingCart size={14} /> Substrate Marketplace
            </h3>
            <div className="flex gap-4">
              <span className="text-[10px] text-[var(--accent)] font-bold">POWER: {state.clickPower.toLocaleString()} / CLICK</span>
              <span className="text-[10px] text-[var(--ready)]  font-bold">AUTO: {state.routingAutoRate.toLocaleString()} RPS</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
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
                      : <span className="font-mono text-[9px]">{u.cost.toLocaleString()} c</span>
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
