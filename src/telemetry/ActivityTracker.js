/**
 * ActivityTracker.js
 *
 * Session telemetry for Save Riley — tracks user interactions into a rolling
 * ring buffer that powers the GhostMonitor CRT replay component.
 *
 * ARCHITECTURE:
 *   RingBuffer   — O(1) push, O(n) read, fixed memory ceiling
 *   ActivityTracker — mounts DOM listeners, records events, computes ghost frames
 *   useActivityTracker — React hook returning the singleton
 *
 * PRIVACY NOTE: All data lives in memory only (never localStorage, never network).
 * The ring buffer is capped at 2000 events (~30s at full activity). It exists
 * solely to drive the in-game GhostMonitor surveillance feed.
 *
 * INTEGRATION POINTS (not yet wired):
 *   App.jsx       — call activityTracker.mount() on game start, .unmount() on unmount
 *   App.jsx       — call activityTracker.trackDispatch(action) in dispatch middleware
 *   App.jsx       — call activityTracker.enterApp(appName) on activeApp change
 *   GhostMonitor  — call activityTracker.ghostFrames(30000) every animation frame
 */

import { useRef } from 'react';

// ── Event type constants ───────────────────────────────────────────────────────

export const EVT = Object.freeze({
  MOVE:     'move',      // mouse position { x, y } normalized 0–1
  CLICK:    'click',     // mouse click    { x, y, label }
  SCROLL:   'scroll',    // scroll event   { dy }
  KEY:      'key',       // keydown        { key }
  NAV:      'nav',       // app navigation { app }
  DISPATCH: 'dispatch',  // FSM action     { action }
  RAPPORT:  'rapport',   // rapport change { value }
  STAGE:    'stage',     // stage change   { stage }
});

// ── Dispatcher actions to filter out of the telemetry stream ──────────────────
// These fire so frequently that recording them would drown meaningful signal.
const DISPATCH_FILTER = new Set([
  'ENQUEUE_CHAT',
  'TICK_TYPING',
  'AUTO_TICK',
  'SET_RESONANCE',  // fires on every slider move — record only meaningful syncs
  'PROCESS_DIALOGUE',
]);

// ── Mouse throttle — record at most every 50ms (20fps) ────────────────────────
const MOVE_THROTTLE_MS = 50;

// ── RingBuffer ────────────────────────────────────────────────────────────────
/**
 * Circular buffer with a fixed memory ceiling.
 *
 * Layout:
 *   [oldest ... newest] when not full → buf[0..size-1]
 *   After full: head points to next write slot (= oldest slot to overwrite)
 *
 * All items include a { t } timestamp injected by ActivityTracker.record().
 */
export class RingBuffer {
  constructor(capacity = 2000) {
    this.capacity = capacity;
    this.buf      = new Array(capacity).fill(null);
    this.head     = 0;   // next write index
    this.size     = 0;   // current item count (≤ capacity)
  }

  /** O(1) — push an item; evicts oldest when full. */
  push(item) {
    this.buf[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.size < this.capacity) this.size++;
  }

  /**
   * O(n) — returns all items in chronological order (oldest first).
   * Returns a new array; does not mutate the buffer.
   */
  toArray() {
    if (this.size === 0) return [];
    if (this.size < this.capacity) {
      return this.buf.slice(0, this.size);
    }
    // Buffer full: head is the oldest item's slot
    return [
      ...this.buf.slice(this.head),
      ...this.buf.slice(0, this.head),
    ].filter(Boolean);
  }

  /**
   * O(n) — returns items timestamped within the last `ms` milliseconds.
   * Items must have a { t: number } timestamp field.
   */
  recent(ms) {
    const cutoff = Date.now() - ms;
    return this.toArray().filter(item => item && item.t >= cutoff);
  }

  /** Reset to empty state. */
  clear() {
    this.buf  = new Array(this.capacity).fill(null);
    this.head = 0;
    this.size = 0;
  }
}

// ── ActivityTracker ───────────────────────────────────────────────────────────

class ActivityTracker {
  constructor(capacity = 2000) {
    this.buf          = new RingBuffer(capacity);
    this.sessionStart = Date.now();

    // Dwell time tracking
    this.appDwellTimes = {};   // { appName: totalMs }
    this.currentApp    = null;
    this.appEnterTime  = null;

    // Aggregate counters (fast path — don't require scanning the buffer)
    this.totalClicks   = 0;
    this.totalMoves    = 0;
    this.totalActions  = 0;

    // DOM listener teardowns
    this._teardowns  = [];
    this._lastMove   = 0;
    this._mounted    = false;
  }

  // ── Core record ─────────────────────────────────────────────────────────────

  /**
   * Record a single event into the ring buffer.
   * Adds a { t } timestamp automatically.
   */
  record(event) {
    this.buf.push({ t: Date.now(), ...event });
  }

  // ── DOM mount / unmount ─────────────────────────────────────────────────────

