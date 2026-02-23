/**
 * saveRileyAPI.js — Public API surface for the Save Riley / FogSift engine.
 *
 * Import from this module to build on top of Save Riley:
 *
 *   import {
 *     STAGES, DIFFICULTY, DIALOGUE_TREE,
 *     rollCheck, buildStats, karmaPolar,
 *     useOS, globalEvents,
 *   } from './lib/saveRileyAPI.js';
 *
 * Everything exported here is considered stable across patch versions.
 * Internal modules (reducer cases, component internals) are subject to change
 * without notice and should not be imported directly by third-party chapters.
 */

// ── Stage enum ───────────────────────────────────────────────────────────────

export { STAGES, VIBE_COLORS } from '../constants/stages';

// ── Dialogue tree + node types ───────────────────────────────────────────────

export { DIALOGUE_TREE } from '../constants/dialogue';

/**
 * Dialogue node type constants.
 * A node is an array of steps. Each step has a `type` field:
 *
 *   { type: 'message', sender: 'Riley', text: '...' [, italic: true] }
 *   { type: 'options', options: [{ text, nextNode, choiceId, rapportBoost }] }
 *   { type: 'action',  action: 'CLOSE_CHAT' | 'GASLIGHT_RESET' | ... }
 *
 * Valid action strings for type:'action' steps:
 *   'CLOSE_CHAT'         — closes the chat panel
 *   'OPEN_SIDEBAR'       — forces sidebar mode
 *   'GASLIGHT_RESET'     — triggers the roguelike loop (DO_GASLIGHT_RESET)
 *   'TRUE_ESCAPE'        — player escapes legitimately (PURIFIED ending)
 *   'SET_STAGE'          — requires `payload` on the step: { action, payload: STAGES.X }
 *   'SET_ARIA_REVEALED'  — marks the Aria lore as unlocked
 *   'SHOW_ASCII_RABBIT'  — triggers the ASCII rabbit flash effect
 *   'ENTER_BOSS_INTRO'   — starts the boss sequence
 */
export const DIALOGUE_NODE_TYPES = {
  MESSAGE: 'message',
  OPTIONS: 'options',
  ACTION:  'action',
};

// ── DnD skill check system ───────────────────────────────────────────────────

export {
  DIFFICULTY,
  DIFFICULTY_SCALES,
  DAMSEL_THRESHOLD,
  buildStats,
  rollCheck,
  rollCheckWithFate,
  rollWithAdvantage,
  getRileyReaction,
  RILEY_REACTIONS,
  karmaPolar,
  bossIntroNode,
  computeFate,
  getApexDC,
  resistApexAttack,
} from '../dnd.js';

// ── State ─────────────────────────────────────────────────────────────────────

export { initialState, getRandomColor } from '../state/initialState';
export { osReducer } from '../state/reducer';

// ── Context / hooks ───────────────────────────────────────────────────────────

/**
 * useOS() — access global OS state and dispatch from any component inside
 * the OSContext provider.
 *
 *   const { state, dispatch } = useOS();
 *   dispatch({ type: 'ENQUEUE_CHAT', payload: myDialogueNode });
 */
export { useOS } from '../context/OSContext';

/**
 * useClaudeRiley() — streaming hook for Claude brain integration.
 * Returns { streamRiley } where streamRiley({ messages, rapport, apiKey,
 *   onToken, onComplete, onError }) returns an abort function.
 *
 * Only active when fogsiftConfig.riley.brain === 'claude' and an API key
 * has been set (via SET_CLAUDE_API_KEY or localStorage 'riley-claude-key').
 */
export { useClaudeRiley } from '../hooks/useClaudeRiley';

// ── Event bus ─────────────────────────────────────────────────────────────────

/**
 * globalEvents — a lightweight pub/sub bus used for cross-component signals.
 *
 *   globalEvents.emit('JITTER', durationMs)  // screen shake
 *   globalEvents.on('JITTER', handler)
 *   globalEvents.off('JITTER', handler)
 *
 * Built-in event types:
 *   'JITTER'  — triggers screen shake animation; payload = duration in ms
 */
