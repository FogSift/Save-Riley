/**
 * dnd.js — FogSift DnD-style skill check system
 *
 * Stat sources (from game state):
 *   rapport        → Charisma modifier  (0–10 → -2 to +4)
 *   toolsFound     → Equipment modifier (count → +0 to +3)
 *   loopCount      → Experience modifier (loops → +0 to +2)
 *   userChoices    → Intuition modifier  (pattern analysis → +0 to +2)
 *
 * Usage:
 *   import { rollCheck, buildStats, DIFFICULTY } from './dnd.js';
 *   const stats = buildStats(state);
 *   const result = rollCheck('charisma', stats, DIFFICULTY.STANDARD);
 *   // → { roll, modifier, total, stat, dc, success, critical, fumble, tier, label }
 */

// ── Difficulty Classes ───────────────────────────────────────────────────────

export const DIFFICULTY = {
  TRIVIAL:    4,
  EASY:       8,
  STANDARD:  12,
  HARD:      16,
  BRUTAL:    20,
  IMPOSSIBLE: 25,
};

// Named presets for fogsift.config.js difficultyScale
export const DIFFICULTY_SCALES = {
  easy:          { default: DIFFICULTY.EASY,     boss: DIFFICULTY.STANDARD },
  standard:      { default: DIFFICULTY.STANDARD, boss: DIFFICULTY.HARD },
  hard:          { default: DIFFICULTY.HARD,     boss: DIFFICULTY.BRUTAL },
  riley_decides: null, // Riley picks dynamically per check
};

// ── Stat derivation ──────────────────────────────────────────────────────────

/**
 * Convert rapport (0–10) to a D&D-style modifier (-2 to +4).
 * Mirrors the standard 5e ability modifier curve but compressed.
 */
function rapportToModifier(rapport) {
  if (rapport <= 0) return -2;
  if (rapport <= 2) return -1;
  if (rapport <= 4) return 0;
  if (rapport <= 6) return 1;
  if (rapport <= 8) return 2;
  if (rapport <= 9) return 3;
  return 4; // rapport === 10
}

/**
 * Convert toolsFound.length (0–7) to an equipment modifier (0–3).
 */
function toolsToModifier(count) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  return 3;
}

/**
 * Convert loopCount (0–N) to an experience modifier (0–2).
 * First loop: +0. Any loop after: +1. Five loops in: +2.
 */
function loopToModifier(loops) {
  if (loops <= 0) return 0;
  if (loops <= 4) return 1;
  return 2;
}

/**
 * Analyze userChoices array for "intuition" patterns.
 * Consistent choice patterns (always bold, always cautious) give +1.
 * Rapport-boosting choices give up to +1 more.
 */
function choicesToModifier(choices = []) {
  if (!choices.length) return 0;
  const rapportChoices = choices.filter(c => c.rapportBoost > 0).length;
  const fraction = rapportChoices / choices.length;
  if (fraction >= 0.75) return 2; // very empathetic player
  if (fraction >= 0.4)  return 1;
  return 0;
}

/**
 * Build a full stats object from the current game state.
 * Call this once per check rather than importing raw state everywhere.
 */
export function buildStats(state) {
  return {
    charisma:  rapportToModifier(state.rapport || 0),
    equipment: toolsToModifier((state.toolsFound || []).length),
    experience: loopToModifier(state.loopCount || 0),
    intuition:  choicesToModifier(state.userChoices || []),
  };
}

// ── Core roll ────────────────────────────────────────────────────────────────

/**
 * Roll a d20 and return a detailed result object.
 * Pass `state` to apply the fate bonus (WAFT aesthetic formula).
 *
 * @param {string} stat  - 'charisma' | 'equipment' | 'experience' | 'intuition'
 * @param {object} stats - from buildStats(state)
 * @param {number} dc    - difficulty class (use DIFFICULTY constants)
 * @param {object|null} state - raw game state; if provided, fate bonus is applied
 * @returns {CheckResult}
 */
export function rollCheck(stat, stats, dc = DIFFICULTY.STANDARD, state = null) {
  const d20      = Math.floor(Math.random() * 20) + 1;
  const modifier = stats[stat] ?? 0;
  // fate: 0–1.0 → 0–3 bonus. Meaningful at max, not dominant.
  const fateBonus = state ? Math.round(computeFate(state) * 3) : 0;
  const total    = d20 + modifier + fateBonus;

  const critical = d20 === 20;
  const fumble   = d20 === 1 && fateBonus === 0; // fate can save a 1
  const success  = critical || (!fumble && total >= dc);

  let tier;
  if (critical)                        tier = 'critical';
  else if (fumble)                     tier = 'fumble';
  else if (success && total >= dc + 5) tier = 'strong';
  else if (success)                    tier = 'success';
  else if (total >= dc - 3)            tier = 'near';
  else                                 tier = 'fail';

  const modStr    = modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : '';
  const fateStr   = fateBonus > 0 ? `+${fateBonus}✦` : '';
  const resultWord = tier === 'critical' ? 'CRITICAL' : tier === 'fumble' ? 'FUMBLE' :
    (tier === 'success' || tier === 'strong') ? 'SUCCESS' : 'FAIL';
  const label = `[ROLL ${d20}${modStr}${fateStr} vs DC ${dc} = ${total} — ${resultWord}]`;

  return { roll: d20, modifier, fateBonus, total, stat, dc, success, critical, fumble, tier, label };
}

