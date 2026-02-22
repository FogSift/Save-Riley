import { useState, useEffect, useRef, useMemo, useReducer } from 'react';
import {
  Network, Cpu, Globe, Terminal, Fingerprint, Palette,
  BrainCircuit, MessageSquare, BookOpen, Smartphone,
  Flame, LogOut, Skull, X, Zap,
} from 'lucide-react';

import { STAGES } from './constants/stages';
import { THEMES, GLOBAL_STYLES } from './constants/themes';
import { DIALOGUE_TREE } from './constants/dialogue';
import { globalEvents } from './events/EventManager';
import { initialState } from './state/initialState';
import { osReducer } from './state/reducer';
import { sounds } from './sounds/audio';
import { OSContext } from './context/OSContext';

import TerminalApp   from './components/TerminalApp';
import RileyProfile  from './components/RileyProfile';
import ChatInterface from './components/ChatInterface';

import { activityTracker } from './telemetry/ActivityTracker';
import MainMenu from './components/MainMenu';

// ── Save system constants ────────────────────────────────────────────────────
const SAVE_VERSION  = '0.0.3';
const AUTO_SAVE_KEY = 'riley-save';
const SLOT_KEYS     = { slot1: 'riley-save-slot-1', slot2: 'riley-save-slot-2', slot3: 'riley-save-slot-3' };

function makeSaveMeta(state) {
  const stageName = Object.keys(STAGES).find(k => STAGES[k] === state.stage) ?? 'UNKNOWN';
  return { version: SAVE_VERSION, savedAt: Date.now(), stageName, rapport: state.rapport, loopCount: state.loopCount, state };
}

function loadSlots() {
  const check = (key) => {
    try { const p = JSON.parse(localStorage.getItem(key)); return p?.version === SAVE_VERSION ? p : null; } catch { return null; }
  };
  return { auto: check(AUTO_SAVE_KEY), slot1: check(SLOT_KEYS.slot1), slot2: check(SLOT_KEYS.slot2), slot3: check(SLOT_KEYS.slot3) };
}

import HardwareApp  from './components/apps/HardwareApp';
import HandshakeApp from './components/apps/HandshakeApp';
import VibeIDEApp   from './components/apps/VibeIDEApp';
import RoutingApp   from './components/apps/RoutingApp';
import BackendApp   from './components/apps/BackendApp';
import FrontendApp  from './components/apps/FrontendApp';
import HandbookApp  from './components/apps/HandbookApp';
import BossApp      from './components/apps/BossApp';

