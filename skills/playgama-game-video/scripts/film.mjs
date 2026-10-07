#!/usr/bin/env node
// Film a web game frame by frame into an MP4, at any size, perfectly smooth (scripts/vclock.js owns the page's clocks).
//
//   node film.mjs --url http://localhost:5173 --out clips/gameplay-1.mp4 --seconds 6
//        [--size 1920x1080 | 2560x1440 | 1080x1920]   the frame (default 1920x1080)
//        [--fps 30]
//        [--ready "window.game && window.game.isReady"] JS that is true once the game can be played (default: 1 s after load)
//        [--setup take-setup.js]   JS run once in the page when it is ready: start a level, place the player, hide the HUD…
//        [--each take-each.js]     JS run before every frame, with `t` = seconds since filming began: press keys, steer, aim…
//        [--pre 2]                 seconds the game runs before the first frame is kept (menus fading, things settling)
//        [--still 3.5]             write one PNG of that moment instead of a clip (test a take quickly)
//        [--seed 7]                Math.random's seed, so a take repeats exactly
//
// Needs Node 18+, ffmpeg on the PATH and puppeteer (npm i puppeteer), or puppeteer-core with CHROME=/path/to/chrome.
// The game must run from a URL (a local dev server or a static server over the build). No sound is recorded: lay the
// game's own sound files in the edit, at the moments the picture shows.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const url = arg('url');
if (!url) { console.error('usage: node film.mjs --url <game url> --out <clip.mp4> --seconds <s> [options]'); process.exit(2); }
const out = path.resolve(arg('out', 'clip.mp4'));
const [W, H] = arg('size', '1920x1080').split('x').map(Number);
const FPS = +arg('fps', 30), SEC = +arg('seconds', 6), PRE = +arg('pre', 0), STILL = arg('still');
const read = (f) => (f ? readFileSync(path.resolve(f), 'utf8') : '');
const setup = read(arg('setup')), each = read(arg('each'));
const readyExpr = arg('ready', '');

let puppeteer;
try { puppeteer = (await import('puppeteer')).default; } catch { puppeteer = (await import('puppeteer-core')).default; }
const browser = await puppeteer.launch({
  headless: true,
  ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}),
  args: ['--hide-scrollbars', '--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required',
    ...(process.platform === 'darwin' ? ['--use-angle=metal'] : [])],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.evaluateOnNewDocument(readFileSync(path.join(here, 'vclock.js'), 'utf8'));
await page.goto(url, { waitUntil: 'domcontentloaded' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const step = () => page.evaluate((ms) => window.__vt.step(ms), 1000 / FPS);
// loading happens in real time; the game's clock moves one frame per pump until it is ready
let ready = false;
for (let i = 0; i < 6000 && !ready; i++) {
  await step(); await sleep(15);
  ready = readyExpr ? await page.evaluate(`!!(${readyExpr})`).catch(() => false) : i >= FPS;
}
if (!ready) { console.error('the game never got ready (check --ready)'); await browser.close(); process.exit(1); }
await page.evaluate((s) => { window.__vt.seed(s); window.__vt.setDate(1759500000000 + s); }, +arg('seed', 7));
if (setup) await page.evaluate(setup);
const tick = (t) => (each ? page.evaluate(`((t) => { ${each} })(${t})`) : null);
for (let i = 0, n = Math.round(PRE * FPS); i < n; i++) { await tick((i - n) / FPS); await step(); }

mkdirSync(path.dirname(out), { recursive: true });
if (STILL) {
  for (let i = 0, n = Math.round(+STILL * FPS); i < n; i++) { await tick(i / FPS); await step(); }
  const png = out.replace(/\.mp4$/, '') + `-${STILL}s.png`;
  writeFileSync(png, await page.screenshot({ type: 'png' }));
  console.log(png);
} else {
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-crf', '15', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const N = Math.round(SEC * FPS);
  for (let i = 0; i < N; i++) {
    await tick(i / FPS);
    await step();
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 30 === 0) process.stdout.write(`frame ${i}/${N}\r`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log(`${out}  ${N} frames at ${W}x${H}`);
}
if (errors.length) console.log([...new Set(errors)].slice(0, 10).join('\n'));
await browser.close();
