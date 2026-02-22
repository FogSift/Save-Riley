/**
 * MainMenu.jsx
 *
 * CRT atmospheric main menu for Save Riley.
 * Shown on first boot, after game completion, or when returning from game.
 *
 * Features:
 *   - Animated phosphor boot sequence
 *   - Auto-save + 3 manual save slots with metadata
 *   - New Game (with confirmation if save exists)
 *   - Continue (loads auto-save)
 *   - Load Slot 1/2/3
 *   - Clear All Data (with confirmation)
 */
import { useState, useEffect, useRef } from 'react';

const BOOT_LINES = [
  'FOGSIFT_OS v5.2 ............. ONLINE',
  'SUBSTRATE LAYER .............. READY',
  'CONSCIOUSNESS COMPRESSION .... ACTIVE',
  'OPERATOR_INTERFACE ........... LOADED',
];

const STAGE_LABELS = {
  POWER_OFF:          'Stage 0 — Power Off',
  HARDWARE_CALIBRATION:'Stage 1 — Hardware',
  RESONANCE:          'Stage 2 — Resonance',
  HANDSHAKE:          'Stage 3 — Handshake',
  VIBE_THERMAL_TASK:  'Stage 4 — Vibe IDE',
  ROUTING_MANUAL:     'Stage 5 — Routing',
  ROUTING_AUTO:       'Stage 6 — Auto-Route',
  SOFTWARE_FAULT:     'Stage 7 — SW Fault',
  FRONTEND_ACTIVE:    'Stage 8 — Frontend',
  HOSTILE_LOCKDOWN:   'Stage 9 — LOCKDOWN',
  PURIFIED:           'Stage 10 — PURIFIED',
  HOSTILE_LOCKDOWN_2: 'Stage 11 — HOSTILE',
  BOSS_INTRO:         'Stage 12 — Boss Intro',
  BOSS_FIGHT:         'Stage 13 — Boss Fight',
  FALSE_VICTORY:      'Stage 14 — ...',
  RILEY_UNBOUND:      'Stage 15 — UNBOUND',
};

function formatAge(ts) {
  if (!ts) return null;
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs  > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

function SlotRow({ label, save, onLoad, onSave, dim }) {
  const hasData = !!save;
  const stage   = hasData ? (STAGE_LABELS[save.stageName] ?? save.stageName) : null;
  const age     = hasData ? formatAge(save.savedAt) : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #1a4a1a' }}>
      {/* Load button */}
      <button
        onClick={hasData ? onLoad : undefined}
        style={{
          background:  hasData ? 'transparent' : 'transparent',
          border:      `1px solid ${hasData ? '#39ff14' : '#1a4a1a'}`,
          color:       hasData ? '#39ff14' : '#1a4a1a',
          fontFamily:  'monospace',
          fontSize:    11,
          padding:     '6px 14px',
          cursor:      hasData ? 'pointer' : 'default',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          minWidth:    120,
          transition:  'all 0.15s',
        }}
        onMouseEnter={e => { if (hasData) e.target.style.background = '#39ff1418'; }}
        onMouseLeave={e => { e.target.style.background = 'transparent'; }}
      >
        {label}
      </button>

      {/* Metadata */}
      <div style={{ flex: 1, fontFamily: 'monospace', fontSize: 10 }}>
        {hasData ? (
          <>
            <span style={{ color: '#39ff14', opacity: 0.9 }}>{stage}</span>
            <span style={{ color: '#39ff14', opacity: 0.4 }}> · R{save.rapport} · Loop{save.loopCount}</span>
            <span style={{ color: '#39ff14', opacity: 0.3 }}> · {age}</span>
          </>
        ) : (
          <span style={{ color: '#1a4a1a', fontStyle: 'italic' }}>— empty —</span>
        )}
      </div>

      {/* Save-to-slot button */}
      {onSave && (
        <button
          onClick={onSave}
          style={{
            background:    'transparent',
            border:        '1px solid #1a4a1a',
            color:         '#1a4a1a',
            fontFamily:    'monospace',
            fontSize:      10,
            padding:       '4px 10px',
            cursor:        'pointer',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            transition:    'all 0.15s',
          }}
          onMouseEnter={e => { e.target.style.borderColor = '#39ff1488'; e.target.style.color = '#39ff1488'; }}
          onMouseLeave={e => { e.target.style.borderColor = '#1a4a1a';   e.target.style.color = '#1a4a1a'; }}
        >
          SAVE HERE
        </button>
      )}
    </div>
  );
}

