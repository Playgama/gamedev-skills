#!/usr/bin/env node
// The voice-over, one command per step: takes from ElevenLabs, OpenAI, Google Gemini or Cartesia (or a free system
// voice for a draft), a page to pick them by ear, and a voice track laid out at its times with the music ducked under it.
//
//   node voice.mjs keys [--init]       which keys it finds, and where (never the values). --init writes the key file
//                                      shared by every video, ~/.config/playgama-game-video/.env, to fill in
//   node voice.mjs make vo/lines.json [--takes 3] [--only v1,v4] [--provider openai] [--voice <id>] [--model <id>]
//                                      new takes -> vo/takes/<id>-<take>.<ext>, added after the ones already there
//   node voice.mjs review vo/lines.json
//                                      vo/review.html: every take with a player
//   node voice.mjs lay vo/lines.json --length 32.3 [--pick v1=2,v4=3] [--music audio/music.wav] [--out audio]
//                                      the picked takes (take 1 if not picked) at their times -> <out>/voice.wav, and
//                                      with --music, the music ducked under the voice -> <out>/music-ducked.wav
//
// vo/lines.json:
//   { "provider": "elevenlabs", "voice": "<voice id or name>", "model": "<optional>", "style": "<optional delivery note>",
//     "spoken": { "Playgama": "play-GAH-ma" },
//     "lines": [ { "id": "v1", "at": 3.5, "text": "This is Sky Shift: a race high above the sea." } ] }
// "text" is what captions show; the voice reads it with each "spoken" name swapped in ("say" on a line replaces it all).
// Keys: the environment first, then the shared key file, never a .env in the video's folder (HyperFrames reads that one,
// and with a Gemini or Google key its snapshot would send frames to Gemini). Needs Node 22+ and ffmpeg.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { OS, need, hint, KEY_FILE, findKey } from './system.mjs';

const [cmd, file] = process.argv.slice(2);
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };

const SERVICES = {
  elevenlabs: { key: 'ELEVENLABS_API_KEY', ext: 'mp3', model: 'eleven_multilingual_v2', voice: 'JBFqnCBsd6RMkjVDRZzb',
    keys: 'https://elevenlabs.io/app/developers/api-keys' },
  openai: { key: 'OPENAI_API_KEY', ext: 'mp3', model: 'gpt-4o-mini-tts', voice: 'cedar', keys: 'https://platform.openai.com/api-keys' },
  gemini: { key: 'GEMINI_API_KEY', ext: 'wav', model: 'gemini-3.8-flash-tts', voice: 'Charon', keys: 'https://aistudio.google.com/apikey' },
  cartesia: { key: 'CARTESIA_API_KEY', ext: 'mp3', model: 'sonic-3.6', voice: 'db6b0ed5-d5d3-463d-ae85-518a07d3c2b4',
    keys: 'https://play.cartesia.ai/keys' },
  draft: { key: null, ext: 'wav', model: '', voice: '' },
};

if (cmd === 'keys') {
  if (process.argv.includes('--init')) {
    if (existsSync(KEY_FILE)) console.log(`${KEY_FILE} is already there`);
    else {
      mkdirSync(path.dirname(KEY_FILE), { recursive: true });
      writeFileSync(KEY_FILE, Object.entries(SERVICES).filter(([, s]) => s.key)
        .map(([n, s]) => `# ${n}: create a key at ${s.keys}\n${s.key}=\n`).join('\n'), { mode: 0o600 });
      console.log(`wrote ${KEY_FILE}`);
    }
    console.log('open it in your editor and paste a key after the "=" of the service you use (not in a chat)');
  }
  for (const [n, s] of Object.entries(SERVICES)) {
    if (!s.key) continue;
    const k = findKey(s.key);
    console.log(`${n.padEnd(11)}${k ? `found in ${k.where}` : `not set (a key: ${s.keys})`}`);
  }
  process.exit(0);
}

if (!file || !['make', 'review', 'lay'].includes(cmd)) {
  console.error('usage: node voice.mjs keys [--init] | make|review|lay <lines.json> [options]'); process.exit(2);
}
need('ffprobe');
const cfg = JSON.parse(readFileSync(file, 'utf8'));
const dir = path.dirname(path.resolve(file));
const takesDir = path.join(dir, 'takes');
const provider = arg('provider', cfg.provider || 'elevenlabs');
const svc = SERVICES[provider];
if (!svc) { console.error(`unknown provider "${provider}": ${Object.keys(SERVICES).join(', ')}`); process.exit(2); }
// the file's voice and model belong to the file's provider; another provider on the command line starts from its own
const own = provider === (cfg.provider || 'elevenlabs');
const voice = arg('voice', own && cfg.voice) || svc.voice;
const model = arg('model', own && cfg.model) || svc.model;
const spoken = (l) => l.say || Object.entries(cfg.spoken || {}).reduce((t, [a, b]) => t.split(a).join(b), l.text);
const dur = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();
const num = (id, f) => parseInt(f.slice(id.length + 1), 10);
const takesOf = (id) => (existsSync(takesDir) ? readdirSync(takesDir) : [])
  .filter((f) => f.startsWith(id + '-') && !Number.isNaN(num(id, f))).sort((a, b) => num(id, a) - num(id, b));

