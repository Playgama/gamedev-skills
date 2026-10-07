# Edit and render (HyperFrames)

HyperFrames renders an HTML page to video. The page is a normal web page with a paused GSAP timeline, and the
renderer seeks it frame by frame. The template in `assets/template/` was checked and rendered with
**hyperframes 0.8.38**: pin that version (`npx hyperframes@0.8.38 …`) for repeatable renders.

## Start from the template

```bash
cp -r assets/template my-game-video && cd my-game-video
curl -o gsap.min.js https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js
mkdir -p clips audio      # clips/gameplay-1.mp4 …, audio/music.mp3, audio/voice.mp3
npx hyperframes@0.8.38 check .                                   # lint + runtime + layout
npx hyperframes@0.8.38 render . -o renders/my-game.mp4 --quality high
```

What to change:
- **The game's look:** the theme block at the top of the `<style>`: its colours, its three fonts, its panels' shape
  (`references/game-look.md`). Leave the sting's colours alone: they are Playgama's.
- **Gameplay clips:** each `<video class="clip game">` has a `data-start` and a `data-duration` in seconds. Add or
  remove clips as the script needs; keep them `muted`.
- **The title and the end card:** their text, and their `data-start` and `data-duration`.
- **Audio:** `<audio>` elements with `data-start` and `data-duration`. `data-volume` sets the gain (1 = 0 dB).
- **The root's `data-duration`:** the whole video's length. The logo's container (`#brand`) should run the same
  length, so the bug stays to the end.
- **The tweens after 3.4 s** in the script block, at the new times. Leave the sting's tweens as they are.

## The rules that keep a render correct

- **Every timed element has `data-start` and `data-duration`**, and the visual ones have `class="clip"`.
- **One paused timeline**, registered as `window.__timelines["<data-composition-id>"]`.
- **Deterministic code only:** no `Date.now()`, no `Math.random()`, no network calls at render time.
- **Seek-safe tweens.** Two `fromTo()` calls on one element leave no stable starting state when the renderer seeks
  backwards. Set the starting state once with `gsap.set()`, then use `to()`. The template's shine shows how.
- **Paths are relative to the project root** (`clips/…`, `fonts/…`), never `../`.
- **Fonts are declared with `@font-face`** pointing at local files. A family the renderer can't resolve falls back to
  a generic font.
- **Media slots match their files.** An audio slot longer than its file is cut to the file. Set `data-duration` to
  the real length.

## Cards

Every card wears the game's look: its panels' fill, outline and corners (`--game-panel`, `--game-line`,
`--game-radius`), its fonts and its colours.
- **A prompt card.** The developer's words in the game's panel, set in the game's font for longer text (`"Game Text"`,
  or `"Game Code"` when the game's own fonts are too decorative for a long prompt).
  - It sits over a darkened frame of the game: blurred, or pixelated for pixel art.
  - Type the text out over about half the shot: reveal it with a `clip-path` or by characters on the timeline.
- **An agent's reply.** The same panel, appearing when the typing ends.
- **The agent's steps.** Rows of `tool_name  what it did  ✓` in `"Game Code"`, the tick in `--game-highlight`, one appearing
  every half second as the voice names them, for example `create_application`, `start_archive_upload`,
  `get_archive_status  PASSED`, `publish_sandbox  public link`.
- **Stills** (code, test output, web pages) go full frame. A slow push-in (scale 1 → 1.1 over the shot) toward a
  highlight box (a 2–4 px outline in `--game-highlight`) lands where the voice names it.
- **A title over gameplay:** darken the bottom third in `--game-bg` and set two lines there in the game's fonts. Keep
  the action in the middle of the frame clear.
- **The corner bug** sits top right. If the game's HUD is there, send it to another corner: in the tween that flies the
  logo at 2.75 s, `x: -820` puts it top left and `y: 478` at the bottom.

## Vertical (9:16)

- Set the root to `data-width="1080" data-height="1920"`, and size `html`, `body` and `#root` to match.
- Use clips filmed vertically.
- Drop the sting's build: start with the logo already small in a corner (`gsap.set("#badge", { x, y, scale })`), so
  frame one is gameplay.
- Put big words at about 70–76% of the height, clear of the platform's buttons on the right and its caption at the
  bottom.

## Before calling it done

1. `npx hyperframes@0.8.38 check .` passes. Read the warnings too.
2. `npx hyperframes@0.8.38 snapshot . --at 0.5,3,10,20` gives quick frames before a full render.
3. Render, then pull a frame every few seconds and look at every one:
   `ffmpeg -i renders/my-game.mp4 -vf fps=1/3 frames/%03d.png`
   Look for text cut off at the edges, the bug covering the game's HUD, a clip freezing on its last frame, and
   anything unreal on screen.
4. Check the sound: the loudness (see `voice-and-music.md`), the voice takes heard by a person, music under the voice
   but not over it.
5. Make a 1080p preview for sharing if the master is large:
   `ffmpeg -i master.mp4 -vf scale=1920:-2 -crf 21 preview.mp4`
