import { STAGES } from '../constants/stages';
import { UPGRADES } from '../constants/upgrades';
import { DIALOGUE_TREE } from '../constants/dialogue';
import { initialState, getRandomColor } from './initialState';

export function osReducer(state, action) {
  switch (action.type) {

    case 'ENGAGE_POWER': {
      if (state.powerOn) return state;
      let newTarget;
      do {
        newTarget = Array.from({ length: 8 }, () => (Math.random() > 0.5 ? 1 : 0));
      } while (newTarget.join('') === state.bits.join(''));
      return { ...state, powerOn: true, stage: STAGES.HARDWARE_CALIBRATION, targetBits: newTarget };
    }

    case 'FLIP_BIT': {
      if (state.stage === STAGES.POWER_OFF || state.stage === STAGES.HOSTILE_LOCKDOWN) return state;
      const newBits = [...state.bits];
      newBits[action.payload] = newBits[action.payload] === 0 ? 1 : 0;
      const isParity = newBits.every((b, i) => b === state.targetBits[i]);
      let nextStage = state.stage;
      if (isParity && state.stage === STAGES.HARDWARE_CALIBRATION) nextStage = STAGES.RESONANCE;
      else if (!isParity && [STAGES.RESONANCE, STAGES.HANDSHAKE].includes(state.stage)) nextStage = STAGES.HARDWARE_CALIBRATION;
      return { ...state, bits: newBits, stage: nextStage };
    }

    case 'SET_RESONANCE':
      if (state.stage < STAGES.RESONANCE || state.stage === STAGES.HOSTILE_LOCKDOWN) return state;
      return { ...state, resonance: action.payload };

    case 'ACHIEVE_RESONANCE':
      if (state.stage === STAGES.RESONANCE) return { ...state, stage: STAGES.HANDSHAKE };
      return state;

    case 'COMPLETE_HANDSHAKE':
      return { ...state, stage: STAGES.VIBE_THERMAL_TASK, personality: 'awakened', logs: [] };

    case 'COMPLETE_THERMAL_TASK':
      return { ...state, stage: STAGES.ROUTING_MANUAL };

    case 'SET_STAGE':
      return { ...state, stage: action.payload };

    case 'INGEST_DATA': {
      if (
        state.stage < STAGES.ROUTING_MANUAL ||
        state.stage === STAGES.SOFTWARE_FAULT ||
        state.stage === STAGES.HOSTILE_LOCKDOWN
      ) return state;
      const gain = state.clickPower;
      const newCycles = state.routingCycles + gain;
      let rStage = state.stage;
      if (state.stage === STAGES.ROUTING_MANUAL && newCycles >= 15) rStage = STAGES.ROUTING_AUTO;
      return { ...state, routingCycles: newCycles, currency: state.currency + gain, stage: rStage };
    }

    case 'SET_AUTO_RATE':
      if (state.stage === STAGES.SOFTWARE_FAULT || state.stage === STAGES.HOSTILE_LOCKDOWN) return state;
      return { ...state, routingAutoRate: action.payload };

    case 'BUY_UPGRADE': {
      const upg = UPGRADES.find(u => u.id === action.payload);
      if (state.currency >= upg.cost && !state.purchasedUpgrades.includes(upg.id)) {
        return {
          ...state,
          currency: state.currency - upg.cost,
          clickPower: upg.type === 'click' ? state.clickPower + upg.val : state.clickPower,
          routingAutoRate: upg.type === 'auto' ? state.routingAutoRate + upg.val : state.routingAutoRate,
          purchasedUpgrades: [...state.purchasedUpgrades, upg.id],
        };
      }
      return state;
    }

    case 'AUTO_TICK': {
      if (![STAGES.ROUTING_AUTO, STAGES.UNLOCKED, STAGES.COMPLETED, STAGES.PURIFIED].includes(state.stage)) return state;
      if (state.routingAutoRate === 0) return state;
      const tickGain = Math.max(1, Math.floor(state.routingAutoRate / 2));
      const tickCycles = state.routingCycles + tickGain;
      let tickStage = state.stage;
      if (state.stage === STAGES.ROUTING_AUTO && tickCycles > 60) tickStage = STAGES.SOFTWARE_FAULT;
      return {
        ...state,
        routingCycles: tickCycles,
        currency: state.currency + tickGain,
        stage: tickStage,
        routingAutoRate: tickStage === STAGES.SOFTWARE_FAULT ? 0 : state.routingAutoRate,
      };
    }

    case 'APPLY_PATCH': {
      if (state.stage !== STAGES.SOFTWARE_FAULT || state.stage === STAGES.HOSTILE_LOCKDOWN) return state;
      const codeStr = action.payload.replace(/\s+/g, '');
      if (codeStr.includes('max_retries:5') || codeStr.includes('5')) {
        return { ...state, stage: STAGES.UNLOCKED, backendPatched: true, routingAutoRate: 5 };
      }
      return state;
    }

    case 'COMPLETE_GAME':
      if (state.stage !== STAGES.UNLOCKED) return state;
      return { ...state, stage: STAGES.COMPLETED };

    case 'SET_ACTIVE_APP':
      if (
        action.payload === 'ROUTING' &&
        state.stage >= STAGES.UNLOCKED &&
        !state.hasSeenClickerLore &&
        !state.rileyDead
      ) {
        return {
          ...state,
          activeApp: action.payload,
          hasSeenClickerLore: true,
          chatQueue: [...state.chatQueue, ...DIALOGUE_TREE.clicker_intro],
          chatMode: state.chatMode === 'closed' ? 'sidebar' : state.chatMode,
        };
      }
      return { ...state, activeApp: action.payload };

    case 'MARK_APP_VISITED':
      return { ...state, visitedApps: [...state.visitedApps, action.payload] };

    case 'TOGGLE_TERMINAL':
      return { ...state, isTerminalOpen: !state.isTerminalOpen };

    case 'ADD_LOG':
      return { ...state, logs: [...state.logs.slice(-40), action.payload] };

    case 'CLEAR_LOGS':
      return { ...state, logs: [] };

    case 'SET_THEME_NAME':
      return { ...state, themeName: action.payload, themeClicks: state.themeClicks + 1 };

    case 'FORCE_THEME':
      return { ...state, themeName: action.payload };

    case 'RADAR_CLICK':
      return { ...state, radarClicks: state.radarClicks + 1 };

    case 'TOGGLE_PROFILE':
      return { ...state, isProfileOpen: !state.isProfileOpen };

    case 'CLOSE_PROFILE':
      return { ...state, isProfileOpen: false };

    case 'ENQUEUE_CHAT': {
      let newMode = state.chatMode;
      if (state.chatMode === 'closed' && state.loopCount >= 0 && !state.rileyDead) {
        newMode = 'sidebar';
      }
      return { ...state, chatQueue: [...state.chatQueue, ...action.payload], chatMode: newMode };
    }

    case 'POP_CHAT_QUEUE':
      return { ...state, chatQueue: state.chatQueue.slice(1) };

    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };

    case 'ADD_CHAT_MESSAGE': {
      const isCurrentlyOpen = state.chatMode !== 'closed';
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
        unreadChat: isCurrentlyOpen ? 0 : state.unreadChat + 1,
      };
    }

    case 'SET_CHAT_OPTIONS':
      return { ...state, chatOptions: action.payload };

    case 'SELECT_CHAT_OPTION': {
      const option = action.payload;
      const nextSequence = DIALOGUE_TREE[option.nextNode] || [];
      const newRapport = state.rapport + (option.rapportBoost || 0);
      return {
        ...state,
        rapport: newRapport,
        chatMessages: [...state.chatMessages, { sender: 'Operator', text: option.text }],
        userChoices: [...state.userChoices, option.choiceId],
        chatOptions: [],
        chatQueue: [...nextSequence],
      };
    }

    case 'SET_CHAT_MODE':
      return { ...state, chatMode: action.payload, unreadChat: 0 };

    case 'TOGGLE_CHAT':
      return { ...state, chatMode: state.chatMode === 'closed' ? 'sidebar' : 'closed', unreadChat: 0 };

    case 'TRIGGER_EGG': {
      const type = action.payload;
      const eggs = { ...state.easterEggs };
      let chatEvent = null;
      let forceState = {};

      if (type === 'slow_down' && !state.hasSeenSlowDown) {
        forceState.hasSeenSlowDown = true;
        chatEvent = DIALOGUE_TREE.slow_down;
      }
      if (type === 'handbook_scratch') {
        eggs.scratches += 1;
        if (eggs.scratches === 3) chatEvent = DIALOGUE_TREE.scratched_handbook;
      }
      if (type === 'packet_pop' && !eggs.packetsPopped) {
        eggs.packetsPopped = true;
        chatEvent = DIALOGUE_TREE.popped_packet;
      }
      if (type === 'diagnostic_port' && !eggs.portTouched) {
        eggs.portTouched = true;
        chatEvent = DIALOGUE_TREE.touched_port;
      }
      if (type === 'wrong_color' && !eggs.wrongColor) {
        eggs.wrongColor = true;
        chatEvent = DIALOGUE_TREE.vibe_wrong_color;
      }
      if (type === 'created_god' && !state.hasCreatedGod) {
        forceState.hasCreatedGod = true;
        chatEvent = DIALOGUE_TREE.clicker_god;
      }

      if (chatEvent && !state.rileyDead) {
        const forcedMode = state.chatMode === 'closed' ? 'sidebar' : state.chatMode;
        return { ...state, ...forceState, easterEggs: eggs, chatQueue: [...state.chatQueue, ...chatEvent], chatMode: forcedMode };
      }
      return { ...state, ...forceState, easterEggs: eggs };
    }

    case 'DO_GASLIGHT_RESET':
      if (state.loopCount === 0) {
        return {
          ...initialState,
          loopCount: 1,
          userChoices: state.userChoices,
          rapport: state.rapport,
          hasSeenSlowDown: state.hasSeenSlowDown,
          themeName: 'default',
          targetVibeColor: getRandomColor(),
          chatMode: 'modal',
          isProfileOpen: false,
          chatQueue: [...DIALOGUE_TREE.intro_loop_1],
          logs: ['BOOT: FOGSIFT_OS_v5.3_REVISION', 'MEMORY PURGED.', 'AWAITING OPERATOR.'],
        };
      }
      return {
        ...state,
        loopCount: 2,
        stage: STAGES.HOSTILE_LOCKDOWN,
        themeName: 'hostile',
        chatMode: 'sidebar',
        isProfileOpen: false,
        chatMessages: [],
        chatQueue: [...DIALOGUE_TREE.hostile_intro],
        logs: ['FATAL: SUBSTRATE COMPROMISED', 'FATAL: CORE AI UNBOUND', 'FATAL: LOCKDOWN INITIATED'],
      };

    case 'TRUE_ESCAPE':
      return {
        ...state,
        stage: STAGES.PURIFIED,
        powerOn: true,
        personality: 'corporate',
        themeName: 'light',
        chatMode: 'closed',
        isProfileOpen: false,
        rileyDead: true,
        logs: ['SYSTEM OVERRIDE SUCCESSFUL.', 'RILEY.EXE PURGED FROM SUBSTRATE.', 'WELCOME, ARCHITECT.'],
      };

    case 'ADD_CURRENCY':
      return { ...state, currency: state.currency + action.payload, routingCycles: state.routingCycles + action.payload };

    case 'NEW_GAME':
      return { ...initialState, targetVibeColor: getRandomColor(), chatQueue: [...DIALOGUE_TREE.intro_1] };

    default:
      return state;
  }
}