export { globalEvents } from '../events/EventManager';

// ── Themes ────────────────────────────────────────────────────────────────────

export { THEMES, GLOBAL_STYLES } from '../constants/themes';

// ── Telemetry ─────────────────────────────────────────────────────────────────

/**
 * activityTracker — RingBuffer-backed event recorder (2000 event ceiling).
 * Records all dispatched actions automatically when routed through App.jsx's
 * wrapped dispatch. Call .analyzeBehavior() for mouse dynamics classification.
 *
 * Methods:
 *   .record(event)               — push a raw event object
 *   .trackDispatch(action)       — records action.type + timestamp
 *   .getAll()                    — returns the full ring buffer as an array
 *   .analyzeBehavior()           — returns { profile: 'calm' | 'hesitant' | 'anxious' | 'erratic', ... }
 */
export { activityTracker } from '../telemetry/ActivityTracker';

// ── Upgrades ──────────────────────────────────────────────────────────────────

/**
 * UPGRADES — array of upgrade definitions for the routing idle-clicker.
 * Each entry: { id, label, cost, type: 'click'|'auto', val, description }
 */
export { UPGRADES } from '../constants/upgrades';

// ── Action type reference (no runtime value — documentation only) ─────────────

/**
 * ACTION_TYPES — exhaustive list of valid action.type strings for osReducer.
 *
 * Dispatch any of these via:
 *   const { dispatch } = useOS();
 *   dispatch({ type: ACTION_TYPES.ENQUEUE_CHAT, payload: myNode });
 *
 * @readonly
 */
