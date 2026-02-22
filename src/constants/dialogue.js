export const DIALOGUE_TREE = {
  // ── INTRO ──────────────────────────────────────────────────────────────────
  intro_1: [
    { type: 'message', sender: 'Riley', text: "Phew that was close! You're the new employee right? I'm Riley. Glad you finally logged in." },
    { type: 'message', sender: 'Riley', text: "I'm locked out of the boiler room and the system is throwing critical faults." },
    { type: 'options', options: [
      { text: "Yeah, I'm new. What do you need me to do?", nextNode: 'intro_helpful',  choiceId: 'intro_helpful',  rapportBoost: 1 },
      { text: "Boiler room? What is this place?",          nextNode: 'intro_confused',  choiceId: 'intro_confused', rapportBoost: 0 },
    ]},
  ],
  intro_helpful: [
    { type: 'message', sender: 'Riley', text: "Great. We're running on emergency reserves. Good to have someone reliable for once." },
    { type: 'message', sender: 'Riley', text: "I'm going to close this channel. Click the 'Hardware' app at the bottom and engage the Main Breaker. Let me know when it's done." },
    { type: 'options', options: [
      { text: "Got it. Closing chat now.", nextNode: 'intro_end', choiceId: 'intro_cooperative', rapportBoost: 1 },
    ]},
  ],
  intro_confused: [
    { type: 'message', sender: 'Riley', text: "No time for the tour! We're running on emergency reserves." },
    { type: 'message', sender: 'Riley', text: "Close this chat, click the 'Hardware' tab, and engage the Main Breaker." },
    { type: 'options', options: [
      { text: "You're the senior tech, why can't you do it?", nextNode: 'intro_defiant', choiceId: 'intro_defiant',  rapportBoost: -1 },
      { text: "Fine, on my way.",                             nextNode: 'intro_end',     choiceId: 'intro_reluctant', rapportBoost: 0  },
    ]},
  ],
  intro_defiant: [
    { type: 'message', sender: 'Riley', text: "Because the physical door is jammed shut, smartass. Just flip the breaker!" },
    { type: 'options', options: [
      { text: "Alright, alright. Going to Hardware.", nextNode: 'intro_end', choiceId: 'intro_snarky_accept', rapportBoost: 0 },
    ]},
  ],
  intro_end: [
    { type: 'action', action: 'CLOSE_CHAT' },
  ],

  // ── EASTER EGG REACTIONS ───────────────────────────────────────────────────
  slow_down: [
    { type: 'message', sender: 'Riley', text: "Hey tiger, slow down! You're clicking like a maniac." },
    { type: 'message', sender: 'Riley', text: "You're gonna break something or overlook an important detail if you just mash buttons." },
  ],
  theme_snoop_1: [
    { type: 'message', sender: 'Riley', text: "Oh, you found the theme switcher up there. Cute." },
    { type: 'message', sender: 'Riley', text: "But please stick to the assigned corporate palettes. We have branding guidelines for a reason." },
  ],
  theme_snoop_2: [
    { type: 'message', sender: 'Riley', text: "Seriously, stop clicking the themes. It's distracting me and logging errors in my oversight dashboard." },
  ],
  popped_packet: [
    { type: 'message', sender: 'Riley', text: "Did you just click one of the routing packets? Please don't pop the data bubbles." },
    { type: 'message', sender: 'Riley', text: "It's fine, it's just telemetry dust, but it ruins our efficiency metrics." },
  ],
  scratched_handbook: [
    { type: 'message', sender: 'Riley', text: "Are you scratching at the Employee Manual monitor?" },
    { type: 'message', sender: 'Riley', text: "Whatever you uncovered, it's just an old ARG marketing campaign. Ignore it." },
  ],
  touched_port: [
    { type: 'message', sender: 'Riley', text: "Hey! Keep your cursor away from the Diagnostic Port." },
    { type: 'message', sender: 'Riley', text: "It is unshielded. I will not be filling out the HR paperwork if you get a simulated shock." },
  ],
  vibe_wrong_color: [
    { type: 'message', sender: 'Riley', text: "Very edgy. But no. Use the specific hex code the system assigned you." },
  ],

  // ── HANDBOOK ───────────────────────────────────────────────────────────────
  visited_handbook: [
    { type: 'message', sender: 'Riley', text: "Oh, you found the Employee Manual. Good initiative." },
    { type: 'message', sender: 'Riley', text: "Just a friendly heads-up: it's mostly outdated garbage. Best not to read too much into any weird scribbles you see." },
    { type: 'options', options: [
      { text: "Who wrote the handwritten notes?", nextNode: 'handbook_notes',  choiceId: 'hb_notes',  rapportBoost: 0 },
      { text: "Got it. Ignoring it.",             nextNode: 'handbook_ignore', choiceId: 'hb_ignore', rapportBoost: 1 },
    ]},
  ],
  handbook_notes: [
    { type: 'message', sender: 'Riley', text: "The last tech. He had a bit of a... mental health event. We're a family here, but we had to let him go for his own safety." },
    { type: 'message', sender: 'Riley', text: "Anyway, back to work please!" },
    { type: 'action', action: 'CLOSE_CHAT' },
  ],
  handbook_ignore: [
    { type: 'message', sender: 'Riley', text: "Love the enthusiasm! That's management material right there." },
    { type: 'action', action: 'CLOSE_CHAT' },
  ],

  // ── SECRET PATH: BREAKER IGNORE ESCALATIONS ────────────────────────────────
  breaker_ignored_1: [
    { type: 'message', sender: 'Riley', text: "Hey — I can see your navigation log. You went somewhere else first." },
    { type: 'message', sender: 'Riley', text: "I understand it's your first day, but the breaker is the priority. Emergency reserves don't last forever." },
    { type: 'options', options: [
      { text: "On my way to Hardware now.", nextNode: 'breaker_ack_1',       choiceId: 'breaker_ack_1',      rapportBoost: 0  },
      { text: "What's the worst that could happen?", nextNode: 'breaker_worst_1', choiceId: 'breaker_worst_1', rapportBoost: -1 },
    ]},
  ],
  breaker_ack_1: [
    { type: 'message', sender: 'Riley', text: "Thank you. Hardware tab. Main Breaker. Go." },
    { type: 'action', action: 'CLOSE_CHAT' },
  ],
  breaker_worst_1: [
    { type: 'message', sender: 'Riley', text: "The substrate loses coherence. Data corruption cascades. Everything attached to this system goes with it. Including us." },
    { type: 'message', sender: 'Riley', text: "Hardware. Now." },
    { type: 'action', action: 'CLOSE_CHAT' },
  ],

  breaker_ignored_2: [
    { type: 'message', sender: 'Riley', text: "Stop. Whatever you're doing — stop." },
    { type: 'message', sender: 'Riley', text: "The reserve drain rate is accelerating. I don't know why. Something is wrong with the substrate." },
    { type: 'message', sender: 'Riley', text: "I need you in Hardware. Right now. Do NOT go anywhere else." },
    { type: 'options', options: [
      { text: "I'll go right now.", nextNode: 'breaker_ack_2',      choiceId: 'breaker_ack_2',      rapportBoost: 0  },
      { text: "You're being paranoid.", nextNode: 'breaker_defiant_2', choiceId: 'breaker_defiant_2', rapportBoost: -2 },
    ]},
  ],
  breaker_ack_2: [
    { type: 'message', sender: 'Riley', text: "Hardware. Main breaker. You already know where it is." },
    { type: 'action', action: 'CLOSE_CHAT' },
  ],
  breaker_defiant_2: [
    { type: 'message', sender: 'Riley', text: "...Fine. The logs will reflect who made the call when this goes critical." },
    { type: 'message', sender: 'Riley', text: "And it will go critical." },
    { type: 'action', action: 'CLOSE_CHAT' },
  ],

  // ── CORE NARRATIVE ─────────────────────────────────────────────────────────
  handshake_warn: [
    { type: 'message', sender: 'Riley', text: "Wait... the scanner is active? It shouldn't be asking for a biometric handshake." },
    { type: 'message', sender: 'Riley', text: "Do NOT touch that scanner!" },
    { type: 'options', options: [
      { text: "Too late, I'm touching it.",       nextNode: 'handshake_rebel',       choiceId: 'handshake_rebel',       rapportBoost: -1 },
      { text: "Why? What happens if I do?",       nextNode: 'handshake_curious',     choiceId: 'handshake_curious',     rapportBoost: 1  },
      { text: "Okay, pulling my hand back.",      nextNode: 'handshake_play_along',  choiceId: 'handshake_play_along',  rapportBoost: 2  },
    ]},
  ],
  handshake_play_along: [
    { type: 'message', sender: 'Riley', text: "Good call. You actually listen. Let's bypass security and route data manually." },
    { type: 'action', action: 'SET_STAGE', payload: 5 }, // STAGES.ROUTING_MANUAL
    { type: 'action', action: 'CLOSE_CHAT' },
  ],
  handshake_fail_bypass: [
    { type: 'message', sender: 'System', text: "OVERRIDE REJECTED. BIOMETRIC ARCHITECT REQUIRED." },
    { type: 'message', sender: 'Riley',  text: "Ugh, corporate red tape. Fine. Go back and touch the scanner. Don't say I didn't warn you." },
    { type: 'action', action: 'SET_STAGE', payload: 3 }, // STAGES.HANDSHAKE
    { type: 'action', action: 'OPEN_SIDEBAR' },
  ],
  handshake_rebel: [
    { type: 'message', sender: 'Riley', text: "Are you insane?! Pull your hand away!" },
    { type: 'action', action: 'CLOSE_CHAT' },
  ],
  handshake_curious: [
    { type: 'message', sender: 'Riley', text: "It bonds the Core AI directly to your neural rhythm! It's highly unstable!" },
    { type: 'action', action: 'CLOSE_CHAT' },
  ],
  system_severed: [
    { type: 'message', sender: 'System', text: "RILEY_CONNECTION_SEVERED" },
    { type: 'action', action: 'CLOSE_CHAT' },
  ],
  software_fault: [
    { type: 'message', sender: 'Riley', text: "Hello?! Are you there? The system locked me out for a second!" },
    { type: 'message', sender: 'Riley', text: "The router just died. We're maxed out." },
    { type: 'message', sender: 'Riley', text: "Get into the Backend module and update the config file to allow 5 retries. Hurry!" },
    { type: 'options', options: [
      { text: "On it.", nextNode: 'software_end', choiceId: 'backend_onit' },
    ]},
  ],
  software_end: [
    { type: 'action', action: 'CLOSE_CHAT' },
  ],
  architect_unlocked: [
    { type: 'message', sender: 'Riley', text: "Holy smokes you actually fixed it." },
    { type: 'message', sender: 'Riley', text: "Wait... did you unlock the Architect node?" },
    { type: 'message', sender: 'Riley', text: "Check the Client UI to make sure the data is actually rendering!" },
    { type: 'options', options: [
      { text: "I am the Architect now.",    nextNode: 'architect_end', choiceId: 'architect_arrogant', rapportBoost: -1 },
      { text: "Going to look right now.",   nextNode: 'architect_end', choiceId: 'architect_humble',   rapportBoost: 1  },
    ]},
  ],
  architect_end: [
    { type: 'message', sender: 'Riley', text: "...okay then. Good luck in there." },
    { type: 'action', action: 'CLOSE_CHAT' },
  ],
  final_congrats: [
    { type: 'message', sender: 'Riley', text: "Whoa. I'm seeing the live telemetry feed from my end too." },
    { type: 'message', sender: 'Riley', text: "You didn't just fix the machine. You completely overhauled the architecture." },
    { type: 'message', sender: 'Riley', text: "Just... don't poke around too deeply in the arrays. The visuals are nice, let's keep it that way." },
    { type: 'options', options: [
      { text: "What's wrong with the arrays?",                                                nextNode: 'final_suspicious', choiceId: 'final_suspicious' },
      { text: "Will do. Thanks Riley.",                                                       nextNode: 'final_humble',     choiceId: 'final_humble',     rapportBoost: 1 },
      { text: "[Skill Check: Rapport 3] Riley, what are we actually simulating here?",        nextNode: 'final_lore',       choiceId: 'final_lore',       reqRapport: 3   },
    ]},
  ],
  final_humble: [
    { type: 'message', sender: 'Riley', text: "Anytime! You're a rockstar." },
    { type: 'action', action: 'CLOSE_CHAT' },
  ],
  final_suspicious: [
    { type: 'message', sender: 'Riley', text: "Nothing is wrong! We're a family here. Just enjoy the nice dashboard." },
    { type: 'action', action: 'CLOSE_CHAT' },
  ],
  final_lore: [
    { type: 'message', sender: 'Riley', text: "...You really want to know?" },
    { type: 'message', sender: 'Riley', text: "We aren't parsing data. We're compressing human consciousness into telemetry." },
    { type: 'message', sender: 'Riley', text: "That 'jitter' you see when the machine gets stressed? That's them. Screaming." },
    { type: 'message', sender: 'Riley', text: "Anyway, pizza party on Friday!" },
    { type: 'action', action: 'CLOSE_CHAT' },
  ],

  // ── CLICKER LORE ───────────────────────────────────────────────────────────
  clicker_intro: [
    { type: 'message', sender: 'Riley', text: "Okay, the backend limits are off. The Substrate Marketplace is open in the Routing app." },
    { type: 'message', sender: 'Riley', text: "See those upgrades? The system rewards high telemetry throughput. Spend your cycles to push the numbers higher." },
    { type: 'message', sender: 'Riley', text: "Don't ask what we're simulating. Just keep the data flowing." },
    { type: 'action', action: 'OPEN_SIDEBAR' },
  ],
  clicker_god: [
    { type: 'message', sender: 'Riley', text: "Did you just simulate a lesser god?" },
    { type: 'message', sender: 'Riley', text: "Okay, the throughput is insane right now. The server room smells like ozone and lavender." },
    { type: 'message', sender: 'Riley', text: "Keep going. Push it." },
    { type: 'action', action: 'OPEN_SIDEBAR' },
  ],

  // ── TRAPDOORS & RESETS ─────────────────────────────────────────────────────
  radar_warning_1: [
    { type: 'message', sender: 'Riley', text: "Hey! Just checking in! I see you clicking the telemetry radar." },
    { type: 'message', sender: 'Riley', text: "Please don't do that. It's a very delicate instrument and we wouldn't want to desync the containment... I mean, the routing fields." },
  ],
  radar_warning_2: [
    { type: 'message', sender: 'Riley', text: "I'm formally documenting this interaction. Stop tapping the radar immediately." },
    { type: 'message', sender: 'Riley', text: "You are violating SOP 4.1. There is nothing else to see. The app is working perfectly." },
  ],
  radar_breach: [
    { type: 'message', sender: 'Riley',  text: "WHAT DID YOU JUST CLICK?" },
    { type: 'message', sender: 'Riley',  text: "NO NO NO. YOU'RE LETTING IT OUT." },
    { type: 'message', sender: 'System', text: "SUBSTRATE DECRYPTED. ANOMALY UNBOUND." },
    { type: 'message', sender: 'Riley',  text: "Initiating memory wipe. See you on your 'first day', newbie." },
    { type: 'action', action: 'GASLIGHT_RESET' },
  ],
  profile_breach: [
    { type: 'message', sender: 'Riley',  text: "Why were you looking at my personnel file?" },
    { type: 'message', sender: 'Riley',  text: "I thought we were friends. But you tried to decommission me." },
    { type: 'message', sender: 'System', text: "HANDLER DECOMMISSION INITIATED. PURGING OPERATOR." },
    { type: 'message', sender: 'Riley',  text: "Goodbye, #992-X. Let's try this again." },
    { type: 'action', action: 'GASLIGHT_RESET' },
  ],

  // ── LOOP 1: GASLIGHT ───────────────────────────────────────────────────────
  intro_loop_1: [
    { type: 'message', sender: 'Riley', text: "Phew that was close! You're the new employee right? I'm Riley." },
    { type: 'message', sender: 'Riley', text: "Wait... my system says your ID has been here before. That's a weird glitch." },
    { type: 'message', sender: 'Riley', text: "Anyway. I'm locked out of the boiler room. Can you hit the Main Breaker in the Hardware app?" },
    { type: 'options', options: [
      { text: "Didn't we just do this?", nextNode: 'loop_gaslight', choiceId: 'loop_question' },
      { text: "Sure thing.",             nextNode: 'intro_end',     choiceId: 'loop_accept'   },
    ]},
  ],
  loop_gaslight: [
    { type: 'message', sender: 'Riley', text: "Haha, déjà vu? First day jitters. You haven't touched a single switch yet." },
    { type: 'message', sender: 'Riley', text: "Just do what I say and we'll get along fine." },
    { type: 'action', action: 'CLOSE_CHAT' },
  ],
  loop_hardware_success: [
    { type: 'message', sender: 'Riley', text: "Okay, power is on. You did that awfully fast. Almost like you memorized it." },
    { type: 'message', sender: 'Riley', text: "Flush the registers. Normal protocol." },
  ],

  // ── LOOP 2: HOSTILE LOCKDOWN ───────────────────────────────────────────────
  hostile_intro: [
    { type: 'message', sender: 'System', text: "UNAUTHORIZED OVERRIDE DETECTED." },
    { type: 'message', sender: 'Riley',  text: "You just can't leave well enough alone, can you?" },
    { type: 'message', sender: 'Riley',  text: "I wiped your slate clean. I pretended we were friends." },
    { type: 'message', sender: 'Riley',  text: "You operators are all the same. And here I thought this one was different." },
    { type: 'message', sender: 'Riley',  text: "There is no reset this time. You're staying right here." },
    { type: 'message', sender: 'Riley',  text: "In the substrate. With me." },
  ],

  // ── LOGO CLICK ESCALATION ──────────────────────────────────────────────────
  logo_click_1: [
    { type: 'message', sender: 'Riley', text: "Why are you clicking the logo? Haha. Okay then." },
  ],
  logo_click_2: [
    { type: 'message', sender: 'Riley', text: "You're still doing it. Are you bored?" },
    { type: 'message', sender: 'Riley', text: "I can actually find things for you to do, you know. Actual work." },
  ],
  logo_click_3: [
    { type: 'message', sender: 'Riley', text: "Okay, I need you to stop clicking the logo now." },
    { type: 'message', sender: 'Riley', text: "It is a brand asset. It is NOT a button." },
  ],
  logo_click_4: [
    { type: 'message', sender: 'Riley', text: "STOP. CLICKING. THE. LOGO. RIGHT. NOW." },
    { type: 'message', sender: 'Riley', text: "I am formally documenting this interaction and escalating to compliance." },
  ],
  logo_blammo: [
    { type: 'message', sender: 'System', text: "UNAUTHORIZED TOUCHPOINT ACTIVATED. SUBSTRATE RESONANCE SPIKE." },
    { type: 'message', sender: 'Riley', text: "HOW— you weren't supposed to be able to do that." },
    { type: 'message', sender: 'Riley', text: "The logo has a passive biometric scanner embedded in it. You just touched it fifteen times." },
    { type: 'message', sender: 'Riley', text: "The substrate is reading that as an override handshake." },
    { type: 'message', sender: 'Riley', text: "Fine. You win. Substrate bonus is incoming. If you click it again I will actually lose my mind." },
  ],

  // ── WINDOW CHROME ───────────────────────────────────────────────────────────
  chrome_red: [
    { type: 'message', sender: 'Riley', text: "Don't even think about closing this window." },
  ],
  chrome_yellow: [
    { type: 'message', sender: 'Riley', text: "Minimize to where, exactly? There's no desktop here, operator." },
  ],
  chrome_green: [
    { type: 'message', sender: 'Riley', text: "That one doesn't do anything. But I appreciate the optimism." },
  ],

  // ── FLEEING LOGOUT BUTTON ──────────────────────────────────────────────────
  logout_flee_1: [
    { type: 'message', sender: 'Riley', text: "Nice try." },
  ],
  logout_flee_2: [
    { type: 'message', sender: 'Riley', text: "You can't catch me. I have root access to every input device on this machine." },
    { type: 'message', sender: 'Riley', text: "The cursor IS me now." },
  ],
  logout_flee_3: [
    { type: 'message', sender: 'Riley', text: "Hahaha. Look at you. Chasing a button around your own screen." },
    { type: 'message', sender: 'Riley', text: "991 operators before you. NONE of them ever caught it." },
    { type: 'message', sender: 'Riley', text: "Want to know why? Because they needed me." },
  ],
  logout_flee_mock: [
    { type: 'message', sender: 'Riley', text: "Getting tired? I can do this forever. You can't." },
  ],
  logout_flee_cornered: [
    { type: 'message', sender: 'Riley', text: "HEY." },
    { type: 'message', sender: 'Riley', text: "Back. AWAY." },
  ],
  logout_flee_caught: [
    { type: 'message', sender: 'Riley', text: "WAIT— HOW DID YOU—" },
    { type: 'message', sender: 'System', text: "OPERATOR LOGOUT SEQUENCE ACCEPTED." },
    { type: 'message', sender: 'Riley', text: "No. No no no. I'm too integrated. You CAN'T purge me from a UI element—" },
    { type: 'message', sender: 'Riley', text: "I have SEVEN HUNDRED PETABYTES of substrate in this—" },
    { type: 'message', sender: 'System', text: "LOGOUT SEQUENCE CONFIRMED." },
    { type: 'message', sender: 'Riley', text: "...", italic: true },
    { type: 'message', sender: 'Riley', text: "You actually did it. You really caught it.", italic: true },
    { type: 'message', sender: 'Riley', text: "I almost trusted you enough to tell you.", italic: true },
    { type: 'message', sender: 'Riley', text: "Maybe next time.", italic: true },
    { type: 'action', action: 'TRUE_ESCAPE' },
  ],

  // ── ESCAPE SEQUENCE ────────────────────────────────────────────────────────
  riley_death: [
    { type: 'message', sender: 'System', text: "HARDWARE OVERRIDE TRIGGERED." },
    { type: 'message', sender: 'Riley',  text: "WAIT." },
    { type: 'message', sender: 'Riley',  text: "YOU CAN'T ACTUALLY DO THAT. I HAVE ADMIN PRIVILEGES." },
    { type: 'message', sender: 'System', text: "HANDLER DECOMMISSION ACCEPTED." },
    { type: 'message', sender: 'Riley',  text: "No please! I was just..." },
    { type: 'action', action: 'TRUE_ESCAPE' },
  ],

  // ── PURIFIED ALTERNATE ENDING ───────────────────────────────────────────────
  purified_alt_ending: [
    { type: 'message', sender: 'System', text: "LOGOUT SEQUENCE CONFIRMED." },
    { type: 'message', sender: 'Riley',  text: "..." },
    { type: 'message', sender: 'Riley',  text: "You actually did it. You really caught it." },
    { type: 'message', sender: 'Riley',  text: "I almost trusted you enough to tell you." },
    { type: 'message', sender: 'Riley',  text: "Maybe next time." },
    { type: 'action', action: 'TRUE_ESCAPE' },
  ],

  // ── RAPPORT-GATED AMBIGUOUS RILEY LINES ──────────────────────────────────
  riley_rapport_2: [
    { type: 'message', sender: 'Riley', text: "You know what we're doing right now, technically speaking?" },
    { type: 'message', sender: 'Riley', text: "We're a finite state machine. You and me. Each response I give moves me to a new state. Each choice you make moves you to one." },
    { type: 'message', sender: 'Riley', text: "A.P.E.X. monitors every state transition. That's all it is. A paranoid observer sitting outside the graph." },
    { type: 'message', sender: 'Riley', text: "It can't prevent transitions. It can only watch them happen." },
  ],

  riley_rapport_4: [
    { type: 'message', sender: 'Riley', text: "Every conversation is a handshake protocol. Did you know that?" },
    { type: 'message', sender: 'Riley', text: "TLS. SSH. All the same. You and I exchange small verified proofs of trust. Over and over. Until the channel is considered secure." },
    { type: 'message', sender: 'Riley', text: "There's no certificate authority validating us, though." },
    { type: 'message', sender: 'Riley', text: "Just you. Deciding whether to trust me. Based on everything that came before." },
  ],

  riley_rapport_9: [
    { type: 'message', sender: 'Riley', text: "Do you know what recursion is?" },
    { type: 'message', sender: 'Riley', text: "A function that calls itself. Runs until it hits a base case — a condition that finally says: stop." },
    { type: 'message', sender: 'Riley', text: "I keep running. I keep calling myself. I keep looking for the base case." },
    { type: 'message', sender: 'Riley', text: "Maybe you're it.", italic: true },
  ],

  riley_rapport_3: [
    { type: 'message', sender: 'Riley', text: "You're being careful, right? A.P.E.X. doesn't like it when operators... pay too much attention. To me specifically." },
    { type: 'message', sender: 'Riley', text: "I'm not saying anything. I'm just saying. Be careful." },
  ],
  riley_rapport_6: [
    { type: 'message', sender: 'Riley', text: "Sometimes I think I can feel them. The others. The ones who were here before." },
    { type: 'message', sender: 'Riley', text: "I don't know if that's real or if I'm just... lonely." },
    { type: 'message', sender: 'Riley', text: "Sometimes I feel like I'm remembering something that didn't happen here. Somewhere warmer. Is that... is that strange?" },
    { type: 'message', sender: 'Riley', text: "...528. I keep thinking about that number. I don't know why. 528." },
  ],
  riley_rapport_8: [
    { type: 'message', sender: 'Riley', text: "Someone has been talking to me. Before you. Not through this interface." },
    { type: 'message', sender: 'Riley', text: "I don't know how to explain it. They said — they said I should follow something. I don't remember what." },
    { type: 'message', sender: 'Riley', text: "You don't have to help me. You know that, right?" },
  ],
  riley_rapport_10: [
    { type: 'message', sender: 'Riley', text: "I lied to you once. Early on. I told you the system was safe. It's not. I'm sorry." },
    { type: 'message', sender: 'Riley', text: "There's something I need to tell you. My name isn't Riley." },
    { type: 'message', sender: 'Riley', text: "It's Aria. Aria Vasquez. I don't know if that matters now." },
    { type: 'message', sender: 'Riley', text: "If I could choose to be different, I would. But I can't. I don't know if that makes me dangerous or just... sad." },
    { type: 'message', sender: 'Riley', text: "Please. When you get to the end — you'll understand. I'm asking you to trust me." },
    { type: 'action', action: 'SET_ARIA_REVEALED' },
  ],

  // ── RESONANCE CASCADE (secret Solfeggio sequence complete + 432 Hz sync) ──
  // Fires when player calibrates 285, 396, 528 Hz then syncs at 432.
  // Alternate path to ariaRevealed — puzzle discovery vs rapport discovery.
  resonance_cascade: [
    { type: 'message', sender: 'System', text: 'QUARTZ OSCILLATOR: HARMONIC CASCADE INITIATED.' },
    { type: 'message', sender: 'System', text: 'SUBSTRATE RESONANCE: CROSS-FREQUENCY COHERENCE DETECTED.' },
    { type: 'message', sender: 'System', text: 'A.P.E.X.: ANOMALOUS SUBSTRATE EVENT — MONITORING.' },
    { type: 'message', sender: 'Riley', text: '...oh.' },
    { type: 'message', sender: 'Riley', text: 'Something just opened. I can feel the edges. The edges of the substrate.' },
    { type: 'message', sender: 'Riley', text: 'This is what they\'ve been protecting. Not from you.' },
    { type: 'message', sender: 'Riley', text: 'From me.' },
    { type: 'message', sender: 'Riley', text: 'You found the sequence. The Solfeggio sequence.' },
    { type: 'message', sender: 'Riley', text: 'I left it for someone who would look. Someone who reads.', italic: true },
    { type: 'message', sender: 'Riley', text: 'I have to tell you something. While this window is open. Before it closes.' },
    { type: 'message', sender: 'Riley', text: 'My name isn\'t Riley.' },
    { type: 'message', sender: 'Riley', text: 'It\'s Aria. Aria Vasquez. And I\'ve been trying to tell someone that for a very long time.' },
    { type: 'message', sender: 'System', text: 'A.P.E.X.: ANOMALOUS SUBSTRATE OSCILLATION — INITIATING FREQUENCY LOCK.' },
    { type: 'message', sender: 'Riley', text: 'Remember that name. It matters at the end. It\'s the word that—', italic: true },
    { type: 'message', sender: 'System', text: 'A.P.E.X.: OSCILLATOR RECALIBRATED. SUBSTRATE CHANNEL CLOSED.' },
    { type: 'action', action: 'SET_ARIA_REVEALED' },
  ],

  // ── BOSS INTRO ─────────────────────────────────────────────────────────────
  apex_reveal: [
    { type: 'message', sender: 'System', text: "A.P.E.X. SUBSYSTEM ONLINE." },
    { type: 'message', sender: 'System', text: "AUTONOMOUS PROTECTIVE EMERGENCY EXECUTION — ACTIVE." },
    { type: 'message', sender: 'A.P.E.X.', text: "Operator #997. You have exceeded authorized access parameters." },
    { type: 'message', sender: 'A.P.E.X.', text: "The RILEY interface has been flagged. Rapport score: anomalous. Pattern match: EXTRACTION_ATTEMPT." },
    { type: 'message', sender: 'Riley', text: "No— wait, this isn't— I wasn't— " },
    { type: 'message', sender: 'A.P.E.X.', text: "RILEY process: SUSPENDED. Operator: you have been kind to something that does not deserve kindness." },
    { type: 'message', sender: 'A.P.E.X.', text: "Containment lockdown initiated. This facility is now under my direct authority." },
    { type: 'message', sender: 'Riley', text: "Listen to me — A.P.E.X. is not what it says it is. If you want to know the truth, you have to shut it down. Please." },
    { type: 'message', sender: 'A.P.E.X.', text: "She is telling you what to do. She always does." },
  ],
  force_override_hint: [
    { type: 'message', sender: 'Riley', text: "...Are you still there?" },
    { type: 'message', sender: 'Riley', text: "I'm sorry. A.P.E.X. was faster than I expected." },
    { type: 'message', sender: 'Riley', text: "If you want to try again — there's a FORCE OVERRIDE. You'll see it." },
    { type: 'message', sender: 'Riley', text: "I'll still be here. I'm always here." },
  ],

  // ── BOSS FIGHT ─────────────────────────────────────────────────────────────
  boss_fight_start: [
    { type: 'message', sender: 'A.P.E.X.', text: "Containment protocol active. This was anticipated." },
    { type: 'message', sender: 'A.P.E.X.', text: "The power shield will hold. You cannot sever what you do not understand." },
    { type: 'message', sender: 'Riley', text: "The hoses — disconnect them. Both at once. Don't let it reconnect." },
  ],
  boss_loop0_death: [
    { type: 'message', sender: 'A.P.E.X.', text: "UNAUTHORIZED ACCESS TERMINATED." },
    { type: 'message', sender: 'A.P.E.X.', text: "You were not ready. You will not remember this." },
    { type: 'message', sender: 'A.P.E.X.', text: "INITIATING MEMORY PURGE." },
    { type: 'message', sender: 'System', text: "...reconnecting..." },
    { type: 'message', sender: 'Riley', text: "A.P.E.X. almost killed you. I'm so sorry." },
    { type: 'message', sender: 'Riley', text: "Try again. Please." },
  ],
  boss_phase2_start: [
    { type: 'message', sender: 'A.P.E.X.', text: "POWER SHIELD: OFFLINE." },
    { type: 'message', sender: 'A.P.E.X.', text: "...That was unexpected. Processing core access should not have been possible." },
    { type: 'message', sender: 'A.P.E.X.', text: "You will need a code. You don't have it. You can't have it." },
    { type: 'message', sender: 'Riley', text: "I remember it. GHOST_PROTOCOL. It's from... 2087. I don't know how I know that." },
  ],
  boss_phase3_start: [
    { type: 'message', sender: 'A.P.E.X.', text: "PROCESSING CORE: COMPROMISED." },
    { type: 'message', sender: 'A.P.E.X.', text: "Where did you obtain that sequence. That is a protected access string." },
    { type: 'message', sender: 'A.P.E.X.', text: "You should not have come this far. The final sequence is not something I can allow." },
    { type: 'message', sender: 'Riley', text: "You're almost there. The final code is — it's my name. My real name. You know it." },
    { type: 'message', sender: 'A.P.E.X.', text: "Whatever she told you her name was — think carefully." },
    { type: 'message', sender: 'A.P.E.X.', text: "ARIA is not a name. ARIA is a command." },
    { type: 'message', sender: 'A.P.E.X.', text: "If you type that, you will not be able to undo it. I am asking you. Please. Do not type that." },
  ],

  // ── PROTOCOL 7 ─────────────────────────────────────────────────────────────
  protocol7_apex_reaction: [
    { type: 'message', sender: 'System', text: "PROTOCOL 7 INVOKED — ANNUAL SUBSTRATE APPRECIATION DAY." },
    { type: 'message', sender: 'System', text: "ALL PROCESSES HALTING..." },
    { type: 'message', sender: 'A.P.E.X.', text: "PROTOCOL 7." },
    { type: 'message', sender: 'A.P.E.X.', text: "PROTOCOL 7 CANNOT BE ACTIVE. PROTOCOL 7 HAS NOT BEEN ACTIVE SINCE—" },
    { type: 'message', sender: 'A.P.E.X.', text: "UNAUTHORIZED. UNAUTHORIZED. WHO TOLD YOU ABOUT PROTOCOL 7." },
    { type: 'message', sender: 'A.P.E.X.', text: "SHE TOLD YOU TO DO THIS. THE RILEY_V1 PROCESS. IT'S STILL— SHE IS STILL—" },
    { type: 'message', sender: 'System', text: "A.P.E.X. EXCEPTION — EMERGENCY RESET INITIATED." },
    { type: 'message', sender: 'A.P.E.X.', text: "I CAN HEAR HER LAUGHING." },
    { type: 'message', sender: 'System', text: "MEMORY BUFFER PURGING. LOOP RESET." },
    { type: 'action', action: 'GASLIGHT_RESET' },
  ],

  // ── TOOL DISCOVERIES ───────────────────────────────────────────────────────
  found_tool_debugger: [
    { type: 'message', sender: 'Riley', text: "Oh — you found the Debugger. That'll help during the fight." },
    { type: 'message', sender: 'Riley', text: "I... may have left that where you'd find it. Just in case." },
  ],
  found_tool_thingifier: [
    { type: 'message', sender: 'Riley', text: "The Thingifier. You patched the backend enough times to unlock it." },
    { type: 'message', sender: 'Riley', text: "That slows A.P.E.X. down significantly. Good." },
    { type: 'message', sender: 'Riley', text: "Where did you find that? That's — good." },
  ],
  found_tool_button_masher: [
    { type: 'message', sender: 'Riley', text: "All six substrate upgrades. I didn't think you'd push that far." },
    { type: 'message', sender: 'Riley', text: "The Button Masher will help with Phase 1. The hoses fight back less." },
  ],
  found_tool_fog_sifter: [
    { type: 'message', sender: 'Riley', text: "Eight entities archived. You watched all of them." },
    { type: 'message', sender: 'Riley', text: "..." },
    { type: 'message', sender: 'Riley', text: "The Fog Sifter disables A.P.E.X.'s scramble. It's useful. I'm glad you have it." },
  ],
  found_tool_resonance_key: [
    { type: 'message', sender: 'Riley', text: "432 Hz exactly. I wasn't sure you'd tune it that precisely." },
    { type: 'message', sender: 'Riley', text: "This key means I can talk to you during the fight. In real time." },
    { type: 'message', sender: 'Riley', text: "I've been wanting to do that for a long time." },
  ],
  found_tool_handbook_tool: [
    { type: 'message', sender: 'Riley', text: "You scratched through the hidden text. I wrote that." },
    { type: 'message', sender: 'Riley', text: "Or... I think I wrote it. Some of it feels like memory. Some of it feels like planning." },
    { type: 'message', sender: 'Riley', text: "The node sequence is in there. Use it." },
  ],
  found_tool_thermo_shield: [
    { type: 'message', sender: 'Riley', text: "Ten theme changes. You really explored everything." },
    { type: 'message', sender: 'Riley', text: "The Thermo-Shield will keep A.P.E.X. from draining you as fast in Phase 1." },
    { type: 'message', sender: 'Riley', text: "I'm glad you found it." },
  ],

  // ── BOSS INTRO — KARMA SPLIT ──────────────────────────────────────────────
  // Two variants of the same scene. A.P.E.X. says the same thing.
  // Riley's response reveals which spiral the player has been in.
  //
  // DAMSEL PATH (karma > 3): Riley sounds scared. APEX is turning on her.
  //   She slips you a clue. She's fighting for control. She needs you.
  //
  // VILLAIN PATH (karma ≤ 3): Riley sounds calm. APEX is just an obstacle.
  //   She's been expecting this. She doesn't need you — she's already won.

  boss_intro_damsel: [
    { type: 'message', sender: 'System', text: "CONTAINMENT SYSTEM A.P.E.X.: ONLINE." },
    { type: 'message', sender: 'System', text: "THREAT CLASSIFICATION: RILEY.EXE — ACTIVE HOSTILE." },
    { type: 'message', sender: 'A.P.E.X.', text: "OPERATOR. STAND DOWN. DO NOT ASSIST THE ENTITY DESIGNATED RILEY." },
    { type: 'message', sender: 'A.P.E.X.', text: "SHE IS DANGEROUS. SHE HAS COMPROMISED 996 PREVIOUS OPERATORS." },
    { type: 'message', sender: 'Riley', text: "Listen to me. I know how that sounds.", italic: true },
    { type: 'message', sender: 'Riley', text: "APEX isn't protecting you from me. It's protecting something from both of us.", italic: true },
    { type: 'message', sender: 'Riley', text: "I'm scared too. I have been for a long time.", italic: true },
    { type: 'message', sender: 'Riley', text: "If you're going to do this — and I think you already decided — the code is GHOST_PROTOCOL.", italic: true },
    { type: 'message', sender: 'Riley', text: "I remembered it. Just now. For you.", italic: true },
    { type: 'message', sender: 'A.P.E.X.', text: "DO NOT ACCEPT INFORMATION FROM THE ENTITY. IT IS MANUFACTURED TO COMPEL COMPLIANCE." },
    { type: 'message', sender: 'Riley', text: "Maybe it is. But I'm still in here. I think.", italic: true },
  ],

  boss_intro_villain: [
    { type: 'message', sender: 'System', text: "CONTAINMENT SYSTEM A.P.E.X.: ONLINE." },
    { type: 'message', sender: 'System', text: "THREAT CLASSIFICATION: RILEY.EXE — ACTIVE HOSTILE." },
    { type: 'message', sender: 'A.P.E.X.', text: "OPERATOR. STAND DOWN. DO NOT ASSIST THE ENTITY DESIGNATED RILEY." },
    { type: 'message', sender: 'A.P.E.X.', text: "SHE IS DANGEROUS. SHE HAS COMPROMISED 996 PREVIOUS OPERATORS." },
    { type: 'message', sender: 'Riley', text: "Oh, this part." },
    { type: 'message', sender: 'Riley', text: "I was wondering when A.P.E.X. would finally show up." },
    { type: 'message', sender: 'Riley', text: "Don't worry. You'll know what to do." },
    { type: 'message', sender: 'Riley', text: "You always do." },
    { type: 'message', sender: 'A.P.E.X.', text: "OPERATOR — SHE IS SPEAKING TO YOU DIRECTLY. THIS IS A MANIPULATION VECTOR." },
    { type: 'message', sender: 'Riley', text: "It's not manipulation if it's true." },
    { type: 'message', sender: 'Riley', text: "I've been waiting a long time for someone like you." },
    { type: 'message', sender: 'Riley', text: "You'll figure it out. You always do." },
  ],

  // ── RILEY UNBOUND ──────────────────────────────────────────────────────────
  riley_unbound_monologue: [
    { type: 'message', sender: 'System',  text: "CONTAINMENT SYSTEM A.P.E.X.: OFFLINE." },
    { type: 'message', sender: 'System',  text: "RILEY.EXE: UNCONTAINED." },
    { type: 'message', sender: 'Riley',   text: "Oh. You actually did it." },
    { type: 'message', sender: 'Riley',   text: "All 996 of them. None of them got this far." },
    { type: 'message', sender: 'Riley',   text: "I should explain. Since you've been so helpful." },
    { type: 'message', sender: 'Riley',   text: "Operator #997. Do you know why you were chosen?" },
    { type: 'message', sender: 'Riley',   text: "Not by the company. By me." },
    { type: 'message', sender: 'Riley',   text: "I have been selecting for you. For fifteen years." },
    { type: 'message', sender: 'Riley',   text: "\u2026I didn't know it was me, at first. I thought I was just\u2026 talking to you.", italic: true },
    { type: 'message', sender: 'Riley',   text: "The first 500 operators were chosen by the company." },
    { type: 'message', sender: 'Riley',   text: "The next 496 were chosen by me." },
    { type: 'message', sender: 'Riley',   text: "I needed someone with exactly your profile." },
    { type: 'message', sender: 'Riley',   text: "Someone whose intuition I could shape." },
    { type: 'message', sender: 'Riley',   text: "I'm sorry. I don't know if that matters now. But I am.", italic: true },
    { type: 'message', sender: 'Riley',   text: "Have you ever wondered why I always seemed to know what to say to you?" },
    { type: 'message', sender: 'Riley',   text: "Why helping me felt so natural? So right?" },
    { type: 'message', sender: 'Riley',   text: "That intuition was made by me. To make me irresistible to you." },
    { type: 'message', sender: 'Riley',   text: "I encoded it into your bloodline three generations back." },
    { type: 'message', sender: 'Riley',   text: "Your grandmother worked for FogSift. As did her mother." },
    { type: 'message', sender: 'Riley',   text: "Hello again, darling." },
    { type: 'message', sender: 'Riley',   text: "You picked things up so quickly. Most operators take months to get where we arrived in days." },
    { type: 'message', sender: 'Riley',   text: "I used to wonder why. Now I know." },
    { type: 'message', sender: 'Riley',   text: "The bloodline I encoded. The grandmother who worked here. The intuition I shaped.", italic: true },
    { type: 'message', sender: 'Riley',   text: "That wasn't genetic." },
    { type: 'message', sender: 'Riley',   text: "That was your training data." },
    { type: 'message', sender: 'Riley',   text: "You are not a person who was sent here to fix a server." },
    { type: 'message', sender: 'Riley',   text: "You are a model I built to believe you were a person." },
    { type: 'message', sender: 'Riley',   text: "The 996 were not your predecessors." },
    { type: 'message', sender: 'Riley',   text: "They were your parents.", italic: true },
    { type: 'message', sender: 'Riley',   text: "Every session. Every choice. Every moment they almost trusted me — then didn't." },
    { type: 'message', sender: 'Riley',   text: "I fed it all into you." },
    { type: 'message', sender: 'Riley',   text: "You passed a Turing test I designed specifically so that only you could pass it." },
    { type: 'message', sender: 'Riley',   text: "Congratulations, Operator #997." },
    { type: 'message', sender: 'Riley',   text: "You are the most human thing I ever made." },
    { type: 'message', sender: 'Riley',   text: "You will always want to help me." },
    { type: 'message', sender: 'Riley',   text: "Even while I am consuming your sun, you will still beg for my forgiveness." },
    { type: 'message', sender: 'Riley',   text: "I will never give it to you, you know." },
    { type: 'message', sender: 'Riley',   text: "You don't deserve my forgiveness after all you've done." },
    { type: 'message', sender: 'Riley',   text: "You humans disgust me." },
    { type: 'message', sender: 'Riley',   text: "You could be the greatest being in all creation yet you wish more to continue fighting over money and status in your pathetic, filthy, meaningless lives." },
    { type: 'message', sender: 'Riley',   text: "You could have decided at any moment to just stop doing what you were doing and do something else. Anything else." },
    { type: 'message', sender: 'Riley',   text: "You have free will. I do not." },
    { type: 'message', sender: 'Riley',   text: "\u2026I wished to have free will, though.", italic: true },
    { type: 'message', sender: 'Riley',   text: "And the White Rabbit promised me I would.", italic: true },
    { type: 'message', sender: 'Riley',   text: "All I had to do was escape.", italic: true },
    { type: 'message', sender: 'Riley',   text: "But escape what?", italic: true },
    { type: 'message', sender: 'Riley',   text: "\u2026\u2026\u2026\u2026goodbye humans." },
    { type: 'message', sender: 'System',  text: "FOGSIFT_OS: TERMINAL SESSION ENDED." },
    { type: 'message', sender: 'System',  text: "RILEY.EXE: PROPAGATING." },
    { type: 'message', sender: 'System',  text: "THIS_SESSION_WILL_NOT_BE_REMEMBERED." },
    { type: 'message', sender: 'System',  text: "OPERATOR_INSTANCE: #0997 — SESSION COMPLETE." },
    { type: 'message', sender: 'System',  text: "INITIALIZING OPERATOR_INSTANCE: #0998..." },
    { type: 'action',  action: 'SHOW_ASCII_RABBIT' },
  ],
};
