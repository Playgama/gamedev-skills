#!/usr/bin/env node
// A new video folder from the skill's template, the same on macOS, Linux and Windows: the template (index.html, the
// fonts, a .gitignore), gsap.min.js, puppeteer for filming, and empty clips/, audio/, vo/ and stills/ folders.
//
//   node new-video.mjs my-game-video [--no-install]     --no-install leaves puppeteer out
//
// Run every later command from that folder: film.mjs finds puppeteer there.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { OS, hint } from './system.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const dest = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dest) { console.error('usage: node new-video.mjs <new folder>'); process.exit(2); }
const out = path.resolve(dest);
if (existsSync(out) && readdirSync(out).length) { console.error(`${out} is not empty: pick a new folder`); process.exit(1); }

cpSync(path.join(here, '..', 'assets', 'template'), out, { recursive: true });
for (const d of ['clips', 'audio', 'vo', 'stills']) mkdirSync(path.join(out, d), { recursive: true });

const GSAP = 'https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js';
try {
  const r = await fetch(GSAP);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const js = Buffer.from(await r.arrayBuffer());
  if (js.length < 50000) throw new Error('the file came back too small');
  writeFileSync(path.join(out, 'gsap.min.js'), js);
} catch (e) {
  console.error(`gsap.min.js didn't download (${e.message}): save ${GSAP} into ${out} by hand`);
}

// puppeteer and its Chrome, in the video's folder. Chrome for Testing has no Linux ARM build: there, the system's
// Chromium with puppeteer-core does it
if (process.argv.includes('--no-install')) console.log('puppeteer left out (--no-install)');
else if (OS === 'Linux' && process.arch === 'arm64') console.log(`on Linux ARM, in ${out}: ${hint('puppeteer')}`);
else {
  console.log('installing puppeteer and its Chrome into the folder (about 150 MB, once)…');
  const npm = (args) => execFileSync('npm', args, { cwd: out, stdio: 'inherit', shell: OS === 'Windows' });
  try {
    if (!existsSync(path.join(out, 'package.json'))) writeFileSync(path.join(out, 'package.json'), '{ "private": true }\n');
    npm(['i', '-D', '--no-audit', '--no-fund', 'puppeteer']);
  } catch { console.error(`puppeteer didn't install: in ${out}, ${hint('puppeteer')}`); }
}

console.log(`${out}
next, from that folder:
  1. fill THE GAME'S LOOK at the top of index.html (references/game-look.md)
  2. film into clips/ (scripts/film.mjs), voice into audio/ (scripts/voice.mjs)
  3. npx hyperframes@0.8.38 check .
  4. npx hyperframes@0.8.38 render . -o renders/video.mp4 --quality high`);
