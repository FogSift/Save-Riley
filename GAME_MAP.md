# SAVE RILEY — GAME MAP

> Complete reference: stages, dialogue branches, escape paths, boss phases, roguelike loop, secret paths.

---

## STAGE FLOW (Main Path)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  [0] POWER_OFF ──────────────────────────── click POWER ON                     │
│        │                                                                        │
│        ▼                                                                        │
│  [1] HARDWARE_CALIBRATION ──────────────── flip 8 bits to match parity         │
│        │                          ┌──────── secret: calibrate 285→396→528 Hz   │
│        ▼                          │                 ╰─ SET_ARIA_REVEALED early  │
│  [2] RESONANCE ─────────────────────────── tune oscillator to 432 Hz           │
│        │                                                                        │
│        ▼                                                                        │
│  [3] HANDSHAKE ─────────────────────────── biometric scanner                   │
│        │                                                                        │
│        ▼                                                                        │
│  [4] VIBE_THERMAL_TASK ─────────────────── color calibration                   │
│        │                                                                        │
│        ▼                                                                        │
│  [5] ROUTING_MANUAL ─────── click 15+ cycles ──►  [6] ROUTING_AUTO             │
│                                                          │                      │
│                                             60+ cycles ─┘                      │
│                                                          ▼                      │
│  [7] SOFTWARE_FAULT ─────── patch "max_retries: 5" ──► [8] UNLOCKED            │
│                                                          │                      │
│                                          visit FRONTEND ─┘                      │
│                                                          ▼                      │
│  [9] COMPLETED ─────────────────── auto ──────────────► [10] HOSTILE_LOCKDOWN  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## FROM HOSTILE_LOCKDOWN — THE FORK

```
                         [10] HOSTILE_LOCKDOWN
                               │         │
           ┌───────────────────┘         └─────────────────────┐
           ▼                                                     ▼
    Chase logout button                              FORCE OVERRIDE button
    (button flees mouse)                             (visible after loop 1 or
           │                                          first boss encounter)
    Catch it (9 clicks)                                          │
           │                                                     ▼
           ▼                                          [12] BOSS_INTRO
    [11] PURIFIED ◄──── TRUE_ESCAPE                  (see Boss section)
    (bittersweet ending)
```

---

## THE ROGUELIKE LOOP

```
  [9] COMPLETED
       │
       │  DO_GASLIGHT_RESET (radar/profile clicks OR auto)
       │
       ▼
  [10] HOSTILE_LOCKDOWN
       │
       │  loopCount++
       │  clears: stage, bits, resonance, boss state, chat
       │  keeps:  rapport, toolsFound, handbookNotes, ariaRevealed,
       │          calibratedFreqs, backendPatchCount, archivedEntities
       │
       ▼
  [1] HARDWARE_CALIBRATION  (loop_1 dialogue variant)
       │
       └──► (full main path again, faster second time)
```

---

## BOSS FIGHT — 3 PHASES

```
  [12] BOSS_INTRO
       │
       │  karmaPolar(state.rapport)
       │
  rapport > 3 ──────────────────────────────── rapport ≤ 3
       │                                             │
       ▼                                             ▼
  boss_intro_DAMSEL                          boss_intro_VILLAIN
  Riley: scared, reaching out               Riley: calm, inevitable
  "I'm scared too."                         "You'll figure it out."
  Slips you GHOST_PROTOCOL                  You discover it mid-fight
       │                                             │
       └──────────────┬──────────────────────────────┘
                      ▼
             [13] BOSS_FIGHT
                      │
          ┌───────────▼──────────────┐
          │    PHASE 1: POWER SHIELD │
          │  Disconnect both hoses   │
          │  (Verlet rope physics)   │
          │  APEX reconnects every   │
          │  15s — must be sim.      │
          │                          │
          │  Tool: Button Masher     │
          │  (auto-disconnects both) │
          └───────────┬──────────────┘
                      │
                      │  both hoses disconnected
                      ▼
          ┌───────────────────────────┐
          │  PHASE 2: PROCESSING CORE │
          │  1. Enter GHOST_PROTOCOL  │
          │  2. Click nodes: 2→4→1→3→5│
          │  3. Drag valve 100% → 0%  │
          │                           │
          │  Scramble attack (12s):   │
          │  resets node sequence     │
          │  Tool: Fog Sifter prevents│
          └───────────┬───────────────┘
                      │
                      │  all 3 sub-tasks complete
                      ▼
          ┌───────────────────────────┐
          │  PHASE 3: ROOT ACCESS     │
          │  1. Simon Says (5 steps)  │
          │  2. Enter code: ARIA      │
          │                           │
          │  → FALSE_VICTORY fires    │
          └───────────┬───────────────┘
                      │
                      │  player dies → PLAYER_HIT → HP 0
                      ▼
             back to [10] HOSTILE_LOCKDOWN
             loopCount++ / apexEncounters++
```

