<img src="assets/playgama-ai-logo.png" alt="Playgama AI" width="280">

# playgama-game-video

An agent skill that makes a video about your web game: a trailer, a Short, a devlog or a "how I made it" story.

Your AI coding agent films real gameplay frame by frame, writes the script from what really happened, and builds the
video in your game's own look: its colours, its fonts, its panels and its sound. The video opens on the Playgama AI
sting, and the logo stays small in a corner.

The skill uses the open [Agent Skills](https://agentskills.io) format. The same folder works in Claude Code, Codex,
Cursor, Gemini CLI, GitHub Copilot and other agents that read skills.

## Made this way

[![How to Make a Game with AI: from a 3D Model to Playgama](https://img.youtube.com/vi/KGID1fQxtxM/maxresdefault.jpg)](https://www.youtube.com/watch?v=KGID1fQxtxM)

[How to Make a Game with AI: from a 3D Model to Playgama](https://www.youtube.com/watch?v=KGID1fQxtxM), an 11-minute
tutorial on Playgama's YouTube channel, made the way this skill works: real gameplay filmed frame by frame, the real
prompts and the agent's steps on screen, a voice-over, rendered with HyperFrames.

## What the agent does

1. Agrees on the video with you: the format, the length, who it is for.
2. Collects the true story: your prompts, timestamps, bugs, numbers and screenshots.
3. Takes your game's look from its own files: colours, fonts, panels, music.
4. Writes the script, then stops for your approval before any voice is recorded.
5. Films the gameplay and takes screenshots of your game, frame by frame.
6. Makes the stills: real code, real prompts, the agent's real steps.
7. Records the voice-over and picks the music. A person listens to every take.
8. Assembles and renders the video, then checks it frame by frame.
9. Hands you the video, a thumbnail, a title and a description.

## Install

This skill lives in [Playgama/gamedev-skills](https://github.com/Playgama/gamedev-skills), in
`skills/playgama-game-video`.

### Claude Code: as a plugin

```
/plugin marketplace add Playgama/gamedev-skills
/plugin install gamedev-skills@playgama
```

### Any agent: copy the folder

Copy `skills/playgama-game-video` into your agent's skills folder and keep its name, which must match the skill's:

| Agent | For all your projects | For one project |
|---|---|---|
| Claude Code | `~/.claude/skills/` | `.claude/skills/` |
| Codex | `~/.agents/skills/` | `.agents/skills/` |
| Cursor | `~/.agents/skills/` or `~/.cursor/skills/` | `.agents/skills/` or `.cursor/skills/` |
| Gemini CLI | `~/.agents/skills/` or `~/.gemini/skills/` | `.agents/skills/` or `.gemini/skills/` |
| GitHub Copilot in VS Code | `~/.agents/skills/` or `~/.copilot/skills/` | `.agents/skills/` or `.github/skills/` |
| Another agent that reads skills | its skills folder (see its docs) | |

```bash
git clone https://github.com/Playgama/gamedev-skills.git

# Codex, Cursor, Gemini CLI, GitHub Copilot
cp -R gamedev-skills/skills/playgama-game-video ~/.agents/skills/

# Claude Code, without the plugin
cp -R gamedev-skills/skills/playgama-game-video ~/.claude/skills/
```

Without git: choose **Code → Download ZIP** on the repository, unzip it, and copy `skills/playgama-game-video` the
same way.

An agent that doesn't read skills can still use it: tell it to read `SKILL.md` in this folder and follow it.

## Use it

Ask in your own words, for example:

- "Make a 30-second trailer of my game running at localhost:5173."
- "Make a vertical Short about how I built this game with an AI agent."
- "Record some gameplay of my game for a video."

The agent picks the skill up from its description. You can also call it by name:
- in Claude Code, `/gamedev-skills:playgama-game-video` from the plugin, or `/playgama-game-video` from a copied
  folder;
- in Codex, `$playgama-game-video`.

The agent works on your computer: it runs your game in a headless browser, films it and renders the video there. A
chat in a web browser can read the instructions, but it can't reach your game.

## What you need

- **Node.js 18+** and **ffmpeg** on the PATH.
- **Puppeteer**, where `scripts/film.mjs` can find it. Node looks for it next to the script and in the folders above
  it, not in the folder you run the script from. So install it in this folder:

  ```bash
  cd ~/.agents/skills/playgama-game-video && npm i puppeteer
  ```

  Or use `puppeteer-core` with your own Chrome: `CHROME=/path/to/chrome`. With the Claude Code plugin, let the agent
  install it: it knows where the plugin keeps the skill.
- **Your game, running from a URL:** its dev server, or a static server over its build.
- **HyperFrames** to render the video. It runs through `npx hyperframes@0.8.38`, so there is nothing to install. On
  its first render it downloads its own headless browser.
- **GSAP:** `gsap.min.js` next to the video template. `references/edit-and-render.md` has the download command.
- **For a voice-over that isn't yours:** a text-to-speech service, and a speech-to-text tool such as Whisper to check
  the takes.
- **Music** you are allowed to use, or the game's own.

To keep your footage on your machine, leave `GEMINI_API_KEY` unset while the agent works. With a key, HyperFrames'
`snapshot` command sends frames to Gemini for a description. `HYPERFRAMES_NO_TELEMETRY=1` (or `DO_NOT_TRACK=1`)
switches off its telemetry.

## Limits

- **Web games.** The game has to run in a browser from a URL. For a native build, the agent asks you for screen
  recordings and screenshots instead.
- **No sound in the footage.** Filming frame by frame records no audio, so the game's own sound files go in during
  the edit.
- **A person listens to the voice.** Text-to-speech makes mistakes that a transcript can't catch.
- **Rendering takes minutes,** and longer for a long video at 2560x1440.

## What's inside

| Path | What it is |
|---|---|
| `SKILL.md` | The instructions the agent follows |
| `references/` | Story and script, the game's look, filming, voice and music, editing and rendering |
| `scripts/film.mjs`, `scripts/vclock.js` | Film any web game frame by frame into a smooth MP4, or take a screenshot of it |
| `scripts/palette.mjs` | Sample the colours a game uses from its screenshots |
| `assets/template/` | A HyperFrames starter video: the sting, gameplay slots, a title, an end card, and one theme block for the game's look |
| `assets/sting.html` | The intro sting alone, in plain CSS |
| `assets/playgama-ai-sting.html` | The sting as a review page. Drop a screenshot of your game on it to see the logo over your game |
| `assets/sting-preview.mp4` | A preview of the sting |
| `assets/playgama-ai-logo.svg`, `.png` | The official Playgama AI logo |

The kit ships no game footage: every picture of your game is filmed from your game.

## Third-party components

| Component | Licence | In this repository |
|---|---|---|
| [DM Mono](https://fonts.google.com/specimen/DM+Mono) | SIL Open Font License 1.1 ([`OFL.txt`](assets/template/fonts/OFL.txt)) | Bundled in `assets/template/fonts/`. It holds the places of your game's fonts in the template until they are in |
| [HyperFrames](https://github.com/heygen-com/hyperframes) | Apache-2.0 | Not bundled: it runs through `npx` |
| [GSAP](https://gsap.com) | [GSAP Standard "no charge" license](https://gsap.com/standard-license) | Not bundled: you download `gsap.min.js` |
| [Puppeteer](https://pptr.dev) | Apache-2.0 | Not bundled: you install it with npm |
| [FFmpeg](https://ffmpeg.org) | LGPL or GPL, depending on the build | Not bundled: you install it |

## Licence

The code and texts are licensed under the
[Apache License 2.0](https://github.com/Playgama/gamedev-skills/blob/main/LICENSE).

The Playgama and Playgama AI names and logos belong to Playgama and are not covered by that licence. That includes
`assets/playgama-ai-logo.svg`, `assets/playgama-ai-logo.png` and the sting made from them.
[`TRADEMARKS.md`](https://github.com/Playgama/gamedev-skills/blob/main/TRADEMARKS.md) says how you may use them.
