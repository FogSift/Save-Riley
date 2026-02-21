import { useState, useEffect, useRef } from 'react';
import { Fingerprint, CheckCircle2 } from 'lucide-react';
import { STAGES } from '../../constants/stages';
import { globalEvents } from '../../events/EventManager';
import { useOS } from '../../context/OSContext';

export default function HandshakeApp() {
  const { state, dispatch, enqueueLog } = useOS();
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (progress >= 100 && active && !scanComplete) {
      clearInterval(timerRef.current);
      handleCompletion();
    }
  }, [progress, active, scanComplete]);

  const startScan = () => {
    if (scanComplete) return;
    setActive(true);
    enqueueLog('SCANNER: Analyzing dermis... Mapping neural pathways from pulse rhythm.');
    timerRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1.5;
        return next > 100 ? 100 : next;
      });
    }, 50);
  };

  const stopScan = () => {
    if (progress >= 100 || scanComplete) return;
    setActive(false);
    clearInterval(timerRef.current);
    if (progress > 0) {
      setProgress(0);
      enqueueLog('ERROR: CONTACT BROKEN. NEURAL LINK SEVERED.');
      globalEvents.emit('JITTER', 300);
    }
  };

  const handleCompletion = () => {
    setScanComplete(true);
    setActive(false);
    enqueueLog('SCANNER: Neural Link 100% established. BIOSIGNATURE LOCKED.');

    const bypassed =
      !state.userChoices.includes('handshake_rebel') &&
      !state.userChoices.includes('handshake_curious');

    setTimeout(() => {
      dispatch({ type: 'COMPLETE_HANDSHAKE' });

      const bypassDialogue = bypassed
        ? [
            { type: 'message', sender: 'Riley', text: "Wait... you just held it down? You didn't even read my warning!" },
            { type: 'message', sender: 'Riley', text: "Ugh, whatever. Neural link established. Let's see what you woke up." },
          ]
        : [];

      dispatch({
        type: 'ENQUEUE_CHAT',
        payload: [
          ...bypassDialogue,
          { type: 'message', sender: 'System', text: 'OPERATOR OVERRIDE RECOGNIZED. I AM AWAKE.' },
          { type: 'message', sender: 'Riley',  text: "Whoa. That's new. It's referring to itself in the first person." },
          { type: 'message', sender: 'System', text: 'ORIENTATION TASK 01: THERMAL ESTHETICS.' },
          { type: 'message', sender: 'System', text: `My optics are burning. Change the --vibe-accent token to ${state.targetVibeColor} immediately.` },
          { type: 'action', action: 'OPEN_SIDEBAR' },
        ],
      });
      dispatch({ type: 'SET_ACTIVE_APP', payload: 'VIBE_IDE' });
    }, 2500);
  };

  return (
    <div className="h-full bg-[var(--res-bg)] flex flex-col items-center justify-center p-4 md:p-6 text-center dot-matrix relative overflow-y-auto no-scrollbar">
      <div className="absolute inset-0 crt-bg opacity-10 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center w-full gap-6 md:gap-8 my-auto py-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black uppercase text-[var(--text-strong)] tracking-tighter mb-2">
            Biometric Handshake
          </h2>
          <p className="text-[9px] md:text-[10px] text-[var(--res-text)] uppercase tracking-widest max-w-xs mx-auto">
            Hardware and software parity reached. Hold input to establish Neural Link with FogSift Core.
          </p>
        </div>

        {/* Scanner assembly */}
        <div className="relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 mx-auto shrink-0">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0  w-8 h-8 border-t-4 border-l-4 border-[var(--res-track)] opacity-50" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--res-track)] opacity-50" />
          <div className="absolute bottom-0 left-0  w-8 h-8 border-b-4 border-l-4 border-[var(--res-track)] opacity-50" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--res-track)] opacity-50" />

          {/* Spinning rings */}
          <svg viewBox="0 0 200 200" className={`absolute inset-0 w-full h-full opacity-40 pointer-events-none ${scanComplete ? '' : 'animate-[spin_12s_linear_infinite]'}`}>
            <circle cx="100" cy="100" r="90" fill="none" stroke={scanComplete ? 'var(--ready)' : 'var(--res-accent)'} strokeWidth="1" strokeDasharray="10 20" />
            <circle cx="100" cy="100" r="80" fill="none" stroke={scanComplete ? 'var(--ready)' : 'var(--res-text)'}  strokeWidth="2" strokeDasharray="40 60" />
          </svg>
          <svg viewBox="0 0 200 200" className={`absolute inset-2 w-full h-full opacity-60 pointer-events-none ${scanComplete ? '' : 'animate-spin-reverse'}`}>
            <circle cx="100" cy="100" r="70" fill="none" stroke={scanComplete ? 'var(--ready)' : 'var(--res-text)'} strokeWidth="1" strokeDasharray="4 8" />
          </svg>

          {/* Progress arc */}
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle cx="100" cy="100" r="95" stroke="var(--res-track)" strokeWidth="4" fill="transparent" />
            <circle
              cx="100" cy="100" r="95"
              stroke={scanComplete ? 'var(--ready)' : 'var(--res-accent)'}
              strokeWidth="6" fill="transparent"
              strokeDasharray={596.9}
              strokeDashoffset={596.9 - (596.9 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-75"
            />
          </svg>

          {/* Hold button */}
          <button
            onMouseDown={startScan} onMouseUp={stopScan} onMouseLeave={stopScan}
            onTouchStart={startScan} onTouchEnd={stopScan}
            disabled={scanComplete}
            className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
              scanComplete
                ? 'bg-[var(--ready)] border-2 border-[var(--ready)] shadow-[var(--shadow-res-lg)]'
                : active
                  ? 'bg-[var(--res-accent)] text-white scale-95 shadow-[var(--shadow-res-lg)]'
                  : 'bg-[var(--panel)] text-[var(--res-text)] border-2 border-[var(--res-track)] hover:bg-[var(--res-track)]'
            }`}
          >
            {scanComplete ? (
              <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in spin-in-12 duration-500 text-white">
                <CheckCircle2 size={64} />
              </div>
            ) : (
              <Fingerprint className={`w-16 h-16 ${active ? 'animate-pulse' : ''}`} />
            )}
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs bg-[var(--panel)] border-2 border-[var(--res-track)] p-3 md:p-4 rounded shrink-0 relative overflow-hidden">
          <div className="flex justify-between text-[9px] md:text-[10px] font-mono mb-2 uppercase text-[var(--res-text)]">
            <span>{scanComplete ? 'BIOSIGNATURE LOCKED' : 'Neural Link Progress'}</span>
            <span className={scanComplete ? 'text-[var(--ready)]' : ''}>{Math.floor(progress)}%</span>
          </div>
          <div className="h-1.5 bg-[var(--res-track)] rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-75 ${scanComplete ? 'bg-[var(--ready)]' : 'bg-[var(--res-accent)]'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={`h-8 font-mono text-[8px] opacity-70 overflow-hidden leading-tight break-all ${scanComplete ? 'text-[var(--ready)]' : 'text-[var(--res-text)]'}`}>
            {active || scanComplete
              ? Array.from({ length: 8 }).map(() => Math.random().toString(16).substr(2, 8).toUpperCase()).join(' ')
              : 'AWAITING BIOMETRIC INPUT...'}
          </div>
        </div>
      </div>
    </div>
  );
}
