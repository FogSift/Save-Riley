import { useEffect, useRef } from 'react';
import { Terminal, X } from 'lucide-react';
import { useOS } from '../context/OSContext';

export default function TerminalApp({ isDrawer }) {
  const { state, dispatch } = useOS();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [state.logs]);

  return (
    <div className={`h-full flex flex-col bg-[var(--bg)] border-r-2 border-[var(--accent)] relative ${isDrawer ? 'w-full' : ''}`}>
      <div className="bg-[var(--panel)] border-b-2 border-[var(--accent)] p-3 flex justify-between items-center z-10">
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

      <div
        ref={scrollRef}
        className="flex-1 p-4 font-mono text-[11px] overflow-y-auto space-y-3 text-[var(--text)] relative no-scrollbar"
      >
        <div className="absolute inset-0 scanline opacity-10 pointer-events-none" />
        {state.logs.map((log, i) => (
          <div key={i} className="relative z-10 flex gap-3 leading-relaxed">
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
      </div>
    </div>
  );
}
