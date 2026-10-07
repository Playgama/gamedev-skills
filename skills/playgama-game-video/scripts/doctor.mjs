#!/usr/bin/env node
// Checks this machine for everything the skill uses, and says what to install for each missing piece, on macOS, Linux
// or Windows. Run it first, from the game's project or the video's folder.
//
//   node doctor.mjs                   Node, ffmpeg, puppeteer, Chrome and WebGL, the draft voice, the voice keys
//   node doctor.mjs --hyperframes     also runs `npx hyperframes@0.8.38 doctor` (its first run downloads ~370 MB)
//
// Exits 1 when something the skill can't work without is missing.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { OS, has, hint, loadPuppeteer, chromeArgs, launchHint, findKey, KEY_FILE } from './system.mjs';

const rows = [];
const check = (name, ok, detail, fix, required = true) => rows.push({ name, ok, detail, fix, required });

const node = process.versions.node;
check('Node.js 22+', +node.split('.')[0] >= 22, node, hint('node'));
check('ffmpeg', has('ffmpeg'), '', hint('ffmpeg'));
check('ffprobe', has('ffprobe'), '', hint('ffmpeg'));

const pp = await loadPuppeteer();
if (!pp) check('puppeteer', false, 'not next to the scripts or in this folder', `in the game's project: ${hint('puppeteer')}`);
else if (pp.name === 'puppeteer-core' && !process.env.CHROME) check('puppeteer', false, 'puppeteer-core without CHROME', 'set CHROME=/path/to/chrome, or npm i puppeteer');
else {
  check('puppeteer', true, pp.name);
  try {
    const browser = await pp.lib.launch({ headless: true, ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}),
      args: chromeArgs() });
    const page = await browser.newPage();
    const gl = await page.evaluate(() => { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); });
    await browser.close();
    check('Chrome starts', true, '');
    check('WebGL in Chrome', gl, gl ? '' : 'none', 'without a GPU: CHROME_ARGS="--enable-unsafe-swiftshader"', false);
  } catch (e) {
    check('Chrome starts', false, String(e.message || e).split('\n')[0].slice(0, 110), launchHint());
  }
}

const draft = OS === 'macOS' ? has('say', ['-v', '?'])
  : OS === 'Windows' ? has('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', 'Add-Type -AssemblyName System.Speech'])
  : has('espeak-ng', ['--version']);
check('draft voice', draft, OS === 'macOS' ? 'say' : OS === 'Windows' ? 'System.Speech' : 'espeak-ng',
  OS === 'Linux' ? hint('espeak-ng') : '', false);

const keys = ['ELEVENLABS_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY', 'CARTESIA_API_KEY'].filter((k) => findKey(k));
check('voice keys', keys.length > 0, keys.length ? keys.map((k) => k.replace('_API_KEY', '').toLowerCase()).join(', ') : 'none',
  `only for a generated voice: node voice.mjs keys --init, then paste a key into ${KEY_FILE}`, false);
if (['GEMINI_API_KEY', 'GOOGLE_API_KEY'].some((k) => process.env[k]) || existsSync('.env')) {
  check('footage stays here', false, 'a Gemini/Google key or a .env is in reach of HyperFrames',
    'pass --describe false to every hyperframes snapshot', false);
}
if (existsSync('index.html')) check('gsap.min.js', existsSync('gsap.min.js'), 'beside index.html', 'node new-video.mjs makes a video folder with it');

for (const r of rows) {
  console.log(`${r.ok ? 'ok  ' : r.required ? 'NO  ' : 'warn'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
  if (!r.ok && r.fix) console.log(`        -> ${r.fix}`);
}
if (process.argv.includes('--hyperframes')) {
  try { execFileSync('npx', ['--yes', 'hyperframes@0.8.38', 'doctor'], { stdio: 'inherit', shell: OS === 'Windows' }); } catch { /* it prints its own */ }
}
const missing = rows.filter((r) => !r.ok && r.required);
console.log(missing.length ? `\n${missing.length} to fix on ${OS} before filming.` : `\nReady on ${OS}.`);
process.exit(missing.length ? 1 : 0);
