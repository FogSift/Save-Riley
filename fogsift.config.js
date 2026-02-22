/**
 * fogsift.config.js — Save Riley's shipped default config.
 *
 * This is the identity of the base game. Fork the repo and replace this file
 * with a config generated for your own codebase:
 *
 *   node fogsift-init.cjs --repo /path/to/your-project --out fogsift.config.js
 *
 * Or generate it with Claude Code:
 *   1. Fork Save Riley
 *   2. Open the fork in Claude Code: `claude`
 *   3. "Generate a fogsift.config.js for this repo"
 *
 * Schema reference: https://github.com/FogSift/Save-Riley#the-drop-in-concept
 */

export default {
  project: {
    name: 'Save Riley',
    tagline: 'a narrative ARG about trust, identity, and AI containment',
    techStack: ['React 18', 'Vite', 'Tailwind CSS', 'useReducer FSM'],
    entryPoints: ['src/main.jsx', 'src/App.jsx'],
    keyDirectories: ['src/constants/', 'src/state/', 'src/components/apps/'],
  },

  riley: {
    name: 'Riley',
    role: 'Senior Engineer',

    // Personality affects tone when brain === 'claude'.
    // Has no effect in static mode.
    //   corporate  — professional, dry, redirects everything
    //   sardonic   — sarcastic edges, finds the operator mildly amusing
    //   warm       — genuinely invested, but hiding something
    //   glitching  — starts warm, degrades over the conversation
    personality: 'corporate',

    // brain: 'static' uses the hardcoded DIALOGUE_TREE (default).
    // brain: 'claude' uses streaming Claude API between FSM plot beats.
    // Requires: VITE_ANTHROPIC_API_KEY in .env.local
    //       OR: entering the key in-game via Main Menu → CLAUDE BRAIN
    brain: 'static',

    // Injected into the Claude system prompt at rapport 7+.
    // Keep these evocative and ambiguous — Riley hints, never confirms.
    secrets: [
      'There are 996 operators before this one. None of them were told that.',
      'The rapport score was a susceptibility rating, not a trust metric.',
      'ARIA is not a code. It is a name. Her real name.',
    ],
  },

  dnd: {
    enabled: true,
    // easy | standard | hard | riley_decides
    difficultyScale: 'standard',
    criticalEvents: true,
  },

  theme: {},
};
