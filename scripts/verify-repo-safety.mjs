#!/usr/bin/env node
/**
 * Pre-commit / pre-release credential check (assignment Part 4, Step 4.3).
 * Zero dependencies. Run from the repo root:  node scripts/verify-repo-safety.mjs
 * Exits 1 if anything unsafe is found, so it can also gate a release.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const git = (...args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null; // non-zero exit (e.g. check-ignore found nothing)
  }
};

const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok, detail });

if (git('rev-parse', '--is-inside-work-tree') !== 'true') {
  console.error('Not inside a git repository.');
  process.exit(1);
}

const tracked = (git('ls-files') ?? '').split('\n').filter(Boolean);

// 1. .env is ignored by a .gitignore rule
const ignoreRule = git('check-ignore', '-v', '.env');
check('.env is ignored by .gitignore', ignoreRule !== null && ignoreRule !== '', ignoreRule ?? 'no rule matches .env');

// 2. .env is not tracked
check('.env is not tracked', !tracked.includes('.env'), 'run: git rm --cached .env');

// 3. No sensitive file types are tracked
const sensitive = tracked.filter((f) => /\.(db|sqlite|sqlite3|pem|key)$/i.test(f) || /^\.env\.(?!example$)/.test(f.split('/').pop() ?? ''));
check('No database, key or .env.* files tracked', sensitive.length === 0, sensitive.join(', '));

// 4. .env.example exists
check('.env.example exists', existsSync('.env.example'));

// 5. No secret-looking content in tracked text files
const patterns = [
  ['private key block', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['Google/Gemini API key', /AIza[0-9A-Za-z_-]{35}/],
  ['OpenAI/Anthropic-style key', /\bsk-[A-Za-z0-9_-]{20,}/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
  ['URL with embedded password', /\b[a-z][a-z0-9+.-]*:\/\/[^\s:@/"']+:[^\s@/"']{3,}@[^\s"']+/i],
];
const skip = /(^|\/)(package-lock\.json|node_modules\/|.*\.(png|jpg|jpeg|gif|ico|pdf)$)/i;
const self = 'scripts/verify-repo-safety.mjs';
const hits = [];
for (const file of tracked) {
  if (skip.test(file) || file === self) continue;
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { continue; }
  if (text.includes('\0')) continue;
  for (const [label, re] of patterns) {
    if (re.test(text)) hits.push(`${file} (${label})`);
  }
}
check('No secret-looking content in tracked files', hits.length === 0, hits.join('; '));

// 6. Staged changes contain no sensitive paths
const staged = (git('diff', '--cached', '--name-only') ?? '').split('\n').filter(Boolean);
const stagedBad = staged.filter((f) => /(^|\/)\.env(\..*)?$/.test(f) && !f.endsWith('.env.example'));
check('Staged changes contain no .env files', stagedBad.length === 0, stagedBad.join(', '));

let failed = 0;
for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${!r.ok && r.detail ? `\n      -> ${r.detail}` : ''}`);
  if (!r.ok) failed++;
}
console.log(failed === 0 ? '\nAll checks passed. Safe to commit.' : `\n${failed} check(s) failed. Do not push yet.`);
console.log('If a real credential was ever committed, rotate it: deleting it from the latest commit is not enough.');
process.exit(failed === 0 ? 0 : 1);