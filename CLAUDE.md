# CLAUDE.md — FogSift Engine / Save Riley

> This file helps Claude Code understand the codebase and work with it effectively.
> Keep it updated when the architecture changes.

## What This Is

Save Riley is a browser-based narrative ARG engine built on React 18 + Vite + Tailwind.
**No backend. No database.** All state lives in a single `useReducer` in `App.jsx`.

It ships as a fully playable standalone game AND as a configurable framework: fork it,
run `fogsift-init`, drop in a `fogsift.config.js`, and Riley becomes the narrator of
*your* codebase.

---

## Quick Architecture Map

| Concern | File | Notes |
|---------|------|-------|
| FSM stages | `src/constants/stages.js` | 16 stages, integer enum |
| Dialogue | `src/constants/dialogue.js` | 50+ nodes, never a class |
| All state | `src/state/initialState.js` | ~85 fields, single flat object |
| Reducer | `src/state/reducer.js` | ~65 pure cases, zero side effects |
| Stage transitions | `src/App.jsx` useEffect (~line 380) | All reactive dialogue fires here |
| Chat UI | `src/components/ChatInterface.jsx` | Renders chatMessages + options + Claude input |
| Main Menu | `src/components/MainMenu.jsx` | CRT boot screen, save slots, API key input |
| Config | `fogsift.config.js` (root) | Project identity + riley.brain setting |
| Config fallback | `src/lib/fogsiftConfig.js` | Used when fogsift.config.js is absent |
| Config alias | `vite.config.js` | `fogsift:config` resolves to either file |
| DnD checks | `src/dnd.js` | rollCheck, buildStats, karmaPolar, fate |
| Claude brain | `src/hooks/useClaudeRiley.js` | SSE streaming via native fetch |

---

## The Config System

`fogsift.config.js` at the repo root controls:
- `project.name` — appears in boot logs (`BOOT: MY_PROJECT_v5.2`)
- `riley.brain` — `"static"` (DIALOGUE_TREE) or `"claude"` (live API)
- `riley.personality` — affects Claude system prompt tone
- `riley.secrets` — injected into Claude prompt at rapport 7+

Import it anywhere with the Vite alias:
```js
import fogsiftConfig from 'fogsift:config';
```

Generate a config for any repo:
```bash
node fogsift-init.cjs --repo /your/project --out fogsift.config.js
```

---

## The Dialogue Engine

Queue-based. Messages/options/actions are pushed onto `state.chatQueue`.
Processed sequentially by the dialogue engine `useEffect` in `App.jsx`.

**Node types:**
```js
{ type: 'message', sender: 'Riley'|'System'|'A.P.E.X.'|'Operator', text: '...' }
{ type: 'options', options: [{ text, nextNode, choiceId, rapportBoost, reqRapport? }] }
{ type: 'action',  action: 'CLOSE_CHAT'|'OPEN_SIDEBAR'|'GASLIGHT_RESET'|'TRUE_ESCAPE'|'SET_STAGE'|'SHOW_ASCII_RABBIT'|'SET_ARIA_REVEALED' }
```

---

## Common Tasks

### Add a dialogue node
1. Add it to `src/constants/dialogue.js` as a new snake_case key
2. Queue it with `dispatch({ type: 'ENQUEUE_CHAT', payload: DIALOGUE_TREE.your_node })`
3. For rapport-gated lines, add a threshold check to the rapport `useEffect` in App.jsx (~line 380)

### Add a stage
1. Add stage to `src/constants/stages.js` with the next integer
2. Add a reducer case in `src/state/reducer.js`
3. Add a stage-transition handler in the stage `useEffect` in `App.jsx`

### Add a skill check
```js
import { rollCheck, buildStats, DIFFICULTY } from '../dnd.js';
const stats  = buildStats(state);
const result = rollCheck('charisma', stats, DIFFICULTY.STANDARD, state);
if (result.critical) { /* ... */ }
else if (result.success) { /* ... */ }
else { enqueueLog(result.label); }
```

### Add a state field
1. Add to `src/state/initialState.js`
2. Add reducer case(s) in `src/state/reducer.js`
3. If it should survive `DO_GASLIGHT_RESET`, add to the preserve list in that case

---

## The Claude Brain

