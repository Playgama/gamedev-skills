#!/usr/bin/env node
// The colours a game really uses, sampled from its pictures: for when its code has no theme to read them from.
//
//   node palette.mjs menu.png hud.png [more pictures or clips…]
//        [--crop x,y,w,h]   sample only that part of each picture (a HUD bar, a menu, a panel)
//        [--colors 8]       how many colours to look for
//
// Prints the colours from darkest to lightest with their share of the pixels, their contrast against the darkest one
// (4.5 or more reads as text on it) and their saturation, and marks the most common, the darkest, the lightest and the
// most saturated. Give each one its job yourself (references/game-look.md). A scene's lighting blends colours that the
// game's UI keeps apart, so sample its menus and HUD when you can. Needs ffmpeg on the PATH; a clip is read at frame 1.
import { execFileSync } from 'node:child_process';

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv.splice(i, 2)[1] : d; };
const K = +arg('colors', 8);
const crop = arg('crop');
if (!argv.length) { console.error('usage: node palette.mjs <picture or clip> [...] [--crop x,y,w,h] [--colors 8]'); process.exit(2); }

// every picture brought to 640 px wide without blending (thin UI text keeps its own colour), read as raw RGB and
// counted in buckets of 5 bits a channel
const [cx, cy, cw, ch] = crop ? crop.split(',').map(Number) : [];
const vf = (crop ? `crop=${cw}:${ch}:${cx}:${cy},` : '') + 'scale=640:-2:flags=neighbor';
const buckets = new Map();
let total = 0;
for (const f of argv) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-frames:v', '1', '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
    { maxBuffer: 1 << 26 });
  for (let i = 0; i + 2 < raw.length; i += 3) {
    const key = (raw[i] >> 3) << 10 | (raw[i + 1] >> 3) << 5 | (raw[i + 2] >> 3);
    const e = buckets.get(key) || buckets.set(key, [0, 0, 0, 0]).get(key);
    e[0] += raw[i]; e[1] += raw[i + 1]; e[2] += raw[i + 2]; e[3]++; total++;
  }
}
const pts = [...buckets.values()].map(([r, g, b, n]) => ({ c: [r / n, g / n, b / n], n }));

// k-means, seeded deterministically: the most common colour, then each time the colour farthest from those chosen
// (among colours holding at least 0.2% of the pixels), so a small bright accent gets a seed of its own
const d2 = (a, b) => 2 * (a[0] - b[0]) ** 2 + 4 * (a[1] - b[1]) ** 2 + 3 * (a[2] - b[2]) ** 2;
const pool = pts.filter((p) => p.n >= total * 0.002).length >= K ? pts.filter((p) => p.n >= total * 0.002) : pts;
let centers = [pool.reduce((a, b) => (b.n > a.n ? b : a)).c];
while (centers.length < Math.min(K, pool.length)) {
  let far = pool[0], fd = -1;
  for (const p of pool) { const d = Math.min(...centers.map((c) => d2(c, p.c))); if (d > fd) { fd = d; far = p; } }
  centers.push(far.c);
}
let groups = [];
for (let it = 0; it < 24; it++) {
  groups = centers.map(() => ({ s: [0, 0, 0], n: 0 }));
  for (const p of pts) {
    let bi = 0, bd = Infinity;
    centers.forEach((c, i) => { const d = d2(c, p.c); if (d < bd) { bd = d; bi = i; } });
    const g = groups[bi];
    g.s[0] += p.c[0] * p.n; g.s[1] += p.c[1] * p.n; g.s[2] += p.c[2] * p.n; g.n += p.n;
  }
  centers = groups.map((g, i) => (g.n ? g.s.map((v) => v / g.n) : centers[i]));
}

// WCAG contrast and HSV saturation
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
const contrast = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
const sat = (c) => { const mx = Math.max(...c), mn = Math.min(...c); return mx ? (mx - mn) / mx : 0; };
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

const cols = centers.map((c, i) => ({ c, share: groups[i].n / total })).filter((x) => x.share >= 0.003)
  .sort((a, b) => lum(a.c) - lum(b.c));
const darkest = cols[0], lightest = cols[cols.length - 1];
const common = cols.reduce((a, b) => (b.share > a.share ? b : a));
const vivid = cols.filter((x) => x.share >= 0.01).reduce((a, b) => (sat(b.c) > sat(a.c) ? b : a), darkest);
console.log('colour    share  contrast  saturation');
for (const x of cols) {
  const marks = [x === common && 'most common', x === darkest && 'darkest', x === lightest && 'lightest',
    x === vivid && sat(x.c) > 0.25 && 'most saturated'].filter(Boolean).join(', ');
  console.log(`${hex(x.c)}  ${(x.share * 100).toFixed(1).padStart(5)}%  ${contrast(x.c, darkest.c).toFixed(1).padStart(8)}  ` +
    `${(sat(x.c) * 100).toFixed(0).padStart(9)}%  ${marks}`);
}
