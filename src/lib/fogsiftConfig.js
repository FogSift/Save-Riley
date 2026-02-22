/**
 * fogsiftConfig.js — fallback defaults
 *
 * This file is used when fogsift.config.js does NOT exist in the repo root.
 * Forked repos before running fogsift-init will use these defaults.
 * Once a fogsift.config.js is present, this file is bypassed entirely.
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
    personality: 'corporate', // corporate | sardonic | warm | glitching

    // 'static'  → use hardcoded DIALOGUE_TREE (default, zero config needed)
    // 'claude'  → use streaming Claude API between plot beats (requires API key)
    brain: 'static',

    secrets: [],
  },

  dnd: {
    enabled: true,
    difficultyScale: 'standard',
    criticalEvents: true,
  },

  theme: {},
};
