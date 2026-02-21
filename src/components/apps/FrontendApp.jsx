import { useState, useEffect } from 'react';
import { Box, Globe, Activity, Radio, Terminal, Radar, AlertTriangle, Skull } from 'lucide-react';
import { STAGES } from '../../constants/stages';
import { DIALOGUE_TREE } from '../../constants/dialogue';
import { useOS } from '../../context/OSContext';

function LiveDataStream({ speed, isOptimal }) {
  const [stream, setStream] = useState([]);

  useEffect(() => {
    if (speed === 0 || !isOptimal) return;
    const interval = setInterval(() => {
      const hash = Math.random().toString(16).substring(2, 8).toUpperCase();
      const temp = (Math.random() * 20 + 20).toFixed(1);
      const hex = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
      const entry = `[SYS.TICK] PKT_${hash} :: { TEMP: ${temp}C, COLOR: '${hex}', PARITY: OK }`;
      setStream(prev => [entry, ...prev].slice(0, 12));
    }, Math.max(100, 2000 / speed));
    return () => clearInterval(interval);
  }, [speed, isOptimal]);

  if (!isOptimal) return <div className="text-[var(--alert)] animate-pulse p-4 font-mono text-sm">STREAM OFFLINE. FIX BACKEND LOGIC.</div>;
  if (speed === 0) return <div className="text-[var(--dim)] p-4 font-mono text-sm">STREAM READY. AWAITING ROUTER THROUGHPUT.</div>;

  return (
    <div className="flex flex-col gap-1 w-full relative z-10 p-4">
      {stream.map((item, i) => (
        <div key={i} className="text-[var(--ready)] font-mono text-[10px] sm:text-xs whitespace-nowrap" style={{ opacity: 1 - i * 0.08 }}>
          {item}
        </div>
      ))}
    </div>
  );
}

