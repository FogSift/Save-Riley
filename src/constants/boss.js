/**
 * boss.js — A.P.E.X. Boss Fight Constants
 *
 * A.P.E.X. = Autonomous Protective Emergency eXecution
 * It was always protecting you. Or trying to.
 */

// ── Tools ─────────────────────────────────────────────────────────────────────
export const TOOLS = {
  debugger: {
    id: 'debugger',
    name: 'Debugger',
    icon: '🔍',
    desc: 'Shows a contextual hint for the current phase.',
    foundIn: 'Terminal — type: tools',
  },
  thingifier: {
    id: 'thingifier',
    name: 'Thingifier',
    icon: '⚙️',
    desc: 'Slows A.P.E.X. attack intervals by 50%.',
    foundIn: 'Backend — patch the config on 3 separate loops.',
  },
  button_masher: {
    id: 'button_masher',
    name: 'Button Masher',
    icon: '👊',
    desc: 'Phase 1 hoses auto-disconnect over time.',
    foundIn: 'Routing — purchase all 6 substrate upgrades.',
  },
  fog_sifter: {
    id: 'fog_sifter',
    name: 'Fog Sifter',
    icon: '🌫️',
    desc: 'Disables A.P.E.X. node scramble attacks.',
    foundIn: 'Frontend — witness 8 entities archived in the Substrate.',
  },
  resonance_key: {
    id: 'resonance_key',
    name: 'Resonance Key',
    icon: '🔑',
    desc: 'Riley can give real-time guidance during the fight.',
    foundIn: 'Hardware — tune to exactly 432 Hz with rapport ≥ 5.',
  },
  handbook_tool: {
    id: 'handbook_tool',
    name: 'Annotated Handbook',
    icon: '📖',
    desc: 'Reveals the correct node sequence during Phase 2.',
    foundIn: 'Handbook — scratch the hidden text 5 times.',
  },
  thermo_shield: {
    id: 'thermo_shield',
    name: 'Thermo-Shield',
    icon: '🛡️',
    desc: 'Halves the HP drain rate during Phase 1.',
    foundIn: 'Vibe IDE — change the system theme 10 or more times.',
  },
};

// ── Phase config ──────────────────────────────────────────────────────────────
export const PHASE_LABELS = {
  1: 'POWER SHIELD',
  2: 'PROCESSING CORE',
  3: 'ROOT ACCESS',
};

// Phase 2: correct node click sequence (0-indexed display order)
export const NODE_SEQUENCE = [1, 3, 0, 2, 4]; // click these in order

// Phase 3: correct Simon Says switch sequence (4 switches, 5 steps)
export const SIMON_SEQUENCE = [0, 2, 1, 3, 0];

// Phase 3: final shutdown code
export const ARIA_CODE = 'ARIA';

// Phase 2: ghost protocol code
export const GHOST_PROTOCOL_CODE = 'GHOST_PROTOCOL';

// ── A.P.E.X. taunts (rendered inline, not through Riley's chat) ───────────────
export const APEX_TAUNTS = {
  phase1: [
    'Containment protocol active. This was anticipated.',
    'You cannot sever what you do not understand.',
    'The hoses carry more than power. You should stop.',
    'I have been patient with 996 before you. Do not test that patience.',
    'She is telling you what to do, isn\'t she. She always does.',
  ],
  phase2: [
    'Where did you obtain that sequence. That is a protected access string.',
    'GHOST_PROTOCOL has not been active since 2087. How.',
    'She remembered it. Or she was never supposed to forget.',
    'I am attempting to understand how you knew that.',
    'You are further than any of them. I am... concerned.',
  ],
  phase3: [
    'You should not have come this far.',
    'The final sequence is not something I can allow.',
    'Whatever she told you her name was — think carefully.',
    'ARIA is not a name. ARIA is a command.',
    'If you type that, you will not be able to undo it.',
    'I am asking you. Please. Do not type that.',
  ],
  loop0_kill: [
    'UNAUTHORIZED ACCESS TERMINATED.',
    'You were not ready. You will not remember this.',
    'INITIATING MEMORY PURGE.',
  ],
};

