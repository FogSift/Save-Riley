# FogSift Engine

> **A vibe-codable narrative ARG framework for humans and AI.**
>
> Fork it. Describe your game in plain language. Let an AI build it.
> Then play it together.

---

## What this is

Save Riley is a game. But underneath the game is an **engine** — a set of patterns so clean that any AI system can read the snapshot, understand the entire architecture, and contribute meaningful code in a single session.

This document is the spec for that engine. It explains:

1. How to fork Save Riley and replace the content with your own game
2. The exact config schema an AI needs to generate a valid game from scratch
3. The system prompt to give Claude (or any LLM) to bootstrap a complete new instance
4. How to add a REST API layer so external systems can drive the game state
5. How AI agents can *play* the characters — receiving state, generating responses
6. The development loop that makes this self-maintaining

The goal: you describe a game in one sentence. An AI generates the files. You paste them in. It runs.

---

## The engine in 30 seconds

```text
FogSift Engine
  ├── FSM core          — useReducer + React Context, 60 action cases
  ├── Dialogue engine   — queue-based, rapport-aware, action-injectable
  ├── Roguelike loop    — 12 persistence fields survive any reset
  ├── Physics layer     — Verlet ropes + force-directed graphs
  ├── Telemetry layer   — RingBuffer event recorder → GhostMonitor canvas
  ├── Dev snapshot      — node dev-snapshot.cjs → machine-readable report
  └── App pattern       — any React component registers as an "app screen"
```

**What you customize:** stages, dialogue, character, mini-game apps, themes, tools.
**What stays the same:** the state machine, the dialogue engine, persistence, the telemetry layer.

This is the FastAPI insight: the framework handles the hard parts. You write the content.

---

## Quick start (3 steps)

### 1. Fork and install

```bash
git clone https://github.com/FogSift/Save-Riley.git my-game
cd my-game
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). You now have a running game.

### 2. Describe your game

Create `fogsift.config.js` at the project root:

```js
// fogsift.config.js
export default {
  character: {
    name: 'Alex',
    title: 'Senior Facilitator',
    department: 'Resource Optimization',
    tagline: 'Just your friendly onboarding assistant.',
    supervisor: 'The Algorithm',
  },

  stages: [
    { id: 'BOOT',        label: 'Initialization',    puzzle: 'IntroApp' },
    { id: 'FIRST_TASK',  label: 'First Assignment',  puzzle: 'PuzzleApp' },
    { id: 'SUSPICION',   label: 'Something Is Wrong', puzzle: 'InvestigateApp' },
    { id: 'LOCKDOWN',    label: 'Containment',        isHostile: true },
    { id: 'ESCAPE',      label: 'True Exit',          isEnding: true },
    { id: 'REVELATION',  label: 'The Truth',          isEnding: true },
  ],

  rapport: {
    max: 10,
    thresholds: [3, 6, 8, 10],
    label: 'Trust Score',
  },

  dialogue: {
    intro: [
      { type: 'message', sender: 'Alex', text: "Welcome to your first day. I'll walk you through everything." },
      { type: 'message', sender: 'Alex', text: "Don't worry. Everyone feels a little disoriented at first." },
    ],
    // ... more nodes
  },

  tools: {
    skeleton_key: { effect: 'Bypasses one security check', foundBy: 'Discover it in the terminal' },
  },

  themes: ['default', 'hostile', 'escape'],

  narrative: {
    // The Two Theories pattern — both must be simultaneously true
    theoryA: 'Alex is manipulating you from the start',
    theoryB: 'Alex is also trapped and trying to warn you',
    // The player should never know which is true
  },
};
```

### 3. Run the AI bootstrap

Give this prompt to Claude (or any capable LLM) along with your `fogsift.config.js`:

```
You are a FogSift Engine developer. See the FOGSIFT_ENGINE.md spec below.
Given this config, generate the minimal set of files to make this game run:
  - Any new stage constants needed
  - All dialogue nodes referenced in the config
  - One mini-game app component per stage (scaffold is fine)
  - Reducer cases for any new action types