const post = async (url, headers, body) => {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return r;
};
const bytes = async (r) => Buffer.from(await r.arrayBuffer());
// one take of one line; each returns the audio, or writes `out` itself
const SYNTH = {
  elevenlabs: async (key, text, near) => bytes(await post(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`, { 'xi-api-key': key },
    { text, model_id: model, voice_settings: cfg.settings || { stability: 0.5, similarity_boost: 0.8, style: 0.2, speed: 1.0 },
      // the lines around it keep the delivery even, on the models that take them
      ...(/^eleven_(multilingual|flash|turbo)/.test(model) ? { previous_text: near.prev, next_text: near.next } : {}) })),
  openai: async (key, text) => bytes(await post('https://api.openai.com/v1/audio/speech', { Authorization: `Bearer ${key}` },
    { model, voice, input: text, response_format: 'mp3', ...(cfg.style ? { instructions: cfg.style } : {}) })),
  gemini: async (key, text) => {
    const content = { type: 'text', text, ...(cfg.style ? { annotations: [{ type: 'speech_metadata', style: cfg.style }] } : {}) };
    const j = await (await post('https://generativelanguage.googleapis.com/v1beta/interactions', { 'x-goog-api-key': key },
      { model, input: [{ type: 'user_input', content: [content] }], response_format: { type: 'audio' },
        generation_config: { speech_config: [{ voice }] } })).json();
    const audio = (j.steps || []).filter((s) => s.type === 'model_output').flatMap((s) => s.content || [])
      .filter((c) => c.type === 'audio').pop();
    if (!audio) throw new Error('no audio in the reply: ' + JSON.stringify(j).slice(0, 300));
    return Buffer.from(audio.data, 'base64');
  },
  cartesia: async (key, text) => bytes(await post('https://api.cartesia.ai/tts/bytes',
    { Authorization: `Bearer ${key}`, 'Cartesia-Version': '2026-08-14' },
    { model_id: model, transcript: text, voice, language: cfg.language || 'en',
      output_format: { container: 'mp3', sample_rate: 44100, bit_rate: 128000 } })),
  // a system voice, free and offline, for timing the edit before paying for takes: macOS's say, Windows' own voices
  // (System.Speech, through PowerShell), espeak-ng on Linux
  draft: async (_, text, near, out) => {
    if (OS === 'macOS') {
      execFileSync('say', [...(voice ? ['-v', voice] : []), '--file-format=WAVE', '--data-format=LEI16@24000', '-o', out, text]);
    } else if (OS === 'Windows') {
      const q = (v) => `'${String(v).replace(/'/g, "''")}'`;
      execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
        'Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; ' +
        (voice ? `$s.SelectVoice(${q(voice)}); ` : '') + `$s.SetOutputToWaveFile(${q(out)}); $s.Speak(${q(text)}); $s.Dispose()`]);
    } else {
      try { execFileSync('espeak-ng', [...(voice ? ['-v', voice] : []), '-w', out, text]); } catch (e) {
        throw new Error(e.code === 'ENOENT' ? `espeak-ng is not installed: ${hint('espeak-ng')}` : String(e.message).split('\n')[0]);
      }
    }
    return null;
  },
};

if (cmd === 'make') {
  const key = svc.key ? findKey(svc.key) : { value: '' };
  if (!key) {
    console.error(`no ${svc.key}: create a key at ${svc.keys}, then run "node voice.mjs keys --init" and paste it into ${KEY_FILE}`);
    process.exit(1);
  }
  const only = new Set(arg('only', '').split(',').filter(Boolean));
  const N = +arg('takes', 1);
  mkdirSync(takesDir, { recursive: true });
  let failed = 0;
  for (const [i, line] of cfg.lines.entries()) {
    if (only.size && !only.has(line.id)) continue;
    const near = { prev: cfg.lines[i - 1] ? spoken(cfg.lines[i - 1]) : '', next: cfg.lines[i + 1] ? spoken(cfg.lines[i + 1]) : '' };
    const from = takesOf(line.id).reduce((m, f) => Math.max(m, num(line.id, f)), 0);
    for (let n = from + 1; n <= from + N; n++) {
      const out = path.join(takesDir, `${line.id}-${n}.${svc.ext}`);
      try {
        const audio = await SYNTH[provider](key.value, spoken(line), near, out);
        if (audio) writeFileSync(out, audio);
        // ~2.5 words a second, a breath between sentences: a take far past that usually repeated something
        const words = line.text.split(/\s+/).filter(Boolean).length;
        const want = words / 2.5 + 0.35 * Math.max(0, (line.text.match(/[.!?](\s|$)/g) || []).length - 1);
        const d = dur(out);
        console.log(`${path.basename(out)}  ${d.toFixed(2)} s${d > want * 1.45 ? `  long for ${words} words (~${want.toFixed(1)} s): listen for a repeat` : ''}`);
      } catch (e) { failed++; console.error(`${line.id}-${n}: ${e.message}`); }
    }
  }
  process.exit(failed ? 1 : 0);
}

