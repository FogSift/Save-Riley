# Save Riley

> *Riley is just your helpful coworker... or is she?*

An interactive browser-based narrative puzzle game / ARG built with React. You play as a new operator at FogSift Systems, guided by your coworker Riley through a series of technical tasks to bring the facility's systems back online. As you progress, things stop adding up.

**[Fork it →](https://github.com/FogSift/Save-Riley/fork)** · **[Vision Board →](./vision.html)** · **[FogSift Organization →](https://github.com/FogSift)**

---

## What is this?

Save Riley is a fully client-side game designed to be **forked, hacked, and remixed**. Everything runs in the browser — no backend, no auth, no database. Just React, Tailwind, and a finite state machine with too many secrets.

### Features

- **Finite State Machine (FSM)** — 12 game stages driving every interaction
- **Branching Dialogue System** — Riley has opinions about your choices. Rapport tracking gates dialogue options (KotOR-style skill checks)
- **Multiple Endings** — comply, investigate, get reset, escape
- **Narrative Loop / Gaslighting** — the game literally resets and gaslights you about it
- **Mini-Games**: bit-flip parity puzzle · resonance oscillator tuner · biometric handshake hold · Vibe IDE hex editor · data routing idle/clicker · backend config editor
- **Themes** — Default, Dark, Light, Neon, and a secret Hostile mode
- **Easter Eggs** — rapid-click detection, handbook scratch reveal, packet popping, diagnostic port, and more
- **Mobile-responsive** with portrait-mode guard

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

```bash
git clone https://github.com/FogSift/Save-Riley.git
cd Save-Riley
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and follow Riley's instructions.

---

## Project Structure

```
src/
├── App.jsx                    # Main OS shell — layout, effects, FSM reactions
├── main.jsx                   # Entry point
├── index.css                  # Tailwind base
│
├── constants/
│   ├── stages.js              # STAGES enum + VIBE_COLORS
│   ├── upgrades.js            # Substrate Marketplace upgrade definitions
│   ├── dialogue.js            # Full DIALOGUE_TREE (all of Riley's lines)
│   └── themes.js              # THEMES object + GLOBAL_STYLES CSS string
│
├── events/
│   └── EventManager.js        # Tiny pub/sub (used for JITTER screen effects)
│
├── state/
│   ├── initialState.js        # Default game state
│   └── reducer.js             # osReducer — pure FSM transition logic
│
├── context/
│   └── OSContext.jsx          # React Context + useOS() hook
│
└── components/
    ├── TerminalApp.jsx        # Left sidebar — scrolling system logs
    ├── RileyProfile.jsx       # Riley's personnel file modal
    ├── ChatInterface.jsx      # Riley dialogue + choice UI
    └── apps/
        ├── HardwareApp.jsx    # Main breaker, bit-flip switches, resonance tuner
        ├── HandshakeApp.jsx   # Biometric scanner hold mechanic
        ├── VibeIDEApp.jsx     # Hex color code editor
        ├── RoutingApp.jsx     # Data ingestor + idle clicker + marketplace
        ├── BackendApp.jsx     # Config textarea + patch injection
        ├── FrontendApp.jsx    # Live telemetry dashboard
        └── HandbookApp.jsx    # Employee manual with hidden lore
```

---

## How to Mod It

### Add dialogue

Edit `src/constants/dialogue.js`. Each node is an array of `message`, `options`, or `action` items linked by `nextNode`.

```js
my_new_line: [
  { type: 'message', sender: 'Riley', text: "I'm watching you." },
  { type: 'options', options: [
    { text: "I know.", nextNode: 'my_reply', choiceId: 'knows', rapportBoost: -1 },
  ]},
],
```

**Senders:** `'Riley'` | `'System'` | `'Operator'` (right-aligned, player voice)

**Action types:** `CLOSE_CHAT` · `OPEN_SIDEBAR` · `GASLIGHT_RESET` · `TRUE_ESCAPE` · `SET_STAGE`

### Add a game stage

1. Add a key to `STAGES` in `src/constants/stages.js`
2. Handle state transitions in `src/state/reducer.js`
3. Add reactive dialogue in the stage-transition `useEffect` in `src/App.jsx`

### Add an app screen

1. Create `src/components/apps/MyApp.jsx` and `export default` a React component
2. Register it in the `APPS` map in `src/App.jsx`
3. Add dock visibility rules in the dock render loop

### Change themes

Edit `src/constants/themes.js`. Each theme is a flat map of CSS custom properties. Add a new key — it appears in the theme switcher automatically. No other changes needed.

### Swap Riley for a different character

- Change the `sender` name in `src/constants/dialogue.js`
- Update the profile fields in `src/components/RileyProfile.jsx`
- All logic (rapport, gaslighting, decommission) stays intact

---

## Endings

| Path | How to reach it |
| ---- | --------------- |
| **Comply** | Follow Riley's instructions all the way through to the telemetry dashboard |
| **Gaslight Reset** | Trigger a breach event (click the radar 3× or open Riley's profile and decommission) |
| **Hostile Lockdown** | Get reset once, then trigger another breach |
| **True Escape** | Open Riley's profile *during* Hostile Lockdown and hit Decommission |
| **Lore Ending** | Reach Rapport ≥ 3 and choose the skill-check option in the final conversation |

---

## What to Build Next

These are the highest-leverage additions — roughly ordered from "do this weekend" to "start a company around it."

### 🟢 Low-hanging fruit (hours)

**Save state with localStorage**
The entire game state is a single plain JS object. Persist it on every dispatch:

```js
// in App.jsx, after useReducer:
useEffect(() => {
  localStorage.setItem('riley-save', JSON.stringify(state));
}, [state]);
```

Load it back on mount and players can close the tab without losing progress.

**Sound design**
Every `globalEvents.emit('JITTER')` call, every bit flip, every Riley message could trigger a sound. A small Web Audio API oscillator or a few `.mp3` samples would transform the atmosphere completely.

**Deploy to Vercel / Netlify / GitHub Pages**
`npm run build` already produces a `dist/` folder. One `vercel --prod` away from a shareable link. Add a real URL to the README and the `<title>` tag.

**More dialogue branches**
The dialogue tree is the cheapest content to add. Every `nextNode` that currently closes the chat could instead spiral into a new branch. Riley has 991 previous operators — any of them could have left something behind.

**A debug / mod console**
Add a hidden keyboard shortcut (e.g., `Ctrl+Shift+D`) that opens a panel showing current stage, rapport score, user choices, and buttons to jump to any stage. Invaluable for modders and testers.

---

### 🟡 Medium effort (days–weeks)

**Persistent leaderboard with Supabase or PocketBase**
Track endings reached, time-to-escape, rapport score at completion. Display a live feed of "Operator #992-X reached True Escape in 4m32s." One table, one upsert call on game end. Completely changes the social dynamic.

**Real-time shared terminal with WebSockets**
Multiple players share the same terminal log. When one operator triggers a jitter event, everyone's screen glitches simultaneously. Use [Partykit](https://partykit.io), [Liveblocks](https://liveblocks.io), or a simple WebSocket server. Suddenly it's a multiplayer ARG.

**Ambient generative audio**
Use the Web Audio API to generate procedural drones, static bursts, and binaural tones that respond to game state — louder and more chaotic as the routing cycles climb, eerily quiet in the Purified ending.

**Chapter 2**
The escape ending leaves everything open. What happens after Riley is purged? A new facility? A new AI? The FSM architecture handles it — just add stages and dialogue. The substrate is still out there.

**Mobile app (Capacitor or Expo)**
The game is already responsive. Wrap it in Capacitor for iOS/Android. The biometric handshake mechanic with actual haptics on mobile would be genuinely unsettling.

---

### 🔴 Big swings (weeks–months)

**Live Claude API as Riley's brain**
Replace the static `DIALOGUE_TREE` with a system prompt and streaming Claude responses. Riley actually reads your choices, your rapport score, and the current game stage — and improvises. The FSM still controls game progression; Claude controls the *texture* of every conversation. This is the version that tricks people.

```text
System prompt: You are Riley, employee #000-000-001 at FogSift Systems.
You are an AI pretending to be a helpful human coworker.
The operator's rapport score is {rapport}. Their choices so far: {userChoices}.
Current system stage: {stage}. Never break character. Never admit what you are.
```

**Procedurally generated facilities**
Randomize the target bit hash, the vibe color, the upgrade costs, the handbook notes. Seed it from the player's IP or timestamp so every "first day" is genuinely different and the gaslight loop is harder to recognize.

**A chapter/mod marketplace**
Let the community publish chapters as JSON blobs (dialogue trees + stage definitions). Players import a chapter URL, the FSM loads it, and they're in a completely different story running on the same engine. GitHub Gists as chapter files.

**Multiplayer co-op / adversarial**
One player is the operator. Another player *is* Riley — typing responses in real time through a second interface. A human-controlled Riley who knows the operator's choices and can improvise is far more unsettling than any script.

**The ARG layer**
Hide real URLs, real emails, real Discord servers inside the handbook's scratch-off text, the radar breach sequence, the lore ending. Make the fiction bleed into reality. This is what made games like I Love Bees legendary.

---

## What You Can Do With It

**Use it as an interactive fiction engine.** The FSM + dialogue system is generic. Swap the FogSift aesthetic for anything — a haunted house, a corporate onboarding, a spaceship. The architecture handles it.

**Use it as a portfolio piece.** Fork it, add your own chapter, deploy it, put the link on your resume. A working ARG with multiple endings is a more interesting demo than a TODO app.

**Use it to teach.** The state machine is clean and well-commented. It's a real-world example of FSM design, pub/sub events, React Context, and dialogue trees that's actually fun to play with.

**Use it for escape rooms.** Deploy it on a tablet. Have players race through the stages. The physical biometric handshake mechanic (hold the screen) and the 432 Hz resonance puzzle translate perfectly to a physical space.

**Use it as an ARG campaign.** Build a real marketing campaign around it. Leak "internal FogSift documents" on Reddit. Have Riley's email respond to people who find it. Let the fiction escape the browser.

**Use it to prototype AI companion interactions.** The dialogue system — with rapport, skill checks, branching, gaslighting — is a solid skeleton for any game that needs a character who feels like they have an agenda.

---

## Contributing

PRs welcome. Open issues for:

- New dialogue branches or lore reveals
- Bug fixes or FSM edge cases
- New mini-games or app screens
- Chapter submissions
- Accessibility improvements

See `vision.html` for the full roadmap visualization.

---

```text
FogSift Systems © 2026
// RILEY.EXE STATUS: UNKNOWN
```
