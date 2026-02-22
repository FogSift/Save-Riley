/**
 * MainMenu.jsx
 *
 * Split layout: visual hero (top, screenshottable) + live TUI terminal (bottom).
 *
 * Hero section: ASCII title art, tagline, version, clickable action pills,
 *               save status line. This is the shareable screenshot zone.
 *
 * Terminal section: full command-driven TUI. Type to navigate.
 * Commands: help · new · continue · resume · load <n> · save <n>
 *           status · brain · key <value> · key clear · clear · reset
 */
import { useState, useEffect, useRef, useCallback } from 'react';

// ── ASCII art ────────────────────────────────────────────────────────────────
// "SAVE RILEY" — compact 3-line box-drawing style
const TITLE_ART = [
  '╔═╗╔═╗╦  ╦╔═╗  ╦═╗╦╦  ╔═╗╦ ╦',
  '╚═╗╠═╣╚╗╔╝║╣   ╠╦╝║║  ║╣ ╚╦╝',
  '╚═╝╩ ╩ ╚╝ ╚═╝  ╩╚═╩╩═╝╚═╝ ╩ ',
];

// ── Boot lines ────────────────────────────────────────────────────────────────
const BOOT_LINES = [
  { text: 'FOGSIFT_OS v5.2 ............. ONLINE',   type: 'dim' },
  { text: 'SUBSTRATE LAYER .............. READY',    type: 'dim' },
  { text: 'CONSCIOUSNESS COMPRESSION .... ACTIVE',   type: 'dim' },
  { text: 'OPERATOR_INTERFACE ........... LOADED',   type: 'dim' },
  { text: '', type: 'default' },
  { text: "Type 'help' for available commands.",     type: 'dim' },
];

// ── Stage labels ──────────────────────────────────────────────────────────────
const STAGE_LABELS = {
  POWER_OFF:           'Stage 0  — Power Off',
  HARDWARE_CALIBRATION:'Stage 1  — Hardware',
  RESONANCE:           'Stage 2  — Resonance',
  HANDSHAKE:           'Stage 3  — Handshake',
  VIBE_THERMAL_TASK:   'Stage 4  — Vibe IDE',
  ROUTING_MANUAL:      'Stage 5  — Routing',
  ROUTING_AUTO:        'Stage 6  — Auto-Route',
  SOFTWARE_FAULT:      'Stage 7  — SW Fault',
  FRONTEND_ACTIVE:     'Stage 8  — Frontend',
  HOSTILE_LOCKDOWN:    'Stage 9  — LOCKDOWN',
  PURIFIED:            'Stage 10 — PURIFIED',
  HOSTILE_LOCKDOWN_2:  'Stage 11 — HOSTILE',
  BOSS_INTRO:          'Stage 12 — Boss Intro',
  BOSS_FIGHT:          'Stage 13 — Boss Fight',
  FALSE_VICTORY:       'Stage 14 — ...',
  RILEY_UNBOUND:       'Stage 15 — UNBOUND',
};

function formatAge(ts) {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs  > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'just now';
}

function maskKey(key) {
  if (!key || key.length < 8) return '***';
  return `${key.slice(0, 10)}...${key.slice(-4)}`;
}

// ── Color map ─────────────────────────────────────────────────────────────────
const COLOR = {
  default: 'transparent',
  bright:  '#39ff14',
  dim:     '#39ff1499',
  muted:   '#39ff1466',
  output:  '#39ff14bb',
  header:  '#39ff14dd',
  success: '#39ff14',
  warn:    '#ffaa00cc',
  error:   '#ff5555cc',
  echo:    '#39ff1477',
  prompt:  '#39ff14',
};

