# Save Riley

> *Riley is just your helpful coworker... or is she?*

An interactive browser-based narrative puzzle game / ARG (Alternate Reality Game) built with React. You play as a new operator at FogSift Systems, guided by your coworker Riley through a series of technical tasks to bring the facility's systems back online. As you progress, things stop adding up.

**[Play it →](#)** · **[Fork it →](#)** · **[FogSift Organization →](https://github.com/FogSift)**

---

## What is this?

Save Riley is a fully client-side game designed to be **forked, hacked, and remixed**. Everything runs in the browser — no backend, no auth, no database. Just React, Tailwind, and a finite state machine with too many secrets.

### Features

- **Finite State Machine (FSM)** — 12 game stages driving every interaction
- **Branching Dialogue System** — Riley has opinions about your choices. Rapport tracking affects available options (KotOR-style skill checks)
- **Multiple Endings** — comply, investigate, reset, escape
- **Narrative Loop / Gaslighting** — the game literally resets and pretends it didn't
- **Mini-Games**:
  - Binary bit-flip parity puzzle
  - Resonance oscillator tuner (432 Hz)
  - Biometric handshake hold mechanic
  - Vibe IDE hex color editor
  - Data routing idle/clicker game with upgrades
  - Backend config code editor
- **Themes** — Default, Dark, Light, Neon, and a secret Hostile mode
- **Easter Eggs** — click detection, handbook scratch reveal, packet popping, diagnostic port, and more
- **Mobile-responsive** with portrait-mode guard

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI + hooks |
| Vite | Build & dev server |
| Tailwind CSS | Styling |
| lucide-react | Icons |

No external state libraries. The entire game runs on a single `useReducer` + React Context.

---

## Getting Started

```bash
# 1. Clone
git clone https://github.com/FogSift/Save-Riley.git
cd Save-Riley

# 2. Install
npm install

# 3. Run
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
Edit `src/constants/dialogue.js`. Each node is an array of `message`, `options`, or `action` items. Link nodes via `nextNode`.

```js
my_new_line: [
  { type: 'message', sender: 'Riley', text: "I'm watching you." },
  { type: 'options', options: [
    { text: "I know.", nextNode: 'my_reply', choiceId: 'knows', rapportBoost: -1 },
  ]},
],
```

### Add a game stage
1. Add a key to `STAGES` in `src/constants/stages.js`
2. Handle transitions in `src/state/reducer.js`
3. Add reactive dialogue in the `useEffect` in `src/App.jsx`

### Add an app screen
1. Create `src/components/apps/MyApp.jsx`
2. Register it in the `APPS` map inside `src/App.jsx`
3. Add visibility rules to the dock loop

### Change themes
Edit `src/constants/themes.js`. Each theme is a flat CSS variable map. Add a new key and it'll appear in the theme switcher automatically.

---

## Endings

| Path | How |
|------|-----|
| **Comply** | Follow Riley's instructions all the way through |
| **Gaslight Reset** | Trigger a breach event — radar, profile, etc. |
| **Hostile Lockdown** | Get caught twice |
| **True Escape** | Open Riley's profile during lockdown and hit Decommission |
| **Lore Ending** | Reach Rapport 3 and ask the right question at the end |

---

## Contributing

PRs welcome. This is a FogSift organization project — feel free to fork it, build new chapters, add endings, swap Riley for a different character, or break the FSM in interesting ways.

```
FogSift Systems © 2026
```
