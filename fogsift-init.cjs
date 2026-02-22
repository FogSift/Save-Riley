#!/usr/bin/env node
/**
 * fogsift-init.cjs
 * Reads any local Git repository and generates a populated fogsift.config.js
 * so you can drop Save Riley into any codebase as an ARG engine.
 *
 * Usage:
 *   node fogsift-init.cjs --repo /path/to/your-project --out fogsift.config.js
 *   npx fogsift-init --repo . --out fogsift.config.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── CLI args ────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--repo') args.repo = argv[i + 1];
    if (argv[i] === '--out')  args.out  = argv[i + 1];
    if (argv[i] === '--help') args.help = true;
    if (argv[i] === '--dry')  args.dry  = true;
  }
  return args;
}

const ARGS = parseArgs(process.argv);

if (ARGS.help) {
  console.log(`
fogsift-init — generate a fogsift.config.js for any codebase

Usage:
  node fogsift-init.cjs --repo <path> [--out fogsift.config.js] [--dry]

Options:
  --repo <path>   Path to the repository to analyze (default: cwd)
  --out  <file>   Output file path (default: fogsift.config.js)
  --dry           Print config to stdout instead of writing a file
  --help          Show this message
`);
  process.exit(0);
}

const REPO_ROOT = path.resolve(ARGS.repo || process.cwd());
const OUT_FILE  = path.resolve(ARGS.out  || 'fogsift.config.js');

// ── Utilities ────────────────────────────────────────────────────────────────

function exists(p) {
  try { fs.accessSync(p); return true; } catch { return false; }
}

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function readText(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

/**
 * Recursively walk a directory, returning all file paths.
 * Skips common noise directories.
 */
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '.nuxt', '__pycache__',
  '.cache', 'coverage', '.turbo', '.venv', 'venv', 'env', '.env',
  'vendor', 'target', 'out', '.svelte-kit',
]);

function walk(dir, depth = 0, acc = []) {
  if (depth > 6) return acc;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.env.example') continue;
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, depth + 1, acc);
    else acc.push(full);
  }
  return acc;
}

function relPath(p) { return path.relative(REPO_ROOT, p); }

// ── Analysis helpers ─────────────────────────────────────────────────────────

const SOURCE_EXTS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.py', '.rb', '.go', '.rs', '.java', '.kt', '.swift',
  '.c', '.cpp', '.cs', '.php', '.vue', '.svelte',
]);

const CONFIG_NAMES = new Set([
  'package.json', 'Cargo.toml', 'pyproject.toml', 'go.mod',
  'composer.json', 'pom.xml', 'build.gradle', 'Gemfile',
  'requirements.txt', 'setup.py',
]);

const INTERESTING_DIRS = [
  'src', 'lib', 'app', 'api', 'server', 'client', 'components',
  'routes', 'controllers', 'models', 'services', 'utils', 'helpers',
  'core', 'internal', 'pkg', 'handlers', 'middleware',
];

function detectTechStack(pkg, files) {
  const stack = [];

  // From package.json
  if (pkg) {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps.react)        stack.push('React');
    if (deps.vue)          stack.push('Vue.js');
    if (deps.svelte)       stack.push('Svelte');
    if (deps.next)         stack.push('Next.js');
    if (deps.nuxt)         stack.push('Nuxt');
    if (deps.express)      stack.push('Express');
    if (deps.fastify)      stack.push('Fastify');
    if (deps.nestjs || deps['@nestjs/core']) stack.push('NestJS');
    if (deps.prisma || deps['@prisma/client']) stack.push('Prisma');
    if (deps.mongoose)     stack.push('MongoDB/Mongoose');
    if (deps.pg || deps.postgres) stack.push('PostgreSQL');
    if (deps.mysql2)       stack.push('MySQL');
    if (deps.redis)        stack.push('Redis');
    if (deps.graphql)      stack.push('GraphQL');
    if (deps.typescript || deps['ts-node']) stack.push('TypeScript');
    if (deps.vite)         stack.push('Vite');
    if (deps.webpack)      stack.push('Webpack');
    if (deps.tailwindcss)  stack.push('Tailwind CSS');
  }

  // From file extensions
  const exts = new Set(files.map(f => path.extname(f)));
  if (exts.has('.py'))   stack.push('Python');
  if (exts.has('.rb'))   stack.push('Ruby');
  if (exts.has('.go'))   stack.push('Go');
  if (exts.has('.rs'))   stack.push('Rust');
  if (exts.has('.java')) stack.push('Java');
  if (exts.has('.cs'))   stack.push('C#');
  if (exts.has('.php'))  stack.push('PHP');

  // From config files at root
  if (exists(path.join(REPO_ROOT, 'Cargo.toml')))     stack.push('Rust');
  if (exists(path.join(REPO_ROOT, 'go.mod')))         stack.push('Go');
  if (exists(path.join(REPO_ROOT, 'pyproject.toml'))) stack.push('Python');
  if (exists(path.join(REPO_ROOT, 'Gemfile')))        stack.push('Ruby');

  // Deduplicate
  return [...new Set(stack)];
}

