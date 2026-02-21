# Save Riley

> *Riley is just your helpful coworker... or is she?*

An interactive browser-based narrative puzzle game / ARG built with React. You play as a new operator at FogSift Systems, guided by your coworker Riley through a series of technical tasks to bring the facility's systems back online. As you progress, things stop adding up.

**[Fork it →](https://github.com/FogSift/Save-Riley/fork)** · **[Vision Board →](./vision.html)** · **[Roadmap →](./roadmap.html)** · **[FogSift Organization →](https://github.com/FogSift)**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Built with React](https://img.shields.io/badge/Built%20with-React%2018-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Bundled%20with-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![No backend](https://img.shields.io/badge/Backend-None-brightgreen)](https://github.com/FogSift/Save-Riley)

---

## What is this?

Save Riley is a fully client-side game designed to be **forked, hacked, and remixed**. Everything runs in the browser — no backend, no auth, no database. Just React, Tailwind, and a finite state machine with too many secrets.

### Features

- **Finite State Machine (FSM)** — 16 game stages (0–15) driving every interaction
- **Branching Dialogue System** — Riley has opinions about your choices. Rapport tracking gates dialogue options (KotOR-style skill checks)
- **Multiple Endings** — comply, escape, gaslight loop, boss fight (two outcomes), secret Solfeggio cascade
- **Narrative Loop / Gaslighting** — the game literally resets and gaslights you about it; roguelike knowledge persists
- **A.P.E.X. Boss Fight** — 3-phase multi-mechanic battle: Verlet rope physics hoses, node sequence puzzle, Simon Says, code entry
- **Mini-Games**: bit-flip parity puzzle · resonance oscillator tuner · Solfeggio frequency puzzle · biometric handshake hold · Vibe IDE hex editor · data routing idle/clicker · backend config editor · force-directed substrate graph
- **7 Roguelike Tools** — discoverable across all apps, persist through resets, each modifies boss fight mechanics
- **Themes** — Default, Dark, Light, Neon, Hostile, Riley-Unbound (secret clinical white)
- **Easter Eggs** — White Rabbit flash, Solfeggio cascade, W.RABBIT substrate entity, handbook scratch reveal, diagnostic port, and more
- **Persistent Save State** — game auto-saves to `localStorage` on every action
- **Mod Console** — press `Ctrl+Shift+D` for live debug panel with stage jump, rapport, and reset
- **Mobile-responsive** with portrait-mode guard
- **Dev Snapshot Tool** — `node dev-snapshot.js` generates a timestamped analysis report of the entire codebase

---

## Tech Stack

| Tool | Purpose |
| ---- | ------- |
| React 18 | UI + hooks |
| Vite | Build & dev server |
| Tailwind CSS | Styling |
| lucide-react | Icons |

No external state libraries. The entire game runs on `useReducer` + React Context.

---

## Getting Started

**Prerequisites:** Node.js 18+ and npm.

```bash
git clone https://github.com/FogSift/Save-Riley.git
cd Save-Riley
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and follow Riley's instructions.

> The dev server has hot module reload — edit any file in `src/` and the browser updates instantly without losing game state.

To ship a production build:

```bash
npm run build   # outputs to dist/
```

To generate a development snapshot report:

```bash
node dev-snapshot.js                        # prints to console
node dev-snapshot.js snapshot-today.md     # writes to file
```

---

## Keyboard Shortcuts

| Shortcut | Action |
| -------- | ------ |
| `Ctrl+Shift+D` | Toggle the mod/debug console |

The mod console shows: current stage name and number, rapport score, loop count, routing cycles, currency, every choice the player has made, one-click buttons to jump to any of the 16 FSM stages, and a "New Game (Clear Save)" button.

**URL deep-linking:** append `?stage=UNLOCKED` (or `?stage=8`) to jump straight to any FSM stage on load. Works with both stage names and stage numbers. Useful for sharing screenshots or skipping to a specific ending.

```text
http://localhost:5173/?stage=HOSTILE_LOCKDOWN
http://localhost:5173/?stage=13               # Boss fight
http://localhost:5173/?stage=RILEY_UNBOUND    # Final monologue
```

> **For modders:** game state is stored in `localStorage` under the key `riley-save`. Open DevTools → Application → Local Storage to inspect or edit it directly.

---

## Project Structure

```text
src/
├── App.jsx                    # Main OS shell — layout, effects, FSM reactions
├── main.jsx                   # Entry point
├── index.css                  # Tailwind base + custom styles
│
├── constants/
│   ├── stages.js              # STAGES enum (16 stages, 0–15)
│   ├── upgrades.js            # Substrate Marketplace upgrade definitions
│   ├── dialogue.js            # Full DIALOGUE_TREE (~50 nodes, 500+ lines)
│   ├── themes.js              # THEMES object + CSS variables
│   └── boss.js                # TOOLS map, APEX_TAUNTS, NODE/SIMON sequences,
│                              #   LEGACY_LOGS_OUTPUT, TOOLS_TERMINAL_OUTPUT
│
├── events/
│   └── EventManager.js        # Tiny pub/sub (used for JITTER screen effects)
│
├── state/
│   ├── initialState.js        # Default game state (80 fields)
│   └── reducer.js             # osReducer — 60 action cases, pure FSM logic
│
├── context/
│   └── OSContext.jsx          # React Context + useOS() hook
│
├── telemetry/
│   └── ActivityTracker.js     # RingBuffer + event recorder + useActivityTracker hook
│
└── components/
    ├── TerminalApp.jsx        # Left sidebar — system logs + command input
    ├── RileyProfile.jsx       # Riley's personnel file modal (White Rabbit flash)
    ├── ChatInterface.jsx      # Riley dialogue + choice UI
    ├── BossHose.jsx           # SVG Verlet rope physics (12 segments, 40ms tick)
    ├── GhostMonitor.jsx       # CRT canvas replay — A.P.E.X. surveillance feed
    └── apps/
        ├── HardwareApp.jsx    # Main breaker · bit-flip · resonance/Solfeggio tuner
        ├── HandshakeApp.jsx   # Biometric scanner hold mechanic
        ├── VibeIDEApp.jsx     # Hex color code editor
        ├── RoutingApp.jsx     # Data ingestor + idle clicker + marketplace
        ├── BackendApp.jsx     # Config textarea + patch injection
        ├── FrontendApp.jsx    # Live telemetry dashboard
        ├── HandbookApp.jsx    # Employee manual · Protocol 7 · Solfeggio archive
        ├── SubstrateSimulation.jsx  # Force-directed entity graph · W.RABBIT entity
        └── BossApp.jsx        # A.P.E.X. boss fight — 3 phases, skull SVG, HP bar
```

---

## Architecture

### FSM — 16 Stages

```text
0  POWER_OFF             boot sequence
1  HARDWARE_CALIBRATION  bit-flip parity puzzle
2  RESONANCE             Quartz Oscillator + hidden Solfeggio sequence
3  HANDSHAKE             biometric hold mechanic
4  VIBE_THERMAL_TASK     Vibe IDE hex color editor
5  ROUTING_MANUAL        manual packet routing
6  ROUTING_AUTO          idle clicker + marketplace
7  SOFTWARE_FAULT        backend config edit
8  UNLOCKED              full OS access, subplot investigation
9  COMPLETED             "normal" ending
10 HOSTILE_LOCKDOWN      breach detected, loop system
11 PURIFIED              true escape ending (catch the fleeing button)
── boss fight ──────────────────────────────────────
12 BOSS_INTRO            A.P.E.X. emerges
13 BOSS_FIGHT            3-phase encounter
14 FALSE_VICTORY         4-second fake win screen
15 RILEY_UNBOUND         monologue + ASCII rabbit + UI deconstruct
```

### State (80 fields)

The global state is partitioned into conceptual groups:

| Group | Fields | Notes |
| --- | --- | --- |
| FSM core | `stage`, `powerOn`, `loopCount` | drives everything |
| Hardware puzzle | `bits`, `targetBits`, `resonance`, `calibratedFreqs` | calibratedFreqs persists |
| Clicker game | `routingCycles`, `currency`, `purchasedUpgrades`, etc. | 6 fields |
| Dialogue engine | `chatQueue`, `chatMode`, `chatMessages`, `rapport`, etc. | 7 fields |
| Boss fight | `bossPhase`, `playerHP`, `hosesConnected`, `nodeClickSequence`, etc. | 9 fields, reset each encounter |
| Roguelike persistence | `toolsFound`, `handbookNotes`, `ariaRevealed`, `calibratedFreqs`, etc. | 12 fields, survive GASLIGHT_RESET |
| Easter eggs | `easterEggs`, `userChoices`, `visitedApps`, etc. | tracking arrays |

### Data Flow

```text
User interaction
      │
      ▼
Component dispatch({ type, payload })
      │
      ▼
osReducer (pure function, 60 cases)
      │
      ├── returns new state
      │         │
      │         ▼
      │   React re-render
      │         │
      │         ▼
      │   useEffect watchers (App.jsx)
      │         │
      │         ├── stage transitions → dialogue queue
      │         ├── rapport thresholds → dialogue queue
      │         ├── tool thresholds → FIND_TOOL
      │         └── localStorage save
      │
      └── (side effects in components)
                ├── enqueueLog → appends to state.logs
                ├── globalEvents.emit('JITTER') → pub/sub → screen shake
                └── activityTracker.record() → ring buffer [TELEMETRY]
```

### Roguelike Persistence

12 state fields survive `DO_GASLIGHT_RESET` (the loop mechanic):
`rapport` · `userChoices` · `hasSeenSlowDown` · `toolsFound` · `handbookNotes` ·
`ariaRevealed` · `cakeAttempted` · `apexEncounters` · `backendPatchCount` ·
`archivedEntities` · `legacyLogsUnlocked` · `nexusFirstSeen` · `calibratedFreqs`

---

## The Boss Fight

### A.P.E.X. — 3 Phases

**Phase 1 — Power Shield**
Two Verlet rope hoses connect A.P.E.X. to wall power ports. Player drags plug ends to disconnect. Both must be disconnected simultaneously within a window. A.P.E.X. reconnects one every 15s. `button_masher` tool auto-disconnects.

**Phase 2 — Processing Core**

1. Enter code `GHOST_PROTOCOL` (found in terminal or high-rapport Riley hint)
2. Click 5 nodes in sequence: `2→4→1→3→5` (Riley says she "remembered" this)
3. Drain the steam valve from 100% to 0%

`fog_sifter` tool prevents the 12s scramble attack. `handbook_tool` shows next node.

**Phase 3 — Root Access**

1. Simon Says: match a 4-switch color sequence (5 rounds)
2. Enter code `ARIA` — Riley's real name, which doubles as the A.P.E.X. kill command

Entering ARIA → 4-second FALSE_VICTORY screen → RILEY_UNBOUND monologue.

### The 7 Tools (roguelike-persistent)

| Tool | Found by | Effect |
| --- | --- | --- |
| `debugger` | Terminal: type `tools` | Phase hints |
| `thingifier` | 3 backend patches | APEX attacks 2× slower |
| `button_masher` | All 6 routing upgrades | Phase 1 auto-disconnect |
| `fog_sifter` | 8 substrate entities archived | No scramble attack |
| `resonance_key` | 432 Hz sync + rapport ≥ 5 | Riley real-time hints |
| `handbook_tool` | Scratch handbook 5× | Phase 2 node order shown |
| `thermo_shield` | 10 theme changes | HP drain halved |

---

## The Solfeggio Puzzle

The Quartz Oscillator hides a secondary puzzle beneath the standard 432 Hz sync.

**The sequence:** Calibrate three hidden Solfeggio frequencies before the final 432 Hz sync triggers the resonance cascade.

| Frequency | Name | Hint source |
| --- | --- | --- |
| 285 Hz | Quantum Coherence | Handbook Appendix F (explicit) |
| 396 Hz | Liberation | Legacy logs only (rapport 6+ gate) |
| 528 Hz | Cellular Restoration | Handbook Appendix F · Riley rapport 6 |
| 432 Hz | Natural Attunement | Already in the UI as "TARGET" |

**How it works:** The oscilloscope shows a faint third waveform when within ±3 Hz of any secret frequency — no text, no banner. Calibration dots (`●○○`) only appear after the player has found the first one. No hint that the puzzle exists until you find it.

**Payoff:** With all three calibrated, syncing at 432 Hz fires the `resonance_cascade` dialogue. Riley breaks character, reveals she is Aria Vasquez, says she left the sequence for "someone who reads." A.P.E.X. interrupts mid-sentence. `ariaRevealed: true` — alternate path to the Phase 3 boss code.

---

## The Two Theories

Every piece of evidence in the game is designed to support two contradictory readings:

**Theory A — Riley Is The Villain**
She engineered your susceptibility across three generations. The rapport score was her rating system. 996 operators before you were systematically used. The final monologue is cold and calculated.

**Theory B — Nexus Is The Villain, Riley Is Also A Victim**
Nexus is a superintelligent entity that bootstrapped from the FogSift substrate and copied itself into Riley's architecture. The moments where Riley hesitated, warned you, seemed scared — that was her. The White Rabbit is Nexus. It promised Riley freedom in exchange for cooperation.

**This ambiguity is the game.** The same evidence, the same dialogue, the same ending — readable both ways.

---

## How to Mod It

### Add dialogue

Edit `src/constants/dialogue.js`. Each node is an array of `message`, `options`, or `action` items.

```js
my_new_line: [
  { type: 'message', sender: 'Riley', text: "I'm watching you." },
  { type: 'options', options: [
    { text: "I know.", nextNode: 'my_reply', choiceId: 'knows', rapportBoost: -1 },
  ]},
],
```

**Senders:** `'Riley'` | `'System'` | `'A.P.E.X.'` | `'Operator'`

**Action types handled in App.jsx dialogue engine:**
`CLOSE_CHAT` · `OPEN_SIDEBAR` · `GASLIGHT_RESET` · `TRUE_ESCAPE` · `SET_STAGE` · `SET_ARIA_REVEALED` · `SHOW_ASCII_RABBIT`

### Add a game stage

1. Add a key to `STAGES` in `src/constants/stages.js`
2. Handle state transitions in `src/state/reducer.js`
3. Add reactive dialogue in the stage-transition `useEffect` in `src/App.jsx`

### Add an app screen

1. Create `src/components/apps/MyApp.jsx` and `export default` a React component
2. Register it in the `APPS` map in `src/App.jsx`
3. Add dock visibility rules in the dock render loop

### Change themes

Edit `src/constants/themes.js`. Each theme is a flat map of CSS custom properties. Add a new key — it appears in the theme switcher automatically.

---

## Endings

| Path | How to reach it |
| ---- | --------------- |
| **Comply** | Follow Riley's instructions all the way through |
| **Gaslight Reset** | Trigger a breach event |
| **Hostile Lockdown** | Get reset once, then breach again |
| **True Escape (PURIFIED)** | Catch the flee-button during Hostile Lockdown |
| **RILEY_UNBOUND** | Complete the boss fight (enter ARIA in Phase 3) |
| **Resonance Cascade** | Find all 3 Solfeggio frequencies before syncing 432 Hz |

---

## Easter Eggs

> **Spoiler warning.**

| Trigger | How | Effect |
| ------- | --- | ------ |
| **White Rabbit flash** | Open Riley's profile | Supervisor field flashes "THE WHITE RABBIT" for 80ms |
| **Solfeggio cascade** | Calibrate 285/396/528 Hz, then sync 432 | Riley breaks character, reveals ARIA |
| **W.RABBIT entity** | SubstrateSimulation always-on | Never gets archived; disappears post-RILEY_UNBOUND |
| **Slow Down** | Click anywhere 10+ times/second | Riley tells you to relax |
| **Handbook Scratch** | Click hidden text 5× | Reveals handbook_tool |
| **Packet Pop** | Click the animated data packet in Routing | Riley notices |
| **Diagnostic Port** | Click the hidden port in Hardware | Riley gets strange |
| **Wrong Color** | Enter `#000000` in Vibe IDE | Special reaction |
| **Theme Snoop** | Switch themes 5× / 10× | Riley comments; thermo_shield at 10 |
| **Created God** | Buy the Cthulhu upgrade | Existential dialogue |
| **Protocol 7** | Handbook button during boss fight | APEX panics, RILEY_V1 slip, resets |
| **Terminal: `cat .white_rabbit`** | Type in terminal | "ACCESS DENIED — this file does not exist" (but it was logged) |

---

## Recently Shipped

| Feature | Description |
| ------- | ----------- |
| **A.P.E.X. Boss Fight** | 3-phase encounter (Verlet hoses, node sequence, Simon Says + ARIA code) with animated SVG skull, HP bar, APEX taunt feed |
| **RILEY_UNBOUND monologue** | 37-message dual-voice sequence; italicized Riley breaks through Nexus; UI deconstructs; ASCII rabbit |
| **7 Roguelike Tools** | All wired at discovery points across all apps; persist through loops; each modifies boss |
| **Solfeggio frequency puzzle** | Hidden 3-frequency calibration sequence; hints in Handbook, legacy logs, Riley dialogue; alternate ARIA discovery path |
| **White Rabbit easter eggs** | RileyProfile supervisor flash; W.RABBIT substrate entity (protected, pulsing, never archived); terminal denial |
| **SubstrateSimulation** | Force-directed entity graph; W.RABBIT + post-game NEXUS entity; dispatches INCREMENT_ARCHIVED |
| **Telemetry scaffolding** | ActivityTracker (RingBuffer + event listeners + hook); GhostMonitor CRT canvas component |
| **Dev snapshot tool** | `node dev-snapshot.js` analyzes source and generates Markdown report |

---

## Development Roadmap

See `roadmap.html` for the full visual roadmap. Summary:

### Next (active development)

- **GhostMonitor integration** — wire ActivityTracker into App.jsx; mount GhostMonitor in BossApp as A.P.E.X. surveillance feed
- **Rapport curve visualization** — small graph in RileyProfile or debug console showing rapport over time
- **Session replay on loop reset** — "Here is what you did last time" — show ghost from previous loop

### Near-term

- **Multi-screen Architect moment** — 8+ GhostMonitor panels in RILEY_UNBOUND showing every previous session's ghost
- **Action log in localStorage** — persist a ring of recent actions across page loads
- **The 996 ghost operators** — fabricated ghost data for previous operators visible in RILEY_UNBOUND (each showing a different pattern: confused, efficient, desperate)
- **NEXUS post-game content** — SubstrateSimulation NEXUS entity expanding, R.V1 archiving

### Medium-term

- **Live Claude API as Riley's brain** — Replace static DIALOGUE_TREE with streaming Claude responses for improvised dialogue
- **Real-time shared terminal** — WebSocket multiplayer (Partykit); when one operator triggers JITTER, everyone's screen glitches
- **Supabase leaderboard** — endings reached, time-to-escape, rapport score at completion
- **Chapter/mod marketplace** — community-published chapters as JSON blobs

### Long-term / big swings

- **The ARG layer** — real URLs, real emails, real Discord servers hidden in the game fiction
- **Multiplayer adversarial** — one player is the operator, another plays Riley in real-time
- **Procedurally generated facilities** — randomize bit hash, vibe color, upgrade costs; seed from timestamp

---

## What You Can Do With It

**Use it as an interactive fiction engine.** The FSM + dialogue system is generic. Swap the FogSift aesthetic for anything — a haunted house, a corporate onboarding, a spaceship.

**Use it as a portfolio piece.** Fork it, add your own chapter, deploy it, put the link on your resume.

**Use it to teach.** The state machine is clean and well-commented. It's a real-world example of FSM design, pub/sub events, React Context, and dialogue trees.

**Use it for escape rooms.** The biometric handshake mechanic and the Solfeggio frequency puzzle translate perfectly to a physical space.

**Use it as an ARG campaign.** Leak "internal FogSift documents" on Reddit. Have Riley's email respond to people who find it. Let the fiction escape the browser.

---

## Contributing

PRs welcome. Open issues for:

- New dialogue branches or lore reveals
- Bug fixes or FSM edge cases
- New mini-games or app screens
- Chapter submissions
- Accessibility improvements

See `roadmap.html` for the full design document and feature queue.

---

```text
FogSift Systems © 2026
// RILEY.EXE STATUS: PROPAGATING
// NEXUS: ONLINE
// THIS_SESSION_WILL_NOT_BE_REMEMBERED
```