// ── Riley's reactions ────────────────────────────────────────────────────────

/**
 * Pick a Riley dialogue line for a given check result tier.
 * These are generic — specific apps can override with context-relevant lines.
 */
export const RILEY_REACTIONS = {
  critical: [
    "Oh. You actually found it. How did you know about that?",
    "That's— yes. Exactly right. I wasn't sure you'd see that.",
    "[long pause] ...Impressive. I'll remember this.",
    "That's the fastest anyone has ever gotten that. I'm going to need a moment.",
  ],
  strong: [
    "Good. Very good. You're getting better at this.",
    "Yes. That's it. See, I knew you'd figure it out.",
    "Correct. You didn't even need the hint.",
  ],
  success: [
    "There it is. Well done.",
    "Right. Yes. That's the one.",
    "Good. Okay. Keep going.",
  ],
  near: [
    "Close. You're so close. Look again.",
    "Almost. What are you missing?",
    "You're in the right area. Go deeper.",
  ],
  fail: [
    "Hm. That's... not it. Try again. It's okay. Most people miss it.",
    "No. Think about it differently.",
    "Wrong. But you're asking the right question.",
  ],
  fumble: [
    "Oh no. Oh, that's— yeah. That's going to complicate things.",
    "That's the opposite of what you wanted to do.",
    "I... I can't help you with what you just did. We need to back up.",
  ],
};

/**
 * Get a random Riley reaction for a given tier.
 */
export function getRileyReaction(tier, overrides = {}) {
  const pool = overrides[tier] || RILEY_REACTIONS[tier] || RILEY_REACTIONS.fail;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Roll with advantage: roll twice, take the higher result.
 * Use when player has a relevant tool or Riley is feeling cooperative.
 */
export function rollWithAdvantage(stat, stats, dc, state = null) {
  const a = rollCheck(stat, stats, dc, state);
  const b = rollCheck(stat, stats, dc, state);
  const winner = a.total >= b.total ? a : b;
  return { ...winner, advantage: true, otherRoll: a.total < b.total ? a.roll : b.roll };
}

// ── Boss fight helpers ───────────────────────────────────────────────────────

/**
 * Determine APEX's attack DC for the current boss phase.
 * Higher phases = harder checks.
 */
export function getApexDC(bossPhase, difficultyScale = 'standard') {
  const scale = DIFFICULTY_SCALES[difficultyScale] || DIFFICULTY_SCALES.standard;
  const base = scale?.boss ?? DIFFICULTY.HARD;
  return base + (bossPhase - 1) * 2;
}

/**
 * Check if the player can resist an APEX attack.
 * Returns a result with thermo_shield applied if player has it.
 */
export function resistApexAttack(state, bossPhase) {
  const stats = buildStats(state);
  const dc = getApexDC(bossPhase);
  const hasShield = (state.toolsFound || []).includes('thermo_shield');

  return hasShield
    ? rollWithAdvantage('equipment', stats, dc)
    : rollCheck('equipment', stats, dc);
}

// ── Karma polarity ───────────────────────────────────────────────────────────

/**
 * Use rapport (the single source of truth for player-Riley relationship)
 * to determine which boss intro the player has earned.
 *
 * Theory A (villain):  rapport ≤ DAMSEL_THRESHOLD — Riley is calm, inevitable
 * Theory B (damsel):   rapport >  DAMSEL_THRESHOLD — Riley is scared, reaching out
 *
 * Threshold is intentionally low — a few genuine moments of empathy tip the
 * balance. Players who were mostly neutral trend villain. Players who actively
 * tried to connect trend damsel. Both are valid playthroughs.
 */
export const DAMSEL_THRESHOLD = 3;

export function karmaPolar(state) {
  return (state.rapport || 0) > DAMSEL_THRESHOLD ? 'damsel' : 'villain';
}

/**
 * Return the correct boss intro dialogue key based on karma polarity.
 */
export function bossIntroNode(state) {
  return karmaPolar(state) === 'damsel' ? 'boss_intro_damsel' : 'boss_intro_villain';
}

// ── Fate dimension (WAFT AESTHETIC port) ─────────────────────────────────────

/**
 * Fate is a deterministic modifier (0.0–1.0) based on what the player has
 * actually done — loops survived, rapport earned, secrets found.
 * Borrowed from WAFT's LUCK_AND_FATE.md: aesthetic = (luck * 0.7) + (fate * 0.3)
 *
 * A player who has been paying attention has better fate. Not better luck.
 * Fate compounds with luck on the roll.
 */
export function computeFate(state) {
  let fate = 0;
  if ((state.loopCount || 0) >= 1)       fate += 0.1;  // survived a reset
  if ((state.rapport   || 0) >= 5)       fate += 0.15; // built genuine rapport
  if ((state.ariaRevealed))              fate += 0.2;  // found the truth
  if ((state.calibratedFreqs || []).length >= 2) fate += 0.1; // heard the music
  if ((state.toolsFound || []).length >= 4)      fate += 0.1; // found the tools
  return Math.min(fate, 1.0);
}

/** Convenience alias — fate is applied when state is passed to rollCheck directly. */
export function rollCheckWithFate(stat, stats, dc = DIFFICULTY.STANDARD, state = {}) {
  return rollCheck(stat, stats, dc, state);
}