function findEntryPoints(files, pkg) {
  const entries = [];

  // package.json main/module
  if (pkg) {
    for (const key of ['main', 'module', 'source', 'exports']) {
      if (typeof pkg[key] === 'string') {
        const p = path.join(REPO_ROOT, pkg[key]);
        if (exists(p)) entries.push(relPath(p));
      }
    }
    // scripts hint
    if (pkg.scripts) {
      for (const script of Object.values(pkg.scripts)) {
        const match = script.match(/(?:node|ts-node|python|ruby|go run)\s+([\w./]+\.\w+)/);
        if (match) entries.push(match[1]);
      }
    }
  }

  // Common entry file names
  const ENTRY_NAMES = [
    'index.js', 'index.ts', 'main.js', 'main.ts', 'app.js', 'app.ts',
    'server.js', 'server.ts', 'index.jsx', 'index.tsx', 'main.jsx', 'main.tsx',
    'index.py', 'main.py', 'app.py', 'manage.py',
    'main.go', 'cmd/main.go',
    'src/main.rs', 'main.rs',
  ];

  for (const name of ENTRY_NAMES) {
    const p = path.join(REPO_ROOT, name);
    if (exists(p)) entries.push(name);
  }

  // Common src/ entries
  for (const name of ENTRY_NAMES) {
    const p = path.join(REPO_ROOT, 'src', name);
    if (exists(p)) entries.push('src/' + name);
  }

  return [...new Set(entries)].slice(0, 5);
}

function findInterestingDirs(files) {
  const dirs = new Set(files.map(f => path.dirname(relPath(f))));
  const found = [];

  for (const idir of INTERESTING_DIRS) {
    for (const d of dirs) {
      if (d === idir || d.startsWith(idir + '/') || d.endsWith('/' + idir)) {
        found.push(d);
        break;
      }
    }
  }
  return [...new Set(found)].slice(0, 8).map(d => d + '/');
}

function countLinesByExtension(files) {
  const counts = {};
  for (const f of files) {
    const ext = path.extname(f);
    if (!SOURCE_EXTS.has(ext)) continue;
    const lines = readText(f).split('\n').length;
    counts[ext] = (counts[ext] || 0) + lines;
  }
  return counts;
}

function findSecretsAndInteresting(files, stack) {
  const candidates = [];

  // Look for TODO/FIXME/HACK/XXX comments
  const commentFiles = files.filter(f => SOURCE_EXTS.has(path.extname(f)));
  const TODO_PATTERN = /(?:TODO|FIXME|HACK|XXX|TEMP|WORKAROUND|DEPRECATED)[:\s]+(.+)/gi;

  for (const f of commentFiles.slice(0, 100)) {
    const content = readText(f);
    const matches = content.match(TODO_PATTERN) || [];
    if (matches.length > 0) {
      const rel = relPath(f);
      candidates.push(
        `There are ${matches.length} TODO/FIXME comment${matches.length > 1 ? 's' : ''} in ${rel}.`
      );
      if (candidates.length >= 2) break;
    }
  }

  // Look for .env.example
  if (exists(path.join(REPO_ROOT, '.env.example'))) {
    const envExample = readText(path.join(REPO_ROOT, '.env.example'));
    const keys = envExample.match(/^[A-Z_]+=.*/gm) || [];
    if (keys.length > 0) {
      candidates.push(`The project has ${keys.length} env var${keys.length > 1 ? 's' : ''} defined in .env.example.`);
    }
  }

  // Deprecation hints
  if (stack.includes('Express') || stack.includes('Node.js')) {
    candidates.push("Some of the route handlers haven't been touched since the initial commit.");
  }
  if (stack.includes('Prisma') || stack.includes('MongoDB/Mongoose')) {
    candidates.push("The database schema has evolved — not all models are in use.");
  }

  // Generic fallback secrets that work for any project
  const fallbacks = [
    "There's a config flag in the codebase that nobody on the team remembers enabling.",
    "One of the utility functions does something slightly different than its name suggests.",
    "The error handling in the auth flow is... optimistic.",
  ];

  while (candidates.length < 3) {
    candidates.push(fallbacks[candidates.length]);
  }

  return candidates.slice(0, 3);
}

