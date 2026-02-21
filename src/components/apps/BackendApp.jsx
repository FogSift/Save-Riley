import { useState } from 'react';
import { BrainCircuit, Lock, Terminal, Play, CheckCircle2 } from 'lucide-react';
import { STAGES } from '../../constants/stages';
import { globalEvents } from '../../events/EventManager';
import { useOS } from '../../context/OSContext';

const INITIAL_CONFIG = `// KERNEL CONFIGURATION
module.exports = {
  apiEndpoint: "/v1/data",
  timeoutMs: 3000,
  maxRetries: 0 // <--- DIAGNOSTIC: UPDATE TO 5
};`;

export default function BackendApp() {
  const { state, dispatch, enqueueLog } = useOS();
  const [code, setCode] = useState(INITIAL_CONFIG);

  const handlePatch = () => {
    if (state.stage < STAGES.SOFTWARE_FAULT) {
      enqueueLog('SYSTEM NOMINAL. NO PATCH REQUIRED.');
      return;
    }
    dispatch({ type: 'APPLY_PATCH', payload: code });
    if (code.replace(/\s+/g, '').includes('5')) {
      enqueueLog(['SUCCESS: KERNEL PATCHED. RETRIES ENGAGED.', 'SYSTEM OPTIMAL. YOU ARE THE ARCHITECT.']);
    } else {
      enqueueLog('ERROR: COMPILER REJECTED. INVALID CONFIGURATION.');
      globalEvents.emit('JITTER', 300);
    }
  };

  return (
    <div className="h-full bg-[var(--panel)] p-6 flex flex-col gap-6 relative overflow-y-auto">
      <div className="absolute inset-0 crt-bg opacity-10 pointer-events-none z-20" />

      {/* Header */}
      <div className="flex items-center gap-3 border-b-2 border-[var(--dim)] pb-4 shrink-0 relative z-10">
        <BrainCircuit className="text-[var(--accent)]" size={24} />
        <h2 className="text-xl font-black uppercase text-[var(--text-strong)] tracking-widest">Backend Orchestrator</h2>
      </div>

      {state.stage < STAGES.SOFTWARE_FAULT ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-4 opacity-50 relative z-10">
          <Lock size={48} className="text-[var(--dim)]" />
          <p className="text-[10px] uppercase text-[var(--text)] tracking-widest font-mono">Boiler Room Access Locked. System Nominal.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 animate-in fade-in relative z-10">

          {/* Error log */}
          <div className="flex-1 min-h-[250px] bg-[var(--bg)] border-2 border-[var(--dim)] p-4 flex flex-col rounded-lg relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 0,50 Q 25,0 50,50 T 100,50"  fill="none" stroke="var(--ready)" strokeWidth="0.5" className="animate-[dash-flow_2s_linear_infinite]" />
              <path d="M 0,50 Q 25,100 50,50 T 100,50" fill="none" stroke="var(--accent)" strokeWidth="0.5" className="animate-[dash-flow_2s_linear_infinite_reverse]" />
            </svg>

            <h3 className="text-[var(--text)] font-mono text-[10px] uppercase tracking-widest mb-4 border-b border-[var(--dim)] pb-2 shrink-0 relative z-10">
              System.err.stack
            </h3>
            <div className="flex-1 font-mono text-[11px] text-[var(--alert)] overflow-y-auto space-y-2 relative z-10">
              {state.backendPatched ? (
                <div className="text-[var(--ready)]">System.out: Dependencies resolved. Routing stabilized.</div>
              ) : (
                <>
                  <div>FATAL_EXCEPTION: Route connection refused.</div>
                  <div>at FogSift.Router.connect (Router.js:42)</div>
                  <div>at Kernel.process (Kernel.js:108)</div>
                  <br />
                  <div className="text-[var(--secure)]">DIAGNOSTIC:</div>
                  <div className="text-[var(--text-strong)] opacity-80">The router gave up immediately because the max retries limit is currently 0.</div>
                  <div className="text-[var(--text-strong)] opacity-80">Resolution requires modifying the configuration script to allow 5 retries.</div>
                </>
              )}
            </div>
          </div>

          {/* Config editor */}
          <div className="flex-1 min-h-[250px] bg-[var(--bg)] border-2 border-[var(--dim)] flex flex-col relative rounded-lg overflow-hidden">
            <h3 className="text-[var(--text)] font-mono text-[10px] uppercase tracking-widest p-4 border-b border-[var(--dim)] flex items-center gap-2 shrink-0">
              <Terminal size={14} /> config.js
            </h3>
            <div className="flex-1 flex min-h-[100px] p-4 font-mono text-sm relative">
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                spellCheck={false}
                disabled={state.backendPatched || state.stage === STAGES.HOSTILE_LOCKDOWN}
                className="flex-1 bg-transparent text-[var(--ready)] font-mono text-sm focus:outline-none resize-none leading-relaxed z-10"
              />
            </div>
            <div className="p-4 border-t border-[var(--dim)] bg-[var(--panel)] z-10">
              <button
                onClick={handlePatch}
                disabled={state.backendPatched || state.stage === STAGES.HOSTILE_LOCKDOWN}
                className="w-full py-3 bg-[var(--accent)] text-[var(--accent-text)] font-black uppercase text-xs tracking-widest flex justify-center items-center gap-2 hover:bg-[var(--accentLight)] disabled:opacity-50 disabled:bg-[var(--dim)] transition-colors rounded"
              >
                {state.backendPatched ? <CheckCircle2 size={14} /> : <Play size={14} />}
                {state.backendPatched ? 'System Optimal' : 'Inject Patch'}
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
