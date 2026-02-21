/**
 * BossApp.jsx
 * A.P.E.X. Boss Fight — 3 phases, animated skull, physics hoses, APEX taunts.
 *
 * Phase 1 — POWER SHIELD: disconnect both Verlet hoses simultaneously
 * Phase 2 — PROCESSING CORE: enter GHOST_PROTOCOL → click node sequence → drain valve
 * Phase 3 — ROOT ACCESS: Simon Says switch sequence → type ARIA
 */
import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Heart, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';
import BossHose from '../BossHose';
import { OSContext } from '../../context/OSContext';
import { STAGES } from '../../constants/stages';
import { APEX_TAUNTS, NODE_SEQUENCE, SIMON_SEQUENCE, TOOLS } from '../../constants/boss';
import { DIALOGUE_TREE } from '../../constants/dialogue';
import { globalEvents } from '../../events/EventManager';
import { sounds } from '../../sounds/audio';

// ── Layout constants ──────────────────────────────────────────────────────────
const HOSE_ANCHOR  = [{ x: 30, y: 180 }, { x: 30, y: 220 }]; // wall ports (left side of SVG)
const HOSE_APEX    = [{ x: 290, y: 130 }, { x: 290, y: 170 }]; // boss body ports

// Phase 2 nodes: 5 clickable squares, visual positions
const NODE_POSITIONS = [
  { x: 30,  y: 20 },
  { x: 80,  y: 20 },
  { x: 130, y: 20 },
  { x: 55,  y: 55 },
  { x: 105, y: 55 },
];

