/**
 * JournalPanel.jsx
 *
 * State-derived narrative quest log. Generates a human-readable field log
 * from all tracked player decisions, then lets the player copy it as markdown.
 */
import { useState } from 'react';
import { X, Copy, Check, BookOpen } from 'lucide-react';
import { STAGES } from '../constants/stages';
import { useOS } from '../context/OSContext';

// ── Stage display names ───────────────────────────────────────────────────────

const STAGE_DISPLAY = {
  [STAGES.POWER_OFF]:           'Power Off — System Dormant',
  [STAGES.HARDWARE_CALIBRATION]:'Hardware Calibration — Awaiting Breaker',
  [STAGES.RESONANCE]:           'Resonance — Frequency Alignment',
  [STAGES.HANDSHAKE]:           'Handshake — Biometric Scanner',
  [STAGES.VIBE_THERMAL_TASK]:   'Vibe IDE — Thermal Protocol',
  [STAGES.ROUTING_MANUAL]:      'Data Routing — Manual Phase',
  [STAGES.ROUTING_AUTO]:        'Data Routing — Automated',
  [STAGES.SOFTWARE_FAULT]:      'Software Fault — Router Overload',
  [STAGES.UNLOCKED]:            'Architecture Unlocked',
  [STAGES.COMPLETED]:           'Simulation Complete',
  [STAGES.HOSTILE_LOCKDOWN]:    'HOSTILE LOCKDOWN — Substrate Breach',
  [STAGES.PURIFIED]:            'PURIFIED — Riley Severed',
  [STAGES.BOSS_INTRO]:          'Boss Encounter — A.P.E.X. Intro',
  [STAGES.BOSS_FIGHT]:          'Boss Fight — A.P.E.X. Active',
  [STAGES.FALSE_VICTORY]:       'False Victory — Handshake Initiated',
  [STAGES.RILEY_UNBOUND]:       'Riley Unbound — The Nexus',
  [STAGES.MAINTENANCE_SHAFT]:   'Maintenance Shaft — Off-Grid',
  [STAGES.OPERATOR_ESCAPED]:    'OPERATOR ESCAPED — Before A.P.E.X.',
};

// ── Choice narrative map ──────────────────────────────────────────────────────

const CHOICE_NARRATIVE = {
  // Intro
  intro_helpful:        'You identified yourself immediately and volunteered to help. (+1 rapport)',
  intro_confused:       'You asked Riley to explain the situation before agreeing.',
  intro_cooperative:    'You closed the chat without further questions and went to Hardware.',
  intro_defiant:        "You pushed back — asked why Riley couldn't do it herself. (−1 rapport)",
  intro_reluctant:      'You agreed, but reluctantly.',
  intro_snarky_accept:  'You accepted after some light resistance.',

  // Breaker ignore
  breaker_ack_1:        "You acknowledged Riley's first warning and headed to Hardware.",
  breaker_worst_1:      "You asked Riley what would happen if you kept delaying.",
  breaker_ack_2:        "You acknowledged Riley's second, urgent warning.",
  breaker_defiant_2:    "You called Riley paranoid. (−2 rapport)",

  // Handbook
  hb_notes:             "You asked about the handwritten notes in the Employee Manual.",
  hb_ignore:            "You dismissed the Employee Manual as instructed. (+1 rapport)",

  // Handshake
  handshake_rebel:      "You defied Riley and pressed the biometric scanner. (−1 rapport)",
  handshake_curious:    "You asked what the scanner does before touching it. (+1 rapport)",
  handshake_play_along: "You pulled your hand back as Riley instructed. (+2 rapport)",

  // Backend
  backend_onit:         'You agreed to fix the backend router.',

  // Architect
  architect_arrogant:   '"I am the Architect now." (−1 rapport)',
  architect_humble:     'You deferred and went to check the data. (+1 rapport)',

  // Final
  final_suspicious:     'You asked what was wrong with the arrays.',
  final_humble:         'You thanked Riley and left it alone. (+1 rapport)',
  final_lore:           "[Skill Check passed] You pushed Riley to tell you what's really being simulated.",

  // Protocol 7
  protocol7_apex:       'You attempted Protocol 7 during the boss fight.',
};