if (cmd === 'review') {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const rows = cfg.lines.map((l) => {
    const takes = takesOf(l.id).map((f) => `<li><span>take ${num(l.id, f)} · ${dur(path.join(takesDir, f)).toFixed(2)} s</span>` +
      `<audio controls preload="none" src="takes/${encodeURIComponent(f)}"></audio></li>`).join('');
    return `<section><h2>${esc(l.id)}${l.at != null ? ` · at ${l.at} s` : ''}</h2><p>${esc(l.text)}</p><ol>${takes || '<li>no takes yet</li>'}</ol></section>`;
  }).join('\n');
  const page = path.join(dir, 'review.html');
  writeFileSync(page, `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Voice takes</title>
<style>
  body { font: 16px/1.5 system-ui, sans-serif; max-width: 760px; margin: 24px auto; padding: 0 16px; background: #111114; color: #eee; }
  h1 { font-size: 22px; } h2 { font-size: 14px; color: #9aa0a6; margin: 28px 0 4px; } p { margin: 0 0 8px; font-size: 18px; }
  ol { list-style: none; padding: 0; margin: 0; } li { display: flex; align-items: center; gap: 12px; margin: 6px 0; }
  li span { min-width: 130px; color: #9aa0a6; font-size: 14px; } audio { flex: 1; min-width: 0; }
  code { background: #222; padding: 2px 6px; border-radius: 4px; overflow-wrap: anywhere; }
</style></head><body>
<h1>Voice takes</h1>
<p>Listen to every take and pick one per line, then: <code>node voice.mjs lay ${esc(path.basename(file))} --pick ${cfg.lines.map((l) => `${esc(l.id)}=1`).join(',')} --length …</code></p>
${rows}
</body></html>
`);
  console.log(page);
}

if (cmd === 'lay') {
  const L = +arg('length', 0);
  if (!L) { console.error('--length <the video\'s length in seconds> is needed'); process.exit(2); }
  const pick = Object.fromEntries(arg('pick', '').split(',').filter(Boolean).map((p) => p.split('=')));
  const outDir = path.resolve(arg('out', 'audio'));
  mkdirSync(outDir, { recursive: true });
  const parts = cfg.lines.filter((l) => l.at != null).map((l) => {
    const f = takesOf(l.id).find((t) => num(l.id, t) === +(pick[l.id] || 1));
    if (!f) { console.error(`${l.id}: no take ${pick[l.id] || 1} in ${takesDir}`); process.exit(1); }
    return { l, f: path.join(takesDir, f), d: dur(path.join(takesDir, f)) };
  });
  parts.forEach((p, i) => {
    const nx = parts[i + 1];
    if (nx && p.l.at + p.d > nx.l.at) console.log(`${p.l.id} runs ${(p.l.at + p.d - nx.l.at).toFixed(2)} s into ${nx.l.id}: move ${nx.l.id} later or pick a shorter take`);
    if (p.l.at + p.d > L) console.log(`${p.l.id} runs past the end of the video`);
  });
  const voiceOut = path.join(outDir, 'voice.wav');
  const chains = parts.map((p, i) => `[${i}]aformat=sample_rates=48000:channel_layouts=stereo,adelay=${Math.round(p.l.at * 1000)}:all=1[a${i}]`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...parts.flatMap((p) => ['-i', p.f]), '-filter_complex',
    `${chains.join(';')};${parts.map((_, i) => `[a${i}]`).join('')}amix=inputs=${parts.length}:normalize=0,apad=whole_dur=${L},atrim=0:${L}`,
    voiceOut]);
  console.log(voiceOut);
  const music = arg('music');
  if (music) {
    // each HyperFrames <audio> plays at one volume, so the music is ducked here, under the voice, before it goes in
    const ducked = path.join(outDir, 'music-ducked.wav');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', music, '-i', voiceOut, '-filter_complex',
      `[0]aformat=sample_rates=48000:channel_layouts=stereo[m];[m][1]sidechaincompress=threshold=0.015:ratio=8:attack=25:release=350,apad=whole_dur=${L},atrim=0:${L}`,
      ducked]);
    console.log(ducked);
  }
}
