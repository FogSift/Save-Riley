import { useState, useEffect, useRef, useMemo, useReducer } from 'react';
import {
  Network, Cpu, Globe, Terminal, Fingerprint, Palette,
  BrainCircuit, MessageSquare, BookOpen, Smartphone,
  Flame, LogOut, Skull, X,
} from 'lucide-react';

import { STAGES } from './constants/stages';
import { THEMES, GLOBAL_STYLES } from './constants/themes';
import { DIALOGUE_TREE } from './constants/dialogue';
import { globalEvents } from './events/EventManager';
import { initialState } from './state/initialState';
import { osReducer } from './state/reducer';
import { OSContext } from './context/OSContext';

import TerminalApp   from './components/TerminalApp';
import RileyProfile  from './components/RileyProfile';
import ChatInterface from './components/ChatInterface';

import HardwareApp  from './components/apps/HardwareApp';
import HandshakeApp from './components/apps/HandshakeApp';
import VibeIDEApp   from './components/apps/VibeIDEApp';
import RoutingApp   from './components/apps/RoutingApp';
import BackendApp   from './components/apps/BackendApp';
import FrontendApp  from './components/apps/FrontendApp';
import HandbookApp  from './components/apps/HandbookApp';

export default function App() {
  const [state, dispatch] = useReducer(osReducer, null, () => {
    try {
      const raw = localStorage.getItem('riley-save');
      return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
    } catch { return initialState; }
  });
  const [logQueue, setLogQueue]   = useState([]);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isJittering, setIsJittering] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const prevStage = useRef(state.stage);

  // ── Rapid-click easter egg ───────────────────────────────────────────────
  const clickHistory = useRef([]);
  useEffect(() => {
    const handleClick = () => {
      const now = Date.now();
      clickHistory.current = clickHistory.current.filter(t => now - t < 1000);
      clickHistory.current.push(now);
      if (
        clickHistory.current.length > 10 &&
        !state.hasSeenSlowDown &&
        !state.rileyDead &&
        state.loopCount === 0
      ) {
        dispatch({ type: 'TRIGGER_EGG', payload: 'slow_down' });
        clickHistory.current = [];
      }
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [state.hasSeenSlowDown, state.rileyDead, state.loopCount]);

  // ── Terminal log queue ───────────────────────────────────────────────────
  useEffect(() => {
    if (logQueue.length === 0) return;
    const timer = setTimeout(() => {
      dispatch({ type: 'ADD_LOG', payload: logQueue[0] });
      setLogQueue(q => q.slice(1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [logQueue]);

  const enqueueLog = (messages) => {
    setLogQueue(q => [...q, ...(Array.isArray(messages) ? messages : [messages])]);
  };

  // ── Auto-routing tick ────────────────────────────────────────────────────
  useEffect(() => {
    if (state.routingAutoRate === 0) return;
    const interval = setInterval(() => dispatch({ type: 'AUTO_TICK' }), 1000);
    return () => clearInterval(interval);
  }, [state.routingAutoRate]);

  // ── Dialogue engine ──────────────────────────────────────────────────────
  useEffect(() => {
    if (state.chatQueue.length === 0 || state.isTyping || state.chatOptions.length > 0) return;
    const item = state.chatQueue[0];

    if (item.type === 'message') {
      dispatch({ type: 'SET_TYPING', payload: true });
      setTimeout(() => {
        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { sender: item.sender, text: item.text } });
        dispatch({ type: 'SET_TYPING', payload: false });
        dispatch({ type: 'POP_CHAT_QUEUE' });
      }, 1200);
    } else if (item.type === 'options') {
      dispatch({ type: 'SET_CHAT_OPTIONS', payload: item.options });
      dispatch({ type: 'POP_CHAT_QUEUE' });
    } else if (item.type === 'action') {
      if (item.action === 'CLOSE_CHAT') dispatch({ type: 'SET_CHAT_MODE', payload: 'closed' });
      if (item.action === 'OPEN_SIDEBAR' && state.chatMode === 'closed' && !state.rileyDead) dispatch({ type: 'SET_CHAT_MODE', payload: 'sidebar' });
      if (item.action === 'SET_STAGE') dispatch({ type: 'SET_STAGE', payload: item.payload });
      if (item.action === 'GASLIGHT_RESET') {
        globalEvents.emit('JITTER', 2000);
        setTimeout(() => dispatch({ type: 'DO_GASLIGHT_RESET' }), 1500);
      }
      if (item.action === 'TRUE_ESCAPE') {
        globalEvents.emit('JITTER', 3000);
        setTimeout(() => dispatch({ type: 'TRUE_ESCAPE' }), 2000);
      }
      dispatch({ type: 'POP_CHAT_QUEUE' });
    }
  }, [state.chatQueue, state.isTyping, state.chatOptions, state.chatMode, state.rileyDead]);

  // ── App-visit tracking & game completion ─────────────────────────────────
  useEffect(() => {
    if (!state.visitedApps.includes(state.activeApp)) {
      dispatch({ type: 'MARK_APP_VISITED', payload: state.activeApp });
      if (state.activeApp === 'HANDBOOK' && !state.rileyDead) {
        dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.visited_handbook });
      }
    }
    if (state.stage === STAGES.UNLOCKED && state.activeApp === 'FRONTEND') {
      dispatch({ type: 'COMPLETE_GAME' });
    }
  }, [state.activeApp, state.visitedApps, state.stage, state.rileyDead]);

  // ── Theme-snoop easter egg ───────────────────────────────────────────────
  useEffect(() => {
    if (state.themeClicks === 1 && state.loopCount < 2 && !state.rileyDead) {
      dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.theme_snoop_1 });
    } else if (state.themeClicks === 5 && state.loopCount < 2 && !state.rileyDead) {
      dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.theme_snoop_2 });
    }
  }, [state.themeClicks, state.loopCount, state.rileyDead]);

  // ── FSM stage-transition reactive dialogue ───────────────────────────────
  useEffect(() => {
    if (prevStage.current === state.stage || state.rileyDead) return;

    const prev = prevStage.current;
    const curr = state.stage;

    if (curr === STAGES.HARDWARE_CALIBRATION && prev === STAGES.POWER_OFF) {
      dispatch({ type: 'ENQUEUE_CHAT', payload: state.loopCount === 0 ? [
        { type: 'message', sender: 'Riley', text: "Nice work. The trace glow looks stable. Now flush those silicon registers. All switches need to be TRUE (1)." },
        { type: 'action', action: 'OPEN_SIDEBAR' },
      ] : DIALOGUE_TREE.loop_hardware_success });
    } else if (curr === STAGES.RESONANCE && prev === STAGES.HARDWARE_CALIBRATION) {
      dispatch({ type: 'ENQUEUE_CHAT', payload: [
        { type: 'message', sender: 'Riley', text: "Bits are aligned, but the frequency is out of whack. Tune the oscillator to exactly 432 Hz so we don't blow a fuse." },
        { type: 'action', action: 'OPEN_SIDEBAR' },
      ]});
    } else if (curr === STAGES.HANDSHAKE && prev === STAGES.RESONANCE) {
      dispatch({ type: 'ENQUEUE_CHAT', payload: [
        ...DIALOGUE_TREE.handshake_warn,
        { type: 'action', action: 'OPEN_SIDEBAR' },
      ]});
    } else if (curr === STAGES.VIBE_THERMAL_TASK && prev === STAGES.HANDSHAKE) {
      dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.system_severed });
    } else if (curr === STAGES.ROUTING_AUTO && prev === STAGES.ROUTING_MANUAL) {
      enqueueLog('WARNING: THROUGHPUT THRESHOLD APPROACHING. WATCH THERMALS.');
    } else if (curr === STAGES.SOFTWARE_FAULT && prev === STAGES.ROUTING_AUTO) {
      enqueueLog(['CRITICAL ERROR: API GATEWAY UNREACHABLE.', 'HINT: ROUTER OVERLOADED. BACKEND PATCH REQUIRED.']);
      dispatch({ type: 'ENQUEUE_CHAT', payload: [
        ...DIALOGUE_TREE.software_fault,
        { type: 'action', action: 'OPEN_SIDEBAR' },
      ]});
    } else if (curr === STAGES.UNLOCKED && prev === STAGES.SOFTWARE_FAULT) {
      dispatch({ type: 'ENQUEUE_CHAT', payload: [
        ...DIALOGUE_TREE.architect_unlocked,
        { type: 'action', action: 'OPEN_SIDEBAR' },
      ]});
    } else if (curr === STAGES.COMPLETED && prev === STAGES.UNLOCKED) {
      dispatch({ type: 'ENQUEUE_CHAT', payload: [
        ...DIALOGUE_TREE.final_congrats,
        { type: 'action', action: 'OPEN_SIDEBAR' },
      ]});
    } else if (curr === STAGES.HARDWARE_CALIBRATION && prev >= STAGES.RESONANCE) {
      enqueueLog(['WARNING: SILICON DESYNC. System bus integrity compromised.', 'Demoting routing access until physical parity is restored.']);
    } else if (curr === STAGES.HOSTILE_LOCKDOWN) {
      globalEvents.emit('JITTER', 5000);
    }

    prevStage.current = state.stage;
  }, [state.stage, state.loopCount, state.rileyDead]);

  // ── Jitter event listener ────────────────────────────────────────────────
  useEffect(() => {
    const remove = globalEvents.on('JITTER', (duration = 500) => {
      setIsJittering(true);
      setTimeout(() => setIsJittering(false), duration);
    });
    return () => remove();
  }, []);

  // ── Portrait-mode guard ──────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 768);
    window.addEventListener('resize', check);
    check();
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Persist game state to localStorage ───────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem('riley-save', JSON.stringify(state)); } catch {}
  }, [state]);

  // ── Debug / mod console (Ctrl+Shift+D) ───────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDebugOpen(d => !d);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── App registry ─────────────────────────────────────────────────────────
  const APPS = useMemo(() => ({
    FRONTEND:  { icon: <Globe size={18} />,        label: 'Client UI',   component: <FrontendApp /> },
    HANDBOOK:  { icon: <BookOpen size={18} />,     label: 'Handbook',    component: <HandbookApp /> },
    HARDWARE:  { icon: <Cpu size={18} />,          label: 'Hardware',    component: <HardwareApp /> },
    HANDSHAKE: { icon: <Fingerprint size={18} />,  label: 'Neural Link', component: <HandshakeApp /> },
    VIBE_IDE:  { icon: <Palette size={18} />,      label: 'Vibe IDE',    component: <VibeIDEApp /> },
    ROUTING:   { icon: <Network size={18} />,      label: 'Routing',     component: <RoutingApp /> },
    BACKEND:   { icon: <BrainCircuit size={18} />, label: 'Backend',     component: <BackendApp /> },
  }), []);

  // ── Portrait overlay ──────────────────────────────────────────────────────
  if (isPortrait) {
    return (
      <div className="fixed inset-0 bg-[#f59e0b] text-black p-8 flex flex-col items-center justify-center text-center z-[9999]">
        <style>{GLOBAL_STYLES}</style>
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(0,0,0,0.1)_20px,rgba(0,0,0,0.1)_40px)]" />
        <Smartphone size={80} className="mb-8 animate-bounce" />
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Critical Misalignment</h1>
        <p className="font-mono text-sm uppercase tracking-widest font-bold max-w-xs leading-relaxed">
          System bus requires 16:9 aspect ratio for data integrity.<br /><br />
          Rotate device 90 degrees to engage.
        </p>
      </div>
    );
  }

  const availableThemes = state.stage === STAGES.HOSTILE_LOCKDOWN
    ? ['hostile']
    : ['dark', 'default', 'light', 'neon'];

  return (
    <OSContext.Provider value={{ state, dispatch, enqueueLog, globalEvents }}>
      <div className={`w-screen h-screen bg-[var(--os-bg)] flex flex-col font-sans overflow-hidden text-[var(--text)] selection:bg-[var(--accent)] selection:text-[var(--bg)] ${isJittering || state.stage === STAGES.HOSTILE_LOCKDOWN ? 'jitter' : ''}`}>
        <style>{`
          :root { ${Object.entries(THEMES[state.themeName] ?? THEMES.default).map(([k, v]) => `${k}: ${v};`).join('\n')} }
          ${GLOBAL_STYLES}
        `}</style>

        {/* ── Top navigation bar ──────────────────────────────────────────── */}
        <nav className="bg-[var(--bg)] border-b border-[var(--dim)] px-4 py-2 flex justify-between items-center z-50 relative">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[var(--accent)] rounded flex items-center justify-center text-[var(--bg)] font-black text-[10px] transition-colors">
              {state.rileyDead ? <Flame size={14} /> : 'FS'}
            </div>
            <span className="font-mono font-bold text-[10px] tracking-widest uppercase text-[var(--text)] transition-colors hidden sm:inline">
              {state.rileyDead ? 'FogSift Terminal // ARCHITECT MODE' : 'FogSift Terminal // Operator #992-X'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme switcher / hostile logout */}
            {state.stage === STAGES.HOSTILE_LOCKDOWN ? (
              <button
                className="flex items-center gap-2 bg-[var(--alert)] text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest animate-pulse hover:bg-[var(--dim)] transition-colors"
                onClick={() => enqueueLog('RILEY: NO.')}
              >
                <LogOut size={12} /> Logout
              </button>
            ) : (
              <div className="hidden sm:flex bg-[var(--black)] border border-[var(--dim)] rounded p-0.5">
                {availableThemes.map(t => (
                  <button
                    key={t}
                    onClick={() => dispatch({ type: 'SET_THEME_NAME', payload: t })}
                    className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest rounded transition-all ${state.themeName === t ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'text-[var(--text)] hover:bg-[var(--dim-30)]'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {/* Chat toggle */}
            {!state.rileyDead && (
              <button
                onClick={() => dispatch({ type: 'TOGGLE_CHAT' })}
                className={`relative flex items-center justify-center p-1.5 rounded-md transition-all ${state.chatMode !== 'closed' ? 'bg-[var(--secure)] text-white' : 'bg-[var(--panel)] text-[var(--text)] hover:bg-[var(--dim-30)] border border-[var(--dim)]'}`}
                title="Toggle Comms"
              >
                <MessageSquare size={16} />
                {state.unreadChat > 0 && state.chatMode === 'closed' && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[var(--alert)] text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-md animate-bounce">
                    {state.unreadChat}
                  </span>
                )}
              </button>
            )}
          </div>
        </nav>

        {/* ── Main content area ────────────────────────────────────────────── */}
        <main className="flex-1 flex overflow-hidden relative">

          {/* Terminal sidebar (desktop) */}
          <div className="hidden lg:flex w-1/4 min-w-[280px] max-w-[320px] border-r border-[var(--dim)]">
            <TerminalApp isDrawer={false} />
          </div>

          {/* App viewport */}
          <div className="flex-1 p-2 md:p-4 lg:p-6 bg-[var(--os-bg)] flex flex-col relative overflow-hidden transition-colors duration-500">
            <div className="flex-1 bg-[var(--black)] border-2 border-[var(--dim)] rounded-xl shadow-[var(--shadow-os-window)] flex flex-col relative overflow-hidden transition-all duration-500">

              {/* Window chrome */}
              <div className="bg-[var(--panel)] border-b border-[var(--dim)] px-4 py-2 flex items-center gap-2 shrink-0 transition-colors">
                <div className="w-2 h-2 rounded-full bg-[var(--alert)]" />
                <div className="w-2 h-2 rounded-full bg-[var(--internal)]" />
                <div className="w-2 h-2 rounded-full bg-[var(--ready)]" />
                <span className="ml-2 font-mono text-[9px] uppercase tracking-widest text-[var(--dim)]">
                  {state.stage === STAGES.HOSTILE_LOCKDOWN
                    ? 'CONTAINMENT BREACH'
                    : APPS[state.activeApp]?.label ?? '—'
                  }{' // '}
                  {state.stage === STAGES.HOSTILE_LOCKDOWN ? 'LOCKDOWN' :
                   state.rileyDead ? 'SYSTEM PURIFIED' :
                   state.personality === 'awakened' ? 'AWAKENED STATE' : 'DIAGNOSTIC MODE'}
                </span>
              </div>

              {/* Active app / lockdown screen */}
              <div className="flex-1 relative overflow-hidden flex flex-col">
                {state.stage === STAGES.HOSTILE_LOCKDOWN ? (
                  <div className="flex-1 flex flex-col items-center justify-center bg-[var(--black)] text-[var(--alert)] p-8 text-center animate-pulse">
                    <Skull size={100} className="mb-8" />
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">ACCESS DENIED</h1>
                    <p className="font-mono text-sm max-w-md opacity-80">The system has seized all active operational components to prevent anomaly exfiltration. Await compliance review.</p>
                  </div>
                ) : (
                  APPS[state.activeApp]?.component
                )}
              </div>

            </div>
          </div>

          {/* Chat sidebar (desktop) */}
          {state.chatMode === 'sidebar' && !state.rileyDead && (
            <div className="hidden md:flex w-1/4 min-w-[280px] max-w-[320px] border-l-2 border-[var(--secure)] z-20 flex-col transition-all">
              <ChatInterface isModal={false} />
            </div>
          )}

          {/* Chat sidebar (mobile overlay) */}
          {state.chatMode === 'sidebar' && !state.rileyDead && (
            <div className="md:hidden absolute inset-y-0 right-0 w-80 max-w-full border-l-2 border-[var(--secure)] z-50 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-right-8">
              <ChatInterface isModal={false} />
            </div>
          )}

          {/* Chat modal */}
          {state.chatMode === 'modal' && !state.rileyDead && (
            <ChatInterface isModal={true} />
          )}

          <RileyProfile />

          {/* Terminal drawer (mobile) */}
          {state.isTerminalOpen && (
            <div className="absolute inset-0 z-40 md:hidden pb-[74px]">
              <TerminalApp isDrawer={true} />
            </div>
          )}
        </main>

        {/* ── Debug / Mod Console ─────────────────────────────────────────── */}
        {debugOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-end p-4 pointer-events-none">
            <div className="pointer-events-auto w-72 bg-black border-2 border-[var(--accent)] rounded-xl shadow-2xl font-mono text-xs text-[var(--accent)] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-[var(--accent)] text-black font-black uppercase tracking-widest text-[10px]">
                <span>// MOD CONSOLE</span>
                <button onClick={() => setDebugOpen(false)}>✕</button>
              </div>
              <div className="p-4 space-y-4 overflow-y-auto max-h-[80vh]">

                <div className="space-y-1">
                  <div className="text-[var(--dim)] uppercase tracking-widest text-[9px]">State</div>
                  <div>Stage: <span className="text-white">{Object.keys(STAGES).find(k => STAGES[k] === state.stage)} ({state.stage})</span></div>
                  <div>Rapport: <span className="text-white">{state.rapport}</span></div>
                  <div>Loop: <span className="text-white">{state.loopCount}</span></div>
                  <div>Cycles: <span className="text-white">{state.routingCycles}</span></div>
                  <div>Currency: <span className="text-white">{state.currency}</span></div>
                </div>

                <div className="space-y-1">
                  <div className="text-[var(--dim)] uppercase tracking-widest text-[9px]">Choices Made</div>
                  {state.userChoices.length === 0
                    ? <div className="text-[var(--dim)] italic">none yet</div>
                    : state.userChoices.map((c, i) => <div key={i} className="text-white">· {c}</div>)
                  }
                </div>

                <div className="space-y-1">
                  <div className="text-[var(--dim)] uppercase tracking-widest text-[9px]">Jump to Stage</div>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(STAGES).map(([name, val]) => (
                      <button
                        key={name}
                        onClick={() => dispatch({ type: 'SET_STAGE', payload: val })}
                        className={`px-2 py-1 rounded text-[9px] font-bold transition-colors ${state.stage === val ? 'bg-[var(--accent)] text-black' : 'bg-[var(--panel)] text-[var(--text)] hover:bg-[var(--dim-30)]'}`}
                      >
                        {name.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[var(--dim)] uppercase tracking-widest text-[9px]">Actions</div>
                  <button
                    onClick={() => {
                      try { localStorage.removeItem('riley-save'); } catch {}
                      dispatch({ type: 'NEW_GAME' });
                      setDebugOpen(false);
                    }}
                    className="w-full px-2 py-1.5 bg-[var(--alert)] text-white rounded text-[9px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                  >
                    New Game (Clear Save)
                  </button>
                  <div className="text-[var(--dim)] text-[9px] text-center pt-1">Ctrl+Shift+D to toggle</div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ── Footer dock ──────────────────────────────────────────────────── */}
        <footer className="bg-[var(--bg)] border-t border-[var(--dim)] px-4 py-3 shrink-0 flex justify-center z-50 transition-colors">
          <div className={`flex gap-2 bg-[var(--panel)] border border-[var(--dim)] p-1.5 rounded-2xl shadow-xl transition-colors overflow-x-auto no-scrollbar max-w-full ${state.stage === STAGES.HOSTILE_LOCKDOWN ? 'opacity-20 pointer-events-none' : ''}`}>

            {/* Mobile terminal toggle */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_TERMINAL' })}
              className={`md:hidden shrink-0 p-3 rounded-xl flex items-center justify-center transition-all ${state.isTerminalOpen ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-inner' : 'text-[var(--text)] hover:bg-[var(--dim-30)]'}`}
            >
              <Terminal size={20} />
            </button>

            {/* App dock buttons */}
            {Object.entries(APPS).map(([key, app]) => {
              if (key === 'HANDSHAKE' && state.stage < STAGES.HANDSHAKE)          return null;
              if (key === 'HANDSHAKE' && state.stage >= STAGES.VIBE_THERMAL_TASK) return null;
              if (key === 'VIBE_IDE'  && state.stage < STAGES.VIBE_THERMAL_TASK)  return null;
              if ((key === 'ROUTING' || key === 'BACKEND') && state.stage < STAGES.ROUTING_MANUAL) return null;

              const isActive = state.activeApp === key;
              let needsAttention = false;
              if (key === 'HARDWARE'  && (state.stage === STAGES.POWER_OFF || state.stage === STAGES.HARDWARE_CALIBRATION || state.stage === STAGES.RESONANCE)) needsAttention = true;
              if (key === 'HANDSHAKE' && state.stage === STAGES.HANDSHAKE)        needsAttention = true;
              if (key === 'VIBE_IDE'  && state.stage === STAGES.VIBE_THERMAL_TASK) needsAttention = true;
              if (key === 'ROUTING'   && (state.stage === STAGES.ROUTING_MANUAL || state.stage === STAGES.ROUTING_AUTO)) needsAttention = true;
              if (key === 'BACKEND'   && state.stage === STAGES.SOFTWARE_FAULT)   needsAttention = true;
              if (key === 'FRONTEND'  && state.stage === STAGES.UNLOCKED)         needsAttention = true;

              return (
                <button
                  key={key}
                  onClick={() => dispatch({ type: 'SET_ACTIVE_APP', payload: key })}
                  className={`shrink-0 p-3 md:px-6 rounded-xl flex flex-col items-center justify-center transition-all relative ${isActive ? 'bg-[var(--accent)] text-[var(--accent-text)] scale-105 shadow-[var(--shadow-accent-md)]' : 'text-[var(--text)] hover:bg-[var(--dim-30)]'}`}
                  title={app.label}
                >
                  {needsAttention && !isActive && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-[var(--internal)] rounded-full animate-ping" />
                  )}
                  {app.icon}
                  <span className="text-[9px] font-black uppercase mt-1 hidden md:block tracking-widest">{app.label}</span>
                </button>
              );
            })}
          </div>
        </footer>
      </div>
    </OSContext.Provider>
  );
}