function buildStages(entryPoints, interestingDirs, stack, pkg) {
  const stages = [];

  // Stage 0 — always boot / find entry point
  stages.push({
    id: 'BOOT',
    challenge: 'Find the entry point of the application',
    hint: entryPoints[0] || 'Look for main.js, index.js, or check package.json → "main"',
  });

  // Stage 1 — routing / HTTP if applicable
  if (stack.some(s => ['Express', 'Fastify', 'NestJS', 'Next.js', 'Rails'].includes(s))) {
    const routeDir = interestingDirs.find(d => d.includes('route') || d.includes('controller'))
      || (interestingDirs.find(d => d.includes('api')) || 'src/routes/');
    stages.push({
      id: 'ROUTING',
      challenge: 'Trace an HTTP request from entry point to response',
      hint: routeDir,
    });
  } else if (interestingDirs.some(d => d.includes('handler') || d.includes('route'))) {
    stages.push({
      id: 'ROUTING',
      challenge: 'Find how requests are handled in this system',
      hint: interestingDirs.find(d => d.includes('handler') || d.includes('route')) || 'src/',
    });
  }

  // Stage 2 — data / models
  const dataDir = interestingDirs.find(d => d.includes('model') || d.includes('schema') || d.includes('db'));
  if (dataDir || stack.some(s => s.includes('SQL') || s.includes('Mongo') || s.includes('Prisma'))) {
    stages.push({
      id: 'DATA_LAYER',
      challenge: 'Explain the primary data model or schema',
      hint: dataDir || 'Look for models/, schema/, or prisma/schema.prisma',
    });
  }

  // Stage 3 — auth if it exists
  const authDir = interestingDirs.find(d => d.includes('auth') || d.includes('middleware'));
  if (authDir) {
    stages.push({
      id: 'AUTH',
      challenge: 'Find the authentication mechanism and explain how sessions work',
      hint: authDir,
    });
  }

  // Stage 4 — services / business logic
  const serviceDir = interestingDirs.find(d => d.includes('service') || d.includes('lib') || d.includes('core'));
  if (serviceDir) {
    stages.push({
      id: 'CORE_LOGIC',
      challenge: 'Find the core business logic — what does this application actually do?',
      hint: serviceDir,
    });
  }

  // Stage 5 — the secret
  stages.push({
    id: 'THE_SECRET',
    challenge: "Find what Riley doesn't want you to find",
    hint: null,
  });

  return stages;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function analyze() {
  console.log(`\n🔍  Analyzing repo: ${REPO_ROOT}\n`);

  if (!exists(REPO_ROOT)) {
    console.error(`❌  Repo path does not exist: ${REPO_ROOT}`);
    process.exit(1);
  }

  // Read package.json if it exists
  const pkgPath = path.join(REPO_ROOT, 'package.json');
  const pkg = readJSON(pkgPath);
  const projectName = pkg?.name || path.basename(REPO_ROOT);
  const projectDescription = pkg?.description || '';

  // Walk the repo
  console.log('   Walking directory tree...');
  const allFiles = walk(REPO_ROOT);
  const sourceFiles = allFiles.filter(f => SOURCE_EXTS.has(path.extname(f)));
  console.log(`   Found ${allFiles.length} files (${sourceFiles.length} source files)`);

  // Detect tech stack
  const stack = detectTechStack(pkg, allFiles);
  console.log(`   Tech stack: ${stack.join(', ') || 'unknown'}`);

  // Find entry points and interesting dirs
  const entryPoints = findEntryPoints(allFiles, pkg);
  const interestingDirs = findInterestingDirs(sourceFiles);
  const secrets = findSecretsAndInteresting(sourceFiles, stack);
  const lineCounts = countLinesByExtension(sourceFiles);
  const stages = buildStages(entryPoints, interestingDirs, stack, pkg);

  const totalLines = Object.values(lineCounts).reduce((a, b) => a + b, 0);

  console.log(`   Entry points: ${entryPoints.join(', ') || 'none found'}`);
  console.log(`   Total source lines: ${totalLines.toLocaleString()}`);
  console.log(`   Stages generated: ${stages.length}`);
  console.log();

  return {
    projectName,
    projectDescription,
    stack,
    entryPoints,
    interestingDirs,
    secrets,
    stages,
    totalLines,
    sourceFileCount: sourceFiles.length,
  };
}

function renderConfig(data) {
  const {
    projectName, projectDescription, stack,
    entryPoints, interestingDirs, secrets, stages,
    totalLines, sourceFileCount,
  } = data;

  const stageLines = stages.map(s => {
    const hint = s.hint ? `hint: ${JSON.stringify(s.hint)}` : 'hint: null';
    return `    { id: ${JSON.stringify(s.id)}, challenge: ${JSON.stringify(s.challenge)}, ${hint} },`;
  }).join('\n');

  const entryLine = entryPoints.length
    ? entryPoints.map(e => JSON.stringify(e)).join(', ')
    : '"src/"';

  const dirLine = interestingDirs.length
    ? interestingDirs.map(d => JSON.stringify(d)).join(', ')
    : '"src/"';

  const secretLines = secrets.map(s => `      ${JSON.stringify(s)},`).join('\n');

  const stackLine = stack.length
    ? stack.map(s => JSON.stringify(s)).join(', ')
    : '"(unknown)"';

  return `// fogsift.config.js
// Generated by fogsift-init on ${new Date().toISOString().slice(0, 10)}
// Repo: ${projectName} (${sourceFileCount} source files, ~${totalLines.toLocaleString()} lines)
//
// This config turns Save Riley into a custom ARG for your codebase.
// Fork https://github.com/FogSift/Save-Riley, drop this file in,
// and deploy. Riley will guide players through YOUR project.
//
// Customize freely — every field below changes what Riley says and does.

export default {
  project: {
    name: ${JSON.stringify(projectName)},
    tagline: ${JSON.stringify(projectDescription || `a ${stack[0] || 'software'} project`)},
    techStack: [${stackLine}],
    entryPoints: [${entryLine}],
    keyDirectories: [${dirLine}],
  },

  riley: {
    name: "Riley",
    role: "Senior Engineer",

    // corporate | sardonic | warm | glitching
    // 'glitching' starts warm and degrades — great for horror/ARG vibes
    personality: "corporate",

    // These appear as Riley's "secrets" — things she reluctantly reveals
    // at high rapport. Edit them to reference real quirks in your codebase.
    secrets: [
${secretLines}
    ],
  },

  // Each stage maps to a challenge players must complete to advance.
  // 'challenge' is what Riley describes. 'hint' is her clue.
  // Set hint: null to make Riley refuse to help (forces player to explore).
  stages: [
${stageLines}
  ],

  dnd: {
    // Skill checks fire when players attempt each challenge.
    // Player stats come from game state:
    //   rapport (0–10) = Charisma modifier
    //   toolsFound.length = Equipment modifier
    //   loopCount = Experience modifier
    enabled: true,

    // easy (DC 8–10) | standard (DC 10–14) | hard (DC 14–18) | riley_decides
    difficultyScale: "standard",

    // If true, Riley reacts to critical fails (roll of 1) with special dialogue
    criticalEvents: true,
  },

  // Override any Save Riley theme variables here.
  // Leave empty to use the default FogSift theme.
  theme: {
    // '--accent': '#ff6b6b',
    // '--bg': '#0a0a0a',
  },
};
`;
}

// ── Run ──────────────────────────────────────────────────────────────────────

const analysis = analyze();
const config   = renderConfig(analysis);

if (ARGS.dry) {
  console.log(config);
} else {
  fs.writeFileSync(OUT_FILE, config, 'utf8');
  console.log(`✅  Written to: ${OUT_FILE}`);
  console.log();
  console.log('Next steps:');
  console.log('  1. Review and edit fogsift.config.js — especially the "secrets" and stage hints');
  console.log('  2. npm install && npm run dev   (in your Save-Riley fork)');
  console.log('  3. Deploy to Vercel/Netlify — it\'s a static site, zero config needed');
  console.log();
  console.log('  Docs: https://github.com/FogSift/Save-Riley#drop-in-mode');
}
