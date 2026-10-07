# Filming the game

Screen recorders drop frames, and a heavy WebGL game at 1440p rarely holds 60 fps while being captured.
`scripts/film.mjs` films frame by frame instead.
- `scripts/vclock.js` takes over the page's clocks (`requestAnimationFrame`, `performance.now`, `Date.now`, timers,
  CSS animations, `Math.random`).
- The filmer moves time one video frame at a time and takes a screenshot of each frame.
- The result is perfectly smooth at any size, however slow the machine.

## Setup

```bash
npx serve dist -l 5173     # or the game's own dev server
node scripts/film.mjs --url http://localhost:5173 --out clips/gameplay-1.mp4 --seconds 6 --size 1920x1080 \
  --ready "window.game && window.game.ready" --setup takes/start.js --each takes/walk.js --pre 2
```

Run it from the video's folder (on Windows, PowerShell puts the line breaks with a backtick, or keep it on one line).
- **Puppeteer:** `film.mjs` finds it in the folder it runs from (`new-video.mjs` installs it there), or next to the
  script. Or use puppeteer-core with `CHROME=/path/to/chrome`. `doctor.mjs` says what is missing.
- **On a Linux server:** `--chrome-args "--no-sandbox"` (or `CHROME_ARGS`) in a container or under Ubuntu 24.04's
  AppArmor, and `--enable-unsafe-swiftshader` for WebGL without a GPU.
- `--ready` is a JavaScript expression that is true once the game can be played. Without it, filming starts 1 s after
  load. Loading itself runs in real time while the clock ticks.
- `--setup` is a file run once when the game is ready: start a level, place the player, open a door, hide a tutorial.
- `--each` is a file run before every frame, with `t` in seconds since filming began: hold keys, steer, aim, trigger
  events at moments.
- `--pre` runs the game that many seconds before the first kept frame: a day card fading, physics settling.
- `--still 3.5` writes one PNG at 3.5 s instead of a clip. Use it to frame a take before filming it.
- `--seed` sets `Math.random`'s seed, so the same take repeats exactly.

## Driving the game

A take is easiest to direct through the game's own objects.
- **Expose a handle in development builds.** For example, `window.game = game`, or the scene, the player and the
  input.
- **Write to what the game reads.** Set the input object's keys, the player's position, the camera's yaw. Don't try
  to simulate a person.
- **Keyboard and mouse events** work from `--each` too. Send them where the game listens: from the document they
  reach document and window listeners, and a listener on the canvas needs the canvas:
  `document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w', bubbles: true }))`.

Some examples:
- **Steer toward a point:** each frame, turn the yaw a little toward `atan2(dx, dz)` and hold "forward". Limit the turn
  rate so the camera pans smoothly.
- **Make an enemy act on cue:** in `--setup`, switch off its senses (so it doesn't chase or catch), then give it goals
  at moments in `--each`. Keep state on `window`, because the script runs anew every frame:
  `if (t > 1 && !window.sent) { enemy.goTo(x, z); window.sent = true }`.
- **Bot or autopilot modes** (`?bot`, an AI driver) are perfect for long continuous takes. Filming them frame by frame
  makes them deterministic.
- **Unity WebGL builds** run on `requestAnimationFrame` too. Drive them with
  `unityInstance.SendMessage('Object', 'Method', 'arg')` from setup and each.

## Choosing the takes

- **Scout first.** Film one quick pass of a whole run at 960x540 and lay it out as a contact sheet:
  `ffmpeg -i scout.mp4 -vf "fps=1/2,scale=320:-2,tile=6x4" sheet.png`. Pick the moments from the sheet.
  - A run filmed this way repeats: the same URL, `--seed` and `--pre` put the same moment at the same second.
  - So the moments land in the real takes where the scout showed them.
- **One take per beat of the script**, 4–10 s each. Film 1–2 s more than the shot needs, because the edit stretches
  shots to fit the voice.
  - Start a take at its moment with `--pre <seconds>`. `t` in `--each` counts from the first kept frame, so timed
    inputs move with the start.
  - With a bot or an autopilot, one continuous take at the delivery size can give every shot instead. The edit plays
    each shot from it with `data-media-start` (`edit-and-render.md`).
- **Film the moment, not the level's start.** Film the wow: the boss, the jump, the chase, the escape, the funny fail.
  Skip menus and loading screens unless the beat is about them.
- **Decide the HUD on purpose.**
  - The game's HUD makes it look real.
  - A clean take without the HUD makes a better thumbnail and a quieter background for titles.
  - Film both when unsure.
- **Make the first frame of the video count.**
  - It must read in under a second, as "this is a game, and something is happening".
  - Full-screen action holds viewers.
  - Text, menus, blurred backgrounds and chat windows lose them.
- **Leave the catch out.** Don't film jump scares, flashes or anything a portal's rules forbid. A promo works without
  them.
- **Film at the delivery size.**
  - 1920x1080 for 16:9, the template's size (3840x2160 for a 4K render).
  - 1080x1920 for vertical. Reframe the game's own camera for vertical rather than cropping a 16:9 take: a crop
    loses the HUD and the subject.

## Sound

`film.mjs` records no sound (Web Audio keeps real time). Lay the game's own sound files in the edit at the moments
the picture shows them: a door, a shot, a creak, a jingle. Real game sound under real gameplay sells it.

## Stills

- **The game itself.** `--still <s>` with the take's own `--setup` and `--each` writes one PNG of that moment at
  `--size`: `--out stills/menu --still 2` writes `stills/menu-2s.png`.
  - Take them for the thumbnail, the frame behind a card or a title, the end card, and the menus and HUD that give
    the game's look (`game-look.md`).
  - Shoot a thumbnail at 2560x1440 or larger, so it can be cropped.
- **Code:** render the real file in a code page in the game's look (its code font and colours, line numbers), take a
  2560x1440 screenshot, and box the lines the voice talks about.
- **Test output, prompts and agent messages:** copy them exactly into a terminal-style or chat-style page and
  screenshot it. Never retype them from memory.
- **Web pages** (your game's Playgama page, a challenge page): a 2x screenshot at 1280x720 CSS size gives a sharp
  2560x1440.

## Pitfalls

- **Physics or game time in a Web Worker** keeps its own clock. Step it from the main thread in development builds,
  or film in real time with a screen recorder as a fallback.
- **A game that times itself by the audio clock** (`AudioContext.currentTime`) won't follow the virtual clock. Give it
  a development switch that uses `performance.now()`.
- **A take that looks wrong on frame 1** usually means the run-up was too short. Raise `--pre` so menus have faded
  and the camera has settled.
