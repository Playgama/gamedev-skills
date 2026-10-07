#!/usr/bin/env node
// A smoke test of the skill's scripts on this machine, the one CI runs on Linux and Windows. It serves a tiny canvas
// game, films a second of it and a still, samples the still's colours, makes and lays out a draft voice, and makes a
// video folder.
//
//   npm i --no-save puppeteer      (or puppeteer-core with CHROME=/path/to/chrome)
//   node tests/smoke.mjs           (CHROME_ARGS="--no-sandbox" in a container or on Ubuntu 24.04)
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const scripts = path.join(root, 'skills', 'playgama-game-video', 'scripts');
const tmp = mkdtempSync(path.join(os.tmpdir(), 'pgv-smoke-'));
const run = promisify(execFile);
// the children run asynchronously, so this process keeps serving the game while Chrome films it
const node = (script, args) => run(process.execPath, [path.join(scripts, script), ...args], { cwd: root, maxBuffer: 1 << 24 })
  .then((r) => r.stdout);
const probe = (f, args) => run('ffprobe', ['-v', 'error', ...args, '-of', 'csv=p=0', f]).then((r) => r.stdout.trim());

const page = readFileSync(path.join(root, 'tests', 'game', 'index.html'));
const server = createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(page); });
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/`;
const ready = ['--ready', 'window.game && window.game.ready'];

let failed = 0;
const step = async (name, fn) => {
  try {
    const said = await fn();
    console.log(`ok    ${name}${said ? `: ${said}` : ''}`);
  } catch (e) {
    failed++;
    console.log(`FAIL  ${name}: ${String(e.stderr || e.message || e).trim().split('\n').slice(0, 4).join(' | ')}`);
  }
};

console.log(`smoke test on ${process.platform}, node ${process.versions.node}, in ${tmp}`);
await step('doctor', async () => (await node('doctor.mjs', []).catch((e) => e.stdout || '')).trim().split('\n').pop());
await step('film a clip', async () => {
  const out = path.join(tmp, 'clip.mp4');
  await node('film.mjs', ['--url', url, '--out', out, '--seconds', '1', '--size', '640x360', ...ready]);
  const n = parseInt(await probe(out, ['-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames']), 10);
  if (n !== 30) throw new Error(`${n} frames, not 30`);
  return `${n} frames`;
});
await step('film a still', async () => {
  await node('film.mjs', ['--url', url, '--out', path.join(tmp, 'still'), '--still', '0.5', '--size', '640x360', ...ready]);
  if (!existsSync(path.join(tmp, 'still-0.5s.png'))) throw new Error('no still-0.5s.png');
  return 'still-0.5s.png';
});
await step('palette', async () => {
  const out = await node('palette.mjs', [path.join(tmp, 'still-0.5s.png'), '--colors', '4']);
  if (!/#[0-9a-f]{6}/.test(out)) throw new Error(out);
  return out.trim().split('\n').slice(1).map((l) => l.slice(0, 7)).join(' ');
});
await step('draft voice', async () => {
  const lines = path.join(tmp, 'vo', 'lines.json');
  mkdirSync(path.dirname(lines), { recursive: true });
  writeFileSync(lines, JSON.stringify({ provider: 'draft', spoken: { Playgama: 'play-GAH-ma' }, lines: [
    { id: 'v1', at: 0.5, text: 'Every gate swaps the car.' }, { id: 'v2', at: 2.5, text: 'Play free on Playgama.' }] }));
  await node('voice.mjs', ['make', lines]);
  await node('voice.mjs', ['review', lines]);
  await node('voice.mjs', ['lay', lines, '--length', '5', '--out', path.join(tmp, 'audio')]);
  const d = +(await probe(path.join(tmp, 'audio', 'voice.wav'), ['-show_entries', 'format=duration']));
  if (Math.abs(d - 5) > 0.05) throw new Error(`voice.wav is ${d} s, not 5`);
  return `voice.wav ${d.toFixed(2)} s`;
});
await step('new video folder', async () => {
  const v = path.join(tmp, 'video');
  await node('new-video.mjs', [v, '--no-install']);
  for (const f of ['index.html', 'gsap.min.js', '.gitignore', 'clips', 'audio', 'fonts/OFL.txt']) {
    if (!existsSync(path.join(v, f))) throw new Error(`no ${f}`);
  }
  return 'index.html, gsap.min.js, folders';
});
server.close();
console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
