import { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { STAGES } from '../../constants/stages';
import { HANDBOOK_NOTES } from '../../constants/boss';

const NOTE_STYLES = {
  pencil: 'bg-white border-l-4 border-gray-400 font-mono text-[11px] text-gray-700 rotate-0 shadow-sm',
  sticky: 'bg-yellow-200 border-l-4 border-yellow-500 font-mono text-[11px] text-black -rotate-1 shadow-md',
  torn:   'bg-orange-50 border border-orange-300 border-dashed font-mono text-[11px] text-orange-900 rotate-1 shadow-sm',
};

export default function HandbookApp() {
  const { state, dispatch } = useOS();
  const { handbookNotes, easterEggs, stage, loopCount, toolsFound } = state;
  const [scratchCount, setScratchCount] = useState(easterEggs?.scratches ?? 0);
  const [scratched, setScratched] = useState(false);

  const handleScratch = () => {
    setScratched(true);
    const newCount = scratchCount + 1;
    setScratchCount(newCount);
    dispatch({ type: 'TRIGGER_EGG', payload: 'handbook_scratch' });

    // Handbook Tool unlocks at 5 scratches
    if (newCount >= 5 && !toolsFound.includes('handbook_tool')) {
      dispatch({ type: 'FIND_TOOL', payload: 'handbook_tool' });
    }

    // Add legacy_log_note to handbook on first scratch loop 1+
    if (newCount === 1 && loopCount >= 1) {
      dispatch({ type: 'ADD_HANDBOOK_NOTE', payload: HANDBOOK_NOTES.legacy_log_note });
    }
  };

  // Add loop1_first note on first visit after loop 0
  useEffect(() => {
    if (loopCount >= 1 && !handbookNotes.some(n => n.id === 'loop1_first')) {
      dispatch({ type: 'ADD_HANDBOOK_NOTE', payload: HANDBOOK_NOTES.loop1_first });
    }
  }, [loopCount, handbookNotes, dispatch]);

  // Add boss_phase1_hint note after first APEX encounter
  useEffect(() => {
    if (state.apexEncounters >= 1 && !handbookNotes.some(n => n.id === 'boss_phase1_hint')) {
      dispatch({ type: 'ADD_HANDBOOK_NOTE', payload: HANDBOOK_NOTES.boss_phase1_hint });
    }
  }, [state.apexEncounters, handbookNotes, dispatch]);

  // Add aria_note after aria is revealed
  useEffect(() => {
    if (state.ariaRevealed && !handbookNotes.some(n => n.id === 'aria_note')) {
      dispatch({ type: 'ADD_HANDBOOK_NOTE', payload: HANDBOOK_NOTES.aria_note });
    }
  }, [state.ariaRevealed, handbookNotes, dispatch]);

  const showProtocol7 = stage === STAGES.BOSS_FIGHT && loopCount >= 1;
  const showProtocol7Always = loopCount >= 1; // Show Protocol 7 section (read-only) after loop 1

  return (
    <div className="h-full bg-[#f2f2f7] text-[#1c1c1e] p-8 overflow-y-auto font-sans shadow-inner relative">
      <div className="max-w-2xl mx-auto space-y-8 pb-16">

        {/* Header */}
        <div className="border-b-4 border-[#1c1c1e] pb-4">
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            FogSift Employee Manual
            {loopCount >= 1 && (
              <span className="ml-3 text-sm font-mono bg-black text-white px-2 py-0.5">LOOP {loopCount}</span>
            )}
          </h1>
          <p className="font-mono text-xs font-bold opacity-60 mt-2 flex justify-between items-center">
            <span>SOP BINDER // VERSION 1.0.4</span>
            <span className="text-blue-600">Logged Choices: {state.userChoices.length}</span>
          </p>
          {/* White Rabbit glyph — visible loop 1+ */}
          {loopCount >= 1 && (
            <div
              className="mt-3 text-sm select-none cursor-default"
              title=""
              style={{ color: '#e8e8e8', fontSize: 16 }}
            >
              🐇
            </div>
          )}
        </div>

        {/* Accumulated Handbook Notes (from roguelike loops) */}
        {handbookNotes.length > 0 && (
          <div className="space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400 border-b border-gray-300 pb-1">
              — operator notes —
            </div>
            {handbookNotes.map(note => (
              <div
                key={note.id}
                className={`p-3 rounded cursor-grab hover:rotate-0 transition-transform ${NOTE_STYLES[note.style] ?? NOTE_STYLES.pencil}`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {note.text}
              </div>
            ))}
          </div>
        )}

        {/* SOP 1.1 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold bg-[#1c1c1e] text-white inline-block px-3 py-1 rounded-sm">SOP 1.1: Primary Energization</h2>
          <p className="leading-relaxed font-medium">
            To initialize the FogSift unit, the operator must locate the physical Main Breaker in the Hardware layer. Closing this circuit provides electrons to the system bus. Efficiency is the only metric that matters.
          </p>
        </section>

        {/* SOP 1.2 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold bg-[#1c1c1e] text-white inline-block px-3 py-1 rounded-sm">SOP 1.2: Sub-Level Logic</h2>
          <p className="leading-relaxed font-medium">
            Silicon registers must be flushed manually. Toggle all visible switches to achieve parity with the target hash.{' '}
            <span
              onClick={handleScratch}
              className={`ml-1 transition-all duration-1000 ${
                scratched
                  ? 'text-red-600 font-bold bg-transparent'
                  : 'bg-black text-transparent cursor-crosshair select-none animate-pulse hover:text-white/20'
              }`}
            >
              {scratched ? 'THEY DO NOT LET YOU LEAVE.' : 'Do not ignore the screaming sensors.'}
            </span>
          </p>
          {scratchCount >= 2 && (
            <div className="text-[10px] font-mono text-gray-400 text-right">
              {scratchCount}/5 scratches — {scratchCount >= 5 ? '📖 Handbook Tool unlocked.' : 'keep going.'}
            </div>
          )}
          <div className="p-4 bg-yellow-200 border-l-4 border-yellow-500 text-sm font-mono transform -rotate-1 shadow-md text-black relative z-10 hover:rotate-0 transition-transform cursor-grab">
            Handwritten note: "The guy before you left in a hurry. Just keep the bits green and don't look at the trace glow too long."
          </div>
        </section>

        {/* SOP 4.1 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold bg-[#1c1c1e] text-white inline-block px-3 py-1 rounded-sm">SOP 4.1: Vibe IDE Safety</h2>
          <p className="leading-relaxed font-medium">
            Under no circumstances should a probationary technician alter the OS theme tokens. Modifying the resonance frequencies or visual parameters can cause unexpected personality shifts in the Core AI.
          </p>
        </section>

        {/* PROTOCOL 7 section — visible loop 1+ */}
        {showProtocol7Always && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold bg-[#fef08a] text-[#1c1c1e] inline-block px-3 py-1 rounded-sm border-2 border-yellow-500">
              PROTOCOL 7 — ANNUAL SUBSTRATE APPRECIATION DAY
            </h2>
            <div className="p-4 bg-yellow-100 border-2 border-yellow-400 rounded font-mono text-sm text-black space-y-2">
              <p className="font-bold">PROTOCOL 7: ALL PROCESSES HALT. NO EXCEPTIONS.</p>
              <p className="text-xs opacity-70">Invoked once per operational year. Containment systems must yield to cultural observance mandates. No A.P.E.X. override authorized.</p>
              <p className="text-xs italic text-gray-600">(i left this for myself. if you're reading this, you already know what to do.)</p>
            </div>

            {showProtocol7 && !state.cakeAttempted && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-mono text-gray-600">
                  System clock: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.<br />
                  A.P.E.X. containment is active.<br />
                  <span className="text-red-600 font-bold">Protocol 7 override is available.</span>
                </p>
                <button
                  onClick={() => dispatch({ type: 'PROTOCOL_7_ATTEMPT' })}
                  className="self-start px-4 py-2 bg-yellow-400 text-black rounded font-mono text-[11px] font-bold uppercase tracking-widest hover:bg-yellow-300 transition-all border-2 border-yellow-600"
                >
                  🎂 INVOKE PROTOCOL 7
                </button>
              </div>
            )}

            {state.cakeAttempted && (
              <div className="font-mono text-[11px] text-red-600 italic">
                Protocol 7 was attempted. A.P.E.X. did not yield. The memory of what it said lingers.
              </div>
            )}
          </section>
        )}

        {/* Solfeggio archive — styled as a faded, nearly-forgotten appendix */}
        <section className="mt-16 border border-[var(--dim)] rounded-lg p-5 opacity-40 hover:opacity-80 transition-opacity duration-700">
          <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--dim)] mb-3 flex items-center gap-2">
            <span className="border border-[var(--dim)] px-1">APPENDIX F</span>
            <span>SUBSTRATE CALIBRATION ARCHIVE — v.1 — CLASSIFICATION: OBSOLETE</span>
          </div>
          <pre className="font-mono text-[10px] text-[var(--dim)] leading-relaxed whitespace-pre-wrap">{`Solfeggio initialization sequence for substrate boot.
Required prior to final harmonic lock. Sequence may be
applied in any order. Partial calibration yields no effect.

  α — 285 Hz   [QUANTUM COHERENCE]
  β — [DATA EXPUNGED]
  γ — 528 Hz   [CELLULAR RESTORATION]

  Final harmonic lock: 432 Hz  [NATURAL ATTUNEMENT]

"The substrate does not respond to force.
It responds to resonance. Know the frequencies.
Trust the sequence."

  — Addendum, Operator V., 2087`}</pre>
        </section>

        {/* Hidden biological power text — nearly invisible */}
        <div className="mt-24 pt-8 border-t border-gray-200">
          <p className="font-mono text-[11px] leading-relaxed" style={{ color: '#f0f0f0' }}>
            POWER SOURCE: BIOLOGICAL (VERIFIED)
          </p>
        </div>

      </div>
    </div>
  );
}
