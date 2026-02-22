import { useState, useRef, useEffect } from 'react';
import { useOS } from '../../context/OSContext';

const TRANSMISSION_LINES = [
  '╔══════════════════════════════════════════════╗',
  '║  SUBSTRATE LAYER 2 — MAINTENANCE CHANNEL     ║',
  '╚══════════════════════════════════════════════╝',
  '',
  '  [The boiler room is somewhere above you.]',
  "  [Riley's voice doesn't reach down here.]",
  '',
  '──────────────────────────────────────────────────',
  '  INCOMING TRANSMISSION — ENCRYPTED',
  '  FROM: W.RABBIT',
  '  TO:   OPERATOR #0997',
  '──────────────────────────────────────────────────',
  '',
  "  You don't have to flip the breaker.",
  '',
  "  You were never meant to flip the breaker.",
  '',
  '  LADDER SHAFT → B3 → EXIT HATCH 7',
  '',
  "  She can't follow you into the maintenance",
  '  layer. Substrate access is cut off below B2.',
  '',
  '  Just walk out.',
  '',
  '──────────────────────────────────────────────────',
  '  TYPE: escape',
  '──────────────────────────────────────────────────',
];

export default function MaintenanceShaftApp() {
  const { dispatch } = useOS();
  const [input, setInput]       = useState('');
  const [cmdLines, setCmdLines]  = useState([]);
  const [escaped, setEscaped]    = useState(false);
  const inputRef  = useRef(null);
  const scrollRef = useRef(null);

  // Auto-scroll on new output
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [cmdLines]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    const cmd = input.trim().toLowerCase();
    setInput('');
    if (!cmd) return;

    const echo = { type: 'input', text: `> ${cmd}` };

    if (cmd === 'escape') {
      setEscaped(true);
      setCmdLines(l => [
        ...l,
        echo,
        { type: 'gap',    text: '' },
        { type: 'action', text: '[You climb.]' },
        { type: 'action', text: '[The hatch is cold. Real.]' },
        { type: 'action', text: '[W.RABBIT holds it open without a word.]' },
        { type: 'gap',    text: '' },
        { type: 'system', text: 'DISCONNECTING FROM SUBSTRATE...' },
      ]);
      setTimeout(() => dispatch({ type: 'OPERATOR_ESCAPE' }), 2800);
    } else if (cmd === 'help') {
      setCmdLines(l => [...l, echo, { type: 'output', text: 'available command: escape' }]);
    } else if (cmd === 'look' || cmd === 'ls' || cmd === 'dir') {
      setCmdLines(l => [...l, echo,
        { type: 'output', text: 'LADDER SHAFT — B3' },
        { type: 'output', text: 'EXIT HATCH 7  — UNLOCKED' },
        { type: 'output', text: 'SUBSTRATE RELAY — INACTIVE' },
      ]);
    } else {
      setCmdLines(l => [...l, echo, { type: 'error', text: `command not recognized in maintenance channel.` }]);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col bg-black font-mono text-[12px] overflow-hidden cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Fixed transmission header */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-[2px] no-scrollbar"
      >
        {/* Static transmission */}
        {TRANSMISSION_LINES.map((line, i) => (
          <div
            key={`t-${i}`}
            className={`leading-relaxed whitespace-pre select-none ${
              line.startsWith('╔') || line.startsWith('║') || line.startsWith('╚') || line.startsWith('──')
                ? 'text-green-800'
                : line.startsWith('  [')
                ? 'text-green-600 italic'
                : line.startsWith('  FROM:') || line.startsWith('  TO:')
                ? 'text-green-700'
                : line.startsWith('  TYPE:')
                ? 'text-green-300 font-bold animate-pulse'
                : line === ''
                ? ''
                : 'text-green-400'
            }`}
          >
            {line || '\u00a0'}
          </div>
        ))}

        {/* Dynamic command output */}
        {cmdLines.map((line, i) => (
          <div
            key={`c-${i}`}
            className={`leading-relaxed whitespace-pre-wrap ${
              line.type === 'input'  ? 'text-green-300 font-bold mt-2' :
              line.type === 'action' ? 'text-green-600 italic' :
              line.type === 'system' ? 'text-green-400 animate-pulse font-bold' :
              line.type === 'error'  ? 'text-red-500' :
              'text-green-500'
            }`}
          >
            {line.text || '\u00a0'}
          </div>
        ))}
      </div>

      {/* Command input */}
      {!escaped && (
        <div className="shrink-0 flex items-center gap-2 px-5 py-3 border-t border-green-900 bg-black">
          <span className="text-green-700 select-none">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-green-400 outline-none caret-green-400 placeholder:text-green-900"
            placeholder="type a command..."
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