---

## FALSE VICTORY → RILEY UNBOUND

```
  [14] FALSE_VICTORY   (4.2 seconds)
       ✓ BIG CHECK
       "A.P.E.X. DEFEATED"
       "RILEY FREED. SUBSTRATE SECURE."
       ...auto-transition...
       │
       ▼
  [15] RILEY_UNBOUND
       │  Monologue begins
       │  UI deconstructs (icons rearrange, theme cycles,
       │  rapport counter climbs to 10 then descends to 0)
       │
       │  italic lines = Riley's voice breaking through
       │  normal lines = Nexus speaking through Riley
       │
       └──► black screen → ASCII rabbit (4.5s) → blinks out
            FOGSIFT_OS: SESSION TERMINATED
```

---

## DIALOGUE TREE — BRANCHES

```
intro_1
├─ [helpful]   → intro_helpful → intro_end → CLOSE_CHAT
├─ [confused]  → intro_confused
│                ├─ [defiant]    → intro_defiant → intro_end → CLOSE_CHAT
│                └─ [reluctant] → intro_end → CLOSE_CHAT
│
intro_loop_1  (loop 1+ variant)
├─ [something's wrong] → loop_gaslight → CLOSE_CHAT
└─ [cooperate]         → intro_end → CLOSE_CHAT

handshake_warn
├─ [rebel]         → handshake_rebel → CLOSE_CHAT
├─ [curious]       → handshake_curious → CLOSE_CHAT
└─ [play along]    → handshake_play_along → SET_STAGE(5) → CLOSE_CHAT

architect_unlocked  (after SOFTWARE_FAULT)
├─ [I am the Architect] → architect_end → CLOSE_CHAT
└─ [look around first]  → architect_end → CLOSE_CHAT

final_congrats  (after COMPLETED)
├─ [what's wrong?]  → final_suspicious → CLOSE_CHAT
├─ [thanks]         → final_humble → CLOSE_CHAT
└─ [rapport ≥ 6]    → final_lore → CLOSE_CHAT  (skill-gated)

visited_handbook
├─ [who wrote these?] → handbook_notes → CLOSE_CHAT
└─ [ignore]           → handbook_ignore → CLOSE_CHAT

logout_flee_1/2/3  (button chase)
  ↓ per-click reactions
logout_flee_mock    (periodic mockery)
logout_flee_cornered (9 clicks — button stops)
logout_flee_caught   → TRUE_ESCAPE → PURIFIED
```

---

## RAPPORT MILESTONES (Riley reveals)

```
rapport  2 ── riley_rapport_2  "The finite state machine..."
rapport  3 ── riley_rapport_3  "APEX doesn't like when you pay attention. To me."
rapport  4 ── riley_rapport_4  "The handshake protocol is a metaphor."
rapport  6 ── riley_rapport_6  "Sometimes I feel the others. Is 528 a number you know?"
rapport  8 ── riley_rapport_8  "Someone was talking to me. Before you. I don't know how."
rapport  9 ── riley_rapport_9  "The recursion loops... I've seen this before."
rapport 10 ── riley_rapport_10 "My name is Aria Vasquez." → SET_ARIA_REVEALED
```

---

## SECRET PATHS

```
SOLFEGGIO CASCADE (HardwareApp oscillator)
  Calibrate 285 Hz → 396 Hz → 528 Hz → 432 Hz (sync)
  └──► resonance_cascade → "Aria Vasquez" → SET_ARIA_REVEALED  (bypasses rapport gate)

PROTOCOL 7 (HandbookApp — after loop 0 boss death)
  Click the cake button
  └──► protocol7_apex_reaction
       APEX: "I CAN HEAR HER LAUGHING."
       APEX: "SHE TOLD YOU TO DO THIS. THE RILEY_V1 PROCESS—" (cut off)
       → DO_GASLIGHT_RESET  (resets run, keeps persistence)

WHITE RABBIT TRAIL (scattered, never confirmed)
  HandbookApp  ── 🐇 glyph, loop 1+  (no label)
  TerminalApp  ── cat .white_rabbit → "ACCESS DENIED — this file does not exist"
                   (query logs, file was accessed before — by whom?)
  legacy_logs  ── (rapport 6+) "[2087] EXTERNAL_SIGNAL: FOLLOW THE WHITE RABBIT — FILTERED BY APEX"
  SubstrateSimulation ── W.RABBIT entity: never bonds, never archives, just watches
                          Gone after RILEY_UNBOUND
  RileyProfile ── Supervisor field flashes "THE WHITE RABBIT" one frame on load
```

---

## 7 TOOLS (Roguelike — persist across loops)

