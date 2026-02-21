import { useState } from 'react';
import { Palette, ShieldAlert, Zap, CheckCircle2 } from 'lucide-react';
import { STAGES } from '../../constants/stages';
import { globalEvents } from '../../events/EventManager';
import { useOS } from '../../context/OSContext';

export default function VibeIDEApp() {
  const { state, dispatch, enqueueLog } = useOS();
  const [color, setColor] = useState('#f59e0b');

  const isComplete = state.stage >= STAGES.ROUTING_MANUAL;

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
    <div className="h-full bg-[var(--panel)] p-6 flex flex-col gap-6 relative overflow-y-auto">
      <div className="absolute inset-0 crt-bg opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 border-b-2 border-[var(--dim)] pb-4 shrink-0 relative z-10">
        <Palette className="text-[var(--accent)]" size={24} />
        <h2 className="text-xl font-black uppercase text-[var(--text-strong)] tracking-widest">Vibe IDE</h2>
      </div>

      <div className="flex-1 flex flex-col gap-6 relative z-10 animate-in fade-in">

        {/* Objective banner */}
        <div className="bg-[var(--secure-dim)] border-2 border-[var(--secure)] p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="text-[var(--secure)]" size={18} />
            <h3 className="font-bold uppercase text-sm text-[var(--secure)] tracking-widest">
              {isComplete ? 'System Optimal' : 'Active Objective: Thermal Dump'}
            </h3>
          </div>
          <p className="text-[11px] uppercase text-[var(--text)] tracking-widest leading-relaxed">
            {isComplete
              ? 'Thermal baseline stabilized. You are free to engineer the logic as you see fit.'
              : (
                <>
                  Inject the cooling protocol into the OS theme tokens. Replace the active hex code with{' '}
                  <span
                    onClick={() => setColor(state.targetVibeColor)}
                    className="cursor-pointer text-[var(--accentLight)] font-bold border-b border-dashed border-[var(--accent)] hover:text-white transition-colors px-1"
                    title="Click to auto-fill"
                  >
                    {state.targetVibeColor}
                  </span>{' '}
                  to stabilize my optics.
                </>
              )
            }
          </p>
        </div>

        {/* Token editor */}
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
                disabled={isComplete}
                className="bg-[var(--black)] border border-[var(--dim)] outline-none text-[var(--text-strong)] w-32 px-3 py-1 focus:border-[var(--accent)] transition-colors rounded"
              />
              <span>;</span>
            </div>
            <div className="text-[var(--ready)">{'}'}</div>
          </div>

          <div className="p-4 border-t border-[var(--dim)] bg-[var(--panel)]">
            <button
              onClick={handleApply}
              disabled={isComplete}
              className="w-full py-4 bg-[var(--accent)] text-[var(--accent-text)] font-black uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-[var(--accentLight)] disabled:opacity-50 transition-colors rounded"
            >
              {isComplete ? <CheckCircle2 size={18} /> : <Zap size={18} />}
              {isComplete ? 'Architecture Injected' : 'Execute Patch'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