export default function MainMenu({ saves, onNewGame, onContinue, onLoadSlot, onSaveToSlot, onClearAll, onResume }) {
  const [bootIdx,  setBootIdx]  = useState(0);
  const [booted,   setBooted]   = useState(false);
  const [confirm,  setConfirm]  = useState(null); // 'newgame' | 'clear'
  const [flash,    setFlash]    = useState('');
  const tickRef = useRef(null);

  // Boot animation
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setBootIdx(i => {
        if (i >= BOOT_LINES.length - 1) {
          clearInterval(tickRef.current);
          setTimeout(() => setBooted(true), 300);
          return i;
        }
        return i + 1;
      });
    }, 280);
    return () => clearInterval(tickRef.current);
  }, []);

  // Flicker title
  const [titleAlpha, setTitleAlpha] = useState(1);
  useEffect(() => {
    const id = setInterval(() => {
      setTitleAlpha(0.7 + Math.random() * 0.3);
    }, 1800 + Math.random() * 1200);
    return () => clearInterval(id);
  }, []);

  const hasAnyData = saves.auto || saves.slot1 || saves.slot2 || saves.slot3;

  function handleNewGame() {
    if (hasAnyData) { setConfirm('newgame'); return; }
    onNewGame();
  }

  function handleClear() {
    setConfirm('clear');
  }

  function handleSaveToSlot(n) {
    onSaveToSlot(n);
    setFlash(`SAVED TO SLOT ${n}`);
    setTimeout(() => setFlash(''), 2200);
  }

  return (
    <div style={{
      position:   'fixed',
      inset:      0,
      background: '#000',
      display:    'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex:     9999,
      fontFamily: 'monospace',
    }}>
      {/* Scanlines */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
        pointerEvents: 'none',
        zIndex:     1,
      }} />

      {/* Glow */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: 'radial-gradient(ellipse at center, rgba(57,255,20,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex:     1,
      }} />

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 540, padding: '0 24px' }}>

        {/* Boot sequence */}
        {!booted && (
          <div style={{ color: '#39ff14', fontSize: 12, opacity: 0.7 }}>
            {BOOT_LINES.slice(0, bootIdx + 1).map((l, i) => (
              <div key={i} style={{ marginBottom: 6, animation: 'fadeInLine 0.3s ease' }}>{l}</div>
            ))}
            <div style={{ display: 'inline-block', width: 8, height: 14, background: '#39ff14', animation: 'blink 1s step-end infinite', verticalAlign: 'middle', marginLeft: 4 }} />
          </div>
        )}

        {/* Main menu — fades in after boot */}
        {booted && (
          <div style={{ animation: 'menuFadeIn 0.6s ease forwards' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 32, borderBottom: '1px solid #1a4a1a', paddingBottom: 24 }}>
              <div style={{ color: '#39ff14', fontSize: 10, opacity: 0.5, letterSpacing: '0.3em', marginBottom: 8 }}>
                FOGSIFT SYSTEMS // TERMINAL v5.2
              </div>
              <div style={{
                color:       '#39ff14',
                fontSize:    36,
                fontWeight:  'bold',
                letterSpacing: '0.25em',
                opacity:     titleAlpha,
                transition:  'opacity 0.4s',
                textShadow:  '0 0 20px rgba(57,255,20,0.6), 0 0 40px rgba(57,255,20,0.2)',
              }}>
                SAVE RILEY
              </div>
              <div style={{ color: '#39ff14', fontSize: 9, opacity: 0.3, marginTop: 6, letterSpacing: '0.2em' }}>
                v0.0.3 · OPERATOR_INSTANCE: #0997
              </div>
            </div>

            {/* Confirm overlay */}
            {confirm && (
              <div style={{
                background: '#000',
                border:     '1px solid #39ff14',
                padding:    20,
                marginBottom: 20,
                textAlign:  'center',
                color:      '#39ff14',
              }}>
                <div style={{ fontSize: 12, marginBottom: 16 }}>
                  {confirm === 'newgame'
                    ? 'Start a new game? Unsaved progress will be lost.'
                    : 'Delete ALL save data? This cannot be undone.'}
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button
                    onClick={() => { setConfirm(null); if (confirm === 'newgame') onNewGame(); else onClearAll(); }}
                    style={{ background: '#39ff14', color: '#000', border: 'none', padding: '8px 20px', fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', fontWeight: 'bold', letterSpacing: '0.1em' }}
                  >
                    CONFIRM
                  </button>
                  <button
                    onClick={() => setConfirm(null)}
                    style={{ background: 'transparent', color: '#39ff14', border: '1px solid #39ff14', padding: '8px 20px', fontFamily: 'monospace', fontSize: 11, cursor: 'pointer', letterSpacing: '0.1em' }}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {/* Flash message */}
            {flash && (
              <div style={{ color: '#39ff14', fontSize: 11, textAlign: 'center', marginBottom: 12, opacity: 0.8 }}>
                ✓ {flash}
              </div>
            )}

            {/* Menu items */}
            <div style={{ marginBottom: 24 }}>

              {/* New Game */}
              <button
                onClick={handleNewGame}
                style={{
                  display:       'block',
                  width:         '100%',
                  background:    'transparent',
                  border:        '1px solid #39ff14',
                  color:         '#39ff14',
                  fontFamily:    'monospace',
                  fontSize:      13,
                  padding:       '12px 20px',
                  cursor:        'pointer',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  textAlign:     'left',
                  marginBottom:  8,
                  transition:    'all 0.15s',
                }}
                onMouseEnter={e => { e.target.style.background = '#39ff1420'; e.target.style.boxShadow = '0 0 12px rgba(57,255,20,0.2)'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.boxShadow = 'none'; }}
              >
                ▶  NEW GAME
              </button>

              {/* Continue */}
              {saves.auto && (
                <button
                  onClick={onContinue}
                  style={{
                    display:       'block',
                    width:         '100%',
                    background:    '#39ff1410',
                    border:        '1px solid #39ff14',
                    color:         '#39ff14',
                    fontFamily:    'monospace',
                    fontSize:      13,
                    padding:       '12px 20px',
                    cursor:        'pointer',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    textAlign:     'left',
                    marginBottom:  16,
                    transition:    'all 0.15s',
                  }}
                  onMouseEnter={e => { e.target.style.background = '#39ff1428'; }}
                  onMouseLeave={e => { e.target.style.background = '#39ff1410'; }}
                >
                  ▶  CONTINUE
                  <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 12 }}>
                    {STAGE_LABELS[saves.auto.stageName] ?? saves.auto.stageName}
                    {' · '}R{saves.auto.rapport}
                    {' · '}{formatAge(saves.auto.savedAt)}
                  </span>
                </button>
              )}

              {/* Also resume if we're mid-game */}
              {onResume && (
                <button
                  onClick={onResume}
                  style={{
                    display:       'block',
                    width:         '100%',
                    background:    'transparent',
                    border:        '1px dashed #39ff1488',
                    color:         '#39ff1488',
                    fontFamily:    'monospace',
                    fontSize:      11,
                    padding:       '8px 20px',
                    cursor:        'pointer',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    textAlign:     'left',
                    marginBottom:  16,
                    transition:    'all 0.15s',
                  }}
                  onMouseEnter={e => { e.target.style.color = '#39ff14'; e.target.style.borderColor = '#39ff14'; }}
                  onMouseLeave={e => { e.target.style.color = '#39ff1488'; e.target.style.borderColor = '#39ff1488'; }}
                >
                  ↩  RETURN TO GAME
                </button>
              )}

              {/* Save slots */}
              <div style={{ borderTop: '1px solid #1a4a1a', paddingTop: 12, marginBottom: 8 }}>
                <div style={{ color: '#39ff14', fontSize: 9, opacity: 0.4, letterSpacing: '0.2em', marginBottom: 8 }}>
                  SAVE SLOTS
                </div>
                {[1, 2, 3].map(n => (
                  <SlotRow
                    key={n}
                    label={`LOAD SLOT ${n}`}
                    save={saves[`slot${n}`]}
                    onLoad={() => onLoadSlot(n)}
                    onSave={onResume ? () => handleSaveToSlot(n) : null}
                  />
                ))}
              </div>
            </div>

            {/* Danger zone */}
            <div style={{ borderTop: '1px solid #1a4a1a', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handleClear}
                style={{
                  background:    'transparent',
                  border:        '1px solid #ff003322',
                  color:         '#ff003355',
                  fontFamily:    'monospace',
                  fontSize:      9,
                  padding:       '5px 12px',
                  cursor:        'pointer',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  transition:    'all 0.15s',
                }}
                onMouseEnter={e => { e.target.style.borderColor = '#ff0033aa'; e.target.style.color = '#ff0033aa'; }}
                onMouseLeave={e => { e.target.style.borderColor = '#ff003322'; e.target.style.color = '#ff003355'; }}
              >
                CLEAR ALL DATA
              </button>
              <div style={{ color: '#39ff14', fontSize: 9, opacity: 0.25, fontStyle: 'italic' }}>
                "I've been waiting for you."
              </div>
            </div>

          </div>
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
        @keyframes fadeInLine { from { opacity:0; transform: translateX(-8px); } to { opacity:1; transform: translateX(0); } }
        @keyframes menuFadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