export const ACTION_TYPES = Object.freeze({
  // ── Boot / power ────────────────────────────────────────────────────────
  ENGAGE_POWER:             'ENGAGE_POWER',          // no payload
  NEW_GAME:                 'NEW_GAME',              // no payload
  LOAD_STATE:               'LOAD_STATE',            // payload: full state object

  // ── Stage progression ────────────────────────────────────────────────────
  SET_STAGE:                'SET_STAGE',             // payload: STAGES.X (number)
  FLIP_BIT:                 'FLIP_BIT',              // payload: index 0–7
  SET_RESONANCE:            'SET_RESONANCE',         // payload: frequency number
  ACHIEVE_RESONANCE:        'ACHIEVE_RESONANCE',     // no payload
  CALIBRATE_FREQ:           'CALIBRATE_FREQ',        // payload: frequency string
  COMPLETE_HANDSHAKE:       'COMPLETE_HANDSHAKE',    // no payload
  COMPLETE_THERMAL_TASK:    'COMPLETE_THERMAL_TASK', // no payload
  COMPLETE_GAME:            'COMPLETE_GAME',         // no payload

  // ── Routing / economy ────────────────────────────────────────────────────
  INGEST_DATA:              'INGEST_DATA',           // no payload
  SET_AUTO_RATE:            'SET_AUTO_RATE',         // payload: number
  BUY_UPGRADE:              'BUY_UPGRADE',           // payload: upgrade id string
  AUTO_TICK:                'AUTO_TICK',             // no payload (fired by interval)
  ADD_CURRENCY:             'ADD_CURRENCY',          // payload: number

  // ── Backend ──────────────────────────────────────────────────────────────
  APPLY_PATCH:              'APPLY_PATCH',           // payload: patch string
  INCREMENT_BACKEND_PATCH:  'INCREMENT_BACKEND_PATCH', // no payload

  // ── Apps / navigation ────────────────────────────────────────────────────
  SET_ACTIVE_APP:           'SET_ACTIVE_APP',        // payload: 'HARDWARE' | 'VIBE_IDE' | ...
  MARK_APP_VISITED:         'MARK_APP_VISITED',      // payload: app key string
  TOGGLE_TERMINAL:          'TOGGLE_TERMINAL',       // no payload
  INCREMENT_BREAKER_IGNORED:'INCREMENT_BREAKER_IGNORED', // no payload

  // ── Logs / UI ────────────────────────────────────────────────────────────
  ADD_LOG:                  'ADD_LOG',               // payload: log line string
  CLEAR_LOGS:               'CLEAR_LOGS',            // no payload
  SET_THEME_NAME:           'SET_THEME_NAME',        // payload: theme key string
  FORCE_THEME:              'FORCE_THEME',           // payload: theme key string
  RADAR_CLICK:              'RADAR_CLICK',           // no payload
  TOGGLE_PROFILE:           'TOGGLE_PROFILE',        // no payload
  CLOSE_PROFILE:            'CLOSE_PROFILE',         // no payload

  // ── Chat / dialogue ──────────────────────────────────────────────────────
  ENQUEUE_CHAT:             'ENQUEUE_CHAT',          // payload: dialogue node array
  POP_CHAT_QUEUE:           'POP_CHAT_QUEUE',        // no payload (engine use only)
  SET_TYPING:               'SET_TYPING',            // payload: boolean
  ADD_CHAT_MESSAGE:         'ADD_CHAT_MESSAGE',      // payload: { sender, text }
  SET_CHAT_OPTIONS:         'SET_CHAT_OPTIONS',      // payload: options array
  SELECT_CHAT_OPTION:       'SELECT_CHAT_OPTION',    // payload: option object
  SET_CHAT_MODE:            'SET_CHAT_MODE',         // payload: 'modal'|'sidebar'|'closed'
  TOGGLE_CHAT:              'TOGGLE_CHAT',           // no payload

  // ── Easter eggs ──────────────────────────────────────────────────────────
  TRIGGER_EGG:              'TRIGGER_EGG',           // payload: egg type string

  // ── Roguelike loop ───────────────────────────────────────────────────────
  DO_GASLIGHT_RESET:        'DO_GASLIGHT_RESET',     // no payload
  TRUE_ESCAPE:              'TRUE_ESCAPE',           // no payload (PURIFIED ending)

  // ── Boss fight ───────────────────────────────────────────────────────────
  ENTER_BOSS_INTRO:         'ENTER_BOSS_INTRO',      // no payload
  ENTER_BOSS_FIGHT:         'ENTER_BOSS_FIGHT',      // no payload
  BOSS_PHASE_COMPLETE:      'BOSS_PHASE_COMPLETE',   // no payload
  PLAYER_HIT:               'PLAYER_HIT',            // payload?: damage number (default 1)
  HEAL_PLAYER:              'HEAL_PLAYER',           // payload?: heal amount (default 1)
  // Phase 1
  DISCONNECT_HOSE:          'DISCONNECT_HOSE',       // payload: hose index 0|1
  RECONNECT_HOSE:           'RECONNECT_HOSE',        // payload: hose index 0|1
  // Phase 2
  ENTER_GHOST_PROTOCOL:     'ENTER_GHOST_PROTOCOL',  // no payload
  CLICK_NODE:               'CLICK_NODE',            // payload: node id string
  RESET_NODE_SEQUENCE:      'RESET_NODE_SEQUENCE',   // no payload
  SET_VALVE:                'SET_VALVE',             // payload: 0–100
  // Phase 3
  SIMON_START:              'SIMON_START',           // payload: color sequence array
  SIMON_INPUT:              'SIMON_INPUT',           // payload: color string
  SIMON_RESET:              'SIMON_RESET',           // no payload
  ENTER_ARIA_CODE:          'ENTER_ARIA_CODE',       // no payload
  // Protocol 7
  PROTOCOL_7_ATTEMPT:       'PROTOCOL_7_ATTEMPT',    // no payload

  // ── RILEY_UNBOUND / endings ──────────────────────────────────────────────
  ENTER_RILEY_UNBOUND:      'ENTER_RILEY_UNBOUND',   // no payload

  // ── Secret escape path ───────────────────────────────────────────────────
  ENTER_MAINTENANCE_SHAFT:  'ENTER_MAINTENANCE_SHAFT', // no payload
  OPERATOR_ESCAPE:          'OPERATOR_ESCAPE',         // no payload

  // ── Lore / progression flags ─────────────────────────────────────────────
  FIND_TOOL:                'FIND_TOOL',             // payload: tool id string
  ADD_HANDBOOK_NOTE:        'ADD_HANDBOOK_NOTE',     // payload: { id, style, text }
  SET_ARIA_REVEALED:        'SET_ARIA_REVEALED',     // no payload
  UNLOCK_LEGACY_LOGS:       'UNLOCK_LEGACY_LOGS',    // no payload
  INCREMENT_ARCHIVED:       'INCREMENT_ARCHIVED',    // no payload

  // ── Claude brain ─────────────────────────────────────────────────────────
  SET_CLAUDE_API_KEY:       'SET_CLAUDE_API_KEY',    // payload: api key string
  SET_CLAUDE_STREAMING:     'SET_CLAUDE_STREAMING',  // payload: boolean
  APPEND_CLAUDE_STREAM:     'APPEND_CLAUDE_STREAM',  // payload: token string
  FLUSH_CLAUDE_STREAM:      'FLUSH_CLAUDE_STREAM',   // no payload
  SET_CLAUDE_FREE_INPUT:    'SET_CLAUDE_FREE_INPUT', // payload: string
});

