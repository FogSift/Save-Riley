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
};
