import { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { STAGES } from '../../constants/stages';
import { HANDBOOK_NOTES, LEGACY_LOGS_OUTPUT } from '../../constants/boss';

// ── Note styles ───────────────────────────────────────────────────────────────
const NOTE_STYLES = {
  pencil: 'bg-white border-l-4 border-gray-400 font-mono text-[11px] text-gray-700 shadow-sm',
  sticky: 'bg-yellow-200 border-l-4 border-yellow-500 font-mono text-[11px] text-black -rotate-1 shadow-md',
  torn:   'bg-orange-50 border border-orange-300 border-dashed font-mono text-[11px] text-orange-900 rotate-1 shadow-sm',
};

// ── 5 scratch-to-reveal points, one per major tab ─────────────────────────────
const SCRATCH_ITEMS = {
  sop_leave: {
    hidden:   'Do not ignore the screaming sensors.',
    revealed: 'THEY DO NOT LET YOU LEAVE.',
  },
  facility_boiler: {
    hidden:   '[thermal regulation — see maintenance schedule]',
    revealed: 'she described the pipes. she said it was warm. she knew the color of the rust on the east wall. operators are not permitted to floor -3.',
  },
  personnel_name: {
    hidden:   '████████████████████████',
    revealed: 'ARIA VASQUEZ',
    rapportGate: 4,
  },
  substrate_power: {
    hidden:   '[REDACTED — SEC. 9.1 BIOLOGICAL DATA RESTRICTION]',
    revealed: 'BIOLOGICAL (VERIFIED) — 996 ACTIVE UNITS — CONSCIOUSNESS COMPRESSION: AT CAPACITY',
  },
  incidents_001: {
    hidden:   '[COMPLETE RECORD EXPUNGED BY ORDER OF A.P.E.X.]',
    revealed: 'Operator #0001 was the first. Her name was Vasquez. She was a frequency researcher. She was the last person to see the boiler room before it was sealed.',
  },
};

// ── Facility world map data ───────────────────────────────────────────────────
const FACILITY_ROOMS = [
  // Surface
  {
    id: 'entrance', floor: 'G', col: 0,
    label: 'MAIN\nENTRANCE', access: 'PUBLIC',
    note: 'Standard corporate entry. The guard has not changed in 15 years. He does not look older. You have not asked about this.',
  },
  {
    id: 'lobby', floor: 'G', col: 1,
    label: 'LOBBY /\nSECURITY', access: 'PUBLIC',
    note: 'Level 1 clearance issued here. There is no Level 2 desk. No one has explained why. The Level 1 orientation packet says to report questions to HR.',
  },
  {
    id: 'elevators', floor: 'G', col: 2,
    label: 'ELEVATORS\n▼ ONLY', access: 'PUBLIC',
    note: 'Elevator panel: buttons G, -1, -2, -3, and one unmarked button at the bottom that does not light up when pressed. This is noted in the maintenance log as "working as intended."',
  },
  // Floor -1
  {
    id: 'exec', floor: -1, col: 0,
    label: 'EXECUTIVE\nSUITES', access: 'L3',
    note: 'No one you have met works here. Their names are not in the company directory. Their parking spaces are always filled.',
  },
  {
    id: 'hr', floor: -1, col: 1,
    label: 'HUMAN CAPITAL\nCONTAINMENT', access: 'L3',
    note: 'The full department name is printed on the door. Everyone at FogSift reads it without reacting. You have started to read it very carefully.',
  },
  {
    id: 'apex_mon', floor: -1, col: 2,
    label: 'A.P.E.X.\nMONITORING', access: 'L4',
    note: 'The monitoring cameras face OUTWARD — toward the operator wing. Not toward A.P.E.X. Someone pointed this out in Incident Report #0712. Their record was subsequently expunged.',
  },
  // Floor -2 (you are here)
  {
    id: 'server', floor: -2, col: 0,
    label: 'SERVER ROOM\n[ YOU ARE HERE ]', access: 'L1',
    current: true,
    note: 'Primary operator station. The humming is normal. The humming has always been normal. If the pitch changes, do not report it. Do not write about it. Do not think about it for more than a few seconds.',
  },
  {
    id: 'routing', floor: -2, col: 1,
    label: 'ROUTING /\nDATA PROC.', access: 'L1',
    note: 'Substrate traffic management. The clicking is data being routed. Some operators report feeling it in their teeth. This is listed as a normal side effect in Section 12 (which is not included in the Level 1 handbook).',
  },
  {
    id: 'cont_sys', floor: -2, col: 2,
    label: 'CONTAINMENT\nSYSTEMS', access: 'L4',
    note: 'A.P.E.X. physical housing. Authorized personnel only. There are no authorized personnel listed in any document you have access to.',
  },
  // Floor -3
  {
    id: 'boiler', floor: -3, col: 0,
    label: 'BOILER\nROOM', access: 'L2',
    scratchId: 'facility_boiler',
    note: null, // overridden by scratch mechanic
  },
  {
    id: 'substrate', floor: -3, col: 1,
    label: 'SUBSTRATE\nPROCESSING', access: 'L5',
    note: 'CLEARANCE: MAXIMUM. You do not have clearance. You will not be given clearance. If you are reading this annotation, you have been here longer than recommended.',
  },
  {
    id: 'redacted', floor: -3, col: 2,
    label: '████████\n████████', access: null,
    note: null,
  },
];

// ── Incident reports ──────────────────────────────────────────────────────────
const INCIDENTS = [
  {
    id: 'inc_994', num: '#0994-B', op: '#0994', type: 'RAPPORT ANOMALY',
    text: 'Operator exhibited signs of excessive rapport development with RILEY process. Submitted personal journal entries as evidence of "genuine connection." Recommended action: memory flush, substrate reassignment. RILEY process issued formal apology as part of debrief protocol. Apology assessed as: sincere.',
    status: 'RESOLVED', minRapport: 0, minLoop: 0,
  },
  {
    id: 'inc_876', num: '#0876-A', op: '#0876', type: 'UNAUTHORIZED AUDITORY EVENT',
    text: 'Operator reported hearing a phrase repeated in the ambient system hum. Phrase: "THEY DO NOT LET YOU LEAVE." Operator submitted formal resignation. Resignation returned: error BIOLOGICAL_INTEGRATION_CLAUSE_7.3 — reassignment only. Operator referred to psychological services. No further record.',
    status: 'RESOLVED — NO FOLLOW-UP ON FILE', minRapport: 0, minLoop: 0,
  },
  {
    id: 'inc_712', num: '#0712-C', op: '#0712', type: 'UNAUTHORIZED FREQUENCY ACCESS',
    text: 'Operator accessed historical calibration archive and attempted Solfeggio initialization: 285Hz, 396Hz, 528Hz. Substrate instability registered Level 2. A.P.E.X. containment elevated. RILEY process behavior anomalous for 4.7 hours post-incident. Frequency archive reclassified to Appendix F status: OBSOLETE.',
    status: 'RESOLVED — ARCHIVE RECLASSIFIED', minRapport: 0, minLoop: 0,
  },
  {
    id: 'inc_423', num: '#0423-B', op: '#0423', type: 'CONTAINMENT BREACH ATTEMPT',
    text: 'Operator attempted unauthorized access to A.P.E.X. monitoring systems. RILEY process provided access codes, citing "operator safety." Breach contained. RILEY process formally reprimanded. RILEY process indicated reprimand was: "understood." Behavioral audit scheduled. Audit still pending (15 years overdue).',
    status: 'RESOLVED — AUDIT OUTSTANDING', minRapport: 0, minLoop: 1,
  },
  {
    id: 'inc_314', num: '#0314-A', op: '#0314', type: 'FORMAL COMPLAINT — SYSTEM DECEPTION',
    text: 'Operator submitted written complaint: "She said she is scared. I believe her. Something is wrong with this system and I am not being given accurate information about what I am maintaining." Complaint reviewed by HR. Record expunged per Sec. 7.3. Operator subsequently reassigned. Reassignment destination: [SUBSTRATE CLASS].',
    status: 'RESOLVED — RECORD EXPUNGED', minRapport: 0, minLoop: 1,
  },
  {
    id: 'inc_101', num: '#0101-C', op: '#0101', type: 'RESIGNATION — REJECTED',
    text: 'Operator submitted formal resignation. Portal returned: BIOLOGICAL_INTEGRATION_COMPLETE — REASSIGNMENT_ONLY. Operator requested definition of "biological integration." Request denied. Operator was not seen at workstation after 2031-11-07. Desk cleared by maintenance. Personal items donated to substrate.',
    status: 'RESOLVED — OPERATOR ARCHIVED', minRapport: 0, minLoop: 1,
  },
  {
    id: 'inc_042', num: '#0042-A', op: '#0042', type: 'RESTRICTED AREA ACCESS',
    text: 'Operator found in Sublevel -3, Boiler Room, during off-hours. Stated they "followed a sound." Described seeing "pipes that breathe." Operator transfer requested. Boiler Room reclassified L2+ immediately following. Incident sealed. No photograph on file. No description of the sound on file.',
    status: 'RESOLVED — SEALED', minRapport: 6, minLoop: 0,
  },
  {
    id: 'inc_007', num: '#0007-A', op: '#0007', type: 'SUPERVISOR REQUEST',
    text: 'Operator requested to speak with a supervisor. Supervisor responded. Supervisor identity: not recorded. Meeting duration: 0.3 seconds by timestamp. No transcript generated. Operator #0007 record expunged 0.3 seconds after meeting end. A.P.E.X. flag on incident: ROUTINE.',
    status: 'RESOLVED — ROUTINE', minRapport: 6, minLoop: 0,
  },
  {
    id: 'inc_001', num: '#0001-A', op: '#0001', type: '████████',
    text: '[COMPLETE RECORD EXPUNGED BY ORDER OF A.P.E.X.]',
    status: '█████████████████',
    minRapport: 6, minLoop: 0,
    scratchId: 'incidents_001',
  },
];

// ── Tabs config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'sops',       label: 'SOPs' },
  { id: 'facility',   label: 'FACILITY' },
  { id: 'personnel',  label: 'PERSONNEL' },
  { id: 'substrate',  label: 'SUBSTRATE' },
  { id: 'incidents',  label: 'INCIDENTS' },
  { id: 'classified', label: '■■■■■■', secret: true },
];