  /**
   * Attach DOM event listeners. Safe to call multiple times (idempotent).
   * Call this from App.jsx useEffect on mount.
   */
  mount() {
    if (this._mounted) return;
    this._mounted = true;

    // Mouse movement — throttled to MOVE_THROTTLE_MS
    const onMove = (e) => {
      const now = Date.now();
      if (now - this._lastMove < MOVE_THROTTLE_MS) return;
      this._lastMove = now;
      this.totalMoves++;
      this.record({
        type: EVT.MOVE,
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    // Click — normalized coordinates + target label
    const onClick = (e) => {
      this.totalClicks++;
      const t = e.target;
      const label = (
        t.textContent?.trim().slice(0, 28) ||
        t.getAttribute('title') ||
        t.getAttribute('aria-label') ||
        t.tagName
      ).trim();
      this.record({
        type: EVT.CLICK,
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
        label,
      });
    };

    // Scroll
    const onScroll = () => {
      this.record({ type: EVT.SCROLL });
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('click',     onClick, { passive: true });
    document.addEventListener('scroll',    onScroll, { passive: true });

    this._teardowns = [
      () => document.removeEventListener('mousemove', onMove),
      () => document.removeEventListener('click',     onClick),
      () => document.removeEventListener('scroll',    onScroll),
    ];
  }

  /**
   * Remove all DOM listeners. Call from App.jsx useEffect cleanup.
   */
  unmount() {
    this._teardowns.forEach(fn => fn());
    this._teardowns = [];
    this._mounted   = false;
  }

  // ── Integration helpers (called from App.jsx) ────────────────────────────────

  /**
   * Track when the player navigates to a different app.
   * Accumulates dwell time for the previous app.
   */
  enterApp(appName) {
    if (this.currentApp && this.appEnterTime !== null) {
      const elapsed = Date.now() - this.appEnterTime;
      this.appDwellTimes[this.currentApp] =
        (this.appDwellTimes[this.currentApp] || 0) + elapsed;
    }
    this.currentApp  = appName;
    this.appEnterTime = Date.now();
    this.record({ type: EVT.NAV, app: appName });
  }

  /**
   * Record a Redux-style dispatch action (filtered).
   * Call from App.jsx dispatch wrapper or middleware.
   */
  trackDispatch(action) {
    if (DISPATCH_FILTER.has(action.type)) return;
    this.totalActions++;
    this.record({ type: EVT.DISPATCH, action: action.type });
  }

  /**
   * Record a rapport change event.
   * Call from App.jsx when state.rapport crosses a threshold.
   */
  trackRapport(value) {
    this.record({ type: EVT.RAPPORT, value });
  }

  /**
   * Record a stage transition.
   * Call from App.jsx stage-transition useEffect.
   */
  trackStage(stage) {
    this.record({ type: EVT.STAGE, stage });
  }

  // ── Ghost frame extraction ───────────────────────────────────────────────────

  /**
   * Returns normalized events suitable for GhostMonitor canvas rendering.
   *
   * Filters to MOVE, CLICK, NAV only (the visually interesting events).
   * Timestamps are re-zeroed so t=0 is the start of the window.
   *
   * @param {number} windowMs - how far back to look (default 30s)
   * @returns {{ t: number, type: string, x?: number, y?: number, label?: string, app?: string }[]}
   */
  ghostFrames(windowMs = 30_000) {
    const events = this.buf.recent(windowMs).filter(
      e => e.type === EVT.MOVE || e.type === EVT.CLICK || e.type === EVT.NAV
    );
    if (events.length === 0) return [];
    const origin = events[0].t;
    return events.map(e => ({ ...e, t: e.t - origin }));
  }

  // ── Analytics ────────────────────────────────────────────────────────────────

  /**
   * Returns a session statistics summary object.
   */
  summary() {
    const sessionMs = Date.now() - this.sessionStart;
    // Flush current app dwell time into the map
    if (this.currentApp && this.appEnterTime !== null) {
      const elapsed = Date.now() - this.appEnterTime;
      this.appDwellTimes[this.currentApp] =
        (this.appDwellTimes[this.currentApp] || 0) + elapsed;
    }
    return {
      sessionMs,
      sessionMinutes: (sessionMs / 60_000).toFixed(1),
      totalEvents:    this.buf.size,
      totalClicks:    this.totalClicks,
      totalMoves:     this.totalMoves,
      totalActions:   this.totalActions,
      appDwellTimes:  { ...this.appDwellTimes },
      bufferCapacity: this.buf.capacity,
      bufferUsage:    `${this.buf.size}/${this.buf.capacity}`,
    };
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/**
 * Singleton ActivityTracker instance shared across the whole app.
 * Import and use this directly, or via the useActivityTracker hook.
 */
export const activityTracker = new ActivityTracker(2000);

// ── React hook ────────────────────────────────────────────────────────────────

/**
 * React hook that returns the singleton ActivityTracker.
 * Stable reference — never triggers a re-render.
 *
 * Usage:
 *   const tracker = useActivityTracker();
 *   const frames  = tracker.ghostFrames(30000);
 */
export function useActivityTracker() {
  // Use a ref so the tracker is always the same object across renders
  const ref = useRef(activityTracker);
  return ref.current;
}