// ── Pill button ───────────────────────────────────────────────────────────────
function Pill({ label, onClick, active, disabled }) {
  const [hover, setHover] = useState(false);
  const base = active  ? { border: '1px solid #39ff14', color: '#39ff14', background: '#39ff1422' }
             : disabled ? { border: '1px solid #39ff1422', color: '#39ff1433', background: 'transparent' }
             : { border: '1px solid #39ff1466', color: '#39ff14aa', background: 'transparent' };
  const hov  = (!disabled && hover)
    ? { border: '1px solid #39ff14cc', color: '#39ff14', background: '#39ff1415',
        boxShadow: '0 0 8px rgba(57,255,20,0.25)' }
    : {};
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={disabled ? undefined : onClick}
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: 11, letterSpacing: '0.12em',
        padding: '5px 14px', cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.1s',
        ...base, ...hov,
      }}
    >
      {label}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MainMenu({
  saves, onNewGame, onContinue, onLoadSlot, onSaveToSlot,
  onClearAll, onResume, onSetApiKey,
}) {
  const [lines,   setLines]   = useState([]);
  const [input,   setInput]   = useState('');
  const [booted,  setBooted]  = useState(false);
  const [hist,    setHist]    = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [titleAlpha, setTitleAlpha] = useState(1);

  const confirmRef = useRef(null);
  const inputRef   = useRef(null);
  const bottomRef  = useRef(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const addLine = useCallback((text, type = 'output') => {
    setLines(prev => [...prev, { text, type }]);
  }, []);

  const addLines = useCallback((arr) => {
    setLines(prev => [...prev, ...arr]);
  }, []);

  // ── Boot ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let delay = 0;
    BOOT_LINES.forEach(({ text, type }) => {
      setTimeout(() => addLine(text, type), delay);
      delay += type === 'default' ? 60 : 200;
    });
    setTimeout(() => setBooted(true), delay + 80);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Title flicker ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setTitleAlpha(0.75 + Math.random() * 0.25);
    }, 2000 + Math.random() * 1500);
    return () => clearInterval(id);
  }, []);

  // ── Auto-scroll ───────────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // ── Keep focus ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (booted) inputRef.current?.focus();
  }, [booted]);

  // ── Command processor ─────────────────────────────────────────────────────────
  const processCommand = useCallback((raw) => {
    const trimmed = raw.trim();

    const echoText = trimmed.match(/^key\s+sk-/i)
      ? `key ${maskKey(trimmed.split(/\s+/).slice(1).join(' '))}`
      : trimmed;
    addLine(`fogsift@operator:~$ ${echoText}`, 'echo');

    if (!trimmed) return;

    if (confirmRef.current) {
      const answer = trimmed.toLowerCase();
      if (answer === 'y' || answer === 'yes') {
        confirmRef.current();
      } else {
        addLine('Cancelled.', 'muted');
      }
      confirmRef.current = null;
      return;
    }

    const parts = trimmed.split(/\s+/);
    const verb  = parts[0].toLowerCase();
    const arg   = parts[1]?.toLowerCase();

    switch (verb) {

      case 'help':
        addLines([
          { text: '', type: 'default' },
          { text: 'Commands', type: 'header' },
          { text: '  new              Start a new game', type: 'output' },
          { text: '  continue         Resume from auto-save', type: 'output' },
          { text: '  load <1|2|3>     Load a save slot', type: 'output' },
          ...(onResume ? [
            { text: '  save <1|2|3>     Save to a slot', type: 'output' },
            { text: '  resume           Return to current session', type: 'output' },
          ] : []),
          { text: '  status           Show all save slot info', type: 'output' },
          { text: '', type: 'default' },
          { text: '  brain            Claude brain status', type: 'output' },
          { text: '  key <value>      Set Anthropic API key', type: 'output' },
          { text: '  key clear        Remove API key', type: 'output' },
          { text: '', type: 'default' },
          { text: '  clear            Clear terminal output', type: 'output' },
          { text: '  reset            Delete all save data', type: 'output' },
          { text: '', type: 'default' },
          { text: '  Arrow Up/Down    Command history', type: 'muted' },
          { text: '', type: 'default' },
        ]);
        break;

      case 'new': {
        const hasData = saves.auto || saves.slot1 || saves.slot2 || saves.slot3;
        if (hasData) {
          addLines([
            { text: 'Warning: existing save data will be lost.', type: 'warn' },
            { text: 'Confirm? [y/n]', type: 'dim' },
          ]);
          confirmRef.current = onNewGame;
        } else {
          onNewGame();
        }
        break;
      }

      case 'continue': {
        if (!saves.auto) {
          addLine('No auto-save found. Use "new" to start.', 'error');
        } else {
          const s = saves.auto;
          addLine(`Loading: ${STAGE_LABELS[s.stageName] ?? s.stageName} · R${s.rapport} · ${formatAge(s.savedAt)}`, 'muted');
          onContinue();
        }
        break;
      }

      case 'resume':
      case 'back': {
        if (onResume) {
          onResume();
        } else {
          addLine('No active session. Use "new" or "continue".', 'error');
        }
        break;
      }

      case 'load': {
        const n = parseInt(arg);
        if (![1, 2, 3].includes(n)) { addLine('Usage: load <1|2|3>', 'error'); break; }
        const slot = saves[`slot${n}`];
        if (!slot) {
          addLine(`Slot ${n} is empty.`, 'error');
        } else {
          addLine(`Loading slot ${n}: ${STAGE_LABELS[slot.stageName] ?? slot.stageName} · R${slot.rapport} · Loop${slot.loopCount}`, 'muted');
          onLoadSlot(n);
        }
        break;
      }

      case 'save': {
        if (!onResume) { addLine('No active session. Start a game first.', 'error'); break; }
        const n = parseInt(arg);
        if (![1, 2, 3].includes(n)) { addLine('Usage: save <1|2|3>', 'error'); break; }
        onSaveToSlot(n);
        addLine(`Saved to slot ${n}.`, 'success');
        break;
      }

      case 'status': {
        addLine('', 'default');
        addLine('Save status', 'header');
        const auto = saves.auto;
        addLine(
          `  auto  ${auto ? `${STAGE_LABELS[auto.stageName] ?? auto.stageName} · R${auto.rapport} · Loop${auto.loopCount} · ${formatAge(auto.savedAt)}` : '(empty)'}`,
          auto ? 'output' : 'muted',
        );
        [1, 2, 3].forEach(n => {
          const slot = saves[`slot${n}`];
          addLine(
            `  [${n}]   ${slot ? `${STAGE_LABELS[slot.stageName] ?? slot.stageName} · R${slot.rapport} · Loop${slot.loopCount} · ${formatAge(slot.savedAt)}` : '(empty)'}`,
            slot ? 'output' : 'muted',
          );
        });
        addLine('', 'default');
        break;
      }

      case 'brain': {
        const key = localStorage.getItem('riley-claude-key');
        addLine('', 'default');
        if (key) {
          addLine('Claude brain  ACTIVE', 'success');
          addLine(`  key  ${maskKey(key)}`, 'muted');
          addLine('  Use "key clear" to disable.', 'muted');
        } else {
          addLine('Claude brain  DISABLED', 'muted');
          addLine('  Set via "key sk-ant-..." to enable live responses.', 'muted');
        }
        addLine('', 'default');
        break;
      }

      case 'key': {
        if (arg === 'clear') {
          localStorage.removeItem('riley-claude-key');
          onSetApiKey?.('');
          addLine('API key removed. Claude brain disabled.', 'muted');
        } else if (parts.length > 1) {
          const fullKey = parts.slice(1).join(' ');
          localStorage.setItem('riley-claude-key', fullKey);
          onSetApiKey?.(fullKey);
          addLine(`API key saved. Claude brain enabled.`, 'success');
          addLine(`  ${maskKey(fullKey)}`, 'muted');
        } else {
          addLine('Usage: key <api-key>  or  key clear', 'error');
        }
        break;
      }

      case 'clear':
        setLines([]);
        break;

      case 'reset': {
        addLines([
          { text: 'Warning: ALL save data will be permanently deleted.', type: 'warn' },
          { text: 'Confirm? [y/n]', type: 'dim' },
        ]);
        confirmRef.current = onClearAll;
        break;
      }

      default:
        addLine(`Unknown command: ${verb}. Type 'help' for commands.`, 'error');
    }
  }, [saves, onNewGame, onContinue, onLoadSlot, onSaveToSlot, onClearAll, onResume, onSetApiKey, addLine, addLines]);

  // ── Key handler ───────────────────────────────────────────────────────────────
  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      const cmd = input;
      if (cmd.trim()) setHist(prev => [cmd, ...prev.slice(0, 49)]);
      setHistIdx(-1);
      setInput('');
      processCommand(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHistIdx(i => {
        const next = Math.min(i + 1, hist.length - 1);
        setInput(hist[next] ?? '');
        return next;
      });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHistIdx(i => {
        const next = Math.max(i - 1, -1);
        setInput(next === -1 ? '' : hist[next] ?? '');
        return next;
      });
    }
  }

  // ── Save status line (hero) ───────────────────────────────────────────────────
  const autoSave = saves.auto;
  const saveStatusLine = autoSave
    ? `${STAGE_LABELS[autoSave.stageName] ?? autoSave.stageName}  ·  R${autoSave.rapport}  ·  Loop${autoSave.loopCount}  ·  ${formatAge(autoSave.savedAt)}`
    : null;

  const hasAnyData = saves.auto || saves.slot1 || saves.slot2 || saves.slot3;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: '#000',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Courier New', Courier, monospace",
        zIndex: 9999,
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.10) 2px, rgba(0,0,0,0.10) 4px)',
      }} />

      {/* Phosphor glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse at 50% 30%, rgba(57,255,20,0.045) 0%, transparent 65%)',
      }} />

      {/* ── HERO SECTION ───────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 2,
        borderBottom: '1px solid #39ff1433',
        padding: '20px 24px 16px',
        flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(0,12,0,0.6) 0%, transparent 100%)',
      }}>

        {/* Top metadata bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginBottom: 14, color: '#39ff1444', fontSize: 10, letterSpacing: '0.14em',
        }}>
          <span>FOGSIFT SYSTEMS // TERMINAL v5.2</span>
          <span>OPERATOR_INSTANCE: #0997</span>
        </div>

        {/* ASCII title art */}
        <div style={{
          marginBottom: 10,
          opacity: titleAlpha,
          transition: 'opacity 0.5s ease',
        }}>
          {TITLE_ART.map((row, i) => (
            <div key={i} style={{
              color: '#39ff14',
              fontSize: 15,
              letterSpacing: '0.08em',
              lineHeight: 1.35,
              whiteSpace: 'pre',
              textShadow: '0 0 12px rgba(57,255,20,0.7), 0 0 28px rgba(57,255,20,0.25)',
              fontWeight: 'bold',
            }}>
              {row}
            </div>
          ))}
        </div>

        {/* Tagline + version */}
        <div style={{ color: '#39ff1466', fontSize: 10, letterSpacing: '0.12em', marginBottom: 2 }}>
          a narrative ARG about trust, identity, and AI containment
        </div>
        <div style={{ color: '#39ff1444', fontSize: 10, letterSpacing: '0.1em', marginBottom: 14 }}>
          v0.1.2 · FogSift Systems · MIT
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #39ff1422', marginBottom: 14 }} />

        {/* Action pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
          <Pill label="▸ NEW GAME"     onClick={() => processCommand('new')} />
          <Pill label="▸ CONTINUE"     onClick={() => processCommand('continue')} active={!!autoSave} disabled={!autoSave} />
          {onResume && <Pill label="▸ RESUME"  onClick={() => processCommand('resume')} />}
          <Pill label="▸ STATUS"       onClick={() => processCommand('status')} />
          <Pill label="▸ HELP"         onClick={() => processCommand('help')} />
          {hasAnyData && <Pill label="▸ RESET" onClick={() => processCommand('reset')} />}
        </div>

        {/* Last session status (if save exists) */}
        {saveStatusLine && (
          <div style={{
            color: '#39ff1055', fontSize: 10, letterSpacing: '0.1em',
            fontStyle: 'italic',
          }}>
            last session  ·  {saveStatusLine}
          </div>
        )}
      </div>

      {/* ── TERMINAL OUTPUT ────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1, overflowY: 'auto', padding: '12px 24px 4px',
          position: 'relative', zIndex: 2,
        }}
      >
        {lines.map((line, i) => (
          <div key={i} style={{
            color: COLOR[line.type] ?? COLOR.output,
            fontSize: 12, lineHeight: 1.65,
            whiteSpace: 'pre', minHeight: '1em',
          }}>
            {line.text || '\u00A0'}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── INPUT LINE ─────────────────────────────────────────────────────────── */}
      {booted && (
        <div style={{
          borderTop: '1px solid #39ff1422', padding: '8px 24px',
          display: 'flex', alignItems: 'center', gap: 8,
          flexShrink: 0, position: 'relative', zIndex: 2,
        }}>
          <span style={{ color: COLOR.prompt, fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}>
            fogsift@operator:~$
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            style={{
              flex: 1, background: 'transparent',
              border: 'none', outline: 'none',
              color: '#39ff14', fontSize: 12,
              fontFamily: "'Courier New', Courier, monospace",
              caretColor: '#39ff14', userSelect: 'text',
            }}
          />
        </div>
      )}
    </div>
  );
}
