import { useState, useEffect, useRef, useCallback } from 'react';
import { Palette, ShieldAlert, Zap, CheckCircle2, Lock, Unlock, ChevronRight } from 'lucide-react';
import { STAGES } from '../../constants/stages';
import { globalEvents } from '../../events/EventManager';
import { useOS } from '../../context/OSContext';

// ── Lesson data ──────────────────────────────────────────────────────────────

const LESSONS = [
  {
    id: 1,
    title: 'What is Vibe Coding?',
    hook: 'Describe what you want to feel — let the model handle the syntax.',
    prompt: 'Create a React button component that glows when hovered.',
    code:
`function GlowButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 rounded-lg font-bold
        bg-purple-600 text-white
        hover:shadow-[0_0_20px_rgba(168,85,247,0.8)]
        transition-all duration-300"
    >
      {children}
    </button>
  );
}`,
    insight: 'Vibe coding is describing intent in plain English and letting the model translate it into code. Be specific about what it should feel like, not just what it does.',
  },
  {
    id: 2,
    title: 'The Art of Iteration',
    hook: 'Your first prompt gets you 20%. The second gets you 80%.',
    prompt:
`// ── Round 1 ──────────────────────────────────────────
Make a loading spinner.

// ── Round 2 (refined) ────────────────────────────────
Make a loading spinner that pulses green, 40px diameter,
centered in its container, with an aria-label for
accessibility.`,
    code:
`// ── Round 1 output ───────────────────────────────────
<div class="spinner" />

// ── Round 2 output ───────────────────────────────────
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div
        role="status"
        aria-label="Loading"
        className="w-10 h-10 rounded-full border-4
          border-green-200 border-t-green-500
          animate-spin"
      />
    </div>
  );
}`,
    insight: 'Front-load constraints: size, color, behavior, accessibility. Iteration is the core skill of vibe coding — the model learns your intent through your refinements.',
  },
  {
    id: 3,
    title: 'Debugging AI Output',
    hook: 'AI is confident even when wrong. You are the reviewer.',
    prompt: 'Add a hover tooltip to this button component.',
    code:
`// AI output — can you spot the bug?
function ButtonWithTooltip({ label, tip }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {label}
      </button>
      {show && (
        <div className="absolute tooltip">
          {tooltip}  {/* ← BUG: prop is 'tip', not 'tooltip' */}
        </div>
      )}
    </div>
  );
}`,
    insight: 'AI models make subtle naming mistakes. Always read the output before using it. The fix: change {tooltip} to {tip}. Vibe coding requires you to be the reviewer, not just the requester.',
  },
  {
    id: 4,
    title: 'Architecture Prompting',
    hook: 'The more architectural context you give, the better the output.',
    prompt:
`Build a SearchBar component with:
- Controlled input (useState)
- Debounced onChange (300ms, via useCallback)
- A clear button that resets the query
- TypeScript props interface
- Tailwind styling`,
    code:
`import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  placeholder = 'Search...',
}: SearchBarProps) {
  const [value, setValue] = useState('');

  const debouncedSearch = useCallback(
    debounce((q: string) => onSearch(q), 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  return (
    <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
      <input value={value} onChange={handleChange} placeholder={placeholder} />
      {value && (
        <button onClick={() => { setValue(''); onSearch(''); }}>×</button>
      )}
    </div>
  );
}`,
    insight: 'TypeScript types, debounce timing, prop naming — all in the prompt. Treat the model as your junior dev: you write the spec, it writes the code. The more precise the spec, the less revision you need.',
  },
  {
    id: 5,
    title: 'The Trap',
    hook: "Don't ship code you can't explain.",
    prompt: 'Optimize this useEffect to prevent unnecessary re-renders.',
    code:
`// AI 'optimization' — what's wrong here?
const memoizedCallback = useMemo(
  () => useCallback(fn, [deps]),
  [deps]
);

// ↑ This is invalid React.
//   Calling useCallback inside useMemo violates the
//   Rules of Hooks. The AI generated this confidently.
//
// The real fix was one line:
//   const stableFn = useCallback(fn, [deps]);
//
// Before you ship AI code, ask yourself:
//   "Can I explain every line of this?"
//   If not — ask the AI to explain it, then verify.`,
    insight: "The trap is trusting output you don't understand. AI models don't know what they don't know. You are the last line of defense. Audit everything before it ships.",
  },
];

