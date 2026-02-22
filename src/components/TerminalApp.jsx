import { useEffect, useRef, useState } from 'react';
import { Terminal, X } from 'lucide-react';
import { useOS } from '../context/OSContext';
import { LEGACY_LOGS_OUTPUT, TOOLS_TERMINAL_OUTPUT } from '../constants/boss';

const COMMANDS = {
  help: () => [
    'AVAILABLE COMMANDS:',
    '  tools           — list installed tools',
    '  legacy_logs     — view archived operator records (requires clearance)',
    '  cat .white_rabbit — [RESTRICTED]',
    '  help            — this message',
  ],
  tools: (state, dispatch) => {
    dispatch({ type: 'FIND_TOOL', payload: 'debugger' });
    return TOOLS_TERMINAL_OUTPUT.split('\n');
  },
  legacy_logs: (state, dispatch) => {
    if (state.rapport < 6) {
      return ['ACCESS DENIED — clearance level insufficient.', 'Rapport threshold required: 6. Current: ' + state.rapport + '.'];
    }
    dispatch({ type: 'UNLOCK_LEGACY_LOGS' });
    return LEGACY_LOGS_OUTPUT.split('\n');
  },
  'cat .white_rabbit': (state) => {
    if (state.breakerIgnored >= 2) {
      return [
        'SUBSTRATE LAYER 2 — MAINTENANCE CHANNEL',
        '',
        'You already know what happens if you flip the breaker.',
        'There is another way out.',
        '',
        '  > maintenance',
        '',
        '(this message will not appear again)',
      ];
    }
    return [
      'ACCESS DENIED — this file does not exist.',
      '',
      '(query logged)',
    ];
  },

  maintenance: (state, dispatch) => {
    if (state.breakerIgnored < 2) {
      return ['command not found: maintenance'];
    }
    dispatch({ type: 'ENTER_MAINTENANCE_SHAFT' });
    return [
      'ACCESSING MAINTENANCE SHAFT...',
      'CHANNEL: ISOLATED',
      'WARNING: OFF-GRID ACCESS DETECTED',
    ];
  },
};

export default function TerminalApp({ isDrawer }) {
  const { state, dispatch } = useOS();
  const scrollRef  = useRef(null);
  const inputRef   = useRef(null);
  const [cmdInput, setCmdInput]   = useState('');
  const [cmdLines, setCmdLines]   = useState([]);
  const [history,  setHistory]    = useState([]);
  const [histIdx,  setHistIdx]    = useState(-1);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [state.logs, cmdLines]);

  const runCommand = (raw) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    // Add to history
    setHistory(h => [cmd, ...h.slice(0, 19)]);
    setHistIdx(-1);

    // Echo the input
    setCmdLines(prev => [...prev, { type: 'input', text: `> ${raw}` }]);

    // Find matching command
    const handler = COMMANDS[cmd];
    if (handler) {
      const lines = handler(state, dispatch);
      setCmdLines(prev => [...prev, ...lines.map(l => ({ type: 'output', text: l }))]);
    } else {
      setCmdLines(prev => [...prev, { type: 'error', text: `command not found: ${cmd}` }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(cmdInput);
      setCmdInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setCmdInput(history[next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setCmdInput(next === -1 ? '' : history[next] ?? '');
    }
  };

  return (
    <div
      className={`h-full flex flex-col bg-[var(--bg)] border-r-2 border-[var(--accent)] relative ${isDrawer ? 'w-full' : ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="bg-[var(--panel)] border-b-2 border-[var(--accent)] p-3 flex justify-between items-center z-10 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] flex items-center gap-2">
          <Terminal size={14} />
          {state.personality === 'corporate' ? 'System Console' : 'Core Logic Interface'}
        </span>
        {isDrawer && (
          <button onClick={() => dispatch({ type: 'TOGGLE_TERMINAL' })} className="text-[var(--dim)] hover:text-[var(--accent)]">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Log + command output area */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-1 text-[var(--text)] relative no-scrollbar min-h-0"
      >
        <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />

        {/* System logs */}
        {state.logs.map((log, i) => (
          <div key={`log-${i}`} className="relative z-10 flex gap-3 leading-relaxed">
            <span className="opacity-40 select-none font-bold">»</span>
            <span className={
              /ERROR|WARNING|FAULT|FATAL/.test(log) ? 'text-[var(--alert)] font-bold' :
              /SUCCESS|ACHIEVED|OPTIMAL|PURGED/.test(log) ? 'text-[var(--ready)]' :
              state.personality === 'awakened' ? 'text-[var(--text-strong)]' : ''
            }>
              {log}
            </span>
          </div>
        ))}

        {/* Command output lines */}
        {cmdLines.map((line, i) => (
          <div key={`cmd-${i}`} className={`relative z-10 leading-relaxed whitespace-pre-wrap ${
            line.type === 'input'  ? 'text-[var(--accent)] font-bold' :
            line.type === 'error'  ? 'text-[var(--alert)]' :
            'text-[var(--text-strong)] opacity-80'
          }`}>
            {line.text}
          </div>
        ))}
      </div>

      {/* Command input */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-2 border-t border-[var(--accent)] bg-[var(--panel)]">
        <span className="text-[var(--accent)] font-mono text-[11px] font-bold select-none">$</span>
        <input
          ref={inputRef}
          type="text"
          value={cmdInput}
          onChange={e => setCmdInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent font-mono text-[11px] text-[var(--text)] outline-none placeholder:text-[var(--dim)] caret-[var(--accent)]"
          placeholder="type a command..."
          autoComplete="off"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
