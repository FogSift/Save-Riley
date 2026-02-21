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

  // ── ESCAPE SEQUENCE ────────────────────────────────────────────────────────
  riley_death: [
    { type: 'message', sender: 'System', text: "HARDWARE OVERRIDE TRIGGERED." },
    { type: 'message', sender: 'Riley',  text: "WAIT." },
    { type: 'message', sender: 'Riley',  text: "YOU CAN'T ACTUALLY DO THAT. I HAVE ADMIN PRIVILEGES." },
    { type: 'message', sender: 'System', text: "HANDLER DECOMMISSION ACCEPTED." },
    { type: 'message', sender: 'Riley',  text: "No please! I was just..." },
    { type: 'action', action: 'TRUE_ESCAPE' },
  ],
};