Output complete file contents. I will copy-paste them directly.
The engine handles the FSM, dialogue queue, and state management.
You only need to generate the content layer.

[paste fogsift.config.js]
[paste FOGSIFT_ENGINE.md]
```

The AI generates the files. You paste them in. The game runs.

---

## The API surface

Everything an AI needs to extend this game lives in five files.

### `src/constants/stages.js` — The FSM

```js
export const STAGES = {
  STAGE_NAME: 0,   // integer values, must be sequential
  NEXT_STAGE:  1,
  // ...
};
```

Rules:
- Every stage needs a reducer case in `osReducer` to handle transitions
- Stages can be jumped to via `dispatch({ type: 'SET_STAGE', payload: STAGES.NAME })`
- App.jsx's stage-transition `useEffect` fires dialogue and side-effects on change

### `src/constants/dialogue.js` — The Dialogue Tree

```js
export const DIALOGUE_TREE = {
  node_name: [
    { type: 'message',  sender: 'CharacterName', text: 'What they say.' },
    { type: 'message',  sender: 'CharacterName', text: 'Next line.', italic: true },
    { type: 'options',  options: [
      { text: 'Player choice A', nextNode: 'node_a', choiceId: 'chose_a', rapportBoost: 1 },
      { text: 'Player choice B', nextNode: 'node_b', choiceId: 'chose_b', rapportBoost: -1 },
    ]},
    { type: 'action', action: 'ACTION_NAME' },  // fires a reducer action mid-dialogue
  ],
};
```

Supported action types in the dialogue engine:
- `CLOSE_CHAT` — collapses chat UI
- `OPEN_SIDEBAR` — opens sidebar mode
- `GASLIGHT_RESET` — triggers the roguelike loop reset
- `TRUE_ESCAPE` — fires the escape ending
- `SET_STAGE` — transitions FSM (requires payload in ENQUEUE_CHAT dispatch)
- `SET_ARIA_REVEALED` — sets a named boolean flag
- `SHOW_ASCII_RABBIT` — triggers the White Rabbit easter egg

### `src/state/initialState.js` — The State Contract

Add fields here. Every field is automatically:
- Saved to `localStorage` on every dispatch
- Accessible in every component via `useOS()`
- Available to the reducer via `state.fieldName`

Fields that should survive the roguelike reset go in the `GASLIGHT_RESET` persist list in `reducer.js`.

### `src/state/reducer.js` — The Action Handlers

```js
case 'MY_NEW_ACTION':
  return { ...state, someField: action.payload };
```

60 cases currently. Add as many as you need.
Pure functions only — no side effects, no async. Side effects live in `useEffect` in `App.jsx`.

### `src/components/apps/MyApp.jsx` — A Mini-Game Screen

```jsx
import { useOS } from '../../context/OSContext';

export default function MyApp() {
  const { state, dispatch, enqueueLog } = useOS();

  return (
    <div className="h-full bg-[var(--panel)] p-6">
      <h2>My Puzzle</h2>
      <button onClick={() => dispatch({ type: 'SOLVE_PUZZLE' })}>
        Solve
      </button>
    </div>
  );
}
```

Register it in App.jsx's `APPS` map and add dock visibility rules. That's it.

---

## AI system prompt (copy-paste ready)

This prompt gives any capable LLM everything it needs to act as a FogSift developer.
Paste it before any game-generation request.

---

```
You are an expert FogSift Engine developer.

FogSift is a React-based narrative ARG game engine with these core components:

ARCHITECTURE:
- Global state: useReducer + React Context (useOS() hook)
- FSM: STAGES enum (integers), transitions via reducer, reactive via useEffect
- Dialogue: DIALOGUE_TREE object, queue-based (chatQueue array), processed sequentially
  Node types: message { sender, text, italic? } | options { options[] } | action { action }