export default function FrontendApp() {
  const { state, dispatch } = useOS();
  const isOptimal = state.stage >= STAGES.UNLOCKED;

  const handleRadarClick = () => {
    if (state.radarClicks === 0) dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.radar_warning_1 });
    else if (state.radarClicks === 1) dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.radar_warning_2 });
    dispatch({ type: 'RADAR_CLICK' });
  };

  const handleForbiddenClick = () => {
    dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.radar_breach });
  };

  if (!isOptimal) {
    return (
      <div className="h-full bg-[var(--bg)] p-6 flex flex-col relative dot-matrix text-[var(--text)] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-[var(--dim)] pb-4 mb-6">
          <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2 text-[var(--text-strong)]">
            <Box size={24} /> Client Interface
          </h2>
          <div className={`px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest ${
            state.stage === STAGES.POWER_OFF
              ? 'bg-[var(--alert-dim)] text-[var(--alert)] border border-[var(--alert)]'
              : 'bg-[var(--panel)] text-[var(--dim)] border border-[var(--dim)]'
          }`}>
            STATUS: {state.stage === STAGES.POWER_OFF ? 'OFFLINE' : 'DEGRADED'}
          </div>
        </div>

        <div className={`flex-1 border-2 border-[var(--dim)] bg-[var(--panel)] rounded-xl shadow-[var(--shadow-os-window)] p-8 flex flex-col items-center justify-center text-center transition-opacity ${state.stage === STAGES.POWER_OFF ? 'opacity-20 grayscale' : 'opacity-100'}`}>
          {state.stage < STAGES.SOFTWARE_FAULT ? (
            <>
              <Globe size={64} className="text-[var(--accentLight)] mb-4 animate-[spin_10s_linear_infinite]" />
              <h3 className="text-xl font-black uppercase text-[var(--text-strong)] mb-2">Awaiting Data</h3>
              <p className="text-xs font-bold opacity-60 uppercase max-w-sm">Data must flow through the Routing Telemetry before rendering here.</p>
            </>
          ) : (
            <>
              <AlertTriangle size={64} className="text-[var(--alert)] mb-4 animate-bounce" />
              <h3 className="text-xl font-black uppercase text-[var(--text-strong)] mb-2">Connection Refused</h3>
              <p className="text-xs font-bold opacity-60 uppercase max-w-sm">API Gateway is unreachable. Check backend systems.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--bg)] p-4 md:p-6 flex flex-col relative text-[var(--text)] overflow-y-auto animate-in fade-in zoom-in-95 duration-500">

      <div className="flex justify-between items-end border-b-2 border-[var(--dim)] pb-4 mb-6">
        <div>
          <h2
            onClick={handleRadarClick}
            className="text-xl md:text-2xl font-black uppercase tracking-widest text-[var(--text-strong)] flex items-center gap-3 cursor-pointer select-none"
          >
            <Radar
              className={`text-[var(--accent)] ${state.radarClicks >= 2 ? 'animate-ping text-[var(--alert)]' : 'animate-[spin_4s_linear_infinite]'}`}
              size={28}
            />
            Global Telemetry
          </h2>
          <p className="text-[10px] font-mono text-[var(--dim)] uppercase mt-1 tracking-widest">Live Data Stream // Architecture V1</p>

          {state.radarClicks >= 3 && (
            <button
              onClick={handleForbiddenClick}
              className="mt-4 px-4 py-2 bg-[var(--alert)] text-white text-[10px] font-black uppercase tracking-widest rounded shadow-[var(--shadow-alert-md)] animate-pulse flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
            >
              <Skull size={14} /> Decrypt Substrate
            </button>
          )}
        </div>
        <div className="px-3 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest bg-[var(--ready-20)] text-[var(--ready)] border border-[var(--ready)]">
          Live: Optimal
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 flex-1">
        <div className="bg-[var(--panel)] border border-[var(--dim)] rounded-xl p-4 md:p-6 flex flex-col justify-between shadow-[var(--shadow-os-window)] relative overflow-hidden group hover:border-[var(--accent)] transition-colors">
          <Activity className="absolute -bottom-4 -right-4 text-[var(--dim)] opacity-20 group-hover:text-[var(--accent)] transition-colors" size={100} />
          <span className="text-[10px] uppercase font-bold text-[var(--dim)] tracking-widest relative z-10">Network Throughput</span>
          <div className="text-4xl md:text-5xl font-black font-mono text-[var(--text-strong)] relative z-10 mt-4">
            {state.routingCycles.toLocaleString()} <span className="text-sm text-[var(--accent)]">pkts</span>
          </div>
          <div className="text-[10px] font-mono text-[var(--ready)] mt-2 relative z-10">Rate: {state.routingAutoRate.toLocaleString()} RPS</div>
        </div>

        <div className="bg-[var(--panel)] border border-[var(--dim)] rounded-xl p-4 md:p-6 flex flex-col justify-between shadow-[var(--shadow-os-window)] relative overflow-hidden group hover:border-[var(--res-accent)] transition-colors">
          <Radio className="absolute -bottom-4 -right-4 text-[var(--dim)] opacity-20 group-hover:text-[var(--res-accent)] transition-colors" size={100} />
          <span className="text-[10px] uppercase font-bold text-[var(--dim)] tracking-widest relative z-10">Core Resonance</span>
          <div className="text-4xl md:text-5xl font-black font-mono text-[var(--text-strong)] relative z-10 mt-4">
            {state.resonance} <span className="text-sm text-[var(--res-text)]">Hz</span>
          </div>
          <div className="text-[10px] font-mono text-[var(--ready)] mt-2 relative z-10">Parity Locked</div>
        </div>

        <div className="col-span-2 md:col-span-1 bg-[var(--panel)] border border-[var(--dim)] rounded-xl p-4 md:p-6 flex flex-col justify-between shadow-[var(--shadow-os-window)]">
          <span className="text-[10px] uppercase font-bold text-[var(--dim)] tracking-widest">Active Vibe Token</span>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-12 h-12 rounded-full animate-pulse shadow-[var(--shadow-accent-md)]" style={{ backgroundColor: 'var(--accent)' }} />
            <div className="text-2xl font-black font-mono text-[var(--accentLight)] uppercase">{state.themeName}</div>
          </div>
        </div>

        <div className="col-span-2 md:col-span-3 bg-[var(--black)] border border-[var(--dim)] rounded-xl flex flex-col shadow-[var(--shadow-os-window)] overflow-hidden relative min-h-[200px]">
          <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
          <div className="p-4 border-b border-[var(--dim)] shrink-0 flex justify-between items-center relative z-10 bg-[var(--panel)]">
            <span className="text-[10px] uppercase font-bold text-[var(--dim)] tracking-widest flex items-center gap-2">
              <Terminal size={12} /> Incoming Stream
            </span>
            <span className="text-[var(--accent)] animate-pulse flex items-center gap-1 text-[10px] font-bold">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" /> REC
            </span>
          </div>
          <div className="flex-1 overflow-hidden relative z-10 flex flex-col justify-end">
            <LiveDataStream speed={state.routingAutoRate} isOptimal={isOptimal} />
          </div>
        </div>
      </div>
    </div>
  );
}
