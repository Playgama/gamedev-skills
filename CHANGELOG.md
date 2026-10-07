# Changelog

## 1.1.0: 2026-10-07

Tested end to end: the published repository, downloaded fresh, made a 32-second trailer of SKY SHIFT in the game's
own look. What the test changed:

- `voice.mjs`, the voice-over in one command per step: takes from ElevenLabs (recommended), OpenAI, Google Gemini or
  Cartesia, or a free draft voice; keys set once in `~/.config/playgama-game-video/.env` and never printed; a page
  to pick takes by ear; the voice track laid out at its times with the music ducked under it.
- `film.mjs` says why a game never got ready: the error the `--ready` expression last threw.
- Filming: scout a whole run at low resolution first, then film one long take and play the shots from it.
- Music: start the track so its lift lands as the game appears after the sting.

Works on macOS, Linux and Windows:

- `doctor.mjs` checks the machine (Node, ffmpeg, puppeteer, Chrome and WebGL, the draft voice, the voice keys) and says
  what to install on that system.
- `new-video.mjs` makes the video's folder (the template, `gsap.min.js`, puppeteer) without shell commands.
- `film.mjs` finds puppeteer in the folder it runs from, checks ffmpeg first, and takes Chrome flags (`--chrome-args`,
  `CHROME_ARGS`) for Linux servers. The draft voice uses Windows' own voices, or espeak-ng on Linux.
- Install steps for each system, in Bash and PowerShell, and a smoke test (`tests/smoke.mjs`) that CI runs on Ubuntu and
  Windows. Tested here on macOS and in Debian 12 on ARM.

Fixed after a fresh-eyes review:

- Node 22+ everywhere: HyperFrames 0.8.38 won't start on older Node.
- Footage stays on the machine: every `snapshot` runs with `--describe false`, and voice keys stay out of the video's
  folder (HyperFrames reads a `.env` there).
- `data-media-start` plays a shot straight from a long take, so there is nothing to cut.
- Keyboard input goes to the document, and the `--each` example keeps its state on `window`.
- The sting's shine tilts as on the reviewed page, in the template and the preview too. The sting can start after a
  cold open (`S` in the template).
- One size, 1920x1080, with `--resolution 4k` for a 4K master. The first-frame rule now says which videos open on
  gameplay.

## 1.0.0: 2026-10-07

The first release.

- `playgama-game-video`: makes a video about a web game in the game's own look, opening on the Playgama AI sting. It
  films real gameplay frame by frame, takes the game's colours and fonts, writes the script from what really
  happened, and renders with HyperFrames.
- Installs as a Claude Code plugin (`/plugin install gamedev-skills@playgama`) or by copying the skill's folder into
  any agent that reads Agent Skills.
