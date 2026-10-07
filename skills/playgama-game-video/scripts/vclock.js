// Virtual time for filming a web game frame by frame. Loaded before any page script (film.mjs injects it with
// puppeteer's evaluateOnNewDocument), it takes over the page's clocks, so time moves only when the filmer calls
// window.__vt.step(ms). One step per video frame gives perfectly even footage however slow the machine renders,
// at any resolution, with no dropped or doubled frames.
//   performance.now, Date.now        the virtual clock (Date.now: a settable base + the virtual time)
//   requestAnimationFrame            queued; each step runs the queue once, with the new time
//   setTimeout / setInterval         fired in order by the steps that pass their time
//   CSS animations and transitions   paused and moved on by the same steps (Web Animations API)
//   Math.random                      seeded (mulberry32), so a take repeats exactly
// Works for games driven by requestAnimationFrame and performance.now / Date.now: three.js, Phaser, PixiJS, Babylon,
// PlayCanvas, plain canvas. Web Audio keeps real time (film the picture; lay the game's sounds in the edit).
// Nothing here waits in real time: puppeteer's own waitForFunction polls with rAF, so the filmer polls from Node.
(() => {
  let now = 0, dateBase = 1759500000000, seed = 1;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  Math.random = rand;
  performance.now = () => now;
  Date.now = () => dateBase + now;

  let raf = [], rafId = 0;
  window.requestAnimationFrame = (cb) => { const id = ++rafId; raf.push({ id, cb }); return id; };
  window.cancelAnimationFrame = (id) => { raf = raf.filter((r) => r.id !== id); };

  let timers = [], tid = 0;
  const add = (cb, ms, a, every) => { const id = ++tid; timers.push({ id, at: now + Math.max(every ? 1 : 0, +ms || 0), cb, a, every }); return id; };
  window.setTimeout = (cb, ms, ...a) => add(cb, ms, a, 0);
  window.setInterval = (cb, ms, ...a) => add(cb, ms, a, Math.max(1, +ms || 0));
  window.clearTimeout = window.clearInterval = (id) => { timers = timers.filter((t) => t.id !== id); };

  const started = new WeakMap();
  const holdAnimations = () => {
    for (const a of document.getAnimations()) {
      if (!started.has(a)) started.set(a, now - (a.currentTime || 0));
      a.pause();
      a.currentTime = now - started.get(a);
    }
  };

  window.__vt = {
    get now() { return now; },
    seed(s) { seed = s | 0; },
    // Date.now() reads `ms` at this moment (a game that seeds itself from the date repeats)
    setDate(ms) { dateBase = ms - now; },
    step(ms) {
      const end = now + ms;
      for (;;) {
        let t = null;
        for (const q of timers) if (q.at <= end && (!t || q.at < t.at || (q.at === t.at && q.id < t.id))) t = q;
        if (!t) break;
        now = Math.max(now, t.at);
        if (t.every) t.at += t.every; else timers = timers.filter((q) => q !== t);
        try { typeof t.cb === 'function' ? t.cb(...t.a) : (0, eval)(String(t.cb)); } catch (e) { console.error(e); }
      }
      now = end;
      const q = raf; raf = [];
      for (const r of q) { try { r.cb(now); } catch (e) { console.error(e); } }
      holdAnimations();
      return now;
    },
  };
})();