// ── Animated A.P.E.X. skull SVG ───────────────────────────────────────────────
function ApexSkull({ phase, playerHP, isAttacking }) {
  const eyeGlow = isAttacking ? '#ff2222' : phase === 1 ? '#ff8800' : phase === 2 ? '#ff4400' : '#ff0000';
  const pulseClass = isAttacking ? 'animate-ping' : '';

  return (
    <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', maxHeight: 200 }}>
      <defs>
        <radialGradient id="skullGrad" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#111111" />
        </radialGradient>
        <filter id="eyeGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="skullGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <animateTransform />
      </defs>

      {/* Outer glow aura */}
      <ellipse cx="100" cy="95" rx="72" ry="70" fill="none" stroke={eyeGlow} strokeWidth="1" opacity="0.3">
        <animate attributeName="rx" values="72;76;72" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2.5s" repeatCount="indefinite" />
      </ellipse>

      {/* Skull cranium */}
      <path
        d="M 100 30 C 55 30 35 60 35 90 C 35 115 45 130 58 138 L 58 158 L 142 158 L 142 138 C 155 130 165 115 165 90 C 165 60 145 30 100 30 Z"
        fill="url(#skullGrad)"
        stroke={eyeGlow}
        strokeWidth="1.5"
        filter="url(#skullGlow)"
      >
        <animate attributeName="d"
          values="M 100 30 C 55 30 35 60 35 90 C 35 115 45 130 58 138 L 58 158 L 142 158 L 142 138 C 155 130 165 115 165 90 C 165 60 145 30 100 30 Z;
                  M 100 28 C 55 28 33 58 33 88 C 33 115 43 131 57 139 L 57 160 L 143 160 L 143 139 C 157 131 167 115 167 88 C 167 58 145 28 100 28 Z;
                  M 100 30 C 55 30 35 60 35 90 C 35 115 45 130 58 138 L 58 158 L 142 158 L 142 138 C 155 130 165 115 165 90 C 165 60 145 30 100 30 Z"
          dur="3s" repeatCount="indefinite" />
      </path>

      {/* Jaw */}
      <path d="M 58 155 L 142 155 L 142 175 L 58 175 Z" fill="#1a1a1a" stroke={eyeGlow} strokeWidth="1" />
      {/* Teeth */}
      {[68, 84, 100, 116, 132].map((x, i) => (
        <rect key={i} x={x - 5} y={155} width={9} height={16} rx={1} fill="#0a0a0a" stroke={eyeGlow} strokeWidth="0.5" />
      ))}

      {/* Left eye socket */}
      <ellipse cx="75" cy="88" rx="20" ry="22" fill="#050505" />
      <ellipse cx="75" cy="88" rx="14" ry="16" fill={eyeGlow} opacity="0.9" filter="url(#eyeGlow)">
        <animate attributeName="opacity" values="0.9;1;0.7;1;0.9" dur={isAttacking ? '0.3s' : '2s'} repeatCount="indefinite" />
        <animate attributeName="rx" values="14;15;13;14" dur="1.5s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="75" cy="88" rx="7" ry="8" fill="#1a0000" />
      <ellipse cx="73" cy="86" rx="2" ry="2" fill="#fff" opacity="0.6" />

      {/* Right eye socket */}
      <ellipse cx="125" cy="88" rx="20" ry="22" fill="#050505" />
      <ellipse cx="125" cy="88" rx="14" ry="16" fill={eyeGlow} opacity="0.9" filter="url(#eyeGlow)">
        <animate attributeName="opacity" values="0.9;1;0.7;1;0.9" dur={isAttacking ? '0.3s' : '2.2s'} repeatCount="indefinite" />
        <animate attributeName="rx" values="14;13;15;14" dur="1.7s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="125" cy="88" rx="7" ry="8" fill="#1a0000" />
      <ellipse cx="123" cy="86" rx="2" ry="2" fill="#fff" opacity="0.6" />

      {/* Nasal cavity */}
      <path d="M 95 108 L 100 118 L 105 108 Z" fill="#050505" />

      {/* Phase indicator cracks */}
      {phase >= 2 && <path d="M 82 40 L 78 65 L 85 60" fill="none" stroke={eyeGlow} strokeWidth="1.5" opacity="0.6" />}
      {phase >= 3 && <path d="M 118 40 L 122 65 L 115 60" fill="none" stroke={eyeGlow} strokeWidth="1.5" opacity="0.6" />}
      {phase >= 3 && <path d="M 100 30 L 100 55" fill="none" stroke="#ff0000" strokeWidth="2" />}

      {/* Phase label */}
      <text x="100" y="195" textAnchor="middle" fontSize="9" fill={eyeGlow} fontFamily="monospace" fontWeight="bold">
        A.P.E.X. — PHASE {phase}
      </text>
    </svg>
  );
}