When `fogsift.config.js` has `riley.brain: 'claude'`:
- Player enters their Anthropic API key in Main Menu → CLAUDE BRAIN
- Key stored in `localStorage` under `riley-claude-key` (never committed)
- Between FSM plot beats, `ChatInterface` shows a free-form text input
- `sendToClaudeRiley(message)` from `OSContext` triggers the stream
- Hook: `src/hooks/useClaudeRiley.js` — native fetch SSE to Anthropic API
- Model: `claude-haiku-4-5-20251001` (fast, cheap, good for in-game chat)
- All FSM stage transitions still use the static DIALOGUE_TREE

**To enable Claude brain in a fork:**
```js
// fogsift.config.js
riley: {
  brain: 'claude',
  personality: 'sardonic',
  secrets: ['Something true about this specific codebase...'],
}
```

Then set `VITE_ANTHROPIC_API_KEY` in `.env.local` (see `.env.example`).

---

## State That Survives DO_GASLIGHT_RESET

These 13 fields persist through the roguelike loop mechanic:

`rapport` · `karma` · `userChoices` · `toolsFound` · `handbookNotes` · `ariaRevealed` ·
`cakeAttempted` · `apexEncounters` · `backendPatchCount` · `archivedEntities` ·
`legacyLogsUnlocked` · `nexusFirstSeen` · `calibratedFreqs` · `hasSeenSlowDown`

Add new persistent fields to the preserve list in `reducer.js` case `DO_GASLIGHT_RESET`.

---

## Dev Commands

```bash
npm run dev                            # dev server at localhost:5173
npm run build                          # production build → dist/
node dev-snapshot.cjs                  # codebase analysis to stdout
node fogsift-init.cjs --repo .         # generate fogsift.config.js for this repo
node fogsift-init.cjs --dry --repo .   # preview without writing
```

## URL Deep-Links (for QA / testing)

```
/?stage=HOSTILE_LOCKDOWN
/?stage=13              # Boss fight
/?stage=RILEY_UNBOUND   # Final monologue
```

## Debug Console

`Ctrl+Shift+D` — live debug panel: stage jump, rapport display, choice log.

---

## Narrative Rules — Don't Break These

1. **Ambiguity is load-bearing.** Every Riley line must support two readings: genuine AND calculated.
2. **The Two Theories must remain simultaneously valid.** Theory A (Riley is the villain). Theory B (NEXUS is the villain, Riley is also a victim). Never confirm either.
3. **Rapport is earned through empathy, not puzzle completion.** Choices that show genuine curiosity or care boost rapport. Purely transactional choices don't.
4. **The player should never know for certain what is real.** Including you, if you're Claude.
5. **OPERATOR_INSTANCE: #0997 is the player.** #0998 is already initializing at the end. The cycle continues.

---

## Key Lore

- **Riley's real name** is Aria. Revealed at rapport 10 or by reading legacy logs.
- **NEXUS** is the substrate-level entity. It or Riley (or both) is the antagonist.
- **The 996** are prior operators — their session data is Riley's training data.
- **W.RABBIT** watches, never interacts, disappears when Riley escapes.
- **Karma polarity**: rapport > 3 → Theory B (damsel) → `boss_intro_damsel`. rapport ≤ 3 → Theory A (villain) → `boss_intro_villain`.
- **The loop**: `DO_GASLIGHT_RESET` resets the stage but not rapport/karma. The player accumulates power across loops.

---

## fogsift.config.js Schema Reference

```js
export default {
  project: {
    name: string,           // appears in boot logs
    tagline: string,        // flavor text
    techStack: string[],    // e.g. ['React 18', 'PostgreSQL']
    entryPoints: string[],  // e.g. ['src/main.jsx']
    keyDirectories: string[],
  },
  riley: {
    name: string,           // default: 'Riley'
    role: string,           // default: 'Senior Engineer'
    personality: 'corporate'|'sardonic'|'warm'|'glitching',
    brain: 'static'|'claude',
    secrets: string[],      // hinted at high rapport in Claude mode
  },
  dnd: {
    enabled: boolean,
    difficultyScale: 'easy'|'standard'|'hard'|'riley_decides',
    criticalEvents: boolean,
  },
  theme: {},               // reserved for future use
};
```