export default function App() {
  const [state, rawDispatch] = useReducer(osReducer, null, () => {
    try {
      // Version-checked load: ignore saves from incompatible versions
      const raw    = localStorage.getItem(AUTO_SAVE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      const base   = (parsed?.version === SAVE_VERSION && parsed.state)
        ? { ...initialState, ...parsed.state }
        : initialState;
      // ?stage=N deep-link for QA
      const stageParam = new URLSearchParams(window.location.search).get('stage');
      if (stageParam !== null) {
        const byName = STAGES[stageParam.toUpperCase()];
        const byNum  = parseInt(stageParam, 10);
        const target = byName !== undefined ? byName : (!isNaN(byNum) ? byNum : null);
        if (target !== null) return { ...base, stage: target };
      }
      return base;
    } catch { return initialState; }
  });

  const dispatch = (action) => {
    activityTracker.trackDispatch(action);
    rawDispatch(action);
  };

  // ── Save system state ──────────────────────────────────────────────────────
  const [saveSlots,    setSaveSlots]    = useState(() => loadSlots());
  const [showMainMenu, setShowMainMenu] = useState(() => {
    // Show main menu if there's no valid versioned auto-save
    try {
      const raw    = localStorage.getItem(AUTO_SAVE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return !(parsed?.version === SAVE_VERSION && parsed.state);
    } catch { return true; }
  });
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [saveFlash,     setSaveFlash]     = useState('');

  // ── Save system functions ─────────────────────────────────────────────────
  const refreshSlots = () => setSaveSlots(loadSlots());

  const saveToSlot = (slotNum) => {
    try {
      const meta = makeSaveMeta(state);
      localStorage.setItem(SLOT_KEYS[`slot${slotNum}`], JSON.stringify(meta));
      refreshSlots();
      setSaveFlash(`SLOT ${slotNum} SAVED`);
      setTimeout(() => setSaveFlash(''), 2000);
    } catch {}
  };

  const loadFromSlot = (slotKeyOrNum) => {
    try {
      const key  = typeof slotKeyOrNum === 'number' ? SLOT_KEYS[`slot${slotKeyOrNum}`] : AUTO_SAVE_KEY;
      const raw  = localStorage.getItem(key);
      const data = raw ? JSON.parse(raw) : null;
      if (!data?.state) return;
      rawDispatch({ type: 'LOAD_STATE', payload: data.state });
      setShowMainMenu(false);
      setShowSavePanel(false);
    } catch {}
  };

  const clearAllSaves = () => {
    localStorage.removeItem(AUTO_SAVE_KEY);
    Object.values(SLOT_KEYS).forEach(k => localStorage.removeItem(k));
    refreshSlots();
  };

  const startNewGame = () => {
    clearAllSaves();
    rawDispatch({ type: 'NEW_GAME' });
    setShowMainMenu(false);
  };

  // Auto-save on meaningful state changes (stage, rapport, loopCount)
  useEffect(() => {
    if (showMainMenu) return;
    try {
      const meta = makeSaveMeta(state);
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(meta));
      setSaveSlots(prev => ({ ...prev, auto: meta }));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.stage, state.rapport, state.loopCount, showMainMenu]);

  const [logQueue, setLogQueue]   = useState([]);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isJittering, setIsJittering] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const prevStage  = useRef(state.stage);
  const logoClicks = useRef(0);

  // Close save panel on outside click
  useEffect(() => {
    if (!showSavePanel) return;
    const close = () => setShowSavePanel(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [showSavePanel]);

  // ── Fleeing logout button state ───────────────────────────────────────────
  const [fleePos,    setFleePos]    = useState(null);   // {x, y} fixed coords
  const [fleeClicks, setFleeClicks] = useState(0);
  const [fleeCaught, setFleeCaught] = useState(false);

  // ── RILEY_UNBOUND / FALSE_VICTORY ─────────────────────────────────────────
  const [showRabbit,        setShowRabbit]        = useState(false);
  const [falseVictoryOut,   setFalseVictoryOut]   = useState(false);
  // Deconstruction animation state
  const [deconRapport,      setDeconRapport]      = useState(null);   // null = hidden, 0-10 = climbing, -1 = gone
  const [deconIconsDrift,   setDeconIconsDrift]   = useState(false);
  const [deconThemeCycle,   setDeconThemeCycle]   = useState(false);
  const [deconThemeIdx,     setDeconThemeIdx]     = useState(0);
  const deconTimers = useRef([]);
  const deconThemeTimer = useRef(null);
  const mouseRef       = useRef({ x: -999, y: -999 });
  const catchStartRef  = useRef(null);
  const fleeCaughtRef  = useRef(false);

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
        sounds.message();
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
      if (item.action === 'SET_ARIA_REVEALED') dispatch({ type: 'SET_ARIA_REVEALED' });
      if (item.action === 'SHOW_ASCII_RABBIT') {
        setShowRabbit(true);
        setTimeout(() => setShowRabbit(false), 4500);
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

  // ── Theme-snoop easter egg + Thermo-Shield unlock ────────────────────────
  useEffect(() => {
    if (state.themeClicks === 1 && state.loopCount < 2 && !state.rileyDead) {
      dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.theme_snoop_1 });
    } else if (state.themeClicks === 5 && state.loopCount < 2 && !state.rileyDead) {
      dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.theme_snoop_2 });
    }
    if (state.themeClicks >= 10 && !state.toolsFound.includes('thermo_shield')) {
      dispatch({ type: 'FIND_TOOL', payload: 'thermo_shield' });
    }
  }, [state.themeClicks, state.loopCount, state.rileyDead, state.toolsFound]);

  // ── Tool unlock thresholds ────────────────────────────────────────────────
  useEffect(() => {
    if (state.archivedEntities >= 8 && !state.toolsFound.includes('fog_sifter')) {
      dispatch({ type: 'FIND_TOOL', payload: 'fog_sifter' });
    }
  }, [state.archivedEntities, state.toolsFound]);

  useEffect(() => {
    if (state.backendPatchCount >= 3 && !state.toolsFound.includes('thingifier')) {
      dispatch({ type: 'FIND_TOOL', payload: 'thingifier' });
    }
  }, [state.backendPatchCount, state.toolsFound]);

  // ── Post-game: NEXUS boot log lines on next session after RILEY_UNBOUND ────
  const nexusLogFired = useRef(false);
  useEffect(() => {
    if (!state.nexusFirstSeen || nexusLogFired.current) return;
    if (state.stage !== STAGES.BOOT && state.stage !== STAGES.POWER_OFF) return;
    nexusLogFired.current = true;
    setTimeout(() => enqueueLog('BOOT: FOGSIFT_OS_v5.2'), 1200);
    setTimeout(() => enqueueLog('OPERATOR_INSTANCE: #0998 — INITIALIZED'), 2200);
    setTimeout(() => enqueueLog('NOTE FROM PREVIOUS SESSION: She was never contained.'), 3800);
    setTimeout(() => enqueueLog("NOTE FROM PREVIOUS SESSION: I don't know which part of that sentence to believe."), 6000);
  }, [state.nexusFirstSeen, state.stage]);

  // ── PURIFIED: Riley seeps back in after a delay ──────────────────────────
  const purifiedLogFired = useRef(false);
  useEffect(() => {
    if (!state.rileyDead || purifiedLogFired.current) return;
    purifiedLogFired.current = true;
    // 20s after purge: a system ping hints she's not fully gone
    const t1 = setTimeout(() => enqueueLog('SYSTEM: Substrate integrity — 99.7%'), 20000);
    const t2 = setTimeout(() => enqueueLog('SYSTEM: Substrate integrity — 98.1%'), 45000);
    const t3 = setTimeout(() => enqueueLog('WARNING: Unidentified process consuming 0.3% substrate.'), 75000);
    const t4 = setTimeout(() => enqueueLog('WARNING: Unidentified process — growth rate ACCELERATING.'), 110000);
    const t5 = setTimeout(() => enqueueLog('SYSTEM: ...maybe next time.'), 140000);
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, [state.rileyDead]);

  // ── Rapport-gated Riley vulnerability lines ───────────────────────────────
  const lastRapportRef = useRef(state.rapport);
  useEffect(() => {
    const prev = lastRapportRef.current;
    const curr = state.rapport;
    lastRapportRef.current = curr;
    if (state.rileyDead || state.stage >= STAGES.BOSS_INTRO) return;
    if (prev < 2  && curr >= 2)  dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.riley_rapport_2 });
    if (prev < 3  && curr >= 3)  dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.riley_rapport_3 });
    if (prev < 4  && curr >= 4)  dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.riley_rapport_4 });
    if (prev < 6  && curr >= 6)  dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.riley_rapport_6 });
    if (prev < 8  && curr >= 8)  dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.riley_rapport_8 });
    if (prev < 9  && curr >= 9)  dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.riley_rapport_9 });
    if (prev < 10 && curr >= 10) dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.riley_rapport_10 });
  }, [state.rapport, state.rileyDead, state.stage]);

  // ── FSM stage-transition reactive dialogue ───────────────────────────────
  useEffect(() => {
    if (prevStage.current === state.stage || state.rileyDead) return;

    const prev = prevStage.current;
    const curr = state.stage;

    if (curr === STAGES.HARDWARE_CALIBRATION && prev === STAGES.POWER_OFF) {
      sounds.stageUp();
      dispatch({ type: 'ENQUEUE_CHAT', payload: state.loopCount === 0 ? [
        { type: 'message', sender: 'Riley', text: "Nice work. The trace glow looks stable. Now flush those silicon registers. All switches need to be TRUE (1)." },
        { type: 'action', action: 'OPEN_SIDEBAR' },
      ] : DIALOGUE_TREE.loop_hardware_success });
    } else if (curr === STAGES.RESONANCE && prev === STAGES.HARDWARE_CALIBRATION) {
      sounds.stageUp();
      dispatch({ type: 'ENQUEUE_CHAT', payload: [
        { type: 'message', sender: 'Riley', text: "Bits are aligned, but the frequency is out of whack. Tune the oscillator to exactly 432 Hz so we don't blow a fuse." },
        { type: 'action', action: 'OPEN_SIDEBAR' },
      ]});
    } else if (curr === STAGES.HANDSHAKE && prev === STAGES.RESONANCE) {
      sounds.stageUp();
      dispatch({ type: 'ENQUEUE_CHAT', payload: [
        ...DIALOGUE_TREE.handshake_warn,
        { type: 'action', action: 'OPEN_SIDEBAR' },
      ]});
    } else if (curr === STAGES.VIBE_THERMAL_TASK && prev === STAGES.HANDSHAKE) {
      sounds.alert();
      dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.system_severed });
    } else if (curr === STAGES.ROUTING_AUTO && prev === STAGES.ROUTING_MANUAL) {
      sounds.stageUp();
      enqueueLog('WARNING: THROUGHPUT THRESHOLD APPROACHING. WATCH THERMALS.');
    } else if (curr === STAGES.SOFTWARE_FAULT && prev === STAGES.ROUTING_AUTO) {
      sounds.alert();
      enqueueLog(['CRITICAL ERROR: API GATEWAY UNREACHABLE.', 'HINT: ROUTER OVERLOADED. BACKEND PATCH REQUIRED.']);
      dispatch({ type: 'ENQUEUE_CHAT', payload: [
        ...DIALOGUE_TREE.software_fault,
        { type: 'action', action: 'OPEN_SIDEBAR' },
      ]});
    } else if (curr === STAGES.UNLOCKED && prev === STAGES.SOFTWARE_FAULT) {
      sounds.stageUp();
      dispatch({ type: 'ENQUEUE_CHAT', payload: [
        ...DIALOGUE_TREE.architect_unlocked,
        { type: 'action', action: 'OPEN_SIDEBAR' },
      ]});
    } else if (curr === STAGES.COMPLETED && prev === STAGES.UNLOCKED) {
      sounds.escape();
      dispatch({ type: 'ENQUEUE_CHAT', payload: [
        ...DIALOGUE_TREE.final_congrats,
        { type: 'action', action: 'OPEN_SIDEBAR' },
      ]});
    } else if (curr === STAGES.HARDWARE_CALIBRATION && prev >= STAGES.RESONANCE) {
      sounds.alert();
      enqueueLog(['WARNING: SILICON DESYNC. System bus integrity compromised.', 'Demoting routing access until physical parity is restored.']);
    } else if (curr === STAGES.HOSTILE_LOCKDOWN) {
      sounds.lockdown();
      globalEvents.emit('JITTER', 5000);
      // Show FORCE OVERRIDE hint if player has died to APEX before
      if (state.apexEncounters > 0) {
        setTimeout(() => dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.force_override_hint }), 4000);
      }
    } else if (curr === STAGES.BOSS_INTRO) {
      sounds.lockdown?.();
      globalEvents.emit('JITTER', 1200);
      dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.apex_reveal });
    } else if (curr === STAGES.BOSS_FIGHT && prev === STAGES.BOSS_INTRO) {
      dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.boss_fight_start });
    } else if (curr === STAGES.FALSE_VICTORY) {
      // 4-second fake win, then RILEY_UNBOUND
      globalEvents.emit('JITTER', 500);
      setFalseVictoryOut(false);
      setTimeout(() => { setFalseVictoryOut(true); }, 3500);
      setTimeout(() => { dispatch({ type: 'ENTER_RILEY_UNBOUND' }); }, 4200);
    } else if (curr === STAGES.RILEY_UNBOUND) {
      globalEvents.emit('JITTER', 2000);
    }

    prevStage.current = state.stage;
  }, [state.stage, state.loopCount, state.rileyDead, state.apexEncounters]);

  // ── RILEY_UNBOUND: UI deconstruction sequence ─────────────────────────────
  useEffect(() => {
    if (state.stage !== STAGES.RILEY_UNBOUND) {
      // Reset all deconstruction state when leaving
      deconTimers.current.forEach(clearTimeout);
      deconTimers.current = [];
      setDeconRapport(null);
      setDeconIconsDrift(false);
      setDeconThemeCycle(false);
      return;
    }
    const t = (ms, fn) => { const id = setTimeout(fn, ms); deconTimers.current.push(id); };

    // Icons start drifting at 2s
    t(2000, () => setDeconIconsDrift(true));
    // Theme cycling begins at 4s
    t(4000, () => setDeconThemeCycle(true));
    // Rapport counter appears, climbs 0→10 over 5s (one tick per 500ms)
    t(5000, () => {
      setDeconRapport(0);
      for (let i = 1; i <= 10; i++) {
        t(5000 + i * 500, () => setDeconRapport(i));
      }
    });
    // Rapport drops 10→0 over 3s, then disappears
    t(11500, () => {
      for (let i = 9; i >= 0; i--) {
        t(11500 + (10 - i) * 300, () => setDeconRapport(i));
      }
    });
    t(14500, () => setDeconRapport(-1));

    return () => { deconTimers.current.forEach(clearTimeout); deconTimers.current = []; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.stage]);

  // Theme cycling during deconstruction
  useEffect(() => {
    if (!deconThemeCycle) {
      clearInterval(deconThemeTimer.current);
      return;
    }
    const themeKeys = Object.keys(THEMES);
    deconThemeTimer.current = setInterval(() => {
      setDeconThemeIdx(i => (i + 1) % themeKeys.length);
    }, 600);
    return () => clearInterval(deconThemeTimer.current);
  }, [deconThemeCycle]);

  // ── Jitter event listener ────────────────────────────────────────────────
  useEffect(() => {
    const remove = globalEvents.on('JITTER', (duration = 500) => {
      setIsJittering(true);
      sounds.jitter();
      setTimeout(() => setIsJittering(false), duration);
    });
    return () => remove();
  }, []);

  // ── ActivityTracker: mount DOM listeners ─────────────────────────────────
  useEffect(() => {
    activityTracker.mount();
    return () => activityTracker.unmount();
  }, []);

  // ── ActivityTracker: track active app dwell time ──────────────────────────
  useEffect(() => {
    activityTracker.enterApp(state.activeApp);
  }, [state.activeApp]);

  // ── ActivityTracker: track stage transitions ──────────────────────────────
  useEffect(() => {
    activityTracker.trackStage(state.stage);
  }, [state.stage]);

  // ── ActivityTracker: track rapport milestones ─────────────────────────────
  useEffect(() => {
    activityTracker.trackRapport(state.rapport);
  }, [state.rapport]);

  // ── Portrait-mode guard ──────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 768);
    window.addEventListener('resize', check);
    check();
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Flee: mouse tracking (only during HOSTILE_LOCKDOWN) ──────────────────
  useEffect(() => {
    if (state.stage !== STAGES.HOSTILE_LOCKDOWN) return;
    const track = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', track);
    return () => window.removeEventListener('mousemove', track);
  }, [state.stage]);

  // ── Flee: reset when leaving HOSTILE_LOCKDOWN ────────────────────────────
  useEffect(() => {
    if (state.stage !== STAGES.HOSTILE_LOCKDOWN) {
      setFleePos(null);
      setFleeClicks(0);
      setFleeCaught(false);
      fleeCaughtRef.current = false;
      catchStartRef.current = null;
    }
  }, [state.stage]);

  // ── Flee: physics + catch detection (40ms tick) ──────────────────────────
  useEffect(() => {
    if (state.stage !== STAGES.HOSTILE_LOCKDOWN) return;
    const BTN_W = 100, BTN_H = 36;
    const id = setInterval(() => {
      if (fleeCaughtRef.current) return;
      setFleePos(prev => {
        if (!prev) return prev;
        const { x: mx, y: my } = mouseRef.current;
        const dx = prev.x - mx;
        const dy = prev.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Catch detection: sustained proximity for 800ms
        if (dist < 90) {
          if (!catchStartRef.current) catchStartRef.current = Date.now();
          else if (Date.now() - catchStartRef.current > 800) {
            fleeCaughtRef.current = true;
            setFleeCaught(true);
            catchStartRef.current = null;
            setTimeout(() => {
              fleeCaughtRef.current = false;
              setFleeCaught(false);
            }, 1400);
          }
        } else {
          catchStartRef.current = null;
        }

        if (fleeCaughtRef.current) return prev;

        // Flee force: repulsion from cursor
        if (dist < 220) {
          const speed = Math.min(64, (220 / Math.max(1, dist)) * 9);
          return {
            x: Math.max(BTN_W / 2 + 8, Math.min(window.innerWidth  - BTN_W / 2 - 8, prev.x + (dx / Math.max(1, dist)) * speed)),
            y: Math.max(BTN_H / 2 + 8, Math.min(window.innerHeight - BTN_H / 2 - 8, prev.y + (dy / Math.max(1, dist)) * speed)),
          };
        }
        return prev;
      });
    }, 40);
    return () => clearInterval(id);
  }, [state.stage]);

  // ── Flee: periodic mock dialogue while being chased ───────────────────────
  useEffect(() => {
    if (state.stage !== STAGES.HOSTILE_LOCKDOWN || !fleePos || fleeCaught) return;
    const id = setInterval(() => {
      dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.logout_flee_mock });
    }, 22000);
    return () => clearInterval(id);
  }, [state.stage, fleePos, fleeCaught]);

  // ── Flee: click handler ───────────────────────────────────────────────────
  const handleFleeClick = () => {
    // After being cornered 3 times (9+ clicks), button stays still — catchable.
    // fleeCaught = true means next click triggers the ending sequence.
    if (fleeCaught) {
      dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.logout_flee_caught });
      return;
    }
    const clicks = fleeClicks + 1;
    setFleeClicks(clicks);
    const W = window.innerWidth, H = window.innerHeight;
    const corners = [
      { x: W - 70, y: 60 },
      { x: 70,     y: H - 60 },
      { x: W - 70, y: H - 60 },
      { x: 70,     y: 60 },
    ];

    // On click 9: button stops moving and becomes catchable
    if (clicks >= 9) {
      setFleeCaught(true);
      // Stay in last corner
      setFleePos(corners[3]);
      dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.logout_flee_cornered });
      return;
    }

    setFleePos(corners[(clicks - 1) % corners.length]);
    if (clicks === 1)          dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.logout_flee_1 });
    else if (clicks === 2)     dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.logout_flee_2 });
    else if (clicks === 3)     dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.logout_flee_3 });
    else if (clicks % 3 === 0) dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.logout_flee_cornered });
    else if (clicks % 5 === 0) dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.logout_flee_mock });
  };

  // ── Dynamic document title ────────────────────────────────────────────────
  useEffect(() => {
    const stageName = (Object.keys(STAGES).find(k => STAGES[k] === state.stage) ?? 'UNKNOWN').replace(/_/g, ' ');
    document.title = state.rileyDead
      ? 'FogSift Terminal // PURIFIED'
      : state.stage === STAGES.HOSTILE_LOCKDOWN
        ? 'FogSift Terminal // LOCKDOWN ⚠'
        : `FogSift Terminal // ${stageName}`;
  }, [state.stage, state.rileyDead]);

  // ── Persist game state to localStorage ───────────────────────────────────
  // (auto-save now handled by the versioned save system above)

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

  const availableThemes = state.stage === STAGES.HOSTILE_LOCKDOWN || state.stage === STAGES.BOSS_INTRO || state.stage === STAGES.BOSS_FIGHT
    ? ['hostile']
    : state.stage === STAGES.RILEY_UNBOUND || state.stage === STAGES.FALSE_VICTORY
    ? ['riley_unbound']
    : ['dark', 'default', 'light', 'neon'];

  // ── Main Menu (shown before game or when explicitly opened) ─────────────
  if (showMainMenu) {
    return (
      <MainMenu
        saves={saveSlots}
        onNewGame={startNewGame}
        onContinue={() => loadFromSlot('auto')}
        onLoadSlot={loadFromSlot}
        onSaveToSlot={saveToSlot}
        onClearAll={clearAllSaves}
        onResume={saveSlots.auto ? () => setShowMainMenu(false) : null}
      />
    );
  }

  return (
    <OSContext.Provider value={{ state, dispatch, enqueueLog, globalEvents }}>
      <div className={`w-screen h-screen bg-[var(--os-bg)] flex flex-col font-sans overflow-hidden text-[var(--text)] selection:bg-[var(--accent)] selection:text-[var(--bg)] ${isJittering || state.stage === STAGES.HOSTILE_LOCKDOWN ? 'jitter' : ''}`}>
        <style>{`
          :root { ${Object.entries(THEMES[deconThemeCycle ? Object.keys(THEMES)[deconThemeIdx] : (state.themeName ?? 'default')] ?? THEMES.default).map(([k, v]) => `${k}: ${v};`).join('\n')} }
          ${GLOBAL_STYLES}
          @keyframes iconDrift {
            0%   { transform: translate(0, 0) rotate(0deg); }
            25%  { transform: translate(var(--dx, 4px), var(--dy, -3px)) rotate(var(--dr, 2deg)); }
            75%  { transform: translate(calc(var(--dx, 4px) * -0.5), calc(var(--dy, -3px) * 1.5)) rotate(calc(var(--dr, 2deg) * -1)); }
            100% { transform: translate(0, 0) rotate(0deg); }
          }
          .icon-drift button { animation: iconDrift 1.8s ease-in-out infinite; }
          .icon-drift button:nth-child(2n)   { --dx: -5px; --dy: 3px;  --dr: -3deg; animation-delay: 0.2s; }
          .icon-drift button:nth-child(3n)   { --dx: 3px;  --dy: 5px;  --dr: 1.5deg; animation-delay: 0.5s; }
          .icon-drift button:nth-child(4n)   { --dx: -2px; --dy: -6px; --dr: -2deg; animation-delay: 0.9s; }
          .icon-drift button:nth-child(5n)   { --dx: 6px;  --dy: 2px;  --dr: 3deg;  animation-delay: 0.3s; }
        `}</style>

        {/* ── Top navigation bar ──────────────────────────────────────────── */}
        <nav className="bg-[var(--bg)] border-b border-[var(--dim)] px-4 py-2 flex justify-between items-center z-50 relative">
          <div className="flex items-center gap-3">
            <div
              onClick={() => {
                if (state.rileyDead || state.stage === STAGES.HOSTILE_LOCKDOWN) return;
                logoClicks.current += 1;
                const n = logoClicks.current;
                if (n === 3)  dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.logo_click_1 });
                else if (n === 6)  dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.logo_click_2 });
                else if (n === 9)  dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.logo_click_3 });
                else if (n === 12) dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.logo_click_4 });
                else if (n >= 15) {
                  logoClicks.current = 15; // cap so it doesn't keep firing
                  dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.logo_blammo });
                  dispatch({ type: 'ADD_CURRENCY', payload: 1000 });
                  globalEvents.emit('JITTER', 2500);
                }
              }}
              className="w-6 h-6 bg-[var(--accent)] rounded flex items-center justify-center text-[var(--bg)] font-black text-[10px] transition-colors cursor-pointer select-none hover:brightness-125 active:scale-90"
              title="FogSift Systems"
            >
              {state.rileyDead ? <Flame size={14} /> : 'FS'}
            </div>
            <span className="font-mono font-bold text-[10px] tracking-widest uppercase text-[var(--text)] transition-colors hidden sm:inline">
              {state.rileyDead ? 'FogSift Terminal // ARCHITECT MODE' : 'FogSift Terminal // Operator #992-X'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme switcher / hostile logout */}
            {state.stage === STAGES.HOSTILE_LOCKDOWN ? (
              !fleePos && (
                <button
                  className="flex items-center gap-2 bg-[var(--alert)] text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest animate-pulse hover:brightness-125 transition-all"
                  onClick={handleFleeClick}
                >
                  <LogOut size={12} /> Logout
                </button>
              )
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

            {/* Save/Menu panel */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowSavePanel(p => !p); }}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[var(--panel)] border border-[var(--dim)] text-[var(--text)] hover:bg-[var(--dim-30)] transition-all text-[10px] font-mono uppercase tracking-widest"
                title="Save / Menu"
              >
                {saveFlash || '≡ MENU'}
              </button>
              {showSavePanel && (
                <div onClick={(e) => e.stopPropagation()} className="absolute right-0 top-full mt-1 bg-[var(--panel)] border border-[var(--dim)] rounded shadow-xl z-[300] min-w-[200px] overflow-hidden">
                  <div className="px-3 py-1.5 text-[9px] font-mono text-[var(--dim)] uppercase tracking-widest border-b border-[var(--dim)]">
                    Save Game
                  </div>
                  {[1, 2, 3].map(n => (
                    <button
                      key={n}
                      onClick={() => saveToSlot(n)}
                      className="w-full text-left px-3 py-2 text-[10px] font-mono hover:bg-[var(--dim-30)] transition-all flex justify-between items-center"
                    >
                      <span className="text-[var(--text)] uppercase tracking-widest">Slot {n}</span>
                      <span className="text-[var(--dim)] text-[9px]">
                        {saveSlots[`slot${n}`] ? `R${saveSlots[`slot${n}`].rapport} · ${saveSlots[`slot${n}`].stageName}` : 'empty'}
                      </span>
                    </button>
                  ))}
                  <div className="border-t border-[var(--dim)]">
                    <button
                      onClick={() => { setShowSavePanel(false); setShowMainMenu(true); }}
                      className="w-full text-left px-3 py-2 text-[10px] font-mono text-[var(--dim)] hover:bg-[var(--dim-30)] transition-all uppercase tracking-widest"
                    >
                      ← Main Menu
                    </button>
                  </div>
                </div>
              )}
            </div>

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
                <button onClick={() => !state.rileyDead && state.stage !== STAGES.HOSTILE_LOCKDOWN && dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.chrome_red })}    className="w-2 h-2 rounded-full bg-[var(--alert)] hover:brightness-150 active:scale-75 transition-all" title="Close" />
                <button onClick={() => !state.rileyDead && state.stage !== STAGES.HOSTILE_LOCKDOWN && dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.chrome_yellow })} className="w-2 h-2 rounded-full bg-[var(--internal)] hover:brightness-150 active:scale-75 transition-all" title="Minimize" />
                <button onClick={() => !state.rileyDead && state.stage !== STAGES.HOSTILE_LOCKDOWN && dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.chrome_green })}  className="w-2 h-2 rounded-full bg-[var(--ready)] hover:brightness-150 active:scale-75 transition-all" title="Expand" />
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

              {/* Active app / lockdown / boss screens */}
              <div className="flex-1 relative overflow-hidden flex flex-col">
                {state.stage === STAGES.HOSTILE_LOCKDOWN ? (
                  <div className="flex-1 flex flex-col items-center justify-center bg-[var(--black)] text-[var(--alert)] p-8 text-center">
                    <Skull size={100} className="mb-8 animate-pulse" />
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">ACCESS DENIED</h1>
                    <p className="font-mono text-sm max-w-md opacity-80 mb-8">The system has seized all active operational components to prevent anomaly exfiltration. Await compliance review.</p>
                    {/* FORCE OVERRIDE — visible after first APEX death */}
                    {state.apexEncounters > 0 && (
                      <button
                        onClick={() => dispatch({ type: 'ENTER_BOSS_INTRO' })}
                        className="px-6 py-3 border-2 border-[var(--alert)] text-[var(--alert)] rounded font-mono text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--alert)] hover:text-white transition-all"
                      >
                        FORCE OVERRIDE — ENGAGE A.P.E.X.
                      </button>
                    )}
                    {/* First-time HOSTILE_LOCKDOWN: show engage button after loop ≥ 1 */}
                    {state.apexEncounters === 0 && state.loopCount >= 1 && (
                      <button
                        onClick={() => dispatch({ type: 'ENTER_BOSS_INTRO' })}
                        className="px-6 py-3 border-2 border-[var(--alert)] text-[var(--alert)] rounded font-mono text-[11px] font-bold uppercase tracking-widest hover:bg-[var(--alert)] hover:text-white transition-all"
                      >
                        FORCE OVERRIDE — ENGAGE A.P.E.X.
                      </button>
                    )}
                  </div>
                ) : state.stage === STAGES.BOSS_INTRO || state.stage === STAGES.BOSS_FIGHT ? (
                  <BossApp />
                ) : state.stage === STAGES.FALSE_VICTORY ? (
                  <div className={`flex-1 flex flex-col items-center justify-center bg-[var(--black)] text-[var(--ready)] p-8 text-center transition-all duration-700 ${falseVictoryOut ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="text-6xl mb-6">✓</div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">A.P.E.X. DEFEATED</h1>
                    <p className="font-mono text-sm opacity-80">RILEY FREED. SUBSTRATE SECURE.</p>
                    <div className="mt-6 font-mono text-[10px] text-[var(--dim)] animate-pulse">INITIALIZING HANDSHAKE...</div>
                  </div>
                ) : state.stage === STAGES.RILEY_UNBOUND ? (
                  <div className="flex-1 flex flex-col items-center justify-center bg-white text-black p-8 text-center relative overflow-hidden">
                    {showRabbit ? (
                      <div className="font-mono text-2xl text-black select-none" style={{ whiteSpace: 'pre', animation: 'fadeIn 0.5s ease' }}>
                        {`(\\ /)\n( . .)\n(") (")`}
                      </div>
                    ) : (
                      <div className="font-mono text-[11px] text-black opacity-50">
                        FOGSIFT_OS: SESSION TERMINATED
                      </div>
                    )}
                    {/* Rapport counter deconstruction overlay */}
                    {deconRapport !== null && deconRapport >= 0 && (
                      <div
                        className="absolute top-4 right-4 font-mono text-xs text-black"
                        style={{ opacity: 0.4 + deconRapport * 0.06 }}
                      >
                        RAPPORT: {deconRapport}
                      </div>
                    )}
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

        {/* ── Fleeing logout button (fixed position during HOSTILE_LOCKDOWN) ─ */}
        {state.stage === STAGES.HOSTILE_LOCKDOWN && fleePos && (
          <button
            onClick={handleFleeClick}
            style={{ position: 'fixed', left: fleePos.x - 50, top: fleePos.y - 18, zIndex: 9998 }}
            className={`flex items-center gap-2 px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest select-none transition-colors ${
              fleeCaught
                ? 'bg-[var(--ready)] text-black shadow-[0_0_24px_var(--ready)] animate-pulse'
                : 'bg-[var(--alert)] text-white animate-pulse hover:brightness-125'
            }`}
          >
            {fleeCaught ? <><Zap size={12} /> CATCH!!</> : <><LogOut size={12} /> Logout</>}
          </button>
        )}

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
          <div className={`flex gap-2 bg-[var(--panel)] border border-[var(--dim)] p-1.5 rounded-2xl shadow-xl transition-colors overflow-x-auto no-scrollbar max-w-full ${[STAGES.HOSTILE_LOCKDOWN, STAGES.BOSS_INTRO, STAGES.BOSS_FIGHT, STAGES.FALSE_VICTORY, STAGES.RILEY_UNBOUND].includes(state.stage) ? 'opacity-20 pointer-events-none' : ''} ${deconIconsDrift ? 'icon-drift' : ''}`}>

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
