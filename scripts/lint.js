'use strict';

// Minimal lint: walk repo, ensure each *.js parses cleanly under Node and that the
// renderer ES modules parse as ES modules. We avoid pulling in eslint to keep deps
// tiny — the goal is to catch syntax errors before packaging.

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['node_modules', 'dist', 'out', '.git', '.github', 'build']);
const RENDERER_DIR = path.join(ROOT, 'src', 'renderer');

let failed = 0;
let checked = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.js')) check(full);
  }
}

function check(file) {
  checked += 1;
  const source = fs.readFileSync(file, 'utf8');
  const isModule = file.startsWith(RENDERER_DIR);
  try {
    if (isModule) {
      // SourceTextModule is experimental; fall back to a syntax-only check via Function constructor on import-stripped source.
      // We just verify there are no parse errors by running through the V8 parser via vm.compileFunction with module-like wrapping.
      const stripped = source.replace(/^\s*import .*?;?$/gm, '').replace(/^\s*export\s+(default\s+)?/gm, '');
      new vm.Script(stripped, { filename: file });
    } else {
      new vm.Script(source, { filename: file });
    }
  } catch (err) {
    failed += 1;
    console.error(`[lint] ${path.relative(ROOT, file)}: ${err.message}`);
  }
}

walk(ROOT);
if (failed) {
  console.error(`\nLint failed: ${failed} file(s) with errors out of ${checked}.`);
  process.exit(1);
} else {
  console.log(`Lint OK: ${checked} files parsed cleanly.`);
}
