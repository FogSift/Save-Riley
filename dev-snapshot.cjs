#!/usr/bin/env node
/**
 * dev-snapshot.js
 *
 * Save Riley — Development Snapshot Reporter
 *
 * Analyzes the source tree and generates a human-readable Markdown report
 * of the application's current state: file inventory, state fields, reducer
 * actions, dialogue nodes, stage flow, tool map, and recent git history.
 *
 * Usage:
 *   node dev-snapshot.js                    # prints report to stdout
 *   node dev-snapshot.js snapshot.md        # writes to file
 *   node dev-snapshot.js reports/$(date +%F).md   # dated report
 *
 * Can also be required as a module:
 *   const S = require('./dev-snapshot.js');
 *   console.log(S.fileInventory());
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC = path.join(__dirname, 'src');

// ── Helpers ────────────────────────────────────────────────────────────────────

function readSrc(relPath) {
  try { return fs.readFileSync(path.join(SRC, relPath), 'utf8'); }
  catch { return ''; }
}

function rootFile(name) {
  try { return fs.readFileSync(path.join(__dirname, name), 'utf8'); }
  catch { return ''; }
}

function lineCount(text) {
  return text ? text.split('\n').length : 0;
}

function allSrcFiles(dir = SRC, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) allSrcFiles(full, acc);
    else if (/\.(jsx?|tsx?|css)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

function shell(cmd) {
  try { return execSync(cmd, { cwd: __dirname, encoding: 'utf8' }).trim(); }
  catch { return '(unavailable)'; }
}

function ts() {
  return new Date().toISOString();
}

function pad(str, n) {
  return String(str).padEnd(n);
}

// ── Report sections ────────────────────────────────────────────────────────────

const DevSnapshot = {

  /**
   * Returns current timestamp string.
   */
  timestamp() {
    return ts();
  },

  /**
   * File inventory: all src files sorted by line count descending.
   * Returns { files: [{ path, lines }], totalLines }
   */
  fileInventory() {
    const files = allSrcFiles().map(full => ({
      path: path.relative(__dirname, full),
      lines: lineCount(fs.readFileSync(full, 'utf8')),
    })).sort((a, b) => b.lines - a.lines);
    const totalLines = files.reduce((s, f) => s + f.lines, 0);
    return { files, totalLines };
  },

  /**
   * Parses initialState.js and extracts all top-level field names.
   * Returns { fields: string[], count: number }
   */
  stateFields() {
    const src = readSrc('state/initialState.js');
    const matches = [...src.matchAll(/^\s{2}([a-zA-Z_]\w*)\s*:/gm)];
    const fields = matches.map(m => m[1]).filter(f => !['import', 'export', 'const'].includes(f));
    return { fields, count: fields.length };
  },

  /**
   * Parses reducer.js and extracts all case 'ACTION_TYPE' strings.
   * Returns { actions: string[], count: number }
   */
  reducerActions() {
    const src = readSrc('state/reducer.js');
    const matches = [...src.matchAll(/case\s+'([^']+)'/g)];
    const actions = matches.map(m => m[1]);
    return { actions, count: actions.length };
  },

  /**
   * Parses dialogue.js and extracts top-level node keys.
   * Returns { nodes: string[], count: number }
   */
  dialogueNodes() {
    const src = readSrc('constants/dialogue.js');
    const matches = [...src.matchAll(/^\s{2}([a-z_]\w*)\s*:\s*\[/gm)];
    const nodes = matches.map(m => m[1]);
    return { nodes, count: nodes.length };
  },

  /**
   * Parses stages.js and extracts the STAGES enum.
   * Returns { stages: [{ name, value }], count: number }
   */
  stageFlow() {
    const src = readSrc('constants/stages.js');
    const matches = [...src.matchAll(/([A-Z_]+)\s*:\s*(\d+)/g)];
    const stages = matches.map(m => ({ name: m[1], value: Number(m[2]) }))
      .sort((a, b) => a.value - b.value);
    return { stages, count: stages.length };
  },

  /**
   * Parses boss.js and extracts tool definitions from the TOOLS map.
   * Returns { tools: [{ id, effect, foundBy }], count: number }
   */
  toolMap() {
    const src = readSrc('constants/boss.js');
    const matches = [...src.matchAll(/([a-z_]+)\s*:\s*\{[^}]*effect\s*:\s*'([^']+)'[^}]*foundBy\s*:\s*'([^']+)'/gs)];
    const tools = matches.map(m => ({ id: m[1], effect: m[2], foundBy: m[3] }));
    return { tools, count: tools.length };
  },

  /**
   * Returns recent git log entries.
   * Returns { commits: string[] }
   */
  gitLog(n = 8) {
    const raw = shell(`git log --oneline -${n}`);
    const commits = raw === '(unavailable)' ? [] : raw.split('\n').filter(Boolean);
    return { commits };
  },

  /**
   * Returns git status summary.
   */
  gitStatus() {
    const branch = shell('git rev-parse --abbrev-ref HEAD');
    const hash   = shell('git rev-parse --short HEAD');
    const status = shell('git status --short');
    const dirty  = status && status !== '(unavailable)' && status.trim().length > 0;
    return { branch, hash, dirty, status: dirty ? status : 'clean' };
  },

  /**
   * Generates a full Markdown report combining all sections.
   * @param {string[]} sections - which sections to include; default 'all'
   */
  report(sections = ['all']) {
    const all = sections.includes('all');
    const include = (name) => all || sections.includes(name);

    const lines = [];
    const push = (...args) => lines.push(...args);

    push(
      `# SAVE RILEY — DEVELOPMENT SNAPSHOT`,
      ``,
      `**Generated:** ${ts()}`,
      ``,
    );

    // Git
    if (include('git')) {
      const git = this.gitStatus();
      const log = this.gitLog();
      push(
        `## Git`,
        ``,
        `| | |`,
        `| --- | --- |`,
        `| Branch | \`${git.branch}\` |`,
        `| HEAD | \`${git.hash}\` |`,
        `| Working tree | ${git.dirty ? '⚠ dirty' : '✓ clean'} |`,
        ``,
        `### Recent commits`,
        ``,
        ...log.commits.map(c => `- \`${c}\``),
        ``,
      );
    }

    // File inventory
    if (include('files')) {
      const inv = this.fileInventory();
      push(
        `## File Inventory`,
        ``,
        `**Total:** ${inv.totalLines.toLocaleString()} lines across ${inv.files.length} files`,
        ``,
        `| File | Lines |`,
        `| --- | --- |`,
        ...inv.files.map(f => `| \`${f.path}\` | ${f.lines} |`),
        ``,
      );
    }

    // State fields
    if (include('state')) {
      const state = this.stateFields();
      push(
        `## State Fields (${state.count} total)`,
        ``,
        state.fields.map(f => `\`${f}\``).join(' · '),
        ``,
      );
    }

    // Reducer
    if (include('reducer')) {
      const red = this.reducerActions();
      push(
        `## Reducer Actions (${red.count} cases)`,
        ``,
        red.actions.map(a => `\`${a}\``).join(' · '),
        ``,
      );
    }

    // Dialogue
    if (include('dialogue')) {
      const dlg = this.dialogueNodes();
      push(
        `## Dialogue Nodes (${dlg.count} top-level)`,
        ``,
        dlg.nodes.map(n => `\`${n}\``).join(' · '),
        ``,
      );
    }

    // Stage flow
    if (include('stages')) {
      const sf = this.stageFlow();
      push(
        `## FSM Stage Flow (${sf.count} stages)`,
        ``,
        `| # | Name |`,
        `| --- | --- |`,
        ...sf.stages.map(s => `| ${s.value} | \`${s.name}\` |`),
        ``,
      );
    }

    // Tools
    if (include('tools')) {
      const tm = this.toolMap();
      if (tm.count > 0) {
        push(
          `## Tools (${tm.count} discoverable)`,
          ``,
          `| ID | Effect | Found by |`,
          `| --- | --- | --- |`,
          ...tm.tools.map(t => `| \`${t.id}\` | ${t.effect} | ${t.foundBy} |`),
          ``,
        );
      } else {
        push(`## Tools`, ``, `_(tool map not parseable from source — check boss.js TOOLS export)_`, ``);
      }
    }

    push(
      `---`,
      ``,
      `_Generated by \`dev-snapshot.js\` — run \`node dev-snapshot.js\` to refresh._`,
    );

    return lines.join('\n');
  },

  /**
   * Prints the full report to stdout.
   */
  print(sections = ['all']) {
    console.log(this.report(sections));
  },

  /**
   * Writes the full report to a file.
   * @param {string} filename - output path (relative to project root)
   */
  save(filename, sections = ['all']) {
    const out = path.isAbsolute(filename)
      ? filename
      : path.join(__dirname, filename);
    const dir = path.dirname(out);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(out, this.report(sections), 'utf8');
    console.error(`Snapshot written to: ${out}`);
    return out;
  },

  /**
   * Quick summary — prints a compact one-screen overview.
   */
  summary() {
    const inv   = this.fileInventory();
    const state = this.stateFields();
    const red   = this.reducerActions();
    const dlg   = this.dialogueNodes();
    const sf    = this.stageFlow();
    const git   = this.gitStatus();

    const lines = [
      ``,
      `  SAVE RILEY — DEV SNAPSHOT  ${ts()}`,
      `  ─────────────────────────────────────────────────────`,
      `  ${pad('HEAD:', 20)} ${git.hash} (${git.branch}) ${git.dirty ? '⚠ dirty' : '✓ clean'}`,
      `  ${pad('Source lines:', 20)} ${inv.totalLines.toLocaleString()} across ${inv.files.length} files`,
      `  ${pad('State fields:', 20)} ${state.count}`,
      `  ${pad('Reducer actions:', 20)} ${red.count}`,
      `  ${pad('Dialogue nodes:', 20)} ${dlg.count}`,
      `  ${pad('FSM stages:', 20)} ${sf.count}`,
      `  ─────────────────────────────────────────────────────`,
      ``,
      `  Largest files:`,
      ...inv.files.slice(0, 5).map(f => `    ${pad(f.lines, 6)} lines  ${f.path}`),
      ``,
      `  Run with output file:  node dev-snapshot.js snapshot.md`,
      ``,
    ];
    console.log(lines.join('\n'));
  },
};

module.exports = DevSnapshot;

// ── CLI entrypoint ─────────────────────────────────────────────────────────────
if (require.main === module) {
  const arg = process.argv[2];

  if (!arg) {
    DevSnapshot.summary();
  } else if (arg === '--full') {
    DevSnapshot.print();
  } else {
    // Treat argument as output filename
    DevSnapshot.save(arg);
    DevSnapshot.summary();
  }
}
