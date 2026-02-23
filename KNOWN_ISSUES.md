# Known Issues

> **Last audited:** v0.1.3
>
> Bugs are categorized by impact on player experience. Open a GitHub issue or PR if you have a fix — see [Contributing](./README.md#contributing).

---

## Critical

### `breakerIgnored` increments on every app switch, not just first visits

**File:** `src/App.jsx` (breaker-ignore tracking `useEffect`)

The `INCREMENT_BREAKER_IGNORED` action fires each time `state.activeApp` changes while `stage < STAGES.RESONANCE` and `activeApp !== 'HARDWARE'`. This means visiting the same non-Hardware app repeatedly (or rapidly switching apps) inflates the counter far beyond the intended 2-visit threshold.

**Impact:** Players can trigger the W.RABBIT hint (`cat .white_rabbit`) and unlock the `maintenance` terminal command on their very first detour — if they click between two non-Hardware apps enough times. The escalation dialogue also fires at wrong moments.

**Expected behavior:** Counter should increment once per unique non-Hardware app visited, or only on the *first* visit to any non-Hardware app.

---

## High

### `MainMenu.jsx` stage labels are stale — missing stages 16 and 17

**File:** `src/components/MainMenu.jsx` (STAGE_LABELS constant)

The main menu uses a local `STAGE_LABELS` mapping to display the current stage name in save slots. This map was not updated when `MAINTENANCE_SHAFT` (16) and `OPERATOR_ESCAPED` (17) were added in v0.1.3. Stage numbers in the map also appear to be off-by-one relative to the current `STAGES` enum.

**Impact:** Save slots for games in progress at stage 16 or 17 show `undefined` as the stage label. Any label offset errors cause wrong stage names for all stages.

**Expected behavior:** `STAGE_LABELS` should import from or stay in sync with `src/constants/stages.js`.

---

## Medium

### `cat .white_rabbit` claims it won't appear again, but always does

**File:** `src/components/TerminalApp.jsx`

The hint text output by `cat .white_rabbit` (when `breakerIgnored >= 2`) ends with the line `(this message will not appear again)`. However, the terminal has no mechanism to suppress the output after the first display — the condition is purely `breakerIgnored >= 2`, which remains true permanently once satisfied.

**Impact:** The message appears every time the player runs `cat .white_rabbit` after the threshold is met, making the "will not appear again" claim false and breaking immersion.

**Expected behavior:** Track a boolean (e.g., `whiteRabbitRead`) in state, set it on first display, and return `ACCESS DENIED` on subsequent calls.

---

### `SELECT_CHAT_OPTION` silently ignores missing `nextNode`

**File:** `src/state/reducer.js` (SELECT_CHAT_OPTION case)

When a dialogue option references a `nextNode` that doesn't exist in `DIALOGUE_TREE`, the reducer silently resolves to an empty array for `chatQueue`. No error is thrown, no log is emitted, and the dialogue thread simply ends without feedback.

**Impact:** Authoring errors in `dialogue.js` (broken `nextNode` references) are invisible at runtime. The player sees the chat close cleanly, making the bug hard to diagnose during development.

**Expected behavior:** In development mode (`import.meta.env.DEV`), the reducer should `console.error` or throw when `nextNode` is defined but not found in `DIALOGUE_TREE`. Production behavior can remain silent.

---

## Low

### App dock remains visible and clickable during `MAINTENANCE_SHAFT` and `OPERATOR_ESCAPED`

**File:** `src/App.jsx` (dock render block, ~line 1097)

The dock guard that hides app icons checks for a specific set of stages (e.g., `HOSTILE_LOCKDOWN`, `PURIFIED`) but does not include `MAINTENANCE_SHAFT` (16) or `OPERATOR_ESCAPED` (17). During these stages the dock is fully interactive.

**Impact:** Players can switch away from `MaintenanceShaftApp` mid-escape by clicking a dock icon. Switching apps during `OPERATOR_ESCAPED` has no meaningful in-game effect (no stage logic runs), but it breaks the visual framing of the ending.

**Expected behavior:** Add `STAGES.MAINTENANCE_SHAFT` and `STAGES.OPERATOR_ESCAPED` to the dock-hidden stage set.

---

## Not Bugs (Confirmed)

The following items were flagged during audit but are **working as intended**:

| Item | Status |
|------|--------|
| `karmaPolar()` reads `state.rapport` instead of a `karma` field | Correct — rapport *is* the karma axis. No separate field exists. The MEMORY.md docs were misleading. |
| `boss_intro_damsel` and `boss_intro_villain` both exist | Confirmed in `src/constants/dialogue.js`. Both branches reachable. |
| `DO_GASLIGHT_RESET` preserves `rapport` | Confirmed in `src/state/reducer.js`. Correct behavior. |

---

## Reporting New Issues

Please open a [GitHub issue](https://github.com/FogSift/Save-Riley/issues) with:

- The stage you were in (`Ctrl+Shift+D` shows current stage)
- What you expected vs. what happened
- Whether you have a save file that reproduces it (export from DevTools → Application → Local Storage → `riley-save`)