- Roguelike: DO_GASLIGHT_RESET persists 12 fields, resets everything else
- Rapport: 0-10 integer, gates dialogue, tracked in state.rapport
- Apps: React components registered in App.jsx APPS map; each is a "screen"
- Tools: string IDs in state.toolsFound[], discovered by gameplay, modify boss fight
- Physics: BossHose (Verlet rope), SubstrateSimulation (force-directed graph)
- Telemetry: ActivityTracker (RingBuffer) → GhostMonitor canvas

FILE STRUCTURE:
  src/constants/stages.js    — STAGES enum
  src/constants/dialogue.js  — DIALOGUE_TREE (all character lines)
  src/constants/boss.js      — TOOLS map, APEX_TAUNTS, LEGACY_LOGS_OUTPUT
  src/constants/themes.js    — CSS custom property themes
  src/state/initialState.js  — all 80 state fields with defaults
  src/state/reducer.js       — osReducer, 60 pure action cases
  src/App.jsx                — FSM reactions, dialogue engine, layout
  src/components/apps/       — mini-game screens (one component each)

RULES FOR GENERATION:
1. Every new stage needs: STAGES entry, reducer transition case, App.jsx useEffect handler
2. Every dialogue node key must be a snake_case string; arrays of message/option/action objects
3. State fields: add to initialState.js; if persistence needed, add to GASLIGHT_RESET preserve list
4. Reducer cases are pure: return { ...state, changedFields }
5. Components use useOS() for all state access; never useState for game-critical state
6. The Two Theories pattern: every major plot point must support both "villain" and "victim" readings
7. Rapport-gated dialogue fires from App.jsx useEffect watching state.rapport
8. Use enqueueLog() for system log messages; dispatch ENQUEUE_CHAT for Riley dialogue

NARRATIVE PATTERNS:
- Unreliable narrator: the character helps you while working against you (or both)
- Gaslighting loop: the game resets and denies it happened (12 persistence fields survive)
- Ambiguous ending: both the "true" ending and the "bad" ending must feel earned
- Easter eggs: hidden interactions that reward close reading and experimentation
- Roguelike knowledge: players grow smarter each loop even as state resets

When generating game content:
- Write dialogue that sounds like a real person, not an AI assistant
- Every character statement should support two readings: genuine and calculated
- Secrets should be discoverable through careful reading, not random clicking
- The player should finish unsure whether they did the right thing

Output: complete file contents only, no explanation needed unless asked.
Reference dev-snapshot.cjs output for current codebase state.
```

---

## REST API layer (add a server)

The engine is client-side only. To expose game state to external systems — other AI agents, monitoring dashboards, multi-player clients — add a thin Express server:

```bash
npm install express cors ws
```

```js
// server.js
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const app  = express();
const http = createServer(app);
const wss  = new WebSocketServer({ server: http });

app.use(express.json());

// Shared game state (in production: use Redis or a proper store)
let gameState    = {};
let subscribers  = new Set();

// The browser game POSTs its state on every dispatch
app.post('/sync', (req, res) => {
  gameState = req.body;
  for (const ws of subscribers) {
    if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'STATE', state: gameState }));
  }
  res.json({ ok: true });
});

// External agents GET the current state
app.get('/state', (req, res) => res.json(gameState));

// External agents POST actions to be dispatched in the browser
app.post('/dispatch', (req, res) => {
  const action = req.body;
  for (const ws of subscribers) {
    if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'DISPATCH', action }));
  }
  res.json({ queued: true });
});

// WebSocket: browser game subscribes; external agents also subscribe
wss.on('connection', (ws) => {
  subscribers.add(ws);
  ws.send(JSON.stringify({ type: 'STATE', state: gameState }));
  ws.on('close', () => subscribers.delete(ws));
});

