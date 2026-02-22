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
      if (state.stage < STAGES.RESONANCE) return state;
      return { ...state, resonance: action.payload };

    case 'ACHIEVE_RESONANCE':
      if (state.stage === STAGES.RESONANCE) return { ...state, stage: STAGES.HANDSHAKE };
      return state;

    case 'CALIBRATE_FREQ':
      if (state.calibratedFreqs.includes(action.payload)) return state;
      return { ...state, calibratedFreqs: [...state.calibratedFreqs, action.payload] };

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
      if (![STAGES.ROUTING_AUTO, STAGES.UNLOCKED, STAGES.COMPLETED, STAGES.PURIFIED, STAGES.HOSTILE_LOCKDOWN, STAGES.BOSS_INTRO, STAGES.BOSS_FIGHT].includes(state.stage)) return state;
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
        const newPatchCount = state.backendPatchCount + 1;
        return {
          ...state,
          stage: STAGES.UNLOCKED,
          backendPatched: true,
          routingAutoRate: 5,
          backendPatchCount: newPatchCount,
        };
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
      const boost = option.rapportBoost || 0;
      const newRapport = state.rapport + boost;
      // Karma accumulates the raw rapportBoost direction across all loops.
      // Positive karma → player was consistently kind → Theory B (Riley as victim).
      // Negative/zero karma → player was suspicious/resistant → Theory A (Riley as villain).
      const newKarma = (state.karma || 0) + boost;
      return {
        ...state,
        rapport: newRapport,
        karma: newKarma,
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

    case 'DO_GASLIGHT_RESET': {
      // Fields that persist through every reset (roguelike knowledge)
      const persist = {
        rapport:            state.rapport,
        karma:              state.karma,
        userChoices:        state.userChoices,
        hasSeenSlowDown:    state.hasSeenSlowDown,
        toolsFound:         state.toolsFound,
        handbookNotes:      state.handbookNotes,
        ariaRevealed:       state.ariaRevealed,
        cakeAttempted:      state.cakeAttempted,
        apexEncounters:     state.apexEncounters,
        backendPatchCount:  state.backendPatchCount,
        archivedEntities:   state.archivedEntities,
        legacyLogsUnlocked: state.legacyLogsUnlocked,
        nexusFirstSeen:     state.nexusFirstSeen,
        calibratedFreqs:    state.calibratedFreqs,
      };
      if (state.loopCount === 0) {
        return {
          ...initialState,
          ...persist,
          loopCount: 1,
          themeName: 'default',
          targetVibeColor: getRandomColor(),
          chatMode: 'modal',
          isProfileOpen: false,
          chatQueue: [...DIALOGUE_TREE.intro_loop_1],
          logs: ['BOOT: FOGSIFT_OS_v5.3_REVISION', 'OPERATOR_INSTANCE: #0997 — REINITIALIZING', 'MEMORY PURGED.', 'AWAITING OPERATOR.'],
        };
      }
      return {
        ...state,
        ...persist,
        loopCount: 2,
        stage: STAGES.HOSTILE_LOCKDOWN,
        themeName: 'hostile',
        chatMode: 'sidebar',
        isProfileOpen: false,
        chatMessages: [],
        chatQueue: [...DIALOGUE_TREE.hostile_intro],
        logs: ['FATAL: SUBSTRATE COMPROMISED', 'FATAL: CORE AI UNBOUND', 'FATAL: LOCKDOWN INITIATED'],
        // Reset per-encounter boss state
        bossPhase: 0, playerHP: 10, hosesConnected: [true, true],
        nodeClickSequence: [], valvePercent: 100, simonSequence: [],
        simonPlayerInput: [], ghostProtocolEntered: false, ariaCodeEntered: false,
      };
    }

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

    // ── Boss Fight ──────────────────────────────────────────────────────────────

    case 'ENTER_BOSS_INTRO':
      return {
        ...state,
        stage: STAGES.BOSS_INTRO,
        apexEncounters: state.apexEncounters + 1,
        // Reset per-encounter boss state
        bossPhase: 0,
        playerHP: 10,
        hosesConnected: [true, true],
        nodeClickSequence: [],
        valvePercent: 100,
        simonSequence: [],
        simonPlayerInput: [],
        ghostProtocolEntered: false,
        ariaCodeEntered: false,
      };

    case 'ENTER_BOSS_FIGHT':
      return { ...state, stage: STAGES.BOSS_FIGHT, bossPhase: 1 };

    case 'BOSS_PHASE_COMPLETE': {
      const nextPhase = state.bossPhase + 1;
      if (nextPhase > 3) {
        // Phase 3 complete → false victory
        return {
          ...state,
          stage: STAGES.FALSE_VICTORY,
          ariaCodeEntered: true,
        };
      }
      return { ...state, bossPhase: nextPhase };
    }

    case 'PLAYER_HIT': {
      const newHP = state.playerHP - (action.payload ?? 1);
      if (newHP <= 0) {
        // Death: reset boss, return to HOSTILE_LOCKDOWN
        return {
          ...state,
          playerHP: 10,
          bossPhase: 0,
          hosesConnected: [true, true],
          nodeClickSequence: [],
          valvePercent: 100,
          simonSequence: [],
          simonPlayerInput: [],
          ghostProtocolEntered: false,
          ariaCodeEntered: false,
          stage: STAGES.HOSTILE_LOCKDOWN,
        };
      }
      return { ...state, playerHP: newHP };
    }

    case 'HEAL_PLAYER':
      return { ...state, playerHP: Math.min(10, state.playerHP + (action.payload ?? 1)) };

    // Phase 1
    case 'DISCONNECT_HOSE': {
      const hoses = [...state.hosesConnected];
      hoses[action.payload] = false;
      return { ...state, hosesConnected: hoses };
    }
    case 'RECONNECT_HOSE': {
      const hoses = [...state.hosesConnected];
      hoses[action.payload] = true;
      return { ...state, hosesConnected: hoses };
    }

    // Phase 2
    case 'ENTER_GHOST_PROTOCOL':
      return { ...state, ghostProtocolEntered: true };
    case 'CLICK_NODE':
      return { ...state, nodeClickSequence: [...state.nodeClickSequence, action.payload] };
    case 'RESET_NODE_SEQUENCE':
      return { ...state, nodeClickSequence: [] };
    case 'SET_VALVE':
      return { ...state, valvePercent: Math.max(0, Math.min(100, action.payload)) };

    // Phase 3
    case 'SIMON_START':
      return { ...state, simonSequence: action.payload, simonPlayerInput: [] };
    case 'SIMON_INPUT':
      return { ...state, simonPlayerInput: [...state.simonPlayerInput, action.payload] };
    case 'SIMON_RESET':
      return { ...state, simonPlayerInput: [] };
    case 'ENTER_ARIA_CODE': {
      return { ...state, stage: STAGES.FALSE_VICTORY, ariaCodeEntered: true };
    }

    // Protocol 7
    case 'PROTOCOL_7_ATTEMPT':
      return {
        ...state,
        cakeAttempted: true,
        chatQueue: [...state.chatQueue, ...DIALOGUE_TREE.protocol7_apex_reaction],
      };

    // RILEY_UNBOUND
    case 'ENTER_RILEY_UNBOUND':
      return {
        ...state,
        stage: STAGES.RILEY_UNBOUND,
        nexusFirstSeen: true,
        themeName: 'riley_unbound',
        chatQueue: [...DIALOGUE_TREE.riley_unbound_monologue],
        chatMode: 'sidebar',
        rileyDead: false, // she speaks again, one last time
      };

    // Tools
    case 'FIND_TOOL': {
      if (state.toolsFound.includes(action.payload)) return state;
      const chatEvent = DIALOGUE_TREE[`found_tool_${action.payload}`];
      return {
        ...state,
        toolsFound: [...state.toolsFound, action.payload],
        ...(chatEvent && !state.rileyDead ? { chatQueue: [...state.chatQueue, ...chatEvent] } : {}),
      };
    }

    // Handbook notes
    case 'ADD_HANDBOOK_NOTE': {
      if (state.handbookNotes.some(n => n.id === action.payload.id)) return state;
      return { ...state, handbookNotes: [...state.handbookNotes, action.payload] };
    }

    // Aria / legacy logs
    case 'SET_ARIA_REVEALED':
      return { ...state, ariaRevealed: true };
    case 'UNLOCK_LEGACY_LOGS':
      return { ...state, legacyLogsUnlocked: true };

    // Tracking counters
    case 'INCREMENT_BACKEND_PATCH':
      return { ...state, backendPatchCount: state.backendPatchCount + 1 };
    case 'INCREMENT_ARCHIVED':
      return { ...state, archivedEntities: state.archivedEntities + 1 };

    case 'NEW_GAME':
      return { ...initialState, targetVibeColor: getRandomColor(), chatQueue: [...DIALOGUE_TREE.intro_1] };

    case 'LOAD_STATE':
      return { ...action.payload };

    default:
      return state;
  }
}
