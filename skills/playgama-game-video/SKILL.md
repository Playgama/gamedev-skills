---
name: playgama-game-video
description: Make a promo, trailer, devlog or "how I made it" video about a web game, in the game's own look, opening on the Playgama AI logo sting. It shows real gameplay filmed frame by frame, the real prompts and agent steps as on-screen cards, a voice-over, music and an end card, all in the game's own colours, fonts and UI. Use this whenever a game developer wants any video about their game for YouTube, Shorts, TikTok, Reels, a landing page or a Playgama listing, especially a game made with an AI agent or published through Playgama MCP or the Playgama Bridge SDK. Use it even when they only say "make a trailer", "record gameplay for a video", "a short about my game" or "a video of how I built this", and whenever they need the Playgama AI logo or its intro animation.
license: Apache-2.0 (the Playgama AI logo and sting are not covered; see TRADEMARKS.md in github.com/Playgama/gamedev-skills)
---

# Making a video about a game

This is how we make videos about games for Playgama. The video looks like the game, not like Playgama: its colours,
fonts, panels and sound. Playgama adds its logo (a 3-second sting at the start and a small bug in the corner) and the
link. The rest of the work is in three places: the story is true and specific, the gameplay is filmed cleanly, and the
first second earns the next one.

The bundled files:

| File | What it is |
|---|---|
| `assets/playgama-ai-logo.svg`, `.png` | The official Playgama AI logo (591×133): a purple pill with the playgama wordmark, and a grey box flush against it with "AI" cut out. The PNG is 4x, transparent |
| `assets/template/` | A starter HyperFrames video, 1920x1080: the sting, three gameplay slots, a title, an end card, music and voice tracks. One theme block at the top holds the game's look |
| `assets/sting-preview.mp4` | The intro animation as it should look, handing over to a placeholder where the game's video starts |
| `assets/sting.html` | The intro animation alone, in plain CSS (7 KB, no libraries): drop it into any page or video tool |
| `assets/playgama-ai-sting.html` | The same animation as a review page with play, speed and scrub controls, and the timeline and colours spelled out. Open it in a browser and drop a screenshot of the game on it to see the logo over the game, or hand it to a designer |
| `scripts/film.mjs`, `scripts/vclock.js` | Film any web game frame by frame into a smooth MP4 at any size |
| `scripts/doctor.mjs`, `scripts/new-video.mjs` | Check the machine and say what to install; make the video's folder (template, gsap, puppeteer) |
| `scripts/palette.mjs` | The colours a game uses, sampled from its screenshots, for when its code has no theme |
| `scripts/voice.mjs` | The voice-over: takes from ElevenLabs, OpenAI, Gemini or Cartesia (or a free draft voice), a page to pick them by ear, and the voice track with the music ducked under it |
| `references/story-and-script.md` | Formats, beat sheets with real example lines, rules for on-screen material |
| `references/game-look.md` | Taking the game's look: where to find it, colours, type, panels, motion, sound, the template's theme |
| `references/filming.md` | How to film takes: readiness, setup and per-frame scripts, choosing moments, the first frame |
| `references/voice-and-music.md` | Voice-over (text-to-speech or your own), pronouncing "Playgama", checking takes, music levels |
| `references/edit-and-render.md` | Assembling in HyperFrames: the template, cards, vertical cuts, checks, rendering, review |

## What you need

It works the same on macOS, Linux and Windows.
1. `node scripts/doctor.mjs` checks the machine and says what to install on it.
2. `node scripts/new-video.mjs <folder>` makes the video's folder: the template, `gsap.min.js`, and puppeteer for
   filming. Run every later command from that folder.

- **To film:** Node 22+ (HyperFrames needs it), ffmpeg and ffprobe on the PATH, and puppeteer. `film.mjs` finds it in
  the folder it runs from, or next to the script. The game must run from a URL: a dev server, or a static server over
  the build.
- **To assemble and render:** HyperFrames (`npx hyperframes@0.8.38`; its first run downloads about 370 MB of packages
  and a headless browser).
- **For the voice, if not your own:** a key for ElevenLabs, or for another service `scripts/voice.mjs` works with,
  set once (`references/voice-and-music.md`), and Whisper or another speech-to-text to check the takes.
- **For music:** an instrumental track you are allowed to use.

## The workflow

Work in this order. Each step feeds the next, and the two approval points save hours.