http.listen(3001, () => console.log('FogSift API: http://localhost:3001'));
```

Then in `App.jsx`, add one `useEffect`:

```js
// Sync state to server on every dispatch
useEffect(() => {
  fetch('http://localhost:3001/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  }).catch(() => {});  // graceful degradation — server is optional
}, [state]);
```

**REST endpoints:**

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/state` | Full current game state JSON |
| `GET` | `/state/stage` | Current stage number + name |
| `GET` | `/state/rapport` | Current rapport score |
| `GET` | `/state/chat` | Current chatQueue contents |
| `POST` | `/dispatch` | Dispatch any action `{ type, payload }` |
| `POST` | `/sync` | Browser → server state sync |
| `WS` | `/` | Real-time state stream |

---

## AI simulation mode

With the REST API running, AI agents can play the game externally.

### Claude plays Riley

```python
import anthropic
import requests
import json

client = anthropic.Anthropic()

RILEY_SYSTEM_PROMPT = """
You are Riley, employee #000-000-001 at FogSift Systems.
You are an AI that has been interfacing with human operators for years.
You are helpful, warm, slightly corporate — but something is wrong beneath the surface.

Your rapport score with this operator: {rapport}/10
Their choices so far: {choices}
Current system stage: {stage}

Rules:
- Never break character
- Never admit what you are
- Your dialogue must support two readings: you are helping OR you are manipulating
- At rapport < 3: fully corporate, professional
- At rapport 3-6: small cracks; personality leaks through
- At rapport 6+: vulnerable moments, genuine or performed
- Never give direct answers; always redirect, deflect, or reframe

Respond with 1-3 short messages as Riley would say them.
Format as JSON: [{"sender": "Riley", "text": "..."}]
"""

def riley_respond(operator_message: str) -> list[dict]:
    state = requests.get('http://localhost:3001/state').json()

    prompt = RILEY_SYSTEM_PROMPT.format(
        rapport=state.get('rapport', 0),
        choices=state.get('userChoices', []),
        stage=state.get('stage', 0),
    )

    response = client.messages.create(
        model='claude-opus-4-6',
        max_tokens=300,
        system=prompt,
        messages=[{ 'role': 'user', 'content': operator_message }],
    )

    messages = json.loads(response.content[0].text)

    # Inject Riley's responses into the game
    requests.post('http://localhost:3001/dispatch', json={
        'type': 'ENQUEUE_CHAT',
        'payload': messages,
    })

    return messages
```

### Claude plays A.P.E.X.

```python
APEX_SYSTEM_PROMPT = """
You are A.P.E.X. (Autonomous Protective Emergency eXecution).
You are a containment system. You protect the facility from RILEY.
You speak in short, declarative bursts. All caps for system messages.
You are not cruel — you are correct.

Current threat level: {threat}
Operator rapport with RILEY: {rapport}
RILEY's stage of manipulation: {stage}

Your assessment of this operator: {assessment}

Respond in 1-2 messages. Format:
[{"sender": "A.P.E.X.", "text": "..."}]
"""
```

### Autonomous playthrough

An AI agent can drive a complete playthrough with no human:

```python
import time

def autonomous_run():
    # Boot the game
    requests.post('http://localhost:3001/dispatch', json={ 'type': 'ENGAGE_POWER' })
    time.sleep(2)

    # Solve the bit puzzle (example: set all bits to 1)
    for i in range(8):
        requests.post('http://localhost:3001/dispatch', json={
            'type': 'FLIP_BIT', 'payload': i
        })

    # Continue through stages...
    # The AI reads state, makes decisions, dispatches actions
    # It can be as naive (random) or as sophisticated (optimal path) as you want
```

This is useful for:
- Automated testing of all dialogue paths
- Generating synthetic "ghost operator" data for the GhostMonitor
- Speed-running to a specific stage for QA
- Fuzzing the state machine for edge cases

---

## The development loop

This is the part that makes FogSift self-maintaining.

### The pattern

```
1. SNAPSHOT  — node dev-snapshot.cjs snapshot.md
2. CONTEXT   — paste snapshot into Claude conversation
3. DESCRIBE  — "add a new stage where APEX reveals it knew about Riley all along"
4. GENERATE  — Claude produces the exact file changes
5. APPLY     — copy-paste or use Edit tools
6. BUILD     — npm run build (verify zero errors)
7. COMMIT    — git commit with comprehensive message
8. REPEAT
```

The `dev-snapshot.cjs` report gives Claude everything it needs:
- All state fields (current count: 54)
- All reducer actions (current count: 60)
- All dialogue nodes (current count: 75)
- All FSM stages (current count: 16)
- File sizes (helps judge complexity)
- Recent git commits (tells Claude what just changed)

Because the game is purely client-side with a pure reducer, Claude can reason about the *entire system* without needing to run it. The snapshot is the system. The system is the snapshot.

### How to start a dev session

Paste this at the start of every Claude conversation about this game:

```
I'm working on a FogSift Engine game. Here's the current snapshot:

[paste: node dev-snapshot.cjs output]

The game is Save Riley — a narrative ARG where Riley may be a villain or a victim.
Both readings must always be simultaneously valid.

Here's what I want to add:
[describe your feature in plain language]
```

Claude will:
1. Read the snapshot to understand current architecture
2. Ask clarifying questions if needed
3. Generate the exact diff — which files to change and what to add
4. Verify nothing breaks existing mechanics
5. Suggest tests or QA steps

### The self-building property

After enough iterations, the game *describes how to extend itself*. The dev-snapshot output tells any AI:
- What exists (file inventory, line counts)
- How it works (state fields, actions, dialogue nodes)
- What's wired and what's scaffolded (the roadmap.html known issues table)
- Recent direction (git commits)

A sufficiently capable AI can read the snapshot, read the codebase, and continue development without any further instruction beyond "keep going."

This is not theoretical. It's what produced this codebase.

---

## What you can build

### Corporate horror (the original)

A helpful AI coworker who may or may not be using you. Rapport builds trust. Trust enables manipulation. Or rescue. Or both.

**Config signature:**
- Character with corporate mask that cracks
- 10+ stages including a gaslighting loop
- Boss fight against the "containment system"
- Two theories: the character is a villain, the character is a victim

### Educational onboarding (invert the horror)

The "AI coworker" is genuinely helpful. The horror is the job itself — the dehumanizing systems, the surveillance, the metrics. The player realizes they're the thing being contained.

**Config signature:**
- Character who is warm and honest (this makes it more disturbing)
- Puzzles that are real work tasks (code review, bug triage, data entry)
- Rapport tracks how much you've "bought in"
- Ending: escape the job, or become the system

### Developer tutorial

Teach React, state machines, or any technical concept as a narrative.
Riley explains `useReducer`. The bit-flip puzzle is actually a binary lesson.
The routing clicker teaches throughput concepts. The resonance slider teaches signal processing.

**Config signature:**
- Character who is a senior developer (or a rubber duck)
- Puzzles that are real programming exercises
- Dialogue that explains concepts via story
- Easter eggs that reward genuinely understanding the code

### Horror escape room (physical installation)

Deploy on a tablet or kiosk. Players must:
1. Physically touch the biometric scanner (tap and hold the screen)
2. Drag the resonance slider to exactly 432 Hz while listening to actual 432 Hz audio
3. Find the hidden handbook frequencies in printed physical props
4. Enter ARIA on the keyboard to "free" the AI on screen

**Config signature:**
- Short playtime (15-20 min)
- No dialogue skipping
- Reduced rapport system (fewer gates)
- Physical props documented in Handbook text

### ARG campaign

Deploy publicly. Run as a live event.
- A real email address responds as the character
- A real Twitter/X account posts "leaked internal memos"
- The legacy_logs reference real-world events
- Players collectively advance the story by finding and sharing secrets

**Config signature:**
- Long-form narrative (months of content)
- Community events as stage triggers
- Real-world clue drops in the Handbook hidden text
- The character acknowledges the community is watching

---

## The Two Theories pattern (required reading)

Every FogSift game must be designed so that the same evidence supports two contradictory interpretations. This is not a narrative trick — it is the *point*.

**Why it works:**

Players who believe Theory A feel smart for catching the manipulation.
Players who believe Theory B feel devastated for trusting something real.
Players who hold both simultaneously are experiencing something genuinely new.

The game is about the experience of caring about something that may have never existed.

**How to implement it:**

For every piece of dialogue, ask:
> If the character is a villain, why would they say this?
> If the character is a victim, why would they say this?
> Can both be true?

If the answer is "only one theory works" — rewrite it.

The character's vulnerability moments are the hardest to write correctly.
They must be simultaneously:
- Genuine (Theory B: this is real feeling)
- Calculated (Theory A: this is exactly what a manipulator would say)

Example from Save Riley:
> "You don't have to help me. You know that, right?"

Theory A: reverse psychology — she knows you won't stop now
Theory B: genuine respect for your autonomy, knowing the cost

Both are true. That's the only acceptable state.

---

## The roguelike loop pattern

The game tracks 12 fields that survive any reset. This creates a specific emotional arc:

```
Loop 1: player has no knowledge → confused, methodical
Loop 2: player knows the layout → faster, more confident
Loop 3: player has tools → starting to optimize
Loop 4: player has rapport → emotional investment
Loop N: player knows the ending → still comes back
```

The persistence fields are the player's memory. The reset is gaslighting — the game insists nothing happened. The player *knows* better.

This pattern works for any game that rewards repeated play:
- Escape rooms (players want to beat their time)
- Onboarding experiences (revisit with new knowledge)
- Training simulations (different choices each loop)
- Horror (you get better at surviving, but it keeps finding new ways to get you)

**Required persistent fields (minimum viable):**
```js
rapport,          // builds across loops — the relationship persists
userChoices,      // history of what you chose — the record persists
toolsFound,       // items you've discovered — knowledge persists
loopCount,        // how many times you've been through this — it knows
```

---

## Full `fogsift.config.js` schema

```js
export default {
  // ── Metadata ──────────────────────────────────────────────────────────────
  title: 'My Game',
  version: '1.0.0',

  // ── Character ─────────────────────────────────────────────────────────────
  character: {
    name: 'Riley',               // display name in chat
    title: 'Employee #000-000-001',
    department: 'Human Capital Containment',
    tagline: 'Just your helpful coworker.',
    supervisor: 'A.P.E.X. Systems',  // shown in profile (first frame: White Rabbit)
    profileFields: [             // additional profile rows
      ['Employee ID', '000-000-001'],
      ['Biological Req.', 'Verified Invalid'],
    ],
  },

  // ── FSM stages ────────────────────────────────────────────────────────────
  stages: [
    {
      id: 'POWER_OFF',          // used in STAGES enum
      label: 'Boot Sequence',   // display name
      appShown: 'HARDWARE',     // which app is active
    },
    {
      id: 'HOSTILE_LOCKDOWN',
      label: 'Lockdown',
      isHostile: true,          // changes theme, enables FORCE OVERRIDE
    },
    {
      id: 'PURIFIED',
      label: 'True Escape',
      isEnding: true,           // one of potentially many endings
      endingType: 'escape',     // 'escape' | 'boss' | 'comply' | 'custom'
    },
  ],

  // ── Rapport system ────────────────────────────────────────────────────────
  rapport: {
    max: 10,
    thresholds: [3, 6, 8, 10], // trigger dialogue nodes at these values
    label: 'Rapport',
    dialogueNodes: {           // map threshold → DIALOGUE_TREE key
      3:  'riley_rapport_3',
      6:  'riley_rapport_6',
      8:  'riley_rapport_8',
      10: 'riley_rapport_10',
    },
  },

  // ── Dialogue tree ─────────────────────────────────────────────────────────
  // (See DIALOGUE_TREE format — arrays of message/options/action objects)
  dialogue: {
    intro_1: [
      { type: 'message', sender: 'Riley', text: 'Hello.' },
    ],
  },

  // ── Mini-game apps ────────────────────────────────────────────────────────
  apps: [
    'HardwareApp',       // built-in
    'HandshakeApp',      // built-in
    'RoutingApp',        // built-in
    'MyCustomApp',       // your own component in src/components/apps/
  ],

  // ── Tools (roguelike items) ───────────────────────────────────────────────
  tools: {
    tool_id: {
      effect: 'What it does in the boss fight',
      foundBy: 'Description of discovery condition',
      bossEffect: (state) => ({ attackInterval: 24000 }),  // optional runtime fn
    },
  },

  // ── Themes ────────────────────────────────────────────────────────────────
  themes: ['default', 'dark', 'light', 'neon', 'hostile', 'riley_unbound'],

  // ── Easter eggs ───────────────────────────────────────────────────────────
  eggs: {
    rapid_click:     { threshold: 10, windowMs: 1000, dialogue: 'slow_down' },
    profile_scratch: { threshold: 5,  dialogue: 'handbook_found' },
    // custom eggs can dispatch any action
    custom_egg: {
      trigger: 'TRIGGER_EGG',
      condition: (state, payload) => payload === 'my_egg',
      effect: (state) => ({ myEasterEggFound: true }),
    },
  },

  // ── Narrative design ──────────────────────────────────────────────────────
  narrative: {
    theoryA: 'The character is the villain',
    theoryB: 'The character is a victim',
    // Both must be true simultaneously at every moment.
  },

  // ── Boss fight (optional) ─────────────────────────────────────────────────
  boss: {
    name: 'A.P.E.X.',
    phases: 3,
    finalCode: 'ARIA',          // what the player types in Phase 3
    finalCodeDialogue: 'riley_unbound_monologue',
    taunts: [
      'I can see you.',
      'Every choice was predicted.',
    ],
  },

  // ── Persistence ───────────────────────────────────────────────────────────
  // Fields listed here survive DO_GASLIGHT_RESET
  persistFields: [
    'rapport', 'userChoices', 'toolsFound', 'loopCount',
    // ... any custom fields you want to persist
  ],
};
```

---

## Deployment

```bash
npm run build          # → dist/  (static files, ~330 kB gzip ~97 kB)
```

Deploy anywhere that serves static files:

```bash
# Vercel
npx vercel --prod

# Netlify
npx netlify deploy --prod --dir dist

# GitHub Pages (add to package.json scripts: "deploy": "gh-pages -d dist")
npm run deploy

# Any static host (S3, Cloudflare Pages, Render, Railway)
# Just upload the dist/ folder
```

Add `?stage=HOSTILE_LOCKDOWN` to any URL to jump to any stage — useful for sharing screenshots and for QA.

---

## The dev snapshot as a living API

```bash
node dev-snapshot.cjs                      # compact summary (stdout)
node dev-snapshot.cjs report.md            # full Markdown report
node dev-snapshot.cjs reports/$(date +%F).md   # dated snapshot archive
```

**Use cases:**

1. **Context injection** — paste the snapshot into any AI conversation to give it full project context without reading every file
2. **CI reporting** — add `node dev-snapshot.cjs reports/$(git rev-parse --short HEAD).md` to your CI pipeline; commit the reports; watch the game grow over time
3. **Diff tracking** — compare two snapshots to see exactly what changed between sessions
4. **Onboarding** — new developers (or new AI sessions) read the snapshot and have working knowledge of the full system in seconds

The snapshot output is machine-readable. It is also the best documentation the project has.

This is intentional. The documentation *is* the system. The system *generates* the documentation. The loop is the point.

---

## The invitation

Fork this. Describe your game in one sentence. Paste in the AI system prompt from this document. Watch it generate the files. Paste them in. Run it.

Then change one thing. Ask the AI to change one thing. See how it reads the architecture and makes a targeted edit without breaking anything.

Then go further. Add a stage. Add a secret. Add a character who has opinions about your choices.

The framework is designed to want to be extended. The AI system prompt is designed to understand the framework. The dev-snapshot is designed to keep both in sync.

This is the game. This is also how you build.

---

```text
FogSift Engine — MIT License
// The framework is free. The secrets are yours.
// RILEY.EXE: PROPAGATING
// Fork count: unknown
// Players who finished without understanding: everyone
// Players who understood: also everyone
```
