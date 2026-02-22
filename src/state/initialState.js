import { STAGES, VIBE_COLORS } from '../constants/stages';
import { DIALOGUE_TREE } from '../constants/dialogue';

export const getRandomColor = () => VIBE_COLORS[Math.floor(Math.random() * VIBE_COLORS.length)];

export const initialState = {
  stage: STAGES.POWER_OFF,
  powerOn: false,
  bits: [0, 1, 0, 0, 1, 0, 1, 0],
  targetBits: [1, 1, 1, 1, 1, 1, 1, 1],
  resonance: 100,
  personality: 'corporate',

  // Data Clicker Game State
  routingCycles: 0,
  currency: 0,
  routingAutoRate: 0,
  clickPower: 1,
  purchasedUpgrades: [],
  hasSeenClickerLore: false,
  hasCreatedGod: false,

  backendPatched: false,
  targetVibeColor: getRandomColor(),
  themeName: 'default',
  themeClicks: 0,
  activeApp: 'HARDWARE',
  isTerminalOpen: false,
  logs: [
    'BOOT: FOGSIFT_OS_v5.2',
    'OPERATOR_INSTANCE: #0997 — INITIALIZED',
    'SYSTEM HEALTH: CRITICAL.',
    'ERROR: NO POWER DETECTED IN PRIMARY BUS.',
  ],
  visitedApps: [],
  radarClicks: 0,
  loopCount: 0,
  rapport: 0,
  hasSeenSlowDown: false,

  // Easter Egg Tracking
  easterEggs: {
    scratches: 0,
    packetsPopped: false,
    portTouched: false,
    wrongColor: false,
  },

  chatMode: 'modal',
  isProfileOpen: false,
  chatMessages: [],
  chatOptions: [],
  chatQueue: [...DIALOGUE_TREE.intro_1],
  userChoices: [],
  isTyping: false,
  unreadChat: 0,
  rileyDead: false,

  // ── Boss Fight (reset each encounter via PLAYER_HIT → 0 HP) ─────────────────
  bossPhase: 0,           // 0=none, 1=power shield, 2=processing core, 3=root access
  playerHP: 10,
  hosesConnected: [true, true],
  nodeClickSequence: [],
  valvePercent: 100,
  simonSequence: [],
  simonPlayerInput: [],
  ghostProtocolEntered: false,
  ariaCodeEntered: false,

  // ── Roguelike Persistence (survives DO_GASLIGHT_RESET) ───────────────────────
  karma: 0,               // net sum of all rapportBoosts; shapes villain vs. damsel Riley
  apexEncounters: 0,      // how many times player has entered the boss
  toolsFound: [],         // collected tool IDs
  handbookNotes: [],      // accumulated notes: { id, style, text }
  ariaRevealed: false,    // true when rapport 10 OR legacy_logs read
  cakeAttempted: false,   // true after Protocol 7 button used
  legacyLogsUnlocked: false,
  backendPatchCount: 0,   // counts APPLY_PATCH successes across all loops
  archivedEntities: 0,    // counts entity eliminations in SubstrateSimulation
  nexusFirstSeen: false,  // true after RILEY_UNBOUND — enables post-game content
  calibratedFreqs: [],    // secret Solfeggio freqs logged; persists across resets
};