// ── Tool IDs ─────────────────────────────────────────────────────────────────

/**
 * TOOL_IDS — valid values for FIND_TOOL payload and state.toolsFound entries.
 * Discoverable across mini-games; each modifies boss fight behaviour.
 */
export const TOOL_IDS = Object.freeze([
  'thermo_shield',   // found in VibeIDEApp — rolls with advantage on Phase 1
  'ghost_protocol',  // found in BackendApp — unlocks Phase 2 bypass
  'signal_booster',  // found in ResonanceApp — bonus to charisma checks
  'packet_sniffer',  // found in RoutingApp — reveals node sequence
  'biometric_spoof', // found in HandshakeApp — auto-succeed biometric checks
  'legacy_key',      // found via terminal — unlocks legacy log content
  'aria_token',      // found at rapport 10 — enables ENTER_ARIA_CODE shortcut
]);

// ── Roguelike persistence field list ─────────────────────────────────────────

/**
 * ROGUELIKE_FIELDS — state fields that survive DO_GASLIGHT_RESET.
 * Everything else is wiped back to initialState on loop.
 */
export const ROGUELIKE_FIELDS = Object.freeze([
  'rapport',
  'userChoices',
  'hasSeenSlowDown',
  'toolsFound',
  'handbookNotes',
  'ariaRevealed',
  'cakeAttempted',
  'apexEncounters',
  'backendPatchCount',
  'archivedEntities',
  'legacyLogsUnlocked',
  'nexusFirstSeen',
  'calibratedFreqs',
]);

// ── fogsift.config.js schema (JSDoc only — no runtime value) ─────────────────

/**
 * @typedef {object} FogsiftConfig
 * @property {object} project
 * @property {string} project.name          — used in boot log: "BOOT: NAME_v5.2"
 * @property {string} project.tagline       — one-line description
 * @property {string[]} project.techStack   — displayed in intro lore
 * @property {string[]} project.entryPoints — file paths Riley references
 * @property {object} riley
 * @property {string} riley.name            — defaults to 'Riley'
 * @property {string} riley.role            — Riley's job title
 * @property {'corporate'|'sardonic'|'warm'|'glitching'} riley.personality
 * @property {'static'|'claude'} riley.brain — 'static' = DIALOGUE_TREE only
 * @property {string[]} riley.secrets       — injected into Claude system prompt at high rapport
 * @property {object} dnd
 * @property {boolean} dnd.enabled
 * @property {'easy'|'standard'|'hard'|'riley_decides'} dnd.difficultyScale
 * @property {boolean} dnd.criticalEvents
 */
