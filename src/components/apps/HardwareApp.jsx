import { useState, useCallback } from 'react';
import { Cpu, Binary, Radio, Power } from 'lucide-react';
import { STAGES } from '../../constants/stages';
import { DIALOGUE_TREE } from '../../constants/dialogue';
import { globalEvents } from '../../events/EventManager';
import { useOS } from '../../context/OSContext';

// ── Solfeggio secret sequence ─────────────────────────────────────────────────
// Hints live in the Handbook (285, 528, 432) and legacy_logs (396).
// Players must calibrate all three before the final 432 sync triggers the cascade.
const SECRET_FREQS = [285, 396, 528];
const SECRET_TOLERANCE = 3;   // ±3 Hz window (1.5% of slider range — requires precision)
const TARGET_RESONANCE = 432;
const LOCK_TOLERANCE = 5;     // existing 432 Hz window

export default function HardwareApp() {
  const { state, dispatch, enqueueLog } = useOS();

  // Local UI state
  const [calibMsg, setCalibMsg] = useState(null);   // quiet confirmation after a secret sync

  // ── Derived oscilloscope values ───────────────────────────────────────────
  const resonanceDelta = Math.abs(state.resonance - TARGET_RESONANCE);
  const noise = resonanceDelta * 0.5;

  // When within tolerance of any secret freq, a faint third waveform converges
  const nearestSecretDelta = Math.min(...SECRET_FREQS.map(f => Math.abs(state.resonance - f)));
  const nearSecret = nearestSecretDelta <= SECRET_TOLERANCE;
  // The secret path only shows when near; amplitude drops as you approach exact
  const secretNoise = nearSecret ? nearestSecretDelta * 1.2 : 0;

  const sinePath1 = `M 0,50 Q 50,${50 - noise} 100,50 T 200,50 T 300,50 T 400,50 T 500,50`;
  const sinePath2 = `M 0,50 Q 50,${50 + noise} 100,50 T 200,50 T 300,50 T 400,50 T 500,50`;
  const secretPath = nearSecret
    ? `M 0,50 Q 50,${50 - secretNoise} 100,50 T 200,50 T 300,50 T 400,50 T 500,50`
    : null;

  // ── Parity check ──────────────────────────────────────────────────────────
  const isParity = state.bits.every((b, i) => b === state.targetBits[i]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePower = () => {
    dispatch({ type: 'ENGAGE_POWER' });
    enqueueLog([
      'SUCCESS: MAIN BREAKER CLOSED.',
      'Welcome, Operator #992-X. You are currently unauthorized for system routing.',
      'Please align the silicon logic gates to match the target parity hash.',
    ]);
  };

  const toggleBit = (idx) => dispatch({ type: 'FLIP_BIT', payload: idx });

  const handleDiagnosticPort = () => dispatch({ type: 'TRIGGER_EGG', payload: 'diagnostic_port' });

  const showCalibMsg = useCallback((msg) => {
    setCalibMsg(msg);
    setTimeout(() => setCalibMsg(null), 3000);
  }, []);

  const handleResonance = () => {
    // ── Secret freq check (first priority) ────────────────────────────────
    const hitSecret = SECRET_FREQS.find(
      f => Math.abs(state.resonance - f) <= SECRET_TOLERANCE && !state.calibratedFreqs.includes(f)
    );

    if (hitSecret) {
      dispatch({ type: 'CALIBRATE_FREQ', payload: hitSecret });
      enqueueLog(`OSCILLATOR LOG: ${hitSecret} Hz — anomalous substrate harmonic detected. Response logged.`);
      showCalibMsg(`${hitSecret} Hz`);
      return;   // don't fall through to 432 check this sync
    }

    // ── Standard 432 Hz check ─────────────────────────────────────────────
    if (Math.abs(state.resonance - TARGET_RESONANCE) < LOCK_TOLERANCE) {
      // If all three secret freqs have been calibrated, trigger cascade
      const allCalibrated = SECRET_FREQS.every(f => state.calibratedFreqs.includes(f));
      if (allCalibrated && !state.ariaRevealed) {
        dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.resonance_cascade });
        if (state.chatMode === 'closed') dispatch({ type: 'SET_CHAT_MODE', payload: 'sidebar' });
      }

      dispatch({ type: 'ACHIEVE_RESONANCE' });
      enqueueLog('SUCCESS: OSCILLATOR SYNCHRONIZED. BIOMETRIC HANDSHAKE REQUIRED.');
      dispatch({ type: 'SET_ACTIVE_APP', payload: 'HANDSHAKE' });

      if (state.rapport >= 5 && !state.toolsFound?.includes('resonance_key')) {
        dispatch({ type: 'FIND_TOOL', payload: 'resonance_key' });
      }
    } else {
      enqueueLog('ERROR: RESONANCE MISMATCH. Ensure frequency is exactly 432 Hz.');
      globalEvents.emit('JITTER', 300);
    }
  };

  // ── Disabled condition: interactive through HOSTILE_LOCKDOWN; locked at boss+ ─
  const syncDisabled = state.stage < STAGES.RESONANCE || state.stage >= STAGES.BOSS_INTRO;

  // ── Calibration dots: only appear after player has found at least one ────
  const calibFound = state.calibratedFreqs.length;
  const showDots = calibFound > 0;

  return (
    <div className="h-full bg-[var(--panel)] p-6 overflow-y-auto space-y-8 relative">
      <div className="absolute inset-0 crt-bg opacity-10 pointer-events-none" />

      {/* Header */}
      <div className="border-b-2 border-[var(--dim)] pb-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <Cpu className="text-[var(--accent)]" />
          <h2 className="text-xl font-black uppercase text-[var(--text-strong)] tracking-widest">Hardware Layer</h2>
        </div>
        {state.powerOn && (
          <button
            onClick={handleDiagnosticPort}
            className="w-4 h-4 rounded-full border-2 border-[var(--alert)] bg-[var(--alert-dim)] hover:bg-[var(--alert)] transition-colors cursor-crosshair"
            title="Diagnostic Port"
          />
        )}
      </div>

      {/* Power Off State */}
      {!state.powerOn ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[var(--alert-dim)] border-2 border-[var(--alert)] rounded-xl relative z-10">
          <Power size={48} className="text-[var(--alert)] mb-4 animate-pulse" />
          <p className="text-[10px] uppercase font-mono mb-6 text-center opacity-80">Workstation is drawing 0.00 Amps.</p>
          <button
            onClick={handlePower}
            className="px-8 py-4 bg-[var(--alert)] text-white font-black uppercase tracking-widest rounded shadow-[var(--shadow-alert-md)] hover:scale-105 active:scale-95 transition-all"
          >
            Engage Main Breaker
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-8 relative z-10">

          {/* Silicon Logic Register */}
          <div className="bg-[var(--bg)] border-2 border-[var(--dim)] p-6 rounded-xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Binary className="text-[var(--accentLight)]" size={18} />
                <h3 className="font-bold uppercase text-sm tracking-widest">Silicon Logic Register</h3>
              </div>
              <div className="px-3 py-1 bg-[var(--black)] rounded text-[10px] font-mono text-[var(--dim)] uppercase border border-[var(--dim)]">
                Status:{' '}
                {isParity
                  ? <span className="text-[var(--ready)]">Aligned</span>
                  : <span className="text-[var(--alert)]">Desync</span>}
              </div>
            </div>

            {/* Target hash */}
            <div className="flex justify-between items-center bg-[var(--black)] border border-[var(--dim)] rounded px-4 py-3 mb-6 relative">
              <div className="absolute inset-0 border border-[var(--accent)] opacity-20 pointer-events-none rounded" />
              <span className="text-[10px] font-mono text-[var(--dim)] uppercase tracking-widest">Target Parity Hash:</span>
              <span className="text-sm font-mono font-bold text-[var(--accentLight)] tracking-[0.5em]">{state.targetBits.join('')}</span>
            </div>

            {/* Bit switches */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                <svg width="100%" height="100%">
                  <path d="M0,50 Q150,0 300,50 T600,50" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5 5" />
                </svg>
              </div>
              {state.bits.map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-3 z-10">
                  <span className="text-[9px] font-mono text-[var(--dim)]">BIT_0{i}</span>
                  <button
                    onClick={() => toggleBit(i)}
                    className={`w-full h-16 md:h-24 rounded-md border-2 transition-all flex items-end justify-center pb-2 ${
                      b === 1
                        ? 'bg-[var(--ready-20)] border-[var(--ready)] text-[var(--ready)] toggle-active'
                        : 'bg-[var(--black)] border-[var(--dim)] text-[var(--dim)] toggle-switch items-start pt-2'
                    }`}
                  >
                    <div className={`w-3 h-1 rounded-full ${b === 1 ? 'bg-[var(--ready)] shadow-[0_0_8px_var(--ready)]' : 'bg-[var(--dim)]'}`} />
                  </button>
                  <span className="font-mono text-sm font-black">{b}</span>
                </div>
              ))}
            </div>

            {/* Output bus trace */}
            <div className="mt-8 pt-6 border-t border-[var(--dim)] relative">
              <div className="text-[10px] uppercase font-bold tracking-widest text-[var(--dim)] mb-4">Output Bus Connection</div>
              <svg className="w-full h-8 overflow-visible">
                <path
                  d="M 0,16 L 100,16 L 120,0 L 200,0 L 220,16 L 1000,16"
                  fill="none"
                  stroke={isParity ? 'var(--ready)' : 'var(--dim)'}
                  strokeWidth="2"
                  className={isParity ? 'trace-glow' : ''}
                />
                <circle cx="0"    cy="16" r="4" fill={isParity ? 'var(--ready)' : 'var(--dim)'} />
                <circle cx="1000" cy="16" r="4" fill={isParity ? 'var(--ready)' : 'var(--dim)'} />
              </svg>
            </div>
          </div>

          {/* Resonance Tuner */}
          {state.stage >= STAGES.RESONANCE && (
            <div className="bg-[var(--res-panel)] border-2 border-[var(--res-accent)] p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4 shadow-[var(--shadow-res-lg)] relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[var(--res-text)]">
                  <Radio size={18} />
                  <h3 className="font-bold uppercase text-sm tracking-widest">Quartz Oscillator</h3>
                </div>
                <div className="text-[10px] font-mono text-[var(--res-text)] bg-[var(--black)] px-2 py-1 rounded border border-[var(--res-track)]">
                  TARGET: 432 HZ
                </div>
              </div>

              {/* Oscilloscope */}
              <div className="w-full h-24 bg-[var(--black)] border-2 border-[var(--res-track)] rounded-lg mb-2 relative overflow-hidden flex items-center">
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: 'linear-gradient(var(--res-track) 1px, transparent 1px), linear-gradient(90deg, var(--res-track) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
                <div className="absolute w-full h-px bg-[var(--res-accent)] opacity-50 top-1/2" />
                <div className="absolute h-full w-px bg-[var(--res-accent)] opacity-50 left-1/2" />
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  <path d={sinePath1} fill="none" stroke="var(--res-accent)" strokeWidth="2" className="transition-all duration-200" />
                  <path d={sinePath2} fill="none" stroke="var(--res-text)" strokeWidth="1" className="transition-all duration-200 opacity-60" />
                  {/* Secret freq tell: faint third path converges when near a Solfeggio harmonic */}
                  {secretPath && (
                    <path
                      d={secretPath}
                      fill="none"
                      stroke="white"
                      strokeWidth="1"
                      opacity="0.18"
                      className="transition-all duration-300"
                    />
                  )}
                </svg>
                {resonanceDelta < LOCK_TOLERANCE && (
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--ready)] font-black text-2xl tracking-widest uppercase bg-black/60 animate-pulse">
                    LOCK ACHIEVED
                  </div>
                )}
              </div>

              {/* Calibration dots — only visible after player finds first secret freq */}
              {showDots && (
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-[8px] font-mono text-[var(--dim)] uppercase tracking-widest opacity-60">HARMONIC</span>
                  {SECRET_FREQS.map((f) => (
                    <span
                      key={f}
                      className={`text-[10px] transition-colors duration-500 ${
                        state.calibratedFreqs.includes(f) ? 'text-[var(--res-accent)]' : 'text-[var(--dim)] opacity-40'
                      }`}
                    >
                      {state.calibratedFreqs.includes(f) ? '●' : '○'}
                    </span>
                  ))}
                  {SECRET_FREQS.every(f => state.calibratedFreqs.includes(f)) && (
                    <span className="text-[8px] font-mono text-[var(--res-accent)] uppercase tracking-widest opacity-80 ml-1">SEQUENCE COMPLETE</span>
                  )}
                </div>
              )}

              {/* Quiet calibration confirmation */}
              {calibMsg && (
                <div className="text-[9px] font-mono text-center text-[var(--dim)] mb-2 transition-opacity">
                  OSCILLATOR LOG: {calibMsg} — substrate harmonic response logged.
                </div>
              )}

              <div className="text-5xl font-mono text-center mb-6 text-[var(--res-text)] tracking-tighter">
                {state.resonance} <span className="text-xl text-[var(--res-text)]">Hz</span>
              </div>
              <input
                type="range" min="200" max="600" step="1" value={state.resonance}
                onChange={e => dispatch({ type: 'SET_RESONANCE', payload: Number(e.target.value) })}
                className="fogsift-slider mb-8 relative z-10"
              />
              <button
                onClick={handleResonance}
                disabled={syncDisabled}
                className="w-full py-4 bg-[var(--res-accent)] text-white font-black uppercase tracking-widest rounded hover:bg-[var(--res-text)] transition-colors disabled:opacity-50 relative z-10 shadow-lg"
              >
                Sync Frequency
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