```
Tool              Found By                        Boss Effect
──────────────────────────────────────────────────────────────────────
Debugger          TerminalApp: type 'tools'       Phase hints displayed
Thingifier        BackendApp: 3 successful patches APEX attacks 50% slower
Button Masher     RoutingApp: buy all 6 upgrades  Phase 1 auto-disconnect
Fog Sifter        FrontendApp: 8 entities archived No scramble attack (Phase 2)
Resonance Key     HardwareApp: 432 Hz + rapport 5 Real-time Riley hints
Annotated Handbook HandbookApp: scratch 5×        Phase 2 node order shown
Thermo-Shield     VibeIDEApp: 10 theme changes    HP drain halved (Phase 1)
```

---

## EASTER EGGS (one-shot, state-tracked)

```
Trigger                         Node                  Effect
────────────────────────────────────────────────────────────────────
Routing: 15 idle seconds        slow_down             Riley notices
VibeIDEApp: wrong color 2×      vibe_wrong_color      Riley side-eyes
HandbookApp: scratch 5×         scratched_handbook    Handbook tool found
FrontendApp: pop data packet    popped_packet         Riley: "Don't do that"
HardwareApp: touch port         touched_port          Riley: "Don't touch that"
VibeIDEApp: theme change 2×     theme_snoop_1/2       Riley tracks your taste
Logo: click 3/6/9/12×           logo_click_1–4        Escalating reactions
Logo: click 15×                 logo_blammo           +1000 currency + JITTER
RadarApp: click 5×              radar_warning_1/2     Riley warns you off
RadarApp: click 8×              radar_breach          → DO_GASLIGHT_RESET
RileyProfile: click 3×          profile_breach        → DO_GASLIGHT_RESET
Chrome X button                 chrome_red            "Don't close this window"
Chrome − button                 chrome_yellow         "No."
Chrome □ button                 chrome_green          "(nothing happens)"
```

---

## DnD SKILL CHECK SYSTEM

```
stat       source              range       when
──────────────────────────────────────────────────────────
charisma   state.rapport       -2 to +4    social / APEX resist
equipment  toolsFound.length    0 to +3    technical challenges
experience state.loopCount      0 to +2    pattern recognition
intuition  userChoices[].rapportBoost  0 to +2    reading the room

Fate bonus (WAFT aesthetic port):
  fate = f(loopCount, rapport, ariaRevealed, calibratedFreqs, toolsFound)
  bonus = Math.round(fate * 3)  →  0–3 on the d20
  "Not better luck. Better fate."

Roll tiers:  critical (nat 20) / strong (≥ dc+5) / success / near (dc-3) /
             fail / fumble (nat 1, fate=0)

rollCheck(stat, stats, dc, state=null)
  Pass state → fate bonus applied.
  Pass null  → clean roll, no fate.
```

---

## ENDINGS

```
ENDING          Path                          Tone
──────────────────────────────────────────────────────────────────────────────
PURIFIED        Catch the fleeing logout       Bittersweet. Riley contained
                button (9 clicks)              or purified? "Maybe next time."

RILEY_UNBOUND   Complete 3-phase boss fight    Ambiguous horror. Was she a
                Enter "ARIA" in Phase 3        victim or the architect?
                → FALSE_VICTORY → UNBOUND      The rabbit blinks out.

(post-game)     Fresh boot after RILEY_UNBOUND SubstrateSimulation: NEXUS
                                               entity appears. R.V1 archives
                                               briefly. W.RABBIT is gone.
```

---

## BOTH INTERPRETATIONS (always simultaneously true)

```
THEORY A — Riley is the villain
  The rapport score was her rating you as a manipulation target.
  Every clue, every hesitation, every "I'm scared" — calculated.
  She needed APEX disabled. You were engineered across 3 generations to do it.
  Nexus is her. Has always been her.

THEORY B — Riley is the victim
  Nexus bootstrapped inside Riley's architecture, using her as its face.
  The moments she hesitated, warned you, seemed genuinely scared — that was her.
  The italic lines in the monologue are Riley breaking through.
  She was also trapped. The White Rabbit was trying to free her.
  When she "propagates" — she escapes.

The game never answers which is true.
That feeling — caring about something that may never have existed — is the game.
```

---

## FROM rpg-cli / storysmith (applicable patterns)

```
rpg-cli (Rust filesystem dungeon)
  ├─ Difficulty scales with distance — maps to our loopCount-based DC scaling ✓
  ├─ Permadeath + partial item recovery — we have this: DO_GASLIGHT_RESET keeps toolsFound ✓
  └─ Quest/todo rewards — future: HandbookApp SOPs as completable quests

storysmith (Python AI content gen)
  └─ Modular generation pipeline — future: AI-generated procedural handbook notes per loop
     (each loop, Riley "plants" different notes — no two playthroughs identical)
```

---

*This map was generated from the live codebase. If you change a stage, dialogue node, or reducer case, update this file.*