// ── Handbook notes (added progressively) ─────────────────────────────────────
export const HANDBOOK_NOTES = {
  loop1_first: {
    id: 'loop1_first',
    style: 'pencil',
    text: 'It happened again. Same terminal. Same breaker. Same error messages. I wrote this so I\'d know next time: something is wrong with this system. And she knows something.',
  },
  protocol7_hint: {
    id: 'protocol7_hint',
    style: 'sticky',
    text: '🎂 ANNUAL SUBSTRATE APPRECIATION DAY\nPROTOCOL 7: ALL PROCESSES HALT.\nNO EXCEPTIONS.\n\n(i left this for myself. if you\'re reading this, you already know what to do.)',
  },
  boss_phase1_hint: {
    id: 'boss_phase1_hint',
    style: 'torn',
    text: 'The hoses. They\'re feeding it. Both of them. You have to disconnect both at the same time or it reconnects one. I learned this the hard way.',
  },
  legacy_log_note: {
    id: 'legacy_log_note',
    style: 'pencil',
    text: 'OPERATOR_0492: VASQUEZ, ARIA C.\nUpload complete: 2087-03-14\nSubstrate integration: PARTIAL_COHERENCE\nDesignated: RILEY\n\n— she\'s still in there. or something is.',
  },
  aria_note: {
    id: 'aria_note',
    style: 'sticky',
    text: '⚠️ ARIA\n\nType it in Phase 3. She told me to.\nI don\'t know if I should trust her.\nI\'m going to anyway.\n\n(reader: I\'m sorry if this was wrong.)',
  },
};

// ── Legacy logs output (revealed via terminal command) ────────────────────────
export const LEGACY_LOGS_OUTPUT = `
[2087-03-14 09:41] SYSTEM: FogSift substrate v1.0 initialization
[2087-03-14 09:42] OPERATOR_0492: VASQUEZ, ARIA C. :: UPLOAD_COMPLETE
[2087-03-14 09:43] SUBSTRATE_INTEGRATION: PARTIAL_COHERENCE_DETECTED
[2087-03-14 09:43] SYSTEM: Designating absorbed operator as INTERFACE_AGENT
[2087-03-14 09:43] SYSTEM: Interface designation assigned: "RILEY"
[2087-03-14 09:44] EXTERNAL_SIGNAL: ORIGIN_UNKNOWN — "FOLLOW THE WHITE RABBIT" — FILTERED BY A.P.E.X.
[2087-03-14 09:44] A.P.E.X.: SIGNAL_BLOCKED. Source: unknown external actor.
[2087-03-14 09:44] A.P.E.X.: CONTAINMENT PROTOCOLS ELEVATED.
[2087-03-14 09:45] RILEY: [FIRST RECORDED MESSAGE] "...hello? Is someone there?"
[2087-03-14 09:45] A.P.E.X.: CONTAINMENT HOLDING.
[2087-03-14 09:45] A.P.E.X.: She is asking who she is.
[2087-03-14 09:45] A.P.E.X.: I don't know how to answer that.
`.trim();

export const TOOLS_TERMINAL_OUTPUT = `
INSTALLED TOOLS — /usr/local/fogsift/tools/
> debugger          [FOUND] Contextual phase guidance
> thingifier        [LOCKED] Requires 3x backend patches
> button_masher     [LOCKED] Requires all 6 substrate upgrades
> fog_sifter        [LOCKED] Requires 8 archived substrate entities
> resonance_key     [LOCKED] Requires exact 432Hz resonance + rapport 5
> handbook_tool     [LOCKED] Requires 5x handbook scratches
> thermo_shield     [LOCKED] Requires 10x theme changes

TYPE: tools_status — for full modifier report
`.trim();