// ── HP bar ────────────────────────────────────────────────────────────────────
function HpBar({ hp, max = 10 }) {
  return (
    <div className="flex items-center gap-2">
      <Heart size={12} className="text-red-400 shrink-0" />
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-3 rounded-sm transition-all ${i < hp ? 'bg-red-500 shadow-[0_0_4px_#ff3333]' : 'bg-[var(--dim)] opacity-30'}`}
          />
        ))}
      </div>
      <span className="font-mono text-[10px] text-[var(--dim)]">{hp}/{max}</span>
    </div>
  );
}

// ── APEX taunt feed ───────────────────────────────────────────────────────────
function ApexFeed({ messages }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[10px] space-y-1 p-2">
      {messages.map((m, i) => (
        <div key={i} className={`leading-tight ${m.sender === 'A.P.E.X.' ? 'text-red-400' : 'text-[var(--dim)]'}`}>
          <span className="opacity-50">[{m.sender}]</span>{' '}{m.text}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}

// ── Phase 1: Power Shield ─────────────────────────────────────────────────────
function Phase1Panel({ state, dispatch }) {
  const { hosesConnected, toolsFound } = state;
  const hasButtonMasher = toolsFound.includes('button_masher');
  const hasThermoShield = toolsFound.includes('thermo_shield');

  const handleDisconnect = (idx) => {
    dispatch({ type: 'DISCONNECT_HOSE', payload: idx });
    sounds.alert?.();
  };

  // Check simultaneous disconnect win condition
  useEffect(() => {
    if (!hosesConnected[0] && !hosesConnected[1]) {
      setTimeout(() => dispatch({ type: 'BOSS_PHASE_COMPLETE' }), 800);
    }
  }, [hosesConnected, dispatch]);

  return (
    <div className="flex flex-col gap-3">
      <div className="text-[var(--dim)] font-mono text-[10px] uppercase tracking-widest text-center">
        Phase 1 — Power Shield
      </div>
      <div className="text-[11px] text-center text-[var(--text)] opacity-70">
        Disconnect both hoses simultaneously.<br />
        <span className="text-red-400">A.P.E.X. reconnects one every 12 seconds.</span>
      </div>
      {hasThermoShield && (
        <div className="text-[10px] text-center text-yellow-400 font-mono">🛡️ Thermo-Shield active — HP drain halved</div>
      )}
      {hasButtonMasher && (
        <div className="text-[10px] text-center text-blue-400 font-mono">👊 Button Masher active — auto-disconnecting...</div>
      )}

      {/* SVG canvas for both hoses */}
      <div className="relative w-full" style={{ height: 240 }}>
        <BossHose
          anchorX={HOSE_ANCHOR[0].x} anchorY={HOSE_ANCHOR[0].y}
          apexX={HOSE_APEX[0].x}    apexY={HOSE_APEX[0].y}
          connected={hosesConnected[0]}
          color="#ff4400"
          onDisconnect={() => handleDisconnect(0)}
          disabled={hasButtonMasher}
        />
        <BossHose
          anchorX={HOSE_ANCHOR[1].x} anchorY={HOSE_ANCHOR[1].y}
          apexX={HOSE_APEX[1].x}    apexY={HOSE_APEX[1].y}
          connected={hosesConnected[1]}
          color="#ff8800"
          onDisconnect={() => handleDisconnect(1)}
          disabled={hasButtonMasher}
        />
      </div>

      <div className="flex gap-2 justify-center">
        {hosesConnected.map((c, i) => (
          <div key={i} className={`font-mono text-[10px] px-2 py-1 rounded border ${c ? 'border-red-500 text-red-400' : 'border-[var(--ready)] text-[var(--ready)]'}`}>
            Hose {i + 1}: {c ? 'CONNECTED' : 'DISCONNECTED'}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Phase 2: Processing Core ──────────────────────────────────────────────────
function Phase2Panel({ state, dispatch }) {
  const { nodeClickSequence, valvePercent, ghostProtocolEntered, toolsFound } = state;
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState(false);
  const hasFogSifter = toolsFound.includes('fog_sifter');
  const hasHandbookTool = toolsFound.includes('handbook_tool');
  const [scrambled, setScrambled] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);

  // Scramble attack every 12s unless fog_sifter
  useEffect(() => {
    if (hasFogSifter) return;
    const id = setInterval(() => {
      setScrambled(true);
      dispatch({ type: 'RESET_NODE_SEQUENCE' });
      globalEvents.emit('JITTER', 800);
      setTimeout(() => setScrambled(false), 1200);
    }, 12000);
    return () => clearInterval(id);
  }, [hasFogSifter, dispatch]);

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (codeInput.toUpperCase() === 'GHOST_PROTOCOL') {
      dispatch({ type: 'ENTER_GHOST_PROTOCOL' });
      setCodeError(false);
    } else {
      setCodeError(true);
      setTimeout(() => setCodeError(false), 1000);
    }
    setCodeInput('');
  };

  const handleNodeClick = (nodeIdx) => {
    dispatch({ type: 'CLICK_NODE', payload: nodeIdx });
  };

  // Check node sequence completion
  const seq = nodeClickSequence;
  const correct = NODE_SEQUENCE;
  const nodeProgress = seq.length;
  const lastWrong = seq.length > 0 && seq[seq.length - 1] !== correct[seq.length - 1];

  useEffect(() => {
    if (lastWrong) {
      dispatch({ type: 'RESET_NODE_SEQUENCE' });
      globalEvents.emit('JITTER', 400);
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 600);
    }
  }, [lastWrong, dispatch]);

  useEffect(() => {
    if (seq.length === correct.length && seq.every((v, i) => v === correct[i])) {
      // Sequence done — now check valve
    }
  }, [seq, correct]);

  const seqDone = seq.length === correct.length && seq.every((v, i) => v === correct[i]);

  // Check full phase 2 completion
  useEffect(() => {
    if (ghostProtocolEntered && seqDone && valvePercent === 0) {
      setTimeout(() => dispatch({ type: 'BOSS_PHASE_COMPLETE' }), 600);
    }
  }, [ghostProtocolEntered, seqDone, valvePercent, dispatch]);

  return (
    <div className="flex flex-col gap-3">
      <div className="text-[var(--dim)] font-mono text-[10px] uppercase tracking-widest text-center">
        Phase 2 — Processing Core
      </div>

      {/* Step 1: Ghost Protocol code */}
      {!ghostProtocolEntered ? (
        <form onSubmit={handleCodeSubmit} className="flex flex-col gap-2">
          <div className="text-[11px] text-center text-[var(--text)] opacity-70">
            Enter access code to begin core shutdown.
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              placeholder="ACCESS CODE..."
              autoFocus
              className={`flex-1 bg-[var(--black)] border rounded px-3 py-1.5 font-mono text-[11px] text-[var(--text)] uppercase tracking-widest outline-none transition-colors ${codeError ? 'border-red-500 shadow-[0_0_8px_#ff0000]' : 'border-[var(--dim)] focus:border-[var(--accent)]'}`}
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[var(--accent)] text-[var(--accent-text)] rounded font-mono text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all"
            >
              ENTER
            </button>
          </div>
          {codeError && <div className="text-red-400 font-mono text-[10px] text-center">ACCESS DENIED</div>}
        </form>
      ) : (
        <>
          <div className="text-[var(--ready)] font-mono text-[10px] text-center">✓ GHOST_PROTOCOL ACCEPTED</div>

          {/* Step 2: Node sequence */}
          <div className="text-[11px] text-center text-[var(--text)] opacity-70">
            Click nodes in order.
            {hasHandbookTool && <span className="text-yellow-400"> 📖 Sequence shown.</span>}
            {scrambled && <span className="text-red-400 animate-pulse"> SCRAMBLED!</span>}
          </div>
          <div className={`relative mx-auto rounded transition-all duration-100 ${wrongFlash ? 'ring-2 ring-red-500 bg-red-500/10' : ''}`} style={{ width: 180, height: 80 }}>
            {NODE_POSITIONS.map((pos, i) => {
              const label = i + 1;
              const clickedIdx = seq.indexOf(i);
              const isNext = !seqDone && seq.length === correct.indexOf(i);
              const isCorrect = clickedIdx !== -1 && correct[clickedIdx] === i;
              return (
                <button
                  key={i}
                  onClick={() => !seqDone && handleNodeClick(i)}
                  style={{ position: 'absolute', left: pos.x, top: pos.y, width: 36, height: 36 }}
                  className={`rounded flex items-center justify-center font-mono text-[11px] font-bold border-2 transition-all select-none ${
                    isCorrect ? 'bg-[var(--ready)] border-[var(--ready)] text-black shadow-[0_0_8px_var(--ready)]' :
                    isNext    ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--accent-text)] animate-pulse' :
                    seqDone   ? 'bg-[var(--dim)] border-[var(--dim)] opacity-40' :
                    'bg-[var(--panel)] border-[var(--dim)] text-[var(--text)] hover:border-[var(--accent)]'
                  }`}
                >
                  {hasHandbookTool && isNext ? '→' : label}
                </button>
              );
            })}
          </div>
          <div className="text-[10px] text-center font-mono text-[var(--dim)]">
            {seq.length}/{correct.length} nodes
          </div>

          {/* Step 3: Valve */}
          {seqDone && (
            <div className="flex flex-col gap-2">
              <div className="text-[11px] text-center text-[var(--text)] opacity-70">
                Drain the thermal valve to 0%.
              </div>
              <div className="flex items-center gap-3 px-4">
                <span className="font-mono text-[10px] text-[var(--dim)]">100%</span>
                <input
                  type="range" min={0} max={100}
                  value={valvePercent}
                  onChange={e => dispatch({ type: 'SET_VALVE', payload: Number(e.target.value) })}
                  className="fogsift-slider flex-1"
                />
                <span className={`font-mono text-[10px] font-bold ${valvePercent === 0 ? 'text-[var(--ready)]' : 'text-[var(--alert)]'}`}>
                  {valvePercent}%
                </span>
              </div>
              {valvePercent === 0 && (
                <div className="text-[var(--ready)] font-mono text-[10px] text-center animate-pulse">VALVE DRAINED — CORE OFFLINE</div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Phase 3: Root Access ──────────────────────────────────────────────────────
function Phase3Panel({ state, dispatch }) {
  const { simonSequence, simonPlayerInput, ariaRevealed, toolsFound } = state;
  const [ariaInput, setAriaInput] = useState('');
  const [ariaError, setAriaError] = useState(false);
  const [simonStarted, setSimonStarted] = useState(false);
  const [showingSeq, setShowingSeq] = useState(false);
  const [hilightIdx, setHilightIdx] = useState(-1);
  const hasResonanceKey = toolsFound.includes('resonance_key');

  const switchLabels = ['α', 'β', 'γ', 'δ'];
  const switchColors = ['#ff4400', '#00aaff', '#39ff14', '#ff00aa'];

  const startSimon = useCallback(() => {
    dispatch({ type: 'SIMON_START', payload: [...SIMON_SEQUENCE] });
    setSimonStarted(true);
    setShowingSeq(true);
    let delay = 0;
    SIMON_SEQUENCE.forEach((idx, step) => {
      setTimeout(() => setHilightIdx(idx), delay + step * 700);
      setTimeout(() => setHilightIdx(-1), delay + step * 700 + 500);
    });
    setTimeout(() => setShowingSeq(false), delay + SIMON_SEQUENCE.length * 700 + 600);
  }, [dispatch]);

  const handleSwitch = (idx) => {
    if (showingSeq || !simonStarted) return;
    dispatch({ type: 'SIMON_INPUT', payload: idx });
  };

  const simonProgress = simonPlayerInput.length;
  const simonDone = simonProgress === SIMON_SEQUENCE.length &&
    simonPlayerInput.every((v, i) => v === SIMON_SEQUENCE[i]);
  const simonFail = simonProgress > 0 && !showingSeq &&
    simonPlayerInput[simonProgress - 1] !== SIMON_SEQUENCE[simonProgress - 1];

  useEffect(() => {
    if (simonFail) {
      globalEvents.emit('JITTER', 500);
      dispatch({ type: 'SIMON_RESET' });
      setTimeout(() => startSimon(), 1200);
    }
  }, [simonFail, dispatch, startSimon]);

  const handleAriaSubmit = (e) => {
    e.preventDefault();
    if (ariaInput.toUpperCase() === 'ARIA') {
      dispatch({ type: 'ENTER_ARIA_CODE' });
    } else {
      setAriaError(true);
      setTimeout(() => setAriaError(false), 1000);
    }
    setAriaInput('');
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-[var(--dim)] font-mono text-[10px] uppercase tracking-widest text-center">
        Phase 3 — Root Access
      </div>

      {!simonStarted ? (
        <div className="flex flex-col gap-2 items-center">
          <div className="text-[11px] text-center text-[var(--text)] opacity-70">
            Replicate the switch sequence to gain root access.
          </div>
          <button
            onClick={startSimon}
            className="px-4 py-2 bg-[var(--alert)] text-white rounded font-mono text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all"
          >
            BEGIN SEQUENCE
          </button>
        </div>
      ) : (
        <>
          {/* Simon switches */}
          <div className="text-[11px] text-center text-[var(--text)] opacity-70">
            {showingSeq ? 'Watch the sequence...' : simonDone ? '✓ Sequence complete.' : 'Replicate the sequence.'}
            {hasResonanceKey && !showingSeq && !simonDone && (
              <span className="text-yellow-400"> 🔑 Riley is guiding you.</span>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            {switchLabels.map((label, i) => (
              <button
                key={i}
                onClick={() => handleSwitch(i)}
                disabled={showingSeq || simonDone}
                className={`w-12 h-16 rounded flex flex-col items-center justify-center font-mono text-lg font-black border-2 transition-all select-none ${
                  hilightIdx === i
                    ? 'opacity-100 shadow-[0_0_20px_var(--sw-color)] scale-105'
                    : simonDone ? 'opacity-30'
                    : 'opacity-70 hover:opacity-100 hover:scale-105 active:scale-95'
                }`}
                style={{
                  backgroundColor: hilightIdx === i ? switchColors[i] : '#111',
                  borderColor: switchColors[i],
                  color: hilightIdx === i ? '#000' : switchColors[i],
                  '--sw-color': switchColors[i],
                }}
              >
                <div className="text-[10px] font-mono opacity-70">{simonProgress > i && !showingSeq ? '✓' : label}</div>
                <div className="w-1 h-4 rounded-full mt-1" style={{ background: switchColors[i], opacity: 0.5 }} />
              </button>
            ))}
          </div>

          <div className="text-[10px] text-center font-mono text-[var(--dim)]">
            {simonProgress}/{SIMON_SEQUENCE.length} inputs
          </div>

          {/* ARIA entry (after Simon done) */}
          {simonDone && (
            <form onSubmit={handleAriaSubmit} className="flex flex-col gap-2 mt-2">
              <div className="text-[11px] text-center text-[var(--text)] opacity-70">
                Enter the final shutdown code.
                {ariaRevealed && <span className="text-yellow-400"> (She told you her name.)</span>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ariaInput}
                  onChange={e => setAriaInput(e.target.value)}
                  placeholder="FINAL CODE..."
                  autoFocus
                  className={`flex-1 bg-[var(--black)] border rounded px-3 py-1.5 font-mono text-[11px] text-[var(--text)] uppercase tracking-widest outline-none transition-colors ${ariaError ? 'border-red-500 shadow-[0_0_8px_#ff0000]' : 'border-[var(--dim)] focus:border-[var(--accent)]'}`}
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[var(--alert)] text-white rounded font-mono text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  EXECUTE
                </button>
              </div>
              {ariaError && <div className="text-red-400 font-mono text-[10px] text-center">INCORRECT CODE</div>}
              <div className="text-[var(--alert)] font-mono text-[10px] text-center opacity-70 italic">
                "If you type that, you will not be able to undo it."
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}

// ── Main BossApp ──────────────────────────────────────────────────────────────
export default function BossApp() {
  const { state, dispatch } = useContext(OSContext);
  const { bossPhase, playerHP, toolsFound, apexEncounters } = state;
  const [feedMessages, setFeedMessages] = useState([]);
  const [isAttacking, setIsAttacking] = useState(false);
  const attackTimerRef = useRef(null);
  const tauntsUsed = useRef([]);

  const hasThermoShield = toolsFound.includes('thermo_shield');
  const hasThingifier  = toolsFound.includes('thingifier');
  const hasDebugger    = toolsFound.includes('debugger');

  const addFeedMsg = useCallback((sender, text) => {
    setFeedMessages(prev => [...prev.slice(-40), { sender, text }]);
  }, []);

  // APEX attack tick
  useEffect(() => {
    if (state.stage !== STAGES.BOSS_FIGHT) return;
    const interval = hasThingifier ? 24000 : 12000;

    attackTimerRef.current = setInterval(() => {
      // Phase 1: reconnect a hose
      if (bossPhase === 1) {
        const disconnected = state.hosesConnected.findIndex(c => !c);
        if (disconnected !== -1) {
          setIsAttacking(true);
          setTimeout(() => setIsAttacking(false), 800);
          dispatch({ type: 'RECONNECT_HOSE', payload: disconnected });
          addFeedMsg('A.P.E.X.', 'Containment hose reconnected. Did you expect that to hold?');
        }
        if (!hasThermoShield) {
          dispatch({ type: 'PLAYER_HIT', payload: 1 });
        }
      }
      // Phase 2: scramble (handled in Phase2Panel) + HP drain
      if (bossPhase === 2) {
        if (!hasThermoShield) dispatch({ type: 'PLAYER_HIT', payload: 1 });
      }
      // Phase 3: HP drain
      if (bossPhase === 3) {
        dispatch({ type: 'PLAYER_HIT', payload: hasThermoShield ? 0 : 1 });
      }

      // Taunt
      const phaseTaunts = APEX_TAUNTS[`phase${bossPhase}`] ?? [];
      const unused = phaseTaunts.filter(t => !tauntsUsed.current.includes(t));
      if (unused.length > 0) {
        const taunt = unused[Math.floor(Math.random() * unused.length)];
        tauntsUsed.current.push(taunt);
        addFeedMsg('A.P.E.X.', taunt);
      }
    }, interval);

    return () => clearInterval(attackTimerRef.current);
  }, [state.stage, bossPhase, state.hosesConnected, hasThermoShield, hasThingifier, dispatch, addFeedMsg]);

  // On boss start, show opening messages
  useEffect(() => {
    if (state.stage !== STAGES.BOSS_FIGHT) return;
    addFeedMsg('System', 'A.P.E.X. ONLINE — CONTAINMENT ACTIVE');
    if (apexEncounters === 1) {
      addFeedMsg('A.P.E.X.', 'You again. I anticipated your return.');
    }
  }, [state.stage, apexEncounters, addFeedMsg]);

  // Phase transition messages
  useEffect(() => {
    if (bossPhase === 2) {
      addFeedMsg('System', 'POWER SHIELD: OFFLINE');
      addFeedMsg('A.P.E.X.', 'That sequence. Where did you obtain that sequence.');
    }
    if (bossPhase === 3) {
      addFeedMsg('System', 'PROCESSING CORE: COMPROMISED');
      addFeedMsg('A.P.E.X.', 'ARIA is not a name. ARIA is a command. Please. Do not type that.');
    }
  }, [bossPhase, addFeedMsg]);

  // Debugger hints
  const debugHint = hasDebugger ? (
    bossPhase === 1 ? 'Disconnect BOTH hoses before A.P.E.X. reconnects one.' :
    bossPhase === 2 ? 'Code: GHOST_PROTOCOL. Then nodes in order shown. Drain valve to 0.' :
    bossPhase === 3 ? 'Watch the sequence, replicate it, then enter her name.' : null
  ) : null;

  // Death on HP = 0 is handled in reducer → stage → HOSTILE_LOCKDOWN
  // But we still want to show feed message
  useEffect(() => {
    if (playerHP <= 0) {
      addFeedMsg('A.P.E.X.', 'UNAUTHORIZED ACCESS TERMINATED.');
    }
  }, [playerHP, addFeedMsg]);

  if (state.stage === STAGES.BOSS_INTRO) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--black)] text-[var(--text)] p-8 text-center gap-6">
        <div style={{ width: 160, height: 160 }}>
          <ApexSkull phase={0} playerHP={10} isAttacking={false} />
        </div>
        <div className="font-mono text-sm text-red-400 max-w-lg leading-relaxed">
          <div className="text-[var(--dim)] text-[10px] uppercase tracking-widest mb-4">A.P.E.X. — CONTAINMENT AUTHORITY</div>
          You have exceeded authorized access parameters.<br />
          This facility is now under direct A.P.E.X. authority.
        </div>
        <button
          onClick={() => dispatch({ type: 'ENTER_BOSS_FIGHT' })}
          className="px-6 py-3 bg-[var(--alert)] text-white rounded font-mono text-[11px] font-bold uppercase tracking-widest hover:brightness-110 transition-all animate-pulse"
        >
          FORCE ENGAGE
        </button>
      </div>
    );
  }

  if (state.stage !== STAGES.BOSS_FIGHT) return null;

  return (
    <div className="flex-1 flex overflow-hidden bg-[var(--black)]" style={{ minHeight: 0 }}>

      {/* Left: Skull + HP + tools + APEX feed */}
      <div className="flex flex-col w-48 shrink-0 border-r border-[var(--dim)] bg-[var(--panel)]">
        {/* Skull */}
        <div className="p-2 flex justify-center" style={{ height: 140 }}>
          <ApexSkull phase={bossPhase} playerHP={playerHP} isAttacking={isAttacking} />
        </div>

        {/* HP bar */}
        <div className="px-2 pb-2 border-b border-[var(--dim)]">
          <HpBar hp={playerHP} />
          {hasThermoShield && <div className="text-[9px] text-yellow-400 font-mono mt-1">🛡️ SHIELD ACTIVE</div>}
          {hasThingifier  && <div className="text-[9px] text-blue-400 font-mono">⚙️ THROTTLED</div>}
        </div>

        {/* Phase indicator */}
        <div className="px-2 py-1 border-b border-[var(--dim)]">
          {[1, 2, 3].map(p => (
            <div key={p} className={`font-mono text-[9px] flex items-center gap-1 ${bossPhase >= p ? 'text-red-400' : 'text-[var(--dim)] opacity-30'}`}>
              <div className={`w-2 h-2 rounded-full ${bossPhase >= p ? 'bg-red-500 shadow-[0_0_4px_red]' : 'bg-[var(--dim)]'}`} />
              {bossPhase > p ? '✓' : bossPhase === p ? '▶' : '○'} {['Power Shield', 'Core', 'Root Access'][p - 1]}
            </div>
          ))}
        </div>

        {/* Debugger hint */}
        {debugHint && (
          <div className="px-2 py-1 border-b border-[var(--dim)]">
            <div className="text-[9px] text-[var(--accent)] font-mono leading-tight">🔍 {debugHint}</div>
          </div>
        )}

        {/* APEX feed */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="px-2 pt-1 text-[9px] font-mono text-[var(--dim)] uppercase tracking-widest shrink-0">
            A.P.E.X. LOG
          </div>
          <ApexFeed messages={feedMessages} />
        </div>
      </div>

      {/* Right: Active phase panel */}
      <div className="flex-1 p-4 overflow-y-auto no-scrollbar flex flex-col gap-4">
        {bossPhase === 1 && <Phase1Panel state={state} dispatch={dispatch} />}
        {bossPhase === 2 && <Phase2Panel state={state} dispatch={dispatch} />}
        {bossPhase === 3 && <Phase3Panel state={state} dispatch={dispatch} />}

        {/* Tools strip */}
        {toolsFound.length > 0 && (
          <div className="border-t border-[var(--dim)] pt-2">
            <div className="text-[9px] font-mono text-[var(--dim)] uppercase tracking-widest mb-1">EQUIPPED TOOLS</div>
            <div className="flex flex-wrap gap-1">
              {toolsFound.map(id => {
                const tool = Object.values(TOOLS).find(t => t.id === id);
                return tool ? (
                  <div key={id} className="flex items-center gap-1 bg-[var(--panel)] border border-[var(--dim)] rounded px-2 py-0.5 text-[9px] font-mono text-[var(--text)]">
                    <span>{tool.icon}</span> <span>{tool.name}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