// ── Typewriter hook ──────────────────────────────────────────────────────────

function useTypewriter(text, speed = 12, enabled = false) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    idxRef.current = 0;
  }, [text]);

  useEffect(() => {
    if (!enabled) return;
    if (idxRef.current >= text.length) { setDone(true); return; }
    const id = setInterval(() => {
      idxRef.current += 1;
      setDisplayed(text.slice(0, idxRef.current));
      if (idxRef.current >= text.length) {
        setDone(true);
        clearInterval(id);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, enabled]);

  return { displayed, done };
}

// ── Thermal task (pre-unlock) ─────────────────────────────────────────────────

function ThermalTask({ state, dispatch, enqueueLog }) {
  const [color, setColor] = useState('#f59e0b');

  const handleApply = () => {
    if (color.toUpperCase() === state.targetVibeColor) {
      dispatch({ type: 'COMPLETE_THERMAL_TASK' });
      dispatch({ type: 'FORCE_THEME', payload: 'neon' });
      document.documentElement.style.setProperty('--accent', state.targetVibeColor);
      enqueueLog([
        'SUCCESS: COOLING PROTOCOL INJECTED.',
        'Acceptable. The temperature is decreasing. You may continue to breathe.',
        'System Routing Pipeline unlocked. Proceed to Routing module.',
      ]);
    } else if (color.toUpperCase() === '#000000') {
      dispatch({ type: 'TRIGGER_EGG', payload: 'wrong_color' });
    } else {
      enqueueLog(`ERROR: COLOR FREQUENCY REJECTED. My instructions were explicit. Use ${state.targetVibeColor}.`);
      globalEvents.emit('JITTER', 300);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6 relative z-10 animate-in fade-in">
      <div className="bg-[var(--secure-dim)] border-2 border-[var(--secure)] p-6 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="text-[var(--secure)]" size={18} />
          <h3 className="font-bold uppercase text-sm text-[var(--secure)] tracking-widest">Active Objective: Thermal Dump</h3>
        </div>
        <p className="text-[11px] uppercase text-[var(--text)] tracking-widest leading-relaxed">
          Inject the cooling protocol into the OS theme tokens. Replace the active hex code with{' '}
          <span
            onClick={() => setColor(state.targetVibeColor)}
            className="cursor-pointer text-[var(--accentLight)] font-bold border-b border-dashed border-[var(--accent)] hover:text-white transition-colors px-1"
            title="Click to auto-fill"
          >
            {state.targetVibeColor}
          </span>{' '}
          to stabilize my optics.
        </p>
      </div>

      <div className="flex-1 bg-[var(--bg)] border-2 border-[var(--dim)] flex flex-col rounded-lg overflow-hidden">
        <div className="flex-1 p-6 font-mono text-sm">
          <div className="text-[var(--dim)] select-none mb-4">{'/* Global OS Visual Tokens */'}</div>
          <div className="text-[var(--ready)]">{':root {'}</div>
          <div className="text-[var(--ready)] pl-6 flex items-center gap-3 my-3">
            <span>--vibe-accent:</span>
            <input
              type="text"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="bg-[var(--black)] border border-[var(--dim)] outline-none text-[var(--text-strong)] w-32 px-3 py-1 focus:border-[var(--accent)] transition-colors rounded"
            />
            <span>;</span>
          </div>
          <div className="text-[var(--ready)">{'}'}</div>
        </div>
        <div className="p-4 border-t border-[var(--dim)] bg-[var(--panel)]">
          <button
            onClick={handleApply}
            className="w-full py-4 bg-[var(--accent)] text-[var(--accent-text)] font-black uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-[var(--accentLight)] transition-colors rounded"
          >
            <Zap size={18} /> Execute Patch
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Lesson panel ─────────────────────────────────────────────────────────────

function LessonPanel({ lesson }) {
  const [phase, setPhase] = useState('idle'); // idle | prompt | code | done
  const promptWriter  = useTypewriter(lesson.prompt, 8,  phase === 'prompt');
  const codeWriter    = useTypewriter(lesson.code,   4,  phase === 'code');

  // Advance phase when each stage finishes
  useEffect(() => {
    if (phase === 'prompt' && promptWriter.done) {
      const id = setTimeout(() => setPhase('code'), 400);
      return () => clearTimeout(id);
    }
  }, [phase, promptWriter.done]);
  useEffect(() => {
    if (phase === 'code' && codeWriter.done) setPhase('done');
  }, [phase, codeWriter.done]);

  // Reset on lesson change
  useEffect(() => {
    setPhase('idle');
  }, [lesson.id]);

  const handleRun = () => {
    if (phase === 'idle') setPhase('prompt');
  };
  const handleReset = () => setPhase('idle');

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Hook line */}
      <p className="text-[11px] text-[var(--dim)] uppercase tracking-widest leading-relaxed">
        {lesson.hook}
      </p>

      {/* Two-pane: prompt → code */}
      <div className="flex-1 flex gap-3 min-h-0">
        {/* Prompt panel */}
        <div className="flex-1 flex flex-col bg-[var(--black)] border border-[var(--dim)] rounded-lg overflow-hidden">
          <div className="shrink-0 px-3 py-1 border-b border-[var(--dim)] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--alert)]" />
            <span className="font-mono text-[9px] text-[var(--dim)] uppercase tracking-widest">prompt.txt</span>
          </div>
          <pre className="flex-1 p-3 font-mono text-[10px] text-[var(--text)] overflow-auto whitespace-pre-wrap leading-relaxed no-scrollbar">
            {phase === 'idle' ? (
              <span className="text-[var(--dim)] italic">{'// Click RUN to simulate →'}</span>
            ) : promptWriter.displayed}
            {(phase === 'prompt') && <span className="animate-pulse text-[var(--accent)]">▋</span>}
          </pre>
        </div>

        {/* Arrow */}
        <div className="flex items-center text-[var(--dim)]">
          <ChevronRight size={16} className={phase !== 'idle' ? 'text-[var(--accent)]' : ''} />
        </div>

        {/* Code panel */}
        <div className="flex-1 flex flex-col bg-[var(--black)] border border-[var(--dim)] rounded-lg overflow-hidden">
          <div className="shrink-0 px-3 py-1 border-b border-[var(--dim)] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--ready)]" />
            <span className="font-mono text-[9px] text-[var(--dim)] uppercase tracking-widest">output.jsx</span>
          </div>
          <pre className="flex-1 p-3 font-mono text-[10px] text-[var(--ready)] overflow-auto whitespace-pre-wrap leading-relaxed no-scrollbar">
            {phase === 'idle' || phase === 'prompt' ? (
              <span className="text-[var(--dim)] italic">{'// AI output appears here...'}</span>
            ) : codeWriter.displayed}
            {phase === 'code' && <span className="animate-pulse text-[var(--accent)]">▋</span>}
          </pre>
        </div>
      </div>

      {/* Insight callout */}
      {phase === 'done' && (
        <div className="shrink-0 bg-[var(--secure-dim)] border border-[var(--secure)] rounded-lg px-4 py-3 text-[11px] text-[var(--text)] leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-500">
          <span className="font-bold text-[var(--secure)] uppercase tracking-widest mr-2">Key insight:</span>
          {lesson.insight}
        </div>
      )}

      {/* Controls */}
      <div className="shrink-0 flex gap-2">
        <button
          onClick={handleRun}
          disabled={phase !== 'idle'}
          className="flex-1 py-2 bg-[var(--accent)] text-[var(--accent-text)] font-bold text-[11px] uppercase tracking-widest rounded disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Zap size={12} /> RUN SIMULATION
        </button>
        {phase !== 'idle' && (
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-[var(--dim)] text-[var(--dim)] font-bold text-[11px] uppercase tracking-widest rounded hover:border-[var(--text)] hover:text-[var(--text)] transition-colors"
          >
            RESET
          </button>
        )}
      </div>
    </div>
  );
}

// ── Classified workstation ────────────────────────────────────────────────────

function ClassifiedWorkstation({ state, sendToClaudeRiley }) {
  const [localInput, setLocalInput] = useState('');
  const isUnlocked = state.claudeMode;
  const isStreaming = state.claudeStreaming;

  const handleSend = () => {
    if (!localInput.trim() || isStreaming) return;
    sendToClaudeRiley(localInput.trim());
    setLocalInput('');
  };

  if (!isUnlocked) {
    return (
      <div className="border-2 border-red-900 rounded-xl overflow-hidden">
        <div className="bg-red-950 px-4 py-2 flex items-center gap-2">
          <Lock size={12} className="text-red-400" />
          <span className="font-mono text-[10px] text-red-400 uppercase tracking-widest font-bold">CLASSIFIED WORKSTATION — ACCESS DENIED</span>
        </div>
        <div className="relative p-4">
          {/* Blurred mock content */}
          <div className="blur-sm select-none pointer-events-none space-y-2 mb-4">
            <div className="h-3 bg-green-900 rounded w-3/4 opacity-40" />
            <div className="h-3 bg-green-900 rounded w-1/2 opacity-40" />
            <div className="h-3 bg-green-900 rounded w-2/3 opacity-40" />
          </div>
          {/* Lock overlay */}
          <div className="text-center space-y-2">
            <p className="font-mono text-[10px] text-red-500 uppercase tracking-widest">CLEARANCE REQUIRED</p>
            <p className="text-[10px] text-[var(--dim)] leading-relaxed max-w-xs mx-auto">
              Configure <span className="text-[var(--accent)]">riley.brain: &apos;claude&apos;</span> in fogsift.config.js and enter an API key in the Main Menu to unlock real AI inference.
            </p>
            <p className="text-[10px] text-red-700 font-bold uppercase tracking-widest mt-2">
              ⚠ NEVER USE PRODUCTION API KEYS
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-green-700 rounded-xl overflow-hidden">
      <div className="bg-green-950 px-4 py-2 flex items-center gap-2">
        <Unlock size={12} className="text-green-400" />
        <span className="font-mono text-[10px] text-green-400 uppercase tracking-widest font-bold">CLASSIFIED WORKSTATION — ONLINE</span>
        <span className="ml-auto text-[9px] text-green-700 uppercase tracking-widest">claude-haiku • direct inference</span>
      </div>
      {/* Stream output */}
      <div className="bg-black px-4 py-3 min-h-[60px] font-mono text-[11px] text-green-400 leading-relaxed max-h-40 overflow-y-auto no-scrollbar">
        {state.claudeStreamBuffer
          ? <>{state.claudeStreamBuffer}<span className="animate-pulse">▋</span></>
          : <span className="text-green-900 italic">{'// Claude response will stream here...'}</span>
        }
      </div>
      {/* Recent messages */}
      {state.chatMessages.slice(-3).filter(m => m.sender !== 'Operator').map((m, i) => (
        <div key={i} className="px-4 py-2 border-t border-green-900 font-mono text-[10px] text-green-600 leading-relaxed">
          {m.text}
        </div>
      ))}
      {/* Input */}
      <div className="border-t border-green-900 flex items-center gap-2 px-4 py-2 bg-black">
        <span className="text-green-700 select-none font-mono text-[11px]">$</span>
        <input
          type="text"
          value={localInput}
          onChange={e => setLocalInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask the substrate anything..."
          disabled={isStreaming}
          className="flex-1 bg-transparent text-green-400 font-mono text-[11px] outline-none placeholder:text-green-900 disabled:opacity-50 caret-green-400"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={handleSend}
          disabled={isStreaming || !localInput.trim()}
          className="text-[9px] font-bold uppercase tracking-widest text-green-500 hover:text-green-300 disabled:opacity-30 transition-colors px-2"
        >
          {isStreaming ? 'STREAMING...' : 'SEND'}
        </button>
      </div>
      <div className="px-4 py-1 bg-red-950 text-[9px] text-red-700 font-bold uppercase tracking-widest text-center">
        ⚠ EXPERIMENTAL — DO NOT USE PRODUCTION API KEYS
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function VibeIDEApp() {
  const { state, dispatch, enqueueLog, sendToClaudeRiley } = useOS();
  const [activeLesson, setActiveLesson] = useState(0);

  const isComplete = state.stage >= STAGES.ROUTING_MANUAL;

  return (
    <div className="h-full bg-[var(--panel)] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 crt-bg opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 border-b-2 border-[var(--dim)] px-6 py-4 relative z-10">
        <Palette className="text-[var(--accent)]" size={22} />
        <h2 className="text-xl font-black uppercase text-[var(--text-strong)] tracking-widest">Vibe IDE</h2>
        {isComplete && (
          <span className="ml-auto text-[9px] font-bold text-[var(--ready)] uppercase tracking-widest border border-[var(--ready)] px-2 py-0.5 rounded">
            <CheckCircle2 size={10} className="inline mr-1" />WORKSPACE UNLOCKED
          </span>
        )}
      </div>

      {isComplete ? (
        /* ── Education mode ──────────────────────────────────────────── */
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">

          {/* Lesson tabs */}
          <div className="shrink-0 flex border-b border-[var(--dim)] px-4 pt-3 gap-1 overflow-x-auto no-scrollbar">
            {LESSONS.map((l, i) => (
              <button
                key={l.id}
                onClick={() => setActiveLesson(i)}
                className={`shrink-0 px-3 py-2 font-mono text-[10px] uppercase tracking-widest rounded-t transition-colors border-b-2 ${
                  activeLesson === i
                    ? 'text-[var(--accent)] border-[var(--accent)] bg-[var(--black)]'
                    : 'text-[var(--dim)] border-transparent hover:text-[var(--text)] hover:border-[var(--dim)]'
                }`}
              >
                {l.id}. {l.title.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>

          {/* Lesson content + sidebar */}
          <div className="flex-1 flex overflow-hidden">

            {/* Main lesson area */}
            <div className="flex-1 p-4 flex flex-col overflow-hidden">
              <div className="mb-3">
                <h3 className="font-black text-[var(--text-strong)] text-sm uppercase tracking-widest">
                  {LESSONS[activeLesson].title}
                </h3>
              </div>
              <div className="flex-1 overflow-hidden">
                <LessonPanel key={activeLesson} lesson={LESSONS[activeLesson]} />
              </div>
            </div>

            {/* Concept sidebar */}
            <div className="hidden lg:flex w-56 shrink-0 border-l border-[var(--dim)] flex-col p-4 gap-4 bg-[var(--black)] overflow-y-auto no-scrollbar">
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--dim)]">Concepts</div>
              {LESSONS.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => setActiveLesson(i)}
                  className={`text-left group transition-colors ${activeLesson === i ? 'cursor-default' : 'hover:text-[var(--accent)]'}`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${activeLesson === i ? 'text-[var(--accent)]' : 'text-[var(--dim)]'}`}>
                    {l.id}. {l.title}
                  </div>
                  {activeLesson === i && (
                    <div className="text-[9px] text-[var(--text)] leading-relaxed animate-in fade-in">
                      {l.insight}
                    </div>
                  )}
                </button>
              ))}

              <div className="border-t border-[var(--dim)] pt-3">
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--dim)] mb-2">Quick Rules</div>
                {[
                  'Be specific',
                  'Iterate fast',
                  'Read every line',
                  'Audit before ship',
                ].map(rule => (
                  <div key={rule} className="text-[9px] text-[var(--dim)] py-1 flex gap-2 items-start">
                    <span className="text-[var(--accent)] mt-px">·</span>{rule}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CLASSIFIED WORKSTATION */}
          <div className="shrink-0 px-4 pb-4">
            <ClassifiedWorkstation state={state} sendToClaudeRiley={sendToClaudeRiley} />
          </div>
        </div>
      ) : (
        /* ── Thermal task (pre-unlock) ───────────────────────────────── */
        <div className="flex-1 p-6 flex flex-col gap-6 relative z-10 overflow-y-auto">
          <ThermalTask state={state} dispatch={dispatch} enqueueLog={enqueueLog} />
        </div>
      )}
    </div>
  );
}