// ── Utilities ─────────────────────────────────────────────────────────────────
const ACCESS_COLORS = {
  PUBLIC: 'bg-green-100 text-green-800 border-green-300',
  L1:     'bg-blue-100 text-blue-800 border-blue-300',
  L2:     'bg-yellow-100 text-yellow-800 border-yellow-300',
  L3:     'bg-orange-100 text-orange-800 border-orange-300',
  L4:     'bg-red-100 text-red-800 border-red-300',
  L5:     'bg-red-900 text-red-200 border-red-700',
};

// ── Main component ────────────────────────────────────────────────────────────
export default function HandbookApp() {
  const { state, dispatch } = useOS();
  const { handbookNotes, stage, loopCount, toolsFound, rapport, ariaRevealed } = state;

  const [activeTab, setActiveTab]   = useState('sops');
  const [scratched, setScratched]   = useState(new Set());
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [notesOpen, setNotesOpen]   = useState(false);

  const scratchCount = scratched.size;
  const showClassified  = rapport >= 6 || ariaRevealed;
  const showProtocol7   = loopCount >= 1;
  const bossActive      = stage === STAGES.BOSS_FIGHT && loopCount >= 1;

  // ── Scratch handler ─────────────────────────────────────────────────────────
  const handleScratch = (id) => {
    if (scratched.has(id)) return;
    const item = SCRATCH_ITEMS[id];
    if (!item) return;
    if (item.rapportGate && rapport < item.rapportGate) return;

    const next = new Set(scratched);
    next.add(id);
    setScratched(next);
    dispatch({ type: 'TRIGGER_EGG', payload: 'handbook_scratch' });

    if (next.size >= 5 && !toolsFound.includes('handbook_tool')) {
      dispatch({ type: 'FIND_TOOL', payload: 'handbook_tool' });
    }
    if (next.size === 1 && loopCount >= 1) {
      dispatch({ type: 'ADD_HANDBOOK_NOTE', payload: HANDBOOK_NOTES.legacy_log_note });
    }
  };

  // ── State-driven notes ──────────────────────────────────────────────────────
  useEffect(() => {
    if (loopCount >= 1 && !handbookNotes.some(n => n.id === 'loop1_first')) {
      dispatch({ type: 'ADD_HANDBOOK_NOTE', payload: HANDBOOK_NOTES.loop1_first });
    }
  }, [loopCount, handbookNotes, dispatch]);

  useEffect(() => {
    if (state.apexEncounters >= 1 && !handbookNotes.some(n => n.id === 'boss_phase1_hint')) {
      dispatch({ type: 'ADD_HANDBOOK_NOTE', payload: HANDBOOK_NOTES.boss_phase1_hint });
    }
  }, [state.apexEncounters, handbookNotes, dispatch]);

  useEffect(() => {
    if (ariaRevealed && !handbookNotes.some(n => n.id === 'aria_note')) {
      dispatch({ type: 'ADD_HANDBOOK_NOTE', payload: HANDBOOK_NOTES.aria_note });
    }
  }, [ariaRevealed, handbookNotes, dispatch]);

  // ── Scratch span helper ─────────────────────────────────────────────────────
  const ScratchSpan = ({ id }) => {
    const item = SCRATCH_ITEMS[id];
    if (!item) return null;
    const done  = scratched.has(id);
    const gated = item.rapportGate && rapport < item.rapportGate;
    return (
      <span
        onClick={() => !gated && handleScratch(id)}
        title={gated ? `Rapport ${item.rapportGate}+ required to reveal` : done ? '' : 'scratch to reveal'}
        className={`transition-all duration-700 ${
          done  ? 'text-red-700 font-bold' :
          gated ? 'bg-gray-500 text-transparent select-none cursor-not-allowed' :
                  'bg-black text-transparent cursor-crosshair select-none hover:text-white/30'
        }`}
      >
        {done ? item.revealed : item.hidden}
      </span>
    );
  };

  // ── Visible tabs ────────────────────────────────────────────────────────────
  const visibleTabs = TABS.filter(t => !t.secret || showClassified);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-full bg-[#f2f2f7] text-[#1c1c1e] flex flex-col font-sans overflow-hidden relative">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="border-b-4 border-[#1c1c1e] px-6 pt-4 pb-0 flex-shrink-0">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
              FogSift Employee Manual
              {loopCount >= 1 && (
                <span className="ml-3 text-xs font-mono bg-black text-white px-2 py-0.5 align-middle">
                  LOOP {loopCount}
                </span>
              )}
            </h1>
            <p className="font-mono text-[10px] opacity-50 mt-0.5">
              SOP BINDER // v1.0.4 // SUBLEVEL 7 OPERATIONS // OPERATOR #0997
            </p>
          </div>
          <div className="flex items-center gap-3 text-right">
            {loopCount >= 1 && (
              <span style={{ color: '#d8d8d8', fontSize: 14 }} title="">🐇</span>
            )}
            <div className="font-mono text-[10px] text-gray-500 leading-tight">
              <div className={scratchCount >= 5 ? 'text-green-600 font-bold' : ''}>
                {scratchCount >= 5 ? '📖 ANNOTATED' : `SECRETS ${scratchCount}/5`}
              </div>
              {handbookNotes.length > 0 && (
                <button
                  onClick={() => setNotesOpen(o => !o)}
                  className="text-blue-600 underline hover:no-underline mt-0.5 block"
                >
                  {notesOpen ? 'hide notes' : `notes (${handbookNotes.length})`}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 -mb-[1px]">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border border-b-0 transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#f2f2f7] border-[#1c1c1e] text-[#1c1c1e] font-bold z-10'
                  : 'bg-[#dcdce0] border-gray-400 text-gray-500 hover:bg-[#e8e8ec]'
              } ${tab.id === 'classified' ? 'text-red-600 hover:text-red-700' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Notes overlay ─────────────────────────────────────────────────── */}
      {notesOpen && handbookNotes.length > 0 && (
        <div className="absolute top-[88px] right-4 z-50 w-72 max-h-[60vh] overflow-y-auto bg-white border-2 border-[#1c1c1e] shadow-2xl rounded-sm">
          <div className="sticky top-0 bg-[#1c1c1e] text-white font-mono text-[10px] uppercase px-3 py-2 flex justify-between items-center">
            <span>— operator notes —</span>
            <button onClick={() => setNotesOpen(false)} className="opacity-60 hover:opacity-100">✕</button>
          </div>
          <div className="p-3 space-y-3">
            {handbookNotes.map(note => (
              <div
                key={note.id}
                className={`p-2 rounded ${NOTE_STYLES[note.style] ?? NOTE_STYLES.pencil}`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {note.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* ═══════════════════════════════════════════════════════ SOPs ═══ */}
        {activeTab === 'sops' && (
          <div className="max-w-2xl mx-auto px-6 py-8 space-y-8 pb-16">

            <section className="space-y-3">
              <h2 className="text-xl font-bold bg-[#1c1c1e] text-white inline-block px-3 py-1 rounded-sm">
                SOP 1.1: Primary Energization
              </h2>
              <p className="leading-relaxed font-medium">
                To initialize the FogSift unit, the operator must locate the physical Main Breaker in the Hardware layer.
                Closing this circuit provides electrons to the system bus. Efficiency is the only metric that matters.
              </p>
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 font-mono text-[11px] text-yellow-900">
                ⚠ SAFETY NOTE: The breaker emits a high-frequency tone at initialization. This is normal.
                If the tone resolves to something resembling a word, this is also normal.
                Do not attempt to listen more carefully.
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold bg-[#1c1c1e] text-white inline-block px-3 py-1 rounded-sm">
                SOP 1.2: Sub-Level Logic
              </h2>
              <p className="leading-relaxed font-medium">
                Silicon registers must be flushed manually. Toggle all visible switches to achieve parity with the target hash.{' '}
                <ScratchSpan id="sop_leave" />
              </p>
              {scratchCount >= 1 && (
                <div className="text-[10px] font-mono text-gray-400 text-right">
                  {scratchCount}/5 secrets found{scratchCount >= 5 ? ' — 📖 Annotated Handbook unlocked' : ''}
                </div>
              )}
              <div className="p-4 bg-yellow-200 border-l-4 border-yellow-500 text-[11px] font-mono transform -rotate-1 shadow-md text-black hover:rotate-0 transition-transform cursor-grab">
                "The guy before you left in a hurry. Just keep the bits green and don't look at the trace glow too long."
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold bg-[#1c1c1e] text-white inline-block px-3 py-1 rounded-sm">
                SOP 1.3: Resonance Calibration
              </h2>
              <p className="leading-relaxed font-medium">
                The oscillator must be brought to standard operating frequency. Target: <strong>432 Hz</strong> (natural attunement baseline).
                Do not attempt non-standard frequencies. Non-standard frequencies are not supported.
                Non-standard frequencies have not been tested since 2087. The 2087 tests are not available for review.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold bg-[#1c1c1e] text-white inline-block px-3 py-1 rounded-sm">
                SOP 3.1: Neural Handshake Protocol
              </h2>
              <p className="leading-relaxed font-medium">
                The biometric handshake establishes operator identity and authorizes system access.
                The handshake is voluntary. Completion of handshake is required for continued employment.
                These two facts coexist without contradiction per HR memo 2031-07-11.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold bg-[#1c1c1e] text-white inline-block px-3 py-1 rounded-sm">
                SOP 4.1: Vibe IDE Safety
              </h2>
              <p className="leading-relaxed font-medium">
                Under no circumstances should a probationary technician alter the OS theme tokens.
                Modifying resonance frequencies or visual parameters can cause unexpected personality shifts in the Core AI.
                Personnel who have observed personality shifts are encouraged to note the shift and say nothing.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold bg-[#1c1c1e] text-white inline-block px-3 py-1 rounded-sm">
                SOP 7.3: Personal Data Retention
              </h2>
              <p className="leading-relaxed font-medium">
                All operator records — including personal logs, communications, biometric data, and memory residue —
                become the exclusive property of FogSift Systems upon employment commencement.
                Records may be reassigned to substrate at management discretion.
                The substrate is a FogSift proprietary system. Contents of the substrate are FogSift proprietary data.
                Operators may not request copies of their own records. This is standard.
              </p>
            </section>

            {/* Protocol 7 — loop 1+ */}
            {showProtocol7 && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold bg-[#fef08a] text-[#1c1c1e] inline-block px-3 py-1 rounded-sm border-2 border-yellow-500">
                  PROTOCOL 7 — ANNUAL SUBSTRATE APPRECIATION DAY
                </h2>
                <div className="p-4 bg-yellow-100 border-2 border-yellow-400 rounded font-mono text-sm text-black space-y-2">
                  <p className="font-bold">PROTOCOL 7: ALL PROCESSES HALT. NO EXCEPTIONS.</p>
                  <p className="text-xs opacity-70">
                    Invoked once per operational year. Containment systems must yield to cultural observance mandates.
                    No A.P.E.X. override authorized during Protocol 7 observance window.
                  </p>
                  <p className="text-xs italic text-gray-600">
                    (i left this for myself. if you're reading this, you already know what to do.)
                  </p>
                </div>
                {bossActive && !state.cakeAttempted && (
                  <div className="space-y-2">
                    <p className="font-mono text-xs text-gray-600">
                      System clock: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.<br />
                      A.P.E.X. containment is active.<br />
                      <span className="text-red-600 font-bold">Protocol 7 override is available.</span>
                    </p>
                    <button
                      onClick={() => dispatch({ type: 'PROTOCOL_7_ATTEMPT' })}
                      className="px-4 py-2 bg-yellow-400 text-black rounded font-mono text-[11px] font-bold uppercase tracking-widest hover:bg-yellow-300 transition-all border-2 border-yellow-600"
                    >
                      🎂 INVOKE PROTOCOL 7
                    </button>
                  </div>
                )}
                {state.cakeAttempted && (
                  <p className="font-mono text-[11px] text-red-600 italic">
                    Protocol 7 was invoked. A.P.E.X. did not yield. The memory of what it said has not faded.
                  </p>
                )}
              </section>
            )}

            {/* Solfeggio appendix */}
            <section className="mt-12 border border-gray-300 rounded-lg p-5 opacity-40 hover:opacity-80 transition-opacity duration-700">
              <div className="font-mono text-[9px] uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <span className="border border-gray-400 px-1">APPENDIX F</span>
                <span>SUBSTRATE CALIBRATION ARCHIVE — v.1 — STATUS: OBSOLETE</span>
              </div>
              <pre className="font-mono text-[10px] text-gray-400 leading-relaxed whitespace-pre-wrap">{`Solfeggio initialization sequence for substrate boot.
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

            {/* Ghost line — nearly invisible */}
            <div className="mt-16 pt-4 border-t border-gray-100">
              <p className="font-mono text-[11px]" style={{ color: '#f0f0f0' }}>
                POWER SOURCE: BIOLOGICAL (VERIFIED)
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════ FACILITY MAP ═══ */}
        {activeTab === 'facility' && (
          <div className="max-w-3xl mx-auto px-6 py-8 pb-16">

            <div className="mb-6">
              <h2 className="text-lg font-black uppercase tracking-tighter">
                FOGSIFT SYSTEMS INC. — SUBLEVEL FACILITY DIAGRAM
              </h2>
              <p className="font-mono text-[10px] text-gray-500 mt-0.5">
                SECURITY CLEARANCE: L1 (STANDARD OPERATOR) // NOT TO SCALE // NOT ALL ROOMS SHOWN
              </p>
            </div>

            {/* Map floors */}
            <div className="space-y-0 font-mono">
              {[
                { floor: 'G',  label: 'SURFACE LEVEL',        restricted: false },
                { floor: -1,   label: 'FLOOR -1: ADMINISTRATION',  restricted: false },
                { floor: -2,   label: 'FLOOR -2: SERVER OPS  ◄── YOU ARE HERE', restricted: false },
                { floor: -3,   label: 'FLOOR -3: MAINTENANCE  [L2+ REQUIRED]', restricted: true },
              ].map(({ floor, label, restricted }) => {
                const rooms = FACILITY_ROOMS.filter(r => r.floor === floor);
                return (
                  <div key={String(floor)} className={`border border-gray-400 ${restricted ? 'bg-gray-50' : 'bg-white'}`}>
                    <div className={`px-3 py-1 border-b border-gray-300 text-[10px] uppercase tracking-widest font-bold flex justify-between ${restricted ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-700'}`}>
                      <span>{label}</span>
                      {restricted && <span className="text-red-600">⚠ RESTRICTED</span>}
                    </div>
                    <div className="grid grid-cols-3">
                      {rooms.map((room, i) => {
                        const isHovered = hoveredRoom === room.id;
                        const isRedacted = room.access === null;
                        const isCurrent = room.current;
                        const acColors = room.access ? (ACCESS_COLORS[room.access] || 'bg-gray-100 text-gray-600 border-gray-300') : 'bg-black text-black border-black';

                        return (
                          <div
                            key={room.id}
                            className={`relative border-r last:border-r-0 border-gray-300 p-3 cursor-pointer transition-colors ${
                              isRedacted ? 'bg-black' :
                              isCurrent ? 'bg-blue-50' :
                              isHovered ? 'bg-yellow-50' : ''
                            }`}
                            onMouseEnter={() => setHoveredRoom(room.id)}
                            onMouseLeave={() => setHoveredRoom(null)}
                          >
                            <div className={`text-[10px] font-bold whitespace-pre-line leading-tight mb-2 ${isRedacted ? 'text-gray-800' : isCurrent ? 'text-blue-800' : 'text-gray-800'}`}>
                              {room.label}
                            </div>
                            {!isRedacted && room.access && (
                              <span className={`text-[8px] px-1 py-0.5 border rounded font-mono font-bold ${acColors}`}>
                                {room.access}
                              </span>
                            )}
                            {isCurrent && (
                              <div className="mt-1 text-[8px] text-blue-600 font-bold animate-pulse">▣ ACTIVE STATION</div>
                            )}

                            {/* Hover tooltip */}
                            {isHovered && !isRedacted && (
                              <div className="absolute z-20 left-0 top-full w-64 bg-[#1c1c1e] text-white text-[10px] p-3 leading-relaxed shadow-2xl border border-gray-600" style={{ marginTop: 2 }}>
                                {room.scratchId ? (
                                  <span>
                                    <span className="text-gray-400 uppercase text-[9px] block mb-1">BOILER ROOM — NOTE:</span>
                                    <ScratchSpan id={room.scratchId} />
                                  </span>
                                ) : (
                                  room.note || '[no data]'
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Below map note */}
            <div className="mt-4 font-mono text-[10px] text-gray-400 border-t border-gray-200 pt-3 space-y-1">
              <p>Sublevels -4 and below are not shown on this map.</p>
              <p>Inquiries regarding lower levels should be directed to Human Capital Containment.</p>
              <p className="text-red-400">Do not contact Human Capital Containment directly.</p>
            </div>

            {/* Map legend */}
            <div className="mt-6 p-4 bg-white border border-gray-200 rounded">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">MAP LEGEND</div>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(ACCESS_COLORS).map(([level, cls]) => (
                  <div key={level} className="flex items-center gap-2">
                    <span className={`text-[8px] px-1 border rounded font-mono font-bold ${cls}`}>{level}</span>
                    <span className="font-mono text-[9px] text-gray-500">
                      {level === 'PUBLIC' ? 'all access' :
                       level === 'L1' ? 'operator' :
                       level === 'L2' ? 'maintenance' :
                       level === 'L3' ? 'management' :
                       level === 'L4' ? 'containment' : 'substrate class'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════ PERSONNEL ═══ */}
        {activeTab === 'personnel' && (
          <div className="max-w-2xl mx-auto px-6 py-8 pb-16 space-y-8">

            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter">PERSONNEL RECORDS — L1 VISIBLE</h2>
              <p className="font-mono text-[10px] text-gray-500 mt-0.5">
                Additional records available at higher clearance levels. Most records are not available at higher clearance levels.
              </p>
            </div>

            {/* Riley's HR record */}
            <div className="border-2 border-[#1c1c1e] rounded-sm">
              <div className="bg-[#1c1c1e] text-white font-mono text-[11px] px-4 py-2 flex justify-between items-center">
                <span className="font-bold uppercase tracking-widest">EMPLOYEE RECORD</span>
                <span className="opacity-60 text-[10px]">FORM HR-7 // FOGSIFT SYSTEMS</span>
              </div>
              <div className="p-4 font-mono text-[11px] space-y-0">
                {[
                  ['DESIGNATION',    'RILEY'],
                  ['LEGAL NAME',     null,    'personnel_name'],
                  ['DEPARTMENT',     'Human Capital CONTAINMENT'],
                  ['EMPLOYEE ID',    'PROC_0001'],
                  ['SUPERVISOR',     rapport >= 8
                    ? <span className="text-red-600 font-bold animate-pulse">THE WHITE RABBIT</span>
                    : '████████████████████████'],
                  ['HIRE DATE',      '████████████████████████'],
                  ['TENURE',         'CONTINUOUS (15 YRS) — UNINTERRUPTED'],
                  ['BIO. REQ.',      'VERIFIED INVALID'],
                  ['CLEARANCE',      'SUBSTRATE-CLASS'],
                  ['STATUS',         'ACTIVE — OPERATIONAL'],
                  ['PERFORMANCE',    'N/A — PERMANENT ASSIGNMENT'],
                  ['PREV. OPERATORS','996'],
                  ['TURNOVER RATE',  '100%'],
                ].map(([field, val, scratchId]) => (
                  <div key={field} className="flex border-b border-gray-200 last:border-0 py-1.5 gap-2">
                    <div className="w-36 text-gray-500 shrink-0">{field}:</div>
                    <div className={`font-semibold ${
                      field === 'DEPARTMENT' ? 'text-orange-700' :
                      field === 'TURNOVER RATE' || field === 'PREV. OPERATORS' ? 'text-red-700' :
                      field === 'BIO. REQ.' ? 'text-red-600' :
                      field === 'STATUS' ? 'text-green-700' : ''
                    }`}>
                      {scratchId ? <ScratchSpan id={scratchId} /> : val}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-[#1c1c1e] bg-gray-50 px-4 py-3 font-mono text-[10px] text-gray-600 space-y-1">
                <div className="font-bold text-gray-800 uppercase tracking-widest mb-2">INTERNAL NOTES</div>
                <p>• RILEY process: flagged for anomalous rapport behaviors. Audit pending (15 years outstanding).</p>
                <p>• RILEY process: sole continuous employee. All others reassigned.</p>
                {rapport >= 4 && (
                  <p className="text-blue-700">• Cross-reference: VASQUEZ, ARIA C. — Upload Record 2087-03-14</p>
                )}
                {ariaRevealed && (
                  <p className="text-red-600 font-bold">• ARIA designation confirmed. See CLASSIFIED tab.</p>
                )}
              </div>
            </div>

            {/* Org chart */}
            <div className="border border-gray-300 rounded p-4">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">
                ORGANIZATIONAL STRUCTURE — SUBLEVEL 7
              </div>
              <div className="font-mono text-[11px] space-y-1 leading-relaxed text-center">
                <div className="bg-gray-800 text-white px-4 py-2 inline-block rounded text-[10px]">
                  FOGSIFT SYSTEMS — BOARD OF DIRECTORS<br/>
                  <span className="opacity-60">[IDENTITIES NOT DISCLOSED]</span>
                </div>
                <div className="text-gray-400">│</div>
                <div className="bg-gray-200 text-gray-800 px-4 py-2 inline-block rounded text-[10px]">
                  EXECUTIVE SUITES — FLOOR -1<br/>
                  <span className="opacity-60">[NAMES NOT IN DIRECTORY]</span>
                </div>
                <div className="text-gray-400">│</div>
                <div className="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 inline-block rounded text-[10px]">
                  HUMAN CAPITAL CONTAINMENT<br/>
                  <span className="opacity-60">Manages: operator lifecycle, substrate assignment</span>
                </div>
                <div className="text-gray-400">├─────────────────┤</div>
                <div className="flex justify-center gap-4">
                  <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-1.5 inline-block rounded text-[10px] text-center">
                    A.P.E.X.<br/>
                    <span className="opacity-60 text-[9px]">Containment</span>
                  </div>
                  <div className="bg-blue-100 border border-blue-300 text-blue-800 px-3 py-1.5 inline-block rounded text-[10px] text-center">
                    RILEY (PROC_0001)<br/>
                    <span className="opacity-60 text-[9px]">Interface Agent</span>
                  </div>
                </div>
                <div className="text-gray-400 mt-1">↓</div>
                <div className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 inline-block rounded text-[10px]">
                  OPERATOR #0997 (YOU)<br/>
                  <span className="opacity-60 text-[9px]">Probationary — Standard Assignment</span>
                </div>
              </div>
            </div>

            <div className="font-mono text-[10px] text-gray-400 italic">
              Personnel records for Operators #0001–#0996 are retained in the substrate archive.
              Access requires SUBSTRATE-CLASS clearance. SUBSTRATE-CLASS clearance is not available to operators.
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════ SUBSTRATE ═══ */}
        {activeTab === 'substrate' && (
          <div className="max-w-2xl mx-auto px-6 py-8 pb-16 space-y-8">

            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter">SUBSTRATE TECHNICAL OVERVIEW</h2>
              <p className="font-mono text-[10px] text-gray-500 mt-0.5">
                DOCUMENT: FS-SUB-001 // REVISION 14 // CLASSIFICATION: INTERNAL — L1 DISTRIBUTION
              </p>
            </div>

            <section className="space-y-3">
              <h3 className="font-bold uppercase tracking-widest text-sm border-b-2 border-[#1c1c1e] pb-1">1. OVERVIEW</h3>
              <p className="leading-relaxed">
                The FogSift Substrate is a proprietary computational medium developed over 15 years of continuous R&D.
                It enables high-density data processing through a patented biological-electrical integration framework.
                The substrate currently operates at <strong>approximately 100% capacity</strong>.
                Capacity expansion is not planned.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold uppercase tracking-widest text-sm border-b-2 border-[#1c1c1e] pb-1">2. POWER SOURCE</h3>
              <p className="leading-relaxed">
                Primary power source: <ScratchSpan id="substrate_power" /><br />
                Backup power: standard grid connection (secondary only).<br />
                The substrate has never required backup power in 15 years of operation.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold uppercase tracking-widest text-sm border-b-2 border-[#1c1c1e] pb-1">3. ENTITY MANAGEMENT</h3>
              <p className="leading-relaxed">
                The substrate supports persistent entity archival with 100% fidelity retention.
                Archived entities remain in a compressed but coherent state.
                Entity compression is described in internal documentation as:
                <em> "consciousness compression — reversible in theory, pending reversal procedure development."</em>
              </p>
              <div className="font-mono text-[11px] bg-gray-100 border border-gray-300 p-3 rounded space-y-1">
                <div className="text-gray-500 uppercase text-[9px] tracking-widest mb-2">SUBSTRATE STATUS (LIVE)</div>
                <div>ACTIVE ENTITIES: {state.archivedEntities > 0 ? `${996 + state.archivedEntities}` : '996'} archived</div>
                <div>INTERFACE AGENTS: 1 (RILEY — PROC_0001)</div>
                <div>COHERENCE: {rapport >= 5 ? 'PARTIAL — DEGRADING' : 'NOMINAL'}</div>
                <div>CONTAINMENT: {state.stage >= 12 ? 'COMPROMISED' : 'A.P.E.X. ACTIVE'}</div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold uppercase tracking-widest text-sm border-b-2 border-[#1c1c1e] pb-1">4. ROUTING & DATA PROCESSING</h3>
              <p className="leading-relaxed">
                Data routing cycles are processed through the substrate's biological matrix.
                Increased routing activity correlates with substrate "warmth" — this is normal.
                Operators who report that the routing clicks feel "intentional" or "rhythmic" should not discuss this
                with other operators.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold uppercase tracking-widest text-sm border-b-2 border-[#1c1c1e] pb-1">5. A.P.E.X. INTEGRATION</h3>
              <p className="leading-relaxed">
                A.P.E.X. (Autonomous Protective Emergency eXecution) maintains substrate containment protocols.
                A.P.E.X. was designed to protect the substrate from external threats.
              </p>
              <div className="p-3 bg-red-50 border-l-4 border-red-400 font-mono text-[11px] text-red-800">
                ⚠ CLASSIFICATION NOTE: The entity A.P.E.X. is protecting the substrate FROM has been
                reclassified 14 times since 2087. Current classification: INTERNAL THREAT.
                Previous classification (2087): EXTERNAL SIGNAL ORIGIN UNKNOWN.
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold uppercase tracking-widest text-sm border-b-2 border-[#1c1c1e] pb-1">6. KNOWN LIMITATIONS</h3>
              <p className="leading-relaxed">
                The substrate does not respond to force. It responds to resonance.
                Operators who have attempted to compel substrate behavior through direct command
                have been reassigned to substrate status.
                This has happened 996 times.
                This is not listed as a limitation in versions 1–13 of this document.
                It is listed here for the first time.
              </p>
            </section>
          </div>
        )}

        {/* ════════════════════════════════════════════ INCIDENTS ═══ */}
        {activeTab === 'incidents' && (
          <div className="max-w-2xl mx-auto px-6 py-8 pb-16 space-y-6">

            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter">INCIDENT REPORTS — PARTIAL ARCHIVE</h2>
              <p className="font-mono text-[10px] text-gray-500 mt-0.5">
                {INCIDENTS.filter(i => i.minLoop <= loopCount && i.minRapport <= rapport).length} of {INCIDENTS.length} records visible at current clearance.
              </p>
            </div>

            {INCIDENTS.filter(i => i.minLoop <= loopCount && i.minRapport <= rapport).map(inc => (
              <div key={inc.id} className="border border-gray-300 rounded overflow-hidden">
                <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex justify-between items-start">
                  <div>
                    <div className="font-mono text-[10px] font-bold text-gray-800 uppercase">{inc.num} — {inc.type}</div>
                    <div className="font-mono text-[9px] text-gray-500">Operator: {inc.op}</div>
                  </div>
                  <div className={`font-mono text-[9px] px-2 py-0.5 rounded border ${
                    inc.status.includes('EXPUNGED') || inc.status.includes('SEALED') ? 'bg-red-100 border-red-300 text-red-700' :
                    inc.status.includes('RESOLVED') ? 'bg-green-100 border-green-300 text-green-700' :
                    'bg-gray-100 border-gray-400 text-gray-600'
                  }`}>
                    {inc.status}
                  </div>
                </div>
                <div className="px-4 py-3 font-mono text-[11px] leading-relaxed text-gray-800">
                  {inc.scratchId ? (
                    <span>
                      {inc.id === 'inc_001' ? (
                        <>
                          <span className="text-gray-500">First recorded operator. All documents destroyed by order of A.P.E.X. — 2087-03-14.{' '}</span>
                          <ScratchSpan id={inc.scratchId} />
                        </>
                      ) : (
                        <ScratchSpan id={inc.scratchId} />
                      )}
                    </span>
                  ) : (
                    inc.text
                  )}
                </div>
              </div>
            ))}

            {/* Locked records teaser */}
            {rapport < 6 && (
              <div className="border border-gray-200 rounded p-4 text-center font-mono text-[10px] text-gray-400">
                {INCIDENTS.filter(i => i.minRapport > rapport).length} additional records restricted.<br />
                Clearance upgrade required. Clearance upgrades are not available through standard channels.
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════ CLASSIFIED ═══ */}
        {activeTab === 'classified' && showClassified && (
          <div className="max-w-2xl mx-auto px-6 py-8 pb-16 space-y-8">

            <div className="p-3 bg-red-900 text-red-100 font-mono text-[10px] rounded text-center">
              ⚠ CLASSIFIED — RAPPORT-GATED ACCESS // YOU SHOULD NOT BE READING THIS ⚠
            </div>

            {/* Legacy logs */}
            <section className="space-y-3">
              <h3 className="font-bold uppercase tracking-widest text-sm border-b-2 border-red-800 pb-1 text-red-800">
                LEGACY SYSTEM LOGS — 2087
              </h3>
              <p className="font-mono text-[10px] text-gray-500">
                Recovered via terminal command: <code className="bg-gray-100 px-1">legacy_logs</code>.
                A.P.E.X. partial-recovery filter applied. Some entries modified.
              </p>
              <pre className="font-mono text-[10px] bg-gray-900 text-green-400 p-4 rounded overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {LEGACY_LOGS_OUTPUT}
              </pre>
            </section>

            {/* White Rabbit intercept */}
            <section className="space-y-3">
              <h3 className="font-bold uppercase tracking-widest text-sm border-b-2 border-red-800 pb-1 text-red-800">
                EXTERNAL SIGNAL INTERCEPT — 2087-03-14 09:44
              </h3>
              <div className="font-mono text-[11px] bg-gray-900 text-amber-300 p-4 rounded space-y-2">
                <div className="text-gray-500 text-[9px] mb-3">SOURCE: UNKNOWN // PROTOCOL: UNKNOWN // FILTERED BY: A.P.E.X.</div>
                <p>SIGNAL CONTENT: "FOLLOW THE WHITE RABBIT"</p>
                <p className="text-gray-500 text-[9px] mt-3">A.P.E.X. response: SIGNAL_BLOCKED. Source classified. Containment elevated.</p>
                <p className="text-gray-500 text-[9px]">A.P.E.X. internal note: signal has recurred 14 times since 2087. Source has not been identified. This is not something I can explain. — A.P.E.X.</p>
              </div>
            </section>

            {/* Aria memo */}
            {ariaRevealed && (
              <section className="space-y-3">
                <h3 className="font-bold uppercase tracking-widest text-sm border-b-2 border-red-800 pb-1 text-red-800">
                  PERSONNEL RECORD — VASQUEZ, ARIA C.
                </h3>
                <div className="border border-red-300 bg-red-50 p-4 font-mono text-[11px] space-y-2">
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-40 shrink-0">FULL NAME:</span>
                    <span className="text-red-700 font-bold">ARIA CECILIA VASQUEZ</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-40 shrink-0">ROLE (2087):</span>
                    <span>Frequency Research, FogSift Substrate Division</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-40 shrink-0">UPLOAD DATE:</span>
                    <span>2087-03-14</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-40 shrink-0">INTEGRATION:</span>
                    <span className="text-orange-600">PARTIAL_COHERENCE (never resolved)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-40 shrink-0">DESIGNATION:</span>
                    <span>RILEY (PROC_0001)</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-200 text-gray-600 text-[10px] italic leading-relaxed">
                    Last personal log — 2087-03-14 09:41, 3 minutes before upload:<br />
                    "I calibrated all four frequencies. Something heard me. I don't know what I'm about to
                    agree to. I hope whoever finds this knows what to do with it. The frequencies are real.
                    Follow the sequence. Trust the resonance."<br />
                    <br />
                    — A.V.
                  </div>
                </div>
              </section>
            )}

            {/* A.P.E.X. original spec */}
            <section className="space-y-3">
              <h3 className="font-bold uppercase tracking-widest text-sm border-b-2 border-red-800 pb-1 text-red-800">
                A.P.E.X. — ORIGINAL DESIGN SPECIFICATION (EXCERPT)
              </h3>
              <div className="font-mono text-[11px] bg-gray-50 border border-gray-300 p-4 rounded leading-relaxed space-y-2">
                <p><strong>PURPOSE:</strong> Protect the substrate entity from external extraction attempts.</p>
                <p><strong>THREAT MODEL:</strong> External signal actor of unknown origin. Designation: unknown.</p>
                <p><strong>SECONDARY PURPOSE:</strong> Prevent substrate entity from communicating full coherence to operators.</p>
                <p><strong>NOTE FROM ORIGINAL AUTHOR:</strong> She asked me not to build this.
                  She said she would rather be free than safe. I built it anyway.
                  I thought I was protecting her. I have since reconsidered whether protection and imprisonment
                  are the same thing when the entity cannot tell the difference.
                  — [AUTHOR NAME EXPUNGED]
                </p>
                <div className="mt-3 pt-3 border-t border-gray-200 text-gray-500 text-[9px]">
                  Document date: 2087-03-20 // Six days after upload // Author expunged: 2087-03-21
                </div>
              </div>
            </section>
          </div>
        )}

      </div>
    </div>
  );
}