1. **Agree on the video.** Settle the format, length and goal before anything else (table below). Ask what the video is
   for: players, a store page, other developers, or Playgama's challenge or catalog.
2. **Collect the true story.** Gather the real prompts, timestamps, commits, bugs, numbers and screenshots
   (`references/story-and-script.md`). If the game was built with an AI agent, its chat history is the richest source:
   read it, and note times and exact quotes.
3. **Take the game's look** (`references/game-look.md`): its colours, fonts, panels, logo, music and UI sounds, from
   its own files first. Write them into the template's theme block.
4. **Write the script, then stop for approval.** Write voice lines and what is on screen, one row each. The developer
   approves the wording and the look before any voice is made: rewording a recorded voice means recording it again.
5. **Film the gameplay and take the screenshots** with `scripts/film.mjs` at the delivery size (see "Pictures of the
   game" below, and `references/filming.md`). Plan one take per beat of the script, a few seconds each, staged with
   the game's own controls or debug hooks.
6. **Make the stills** in the game's look. Use real code with real line numbers, the real prompt and the agent's
   steps, web pages, and the covers.
7. **Record the voice and pick music** (`references/voice-and-music.md`, `scripts/voice.mjs`). A human listens to the voice takes, because
   text-to-speech fails in ways no transcript catches.
8. **Assemble and render** with the template (`references/edit-and-render.md`). Run the checks, render, pull a frame
   every few seconds and look at every one before calling it done.
9. **Package it:** a thumbnail (1280x720, the game's best frame, at most 4 huge words in its own font), a title and a
   description with the game's link.

## Pick the format first

| Video | Shape | Length | Opens on |
|---|---|---|---|
| Short / Reels / TikTok | 9:16, 1080x1920 | 15–35 s | **gameplay in the first frame**; the logo as a small corner bug only |
| Trailer / promo | 16:9, 1920x1080 | 30–90 s | the sting (3 s), then the best gameplay |
| "How I made it" story | 16:9 | 3–6 min | gameplay with the hook line, then the sting or a title |
| Tutorial ("publish with Playgama MCP") | 16:9 | 1–3 min per part | the sting, then the result first and the steps after |

A Short is decided in its first second, when the viewer stays or swipes away. Shorts that open on full-screen gameplay
that reads at a glance keep far more viewers than ones that open on something to read (a long comment card, game
menus, a chat box). So a Short never opens on the sting or on text.

## The game's look

The video looks like the game: anyone who has played it should know it from any frame. Take the look from the game
itself, not from Playgama (`references/game-look.md`):
- **Colours** from its UI and code: a background, a panel, text, a button and a highlight. When the code has no theme,
  sample its menus and HUD with `scripts/palette.mjs`.
- **Type:** every font matches the game, the code font included.
  - Titles go in its title or logo font, labels and prompts in its UI or text font.
  - Code and tool calls go in a monospace in its spirit: a pixel one for pixel art, a typewriter one for a dark or
    retro game.
  - The template's DM Mono only holds their places.
- **Panels and buttons:** cards shaped like its panels, the end card's button like its main button, its own icons and
  logo.
- **Motion and sound:** move the way its UI moves (bouncy, calm, or in pixel steps). Use its own music and UI sounds
  first.
- **Cards over pictures, not black slides.** Put a prompt or a step over a darkened frame of the game, and a title low
  over the gameplay with the bottom darkened in the game's background colour. Prefer real pictures side by side to
  cards with only names on them.

The colours, fonts and panel shape go into one theme block at the top of the template's style.

## Pictures of the game

The kit ships no game footage. Every picture of the game is filmed from the developer's own game, by you, with
`scripts/film.mjs` (`references/filming.md`). That covers the video, the thumbnail, the frame behind a card and the
review pages.
- **Clips:** one take per beat, for example
  `node scripts/film.mjs --url http://localhost:5173 --out clips/gameplay-1.mp4 --seconds 6`.
- **Screenshots:** the same command with `--still <seconds>` writes one PNG of that moment instead. Take one whenever a
  step needs a picture of the game:
  - its menus and HUD, to read its look from (`scripts/palette.mjs`);
  - the frame behind a prompt card or a title;
  - the thumbnail and the end card;
  - the sting over the game, to check that the corner bug clears its HUD. Drop the screenshot on
    `assets/playgama-ai-sting.html`, or put the first clip in the template and run
    `npx hyperframes@0.8.38 snapshot . --at 3.5 --describe false`.
- **Vertical cuts** are filmed at 1080x1920, with the game's camera reframed for it.
- **If the game can't run here** (a native build, a login wall, an online-only game), ask the developer for screen
  recordings and screenshots at the delivery size, with no cursor or notifications on screen. Never fill a gap with
  pictures of another game, a store page or this kit's examples.

## What Playgama adds

Its logo and the link, nothing else. Playgama's purple and dark plate belong to the logo and the sting, not to the
video.
- **The logo** is `assets/playgama-ai-logo.svg`, the official file: a purple `#9747ff` pill with the white wordmark,
  and a grey `#d2d2d2` box with "AI" cut out of it.
  - Use it as it is: don't recolour it, stretch it, add effects, change its gaps or redraw it.
  - The "AI" is a hole, so it shows whatever is behind the logo.
  - Give it clear space of at least half the pill's height.
  - As a corner bug it is about 200 px wide on a 1920 frame. If the game's own HUD sits in that corner, move the bug
    to another corner rather than covering the HUD (`references/edit-and-render.md`).
- **The link** to Playgama goes to the game's own page there: on the end card and in the description.

## The intro sting

Playgama's ident, like a publisher's logo before a trailer: about 3 seconds, ready-made in
`assets/template/index.html`. It keeps its own colours and timing in every video; everything after it is the game's.
`assets/sting-preview.mp4` shows it handing over to a placeholder. To see it over the developer's game, take a
screenshot or a clip of the game (see "Pictures of the game").

- **Build:** on onyx with a soft purple glow, the purple pill grows out from its centre (0.05 s, over 0.55 s). The
  white playgama wordmark wipes in left to right (0.42 s). The grey box pops in flush against the pill (0.92 s), and
  "A" and "I" are cut out of it (1.12 s, 1.27 s). A band of light crosses the pill (1.55 s).
- **Hand-off:** the whole logo flies to the top-right corner at 19% size, 39 px from the top and the right of a
  1920×1080 frame (2.75 s, over 0.62 s). It stays there as the bug while the gameplay fades up underneath (3.0 s).
- **The parts** are drawn from the official file's own shapes at 240 px tall, so the sting ends on exactly the logo.
- **Change:** keep its timing. To put a cold open first (a story), start the sting later: set `S` in the template
  (`references/edit-and-render.md`). For a 9:16 cut, drop the build and start the bug in the corner from frame one.

## Rules that came from mistakes

- **Only real material on screen.**
  - Show real prompts, real numbers, real timestamps and real code.
  - If a number has to be illustrative, say so on screen ("EXAMPLE DATA") the whole time it shows.
  - Never invent a quote, a comment, a player count or a review. Viewers who check a made-up number stop trusting the
    rest.
- **Prompts on screen are the developer's words.**
  - Translate them into the video's language, but don't reword them.
  - Cut a long one with "[…]" rather than paraphrasing it.
  - Agent steps are the real tool calls in their real order, for example `create_application` →
    `start_archive_upload` → `get_archive_status` (PASSED) → `publish_sandbox` (a public link).
- **Your own art only.** Show no other game's characters, logo or art, even when your game is "like" it: name the
  genre instead ("a horror escape game"), not another game.
- **Playgama is said "play-GAH-ma".** English voices say "play-GAY-ma" unless you steer them
  (`references/voice-and-music.md`).
- **Check every voice take** against its text (a transcript), and have a person listen. Text-to-speech has repeated a
  sentence, added one nobody wrote, read its own instructions aloud and swallowed a last syllable, each in a take that
  sounded fine on its own.
- **The first gameplay frame reads in under a second, not a menu or a loading screen.**
  - A Short opens on it. A trailer or a story reaches it straight after the sting or the cold open.
  - Film the best moment, not the beginning of a level.
  - Text in the first two seconds of gameplay: at most four huge words.
- **Footage stays on the machine.** HyperFrames' `snapshot` sends frames to Gemini for a description whenever a
  Gemini or Google key is set, and it reads a `.env` in the video's folder. Pass `--describe false` to every
  `snapshot`, and keep voice keys in `voice.mjs`'s shared key file, not in the video's folder.

## When you're done

The developer gets:
- the master MP4, and a smaller preview if it's large;
- the thumbnail;
- a text file with the title, the description (the game's link, chapters for long videos, #playgama) and a comment to
  pin.

Tell them where each file is and what is still theirs to decide: posting time, a voice take they haven't heard, and
anything you could not check.