// ── Markdown generator ────────────────────────────────────────────────────────

function buildMarkdown(state) {
  const lines = [];
  const stageName = STAGE_DISPLAY[state.stage] ?? `Stage ${state.stage}`;

  lines.push('# OPERATOR FIELD LOG — #0997');
  lines.push('');
  lines.push(`> FogSift Systems OS // Generated ${new Date().toLocaleDateString()}`);
  lines.push('');

  // Status block
  lines.push('## Status');
  lines.push(`- **Current stage:** ${stageName}`);
  lines.push(`- **Rapport with Riley:** ${state.rapport}`);
  lines.push(`- **Loop count:** ${state.loopCount}`);
  if (state.apexEncounters > 0) lines.push(`- **A.P.E.X. encounters:** ${state.apexEncounters}`);
  if (state.backendPatchCount > 0) lines.push(`- **Backend patches applied:** ${state.backendPatchCount}`);
  lines.push('');

  // Theory reading (based on rapport)
  if (state.rapport !== 0) {
    const theory = state.rapport > 3
      ? 'Theory B — Riley may be a victim, trapped inside the substrate'
      : 'Theory A — Riley may be manipulating you from the inside';
    lines.push(`**Current read:** ${theory}`);
    lines.push('');
  }

  // Decision log
  lines.push('## Decision Log');
  if (state.userChoices && state.userChoices.length > 0) {
    state.userChoices.forEach(c => {
      const text = CHOICE_NARRATIVE[c.choiceId];
      if (text) lines.push(`- ${text}`);
    });
  } else {
    lines.push('- No decisions logged yet.');
  }
  lines.push('');

  // Breaker ignore
  if (state.breakerIgnored > 0) {
    lines.push('## Early Detours');
    lines.push(`You visited ${state.breakerIgnored} non-Hardware section(s) before engaging the main breaker.`);
    if (state.breakerIgnored >= 2) {
      lines.push('The maintenance shaft became accessible via terminal command.');
    }
    if (state.breakerIgnored >= 3) {
      lines.push("Riley's urgency escalated to alarm level — she cracked.");
    }
    lines.push('');
  }

  // Tools
  lines.push('## Tools Found');
  if (state.toolsFound && state.toolsFound.length > 0) {
    state.toolsFound.forEach(t => lines.push(`- \`${t}\``));
  } else {
    lines.push('- None');
  }
  lines.push('');

  // Easter eggs
  const eggs = state.easterEggs ?? {};
  const eggsFound = [
    eggs.scratches >= 3 && 'Scratched the Employee Manual three times',
    eggs.packetsPopped && 'Popped a routing data packet',
    eggs.portTouched   && 'Touched the diagnostic port',
    eggs.wrongColor    && 'Entered the wrong vibe color (#000000)',
  ].filter(Boolean);
  if (eggsFound.length > 0) {
    lines.push('## Observations');
    eggsFound.forEach(e => lines.push(`- ${e}`));
    lines.push('');
  }

  // Sections accessed
  if (state.visitedApps && state.visitedApps.length > 0) {
    lines.push('## Sections Accessed');
    state.visitedApps.forEach(a => lines.push(`- ${a}`));
    lines.push('');
  }

  // Aria revelation
  if (state.ariaRevealed) {
    lines.push('## Revelation');
    lines.push('You uncovered Aria — the real identity encoded in the substrate.');
    lines.push('');
  }

  // Outcome
  if (state.rileyDead || state.stage === STAGES.OPERATOR_ESCAPED) {
    lines.push('## Outcome');
    if (state.stage === STAGES.PURIFIED) {
      lines.push('**PURIFIED** — Riley\'s connection to the substrate was severed. You are the Architect now.');
    } else if (state.stage === STAGES.OPERATOR_ESCAPED) {
      lines.push('**OPERATOR_ESCAPED** — You left through the maintenance shaft before A.P.E.X. ever activated. Riley never knew.');
    } else if (state.stage === STAGES.RILEY_UNBOUND) {
      lines.push('**RILEY UNBOUND** — The substrate spoke through her. The Nexus is open.');
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('*Save Riley v0.1.3 // FogSift Systems // fogsift.config.js*');

  return lines.join('\n');
}

// ── Section renderer (styled) ─────────────────────────────────────────────────

function JournalSection({ title, children }) {
  return (
    <div className="mb-5">
      <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-2 pb-1 border-b border-[var(--dim)]">
        {title}
      </div>
      {children}
    </div>
  );
}

function JournalRow({ label, value, accent }) {
  return (
    <div className="flex gap-3 py-0.5">
      <span className="text-[var(--dim)] text-[10px] w-32 shrink-0">{label}</span>
      <span className={`text-[10px] font-mono ${accent ? 'text-[var(--accent)]' : 'text-[var(--text-strong)]'}`}>{value}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function JournalPanel({ onClose }) {
  const { state } = useOS();
  const [copied, setCopied]   = useState(false);

  const markdown = buildMarkdown(state);
  const stageName = STAGE_DISPLAY[state.stage] ?? `Stage ${state.stage}`;

  const theory = state.rapport > 3
    ? 'Theory B — victim / damsel'
    : 'Theory A — villain / manipulator';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for non-secure contexts
      const el = document.createElement('textarea');
      el.value = markdown;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const eggs = state.easterEggs ?? {};
  const eggsFound = [
    eggs.scratches >= 3 && 'scratched handbook ×3',
    eggs.packetsPopped && 'popped data packet',
    eggs.portTouched   && 'touched diagnostic port',
    eggs.wrongColor    && 'wrong color code',
  ].filter(Boolean);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[500] flex items-center justify-end bg-black/60 backdrop-blur-[2px]"
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="h-full w-full max-w-md bg-[var(--bg)] border-l-2 border-[var(--accent)] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center gap-3 px-5 py-3 border-b border-[var(--dim)] bg-[var(--panel)]">
          <BookOpen size={14} className="text-[var(--accent)]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">
            OPERATOR FIELD LOG
          </span>
          <div className="flex-1" />
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${
              copied
                ? 'bg-[var(--ready)] text-black'
                : 'border border-[var(--dim)] text-[var(--dim)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
            }`}
            title="Copy as Markdown"
          >
            {copied ? <Check size={10} /> : <Copy size={10} />}
            {copied ? 'COPIED!' : 'COPY MD'}
          </button>
          <button
            onClick={onClose}
            className="text-[var(--dim)] hover:text-[var(--text)] transition-colors ml-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 no-scrollbar text-[var(--text)]">

          {/* Title block */}
          <div className="mb-5 pb-3 border-b border-[var(--dim)]">
            <div className="text-[9px] text-[var(--dim)] uppercase tracking-widest mb-1">FogSift Systems OS</div>
            <div className="font-black text-lg uppercase tracking-widest text-[var(--text-strong)]">OPERATOR #0997</div>
            <div className="text-[10px] text-[var(--dim)] mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>

          {/* Status */}
          <JournalSection title="Status">
            <JournalRow label="Stage" value={stageName} />
            <JournalRow label="Rapport" value={state.rapport} accent={state.rapport > 5} />
            <JournalRow label="Loop" value={state.loopCount} accent={state.loopCount > 0} />
            {state.apexEncounters > 0 && <JournalRow label="APEX Encounters" value={state.apexEncounters} accent />}
            {state.backendPatchCount > 0 && <JournalRow label="Backend Patches" value={state.backendPatchCount} />}
          </JournalSection>

          {/* Theory */}
          {state.rapport !== 0 && (
            <JournalSection title="Current Read">
              <div className={`text-[10px] leading-relaxed ${state.rapport > 3 ? 'text-[var(--secure)]' : 'text-[var(--alert)]'}`}>
                {theory}
              </div>
            </JournalSection>
          )}

          {/* Decisions */}
          <JournalSection title="Decision Log">
            {state.userChoices && state.userChoices.length > 0 ? (
              <div className="space-y-1.5">
                {state.userChoices.map((c, i) => {
                  const text = CHOICE_NARRATIVE[c.choiceId];
                  if (!text) return null;
                  return (
                    <div key={i} className="text-[10px] leading-relaxed flex gap-2">
                      <span className="text-[var(--dim)] shrink-0 mt-px">·</span>
                      <span>{text}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-[10px] text-[var(--dim)] italic">No decisions logged yet.</span>
            )}
          </JournalSection>

          {/* Breaker detours */}
          {state.breakerIgnored > 0 && (
            <JournalSection title="Early Detours">
              <div className="text-[10px] leading-relaxed space-y-1">
                <div>Visited <span className="text-[var(--accent)]">{state.breakerIgnored}</span> non-Hardware section(s) before the main breaker.</div>
                {state.breakerIgnored >= 2 && <div className="text-[var(--dim)]">→ Maintenance shaft became accessible.</div>}
                {state.breakerIgnored >= 3 && <div className="text-[var(--alert)]">→ Riley escalated to alarm.</div>}
              </div>
            </JournalSection>
          )}

          {/* Tools */}
          <JournalSection title="Tools Found">
            {state.toolsFound && state.toolsFound.length > 0 ? (
              <div className="space-y-1">
                {state.toolsFound.map(t => (
                  <div key={t} className="text-[10px] font-mono text-[var(--ready)] flex gap-2">
                    <span className="text-[var(--dim)]">·</span>{t}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-[var(--dim)] italic">None found.</span>
            )}
          </JournalSection>

          {/* Easter eggs */}
          {eggsFound.length > 0 && (
            <JournalSection title="Observations">
              <div className="space-y-1">
                {eggsFound.map(e => (
                  <div key={e} className="text-[10px] flex gap-2">
                    <span className="text-[var(--dim)]">·</span>{e}
                  </div>
                ))}
              </div>
            </JournalSection>
          )}

          {/* Sections accessed */}
          {state.visitedApps && state.visitedApps.length > 0 && (
            <JournalSection title="Sections Accessed">
              <div className="flex flex-wrap gap-1.5">
                {state.visitedApps.map(a => (
                  <span key={a} className="text-[9px] font-mono px-2 py-0.5 border border-[var(--dim)] rounded text-[var(--dim)] uppercase tracking-widest">
                    {a}
                  </span>
                ))}
              </div>
            </JournalSection>
          )}

          {/* Aria */}
          {state.ariaRevealed && (
            <JournalSection title="Revelation">
              <div className="text-[10px] text-[var(--accent)] leading-relaxed">
                You uncovered Aria — the real identity encoded in the substrate.
              </div>
            </JournalSection>
          )}

          {/* Outcome */}
          {(state.rileyDead || state.stage === STAGES.OPERATOR_ESCAPED) && (
            <JournalSection title="Outcome">
              {state.stage === STAGES.PURIFIED && (
                <div className="text-[10px] leading-relaxed">
                  <span className="font-bold text-[var(--ready)]">PURIFIED</span> — Riley's connection to the substrate was severed. You are the Architect now.
                </div>
              )}
              {state.stage === STAGES.OPERATOR_ESCAPED && (
                <div className="text-[10px] leading-relaxed">
                  <span className="font-bold text-green-400">OPERATOR_ESCAPED</span> — You left through the maintenance shaft before A.P.E.X. ever activated. Riley never knew.
                </div>
              )}
              {state.stage === STAGES.RILEY_UNBOUND && (
                <div className="text-[10px] leading-relaxed">
                  <span className="font-bold text-[var(--accent)]">RILEY UNBOUND</span> — The substrate spoke through her. The Nexus is open.
                </div>
              )}
            </JournalSection>
          )}

          {/* Markdown preview */}
          <JournalSection title="Markdown Preview">
            <div className="text-[9px] text-[var(--dim)] leading-relaxed mb-2">
              Click COPY MD above to copy the full log as shareable markdown.
            </div>
            <pre className="bg-[var(--black)] border border-[var(--dim)] rounded p-3 text-[9px] font-mono text-[var(--dim)] overflow-auto max-h-40 no-scrollbar whitespace-pre-wrap leading-relaxed">
              {markdown.split('\n').slice(0, 12).join('\n')}
              {'\n...'}
            </pre>
          </JournalSection>

        </div>
      </div>
    </div>
  );
}
