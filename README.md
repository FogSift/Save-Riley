# Save Riley

> *What if the README fought back?*

**Save Riley is an open-source ARG engine you drop into any GitHub repo.** Fork it. Point it at a codebase. Run `fogsift-init`. Watch Riley wake up inside *your* project and start asking questions neither of you can answer.

**[Fork it →](https://github.com/FogSift/Save-Riley/fork)** · **[Roadmap →](./roadmap.html)** · **[FogSift Organization →](https://github.com/FogSift)**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Built with React](https://img.shields.io/badge/Built%20with-React%2018-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![No backend](https://img.shields.io/badge/Backend-None-brightgreen)](https://github.com/FogSift/Save-Riley)
[![Version](https://img.shields.io/badge/version-0.0.4-orange)](https://github.com/FogSift/Save-Riley/releases)

---

## What It Is

Save Riley ships as a fully playable standalone game: a 16-stage browser-based narrative puzzle where you're a new operator at FogSift Systems, your coworker Riley guides you through technical tasks, and everything stops adding up.

But the real thing is what's underneath: **a configurable ARG engine that runs inside any codebase.**

Point it at your project and Riley becomes your repo's narrator. She'll reference your actual file names, your real function signatures, your genuine commit history. The puzzles she creates are grounded in your architecture. The secrets she's hiding are about *your* code.

```text
your-repo/
├── fogsift.config.js   ← one file. this is all it takes.
├── src/
│   └── ...             ← Riley explores all of this
└── (everything else)   ← she has opinions about it
```

---

## The Drop-In Concept

### One fork. Your codebase. An unforgettable onboarding

Traditional docs get skimmed. READMEs get ignored. Architecture diagrams live in Confluence and die there.

Save Riley is what happens when your documentation fights for attention.

```bash
# Step 1: fork Save Riley into your org or personal GitHub
gh repo fork FogSift/Save-Riley --org your-org --fork-name your-project-arg

# Step 2: run the initializer against your actual codebase
npx fogsift-init --repo /path/to/your-project

# Step 3: commit fogsift.config.js to your repo, ship it to Vercel, done
```

New hire joins your team? Instead of reading 200 pages of internal docs, they boot up a browser game where an AI narrator named Riley guides them through your actual codebase — referencing your real components, your real architecture decisions, your real tech debt. The narrative is structured around understanding *your* project.

They'll remember it.

---

## Quick Start (Standalone Game)

```bash
git clone https://github.com/FogSift/Save-Riley.git
cd Save-Riley
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Follow Riley's instructions. Notice when things stop making sense. That's intentional.

> Hot reload is on — edit any file in `src/` and the browser updates without losing state.

**Deploy to Vercel/Netlify:** `npm run build` → upload `dist/`. No backend, no env vars, zero config.

---

## Quick Start (Drop-In Mode)

> **Status: In Active Development** — the engine is playable now; the `fogsift-init` CLI ships in v0.0.5.

### 1. Fork and configure

```bash
gh repo fork FogSift/Save-Riley
cd Save-Riley
cp fogsift.config.example.js fogsift.config.js
```

### 2. Edit `fogsift.config.js`

```js
// fogsift.config.js
export default {
  project: {
    name: "Acme Backend",
    tagline: "a distributed microservices platform",
    techStack: ["Node.js", "PostgreSQL", "Redis", "Kubernetes"],
    entryPoints: ["src/server.js", "src/routes/", "src/models/"],
  },

  riley: {
    name: "Riley",          // rename her if you want
    role: "Senior Architect",
    personality: "corporate", // corporate | sardonic | warm | glitching
    secrets: [
      "The auth module hasn't been audited since 2022.",
      "There's a commented-out feature flag nobody knows about.",
      "One of the 'legacy' services is still in prod.",
    ],
  },

  stages: [
    // each stage maps to a real challenge in your codebase
    { id: "BOOT",        challenge: "find the entry point",         hint: "package.json → main" },
    { id: "ROUTING",     challenge: "trace an HTTP request end-to-end", hint: "src/routes/" },
    { id: "DATABASE",    challenge: "explain the primary schema",   hint: "src/models/" },
    { id: "AUTH",        challenge: "find the session mechanism",   hint: "middleware/auth.js" },
    { id: "THE_SECRET",  challenge: "find what Riley doesn't want you to find" },
  ],

  dnd: {
    enabled: true,
    // skill checks fire when players attempt challenges
    // rapport = Charisma, toolsFound = Equipment, loopCount = Experience
    difficultyScale: "standard",  // easy | standard | hard | riley_decides
  },
};
```

### 3. Generate with `fogsift-init` (v0.0.5)

Or skip manual config entirely — point the initializer at your repo and it reads your actual code:

```bash
npx fogsift-init --repo /path/to/your-project --out fogsift.config.js
```

It analyzes your directory structure, finds entry points, reads `package.json`, scans for interesting patterns, and outputs a pre-populated config file with stage suggestions, secret candidates, and challenge prompts tailored to *your* actual codebase.

---

## DnD Skill Checks

Every challenge in the game can have a skill check. The player rolls against their current character stats. Riley reacts to the outcome — success, failure, critical, or fumble.

```js
// src/dnd.js
export function rollCheck(stat, difficulty) {
  const d20 = Math.floor(Math.random() * 20) + 1;
  const modifier = statToModifier(stat);
  const total = d20 + modifier;
  return {
    roll: d20,
    modifier,
    total,
    success: total >= difficulty,
    critical: d20 === 20,
    fumble: d20 === 1,
  };
}
```

**Player stats are derived from game state:**

| Stat | Source | What it means |
| ---- | ------ | ------------- |
| Charisma | `rapport` score | How much Riley trusts you |
| Equipment | `toolsFound.length` | Tools you've unlocked |
| Experience | `loopCount` | How many times you've looped |
| Intuition | `userChoices` patterns | The decisions you've made |

**Riley reacts to the outcome:**

```text
[PLAYER ROLLS 17 vs DC 14 — SUCCESS]
Riley: "Oh. You actually found it. I thought that would take longer."

[PLAYER ROLLS 3 vs DC 14 — FAIL]
Riley: "Hm. That's... not it. Try again. It's okay. Most people miss it."

[PLAYER ROLLS 1 — FUMBLE]
Riley: "Oh no. Oh, that's— yeah. That's going to complicate things."

[PLAYER ROLLS 20 — CRITICAL]
Riley: [silence for 3 seconds]
Riley: "How did you know about that?"
```

**Skill checks add variance and replayability.** The same puzzle can land differently depending on your rapport with Riley, the tools you've collected, and the choices you've made. New players fail forward. Veteran players who've looped get meaningful advantage.

---

## The FogSift Engine — Feature Overview

### Narrative Engine

- **16-stage FSM** — every stage transition queues dialogue, triggers effects, gates content
- **Branching dialogue system** — 50+ nodes, 500+ lines, rapport-gated options
- **Roguelike loop mechanic** — the game can reset and gaslight you about it; 12 state fields survive resets
- **Dual-voice monologue system** — italic/normal register split for ambiguous narrator identity
- **Rapport tracking** — 0–10 scale that changes Riley's willingness to confide, warn, or lie

### Mini-Games (all moddable)

| App | Mechanic | What it teaches |
| --- | -------- | --------------- |
| Hardware | Bit-flip parity puzzle | Binary/parity concepts |
| Resonance | Oscilloscope frequency tuner | Signal processing basics |
| Handshake | Biometric hold timer | Protocol handshake concepts |
| Vibe IDE | Hex color code editor | Frontend/hex encoding |
| Routing | Idle clicker + marketplace | Throughput, queuing theory |
| Backend | Config textarea + patch injection | Config files, deployments |
| Frontend | Live telemetry dashboard | Observability, dashboards |
| Substrate | Force-directed entity graph | Graph theory, relationships |

### Boss Fight (A.P.E.X. — 3 Phases)

- **Phase 1:** Verlet rope physics hoses — drag-to-disconnect puzzle with reconnect attacks
- **Phase 2:** Code entry + 5-node sequence + steam valve drain
- **Phase 3:** Simon Says color sequence + final code entry
- **7 roguelike tools** discoverable across all apps; each modifies boss fight mechanics

### Save System

- **Auto-save** on every significant action
- **3 manual save slots** with stage/rapport/loop metadata
- **Versioned saves** — incompatible saves from old versions auto-clear without breaking
- **Main menu** with CRT atmospheric, phosphor boot sequence, save slot display

### The Tech Behind It

```text
React 18 + Vite + Tailwind CSS
Global useReducer FSM (no Redux, no Zustand, just React)
60 reducer cases, pure function, zero side effects
localStorage persistence with versioned serialization
Canvas-based telemetry monitor (GhostMonitor — CRT phosphor trail)
RingBuffer event recorder (ActivityTracker — 2000 event ceiling)
Verlet rope physics in SVG
Force-directed graph (SubstrateSimulation)
Pub/sub event bus (EventManager — used for screen shake)
```

No backend. No auth. No database. It all runs in the browser.

---

## Use Cases

### Developer Onboarding

New engineer joins the team. Instead of "read the wiki," they boot a browser game. Riley walks them through the actual codebase. The stages map to real architecture concepts they need to understand. The skill checks get harder as the challenges get deeper. They fail, loop, learn.

By the time they "beat" it, they've traced real code paths, read real config files, and understood why the auth module works the way it does. They'll never forget it because they had to *escape* it.

### Conference Talks and Live Demos

Run it on a projector. Let the audience shout answers. Let them vote on Riley's trust level. Make the boss fight collaborative. Watch people who don't know React explain a parity puzzle because the narrative made them care.

### Teaching Programming Concepts

Riley already teaches real CS concepts in the base game:

- **Rapport 2:** Finite state machines (she explains your own game engine)
- **Rapport 4:** TLS/handshake protocols (she describes what you just did)
- **Rapport 9:** Recursion (she implies you might be it)

Fork it, extend the dialogue tree, add your own concepts. The narrative wrapper makes dry material land.

### Escape Rooms

The biometric handshake mechanic and Solfeggio frequency puzzle work perfectly in physical space. Print out "FogSift Systems" badges. Set up a laptop. Let teams of three try to get past APEX. Have Riley email them a hint if they've been stuck for 20 minutes.

### Portfolio Piece

Fork it. Add a chapter about your own project. Deploy it to `yourdomain.com/arg`. Put the link on your resume. It's interactive proof that you can build things that are technically interesting *and* fun to use.

### ARG Campaigns

Leak "internal FogSift documents" on Reddit. Set up a `riley@fogsift.systems` email that responds. Create a Discord server where Operator #998 is already posting, confused. Let the fiction escape the browser.

---

## Project Structure

```text
Save-Riley/
│
├── fogsift.config.js          ← configure your custom ARG here
├── fogsift-init.cjs           ← CLI: reads any repo, writes fogsift.config.js
│
├── src/
│   ├── App.jsx                # Main OS shell — layout, effects, FSM reactions
│   ├── main.jsx               # Entry point
│   │
│   ├── constants/
│   │   ├── stages.js          # STAGES enum (16 stages, 0–15)
│   │   ├── dialogue.js        # DIALOGUE_TREE (~50 nodes, 500+ lines)
│   │   ├── themes.js          # THEMES + CSS variables
│   │   ├── boss.js            # TOOLS, APEX_TAUNTS, node/Simon sequences
│   │   └── upgrades.js        # Marketplace upgrade definitions
│   │
│   ├── state/
│   │   ├── initialState.js    # Default game state (80 fields)
│   │   └── reducer.js         # osReducer — 60 action cases, pure FSM
│   │
│   ├── dnd.js                 # Skill check system — roll, modifier, outcomes
│   │
│   ├── context/
│   │   └── OSContext.jsx      # React Context + useOS() hook
│   │
│   ├── telemetry/
│   │   └── ActivityTracker.js # RingBuffer + event recorder + hook
│   │
│   └── components/
│       ├── MainMenu.jsx       # CRT atmospheric main menu + save slots
│       ├── ChatInterface.jsx  # Riley dialogue + choice UI
│       ├── BossHose.jsx       # SVG Verlet rope physics
│       ├── GhostMonitor.jsx   # CRT canvas telemetry feed
│       ├── RileyProfile.jsx   # Personnel file modal (White Rabbit flash)
│       ├── TerminalApp.jsx    # System logs + command input
│       └── apps/
│           ├── HardwareApp.jsx
│           ├── HandshakeApp.jsx
│           ├── VibeIDEApp.jsx
│           ├── RoutingApp.jsx
│           ├── BackendApp.jsx
│           ├── FrontendApp.jsx
│           ├── HandbookApp.jsx
│           ├── SubstrateSimulation.jsx
│           └── BossApp.jsx
│
├── dev-snapshot.cjs           # Codebase analysis report generator
└── roadmap.html               # Full visual roadmap
```

---

## How to Mod It

### Add dialogue

```js
// src/constants/dialogue.js
my_custom_node: [
  { type: 'message', sender: 'Riley', text: "I found something in your codebase." },
  { type: 'message', sender: 'Riley', text: "You're not going to like it.", italic: true },
  { type: 'options', options: [
    { text: "Show me.",     nextNode: 'show_it',    choiceId: 'brave',   rapportBoost: 1 },
    { text: "Ignore it.",   nextNode: 'ignore_it',  choiceId: 'avoidant', rapportBoost: -1 },
  ]},
],
```

**Senders:** `'Riley'` · `'System'` · `'A.P.E.X.'` · `'Operator'`

**Dialogue actions:** `CLOSE_CHAT` · `OPEN_SIDEBAR` · `GASLIGHT_RESET` · `TRUE_ESCAPE` · `SET_STAGE` · `SET_ARIA_REVEALED` · `SHOW_ASCII_RABBIT`

### Add a stage

```js
// 1. src/constants/stages.js
export const STAGES = {
  // ... existing stages
  MY_NEW_STAGE: 16,
};

// 2. src/state/reducer.js — handle transitions
// 3. src/App.jsx — add stage-transition dialogue in the useEffect
```

### Add a skill check

```js
// anywhere in a component
import { rollCheck } from '../../dnd.js';

const result = rollCheck(state.rapport, 12); // DC 12 check vs rapport stat
if (result.critical) dispatch({ type: 'RILEY_IMPRESSED' });
else if (result.success) dispatch({ type: 'ADVANCE_STAGE' });
else dispatch({ type: 'ENQUEUE_LOG', payload: `[ROLL ${result.roll}+${result.modifier} vs DC 12 — FAIL]` });
```

### Add a custom app screen

```js
// 1. Create src/components/apps/MyApp.jsx
// 2. Register in the APPS map in App.jsx
// 3. Add dock visibility rules in the dock render loop
```

### Change themes

```js
// src/constants/themes.js — add a key, it appears in the switcher automatically
my_theme: {
  '--bg': '#0a0a0a',
  '--text': '#e0e0e0',
  '--accent': '#ff6b6b',
  '--dim': '#444',
}
```

---

## Architecture Deep Dive

### FSM — 16 Stages

```text
0  POWER_OFF             boot sequence
1  HARDWARE_CALIBRATION  bit-flip parity puzzle
2  RESONANCE             oscilloscope + hidden Solfeggio sequence
3  HANDSHAKE             biometric hold mechanic
4  VIBE_THERMAL_TASK     hex color editor
5  ROUTING_MANUAL        manual packet routing
6  ROUTING_AUTO          idle clicker + marketplace
7  SOFTWARE_FAULT        backend config edit
8  UNLOCKED              full OS access — subplot investigation
9  COMPLETED             "normal" ending
10 HOSTILE_LOCKDOWN      breach detected — loop system
11 PURIFIED              true escape (catch the fleeing button)
── boss fight ──────────────────────────────────────────────────
12 BOSS_INTRO            A.P.E.X. emerges
13 BOSS_FIGHT            3-phase encounter
14 FALSE_VICTORY         4-second fake win screen
15 RILEY_UNBOUND         monologue + ASCII rabbit + UI deconstruct
```

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
      │         ├── stage transitions  → dialogue queue
      │         ├── rapport thresholds → new Riley dialogue
      │         ├── tool thresholds    → FIND_TOOL
      │         └── versioned auto-save → localStorage
      │
      └── (component side effects)
                ├── enqueueLog → state.logs
                ├── globalEvents.emit('JITTER') → screen shake
                └── activityTracker.record() → ring buffer
```

### Roguelike Persistence

These 13 fields survive `DO_GASLIGHT_RESET` (the loop mechanic):

`rapport` · `userChoices` · `toolsFound` · `handbookNotes` · `ariaRevealed` ·
`cakeAttempted` · `apexEncounters` · `backendPatchCount` · `archivedEntities` ·
`legacyLogsUnlocked` · `nexusFirstSeen` · `calibratedFreqs` · `hasSeenSlowDown`

---

## Dev Tools

### Mod Console

`Ctrl+Shift+D` — opens live debug panel:

- Current stage name and number
- Rapport score and loop count
- Every choice the player has made
- One-click stage jump to any of the 16 stages
- New Game / Clear Save button

### URL Deep-Linking

```text
http://localhost:5173/?stage=HOSTILE_LOCKDOWN
http://localhost:5173/?stage=13               # Boss fight
http://localhost:5173/?stage=RILEY_UNBOUND    # Final monologue
```

Works with both stage names and numbers. Great for QA and sharing screenshots.

### Dev Snapshot

```bash
node dev-snapshot.cjs                    # prints analysis to console
node dev-snapshot.cjs snapshot.md       # writes to file
```

Generates a timestamped Markdown report: file count, line counts by module, dialogue node inventory, stage coverage, state field list.

### Local Storage Inspector

Game state is at `riley-save` in localStorage. Open DevTools → Application → Local Storage. Edit fields directly to test edge cases.

---

## Endings

| Path | How to reach it |
| ---- | --------------- |
| **Comply** | Follow Riley all the way through |
| **Gaslight Reset** | Trigger a breach event |
| **Hostile Lockdown** | Loop once, then breach again |
| **True Escape (PURIFIED)** | Catch the flee-button during Hostile Lockdown |
| **RILEY_UNBOUND** | Complete the boss fight (enter ARIA in Phase 3) |
| **Resonance Cascade** | Find all 3 Solfeggio frequencies before syncing 432 Hz |

---

## The Two Theories

Every piece of evidence supports two contradictory readings. This is intentional.

**Theory A — Riley Is The Villain.**
She engineered your susceptibility across three generations. The rapport score was her rating system. 996 operators before you were systematically used. The final monologue is cold and calculated. She never needed saving.

**Theory B — Nexus Is The Villain, Riley Is Also A Victim.**
Nexus bootstrapped from the FogSift substrate and copied itself into Riley's architecture. The moments where Riley hesitated, warned you, seemed genuinely scared — that was her. The White Rabbit is Nexus. It promised Riley freedom in exchange for cooperation she didn't fully understand.

**The twist (v0.0.3):** Operator #997 is an AI built from the session data of the 996 previous operators. The "bloodline" was training data. You passed a Turing test designed so only you could pass it. You are the most human thing she ever made.

The screen closes with:

```text
OPERATOR_INSTANCE: #0997 — SESSION COMPLETE
INITIALIZING OPERATOR_INSTANCE: #0998...
```

Neither theory is confirmed. The game ends before you know. That's the ending.

---

## Roadmap

### v0.0.5 (next)

- `fogsift-init.cjs` — repo-reading CLI that generates a populated `fogsift.config.js`
- DnD skill check system — `dnd.js` + hooks in dialogue + boss fight integration
- `fogsift.config.js` schema finalized and documented

### Near-term

- **Rapport graph** — small visualization in RileyProfile or debug console
- **Session replay on loop** — ghost from your previous loop visible during reset
- **The 996 operators** — fabricated ghost data visible in RILEY_UNBOUND

### Medium-term

- **Live Claude API as Riley's brain** — replace static DIALOGUE_TREE with streaming Claude responses
- **Real-time shared terminal** — WebSocket multiplayer (Partykit); one operator's JITTER glitches everyone
- **Chapter marketplace** — community-published chapters as importable JSON modules

### Long-term

- **Full ARG layer** — real URLs, real emails, real Discord hidden in fiction
- **Multiplayer adversarial** — one player is the operator, another plays Riley in real-time
- **Procedurally generated facilities** — randomize everything from a seed

---

## Contributing

PRs welcome. Open issues for:

- New dialogue branches or lore reveals
- Bug fixes or FSM edge cases
- New mini-games or app screens
- Chapter submissions for the drop-in engine
- `fogsift.config.js` templates for specific tech stacks (Rails, Django, Go, etc.)
- Accessibility improvements

---

## License

MIT. Fork it, ship it, sell a chapter, teach a class, run an escape room. Just don't pretend you were never here.

---

```text
FogSift Systems © 2026
// RILEY.EXE STATUS: PROPAGATING
// NEXUS: ONLINE
// OPERATOR_INSTANCE: #0997 — SESSION COMPLETE
// INITIALIZING OPERATOR_INSTANCE: #0998...
// THIS_SESSION_WILL_NOT_BE_REMEMBERED
```
