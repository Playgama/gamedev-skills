# The game's look

A video about a game should look like the game. Someone who has played it should know it from any frame, and someone
who hasn't should see what playing it feels like. Playgama adds its logo (the sting and the corner bug) and the link.
Everything else comes from the game.

## Contents
1. Where to find the look
2. Colours
3. Type
4. Panels, buttons, icons, the logo
5. Motion
6. Sound
7. Readability
8. Into the template

## 1. Where to find the look

Look in this order, and stop as soon as you have exact values.

1. **The game's own files.**
   - Its stylesheet or theme: CSS variables, a theme or config module, a UI skin. HUSH keeps its look in a few
     variables at the top of `src/style.css`:
     ```css
     --ink: #d8ccb4; --dim: #8d806c; --red: #c0301f; --amber: #d9a45b; --panel: rgba(10, 8, 7, 0.86);
     --type: 'Special Elite', 'Courier New', monospace; --sans: 'Oswald', 'Arial Narrow', sans-serif;
     ```
   - Its fonts, UI sprites, icons, logo, sounds and music.
   - In an engine: Unity's UI prefabs and TextMeshPro font assets, Godot's Theme resources, the text styles in a
     Phaser or Pixi scene.
2. **What the developer chose to show:** the store page, the covers, the key art.
3. **The screen itself.** When the code has no theme, film stills of a menu and the HUD (`scripts/film.mjs --still`)
   and sample them:
   ```bash
   node scripts/palette.mjs menu.png --crop 165,63,310,233     # x,y,w,h: only the settings panel
   ```
   - On HUSH's settings panel it finds `#0a0706`, `#dbd4c6`, `#7e7465` and `#3b100a`: the background, the text, the
     dim text and the button. They are close to the values in its code.
   - Sample the UI, not a scene. Lighting blends colours that the UI keeps apart.
4. **The developer's words.** Ask how the game should feel, in three words ("cosy, warm, handmade"; "tense, dark,
   quiet"), and check every choice against them.

Write what you found as a short style sheet: the colours and their jobs, the fonts, the panel shape, two or three
sounds. Show it to the developer with the script.

## 2. Colours

Give each colour one job. These five are enough, and they are what the template's theme takes:

| Job | Where it comes from | HUSH |
|---|---|---|
| Background | the darkest colour of its UI: menu backgrounds, panel fills | `#0a0807` |
| Panel | the fill and outline of its boxes and dialogs | `rgba(10, 8, 7, 0.86)`, outline `rgba(160, 130, 100, 0.28)` |
| Text | its UI text | `#d8ccb4` |
| Button | its main button, and the text on it | `rgba(110, 22, 14, 0.55)`, text `#d8ccb4` |
| Highlight | its bright colour for words that stand out: a score, a key, a link | `#d9a45b` |

- **Take them from the UI, not a scene.** The HUD and the menus are the designed palette.
- **Add no colours the game doesn't have.** Playgama's purple belongs to its logo alone.

## 3. Type

Every font in the video matches the game, the code font included. The DM Mono bundled with the template only holds
their places until the game's fonts are in.
- **Titles in its title or logo font, labels and captions in its UI font.** HUSH: Special Elite, a typewriter face,
  for titles and notes; Oswald for labels and buttons.
- **Prompts and the agent's replies** go in the font the game uses for longer text: its notes, dialogue or
  descriptions. If that one is too decorative for a long prompt, pick a plainer face in the same spirit.
- **Code and tool calls** need a monospace, so that columns and indents line up. Use the game's own if it has one,
  otherwise pick one in its spirit:
  - a pixel monospace for pixel art, a rounded one for a cosy game, a typewriter one for a dark or retro game;
  - HUSH's stylesheet falls back from Special Elite to Courier New, and that shows the way: a Courier-style
    monospace such as Courier Prime (SIL OFL). Special Elite itself isn't monospaced.
- **Use the game's own font files** when their licence covers video.
  - Open fonts (SIL OFL, Apache 2.0, as on Google Fonts) do, and so do most desktop licences.
  - Check a font licensed only for the web.
  - Otherwise pick a free font close to it.
- **Set the words the way the game sets them.** HUSH spaces its titles wide (about 0.18 em) and gives them a dark red
  glow; a cartoon game may outline its words. Give the video's words the same treatment.
- **A pixel font** goes at whole multiples of its pixel size, so its pixels stay square.

## 4. Panels, buttons, icons, the logo

- **Cards** (a prompt, a step, a caption) take the shape of its panels: the same corners, outline and fill.
  - HUSH's panels are square, with a 1 px brown outline.
  - The closest match is the game's own panel sprite, used as a CSS `border-image`.
- **The end card's button** looks like its main button.
- **Icons** come from the game: its coins, hearts, keys.
- **The game's own logo** goes on the title and the end card when it has one. Otherwise set its name in the title
  font.

## 5. Motion

Move the way its UI moves.
- **A bouncy, juicy game:** titles pop in with an overshoot (`back.out`), cards slide in fast, cuts land on hits.
- **A calm or dark game:** slow fades and no bounce. HUSH's title flickers like a failing bulb, and the video's can too.
- **Pixel art:**
  - hard cuts and stepped motion (`steps(4)`);
  - no blur, and scaling only by whole numbers (`image-rendering: pixelated`);
  - behind a card, darken or pixelate the frame instead of blurring it.
- **Cut on the game's beats:** a jump, a hit, a door.

## 6. Sound

- **Its own music** is the best bed, because it already sounds like the game. Use another track only if it has none
  (`voice-and-music.md`).
- **Its UI sounds** (a click, a coin, a page turn) go under cards and titles, quietly.

## 7. Readability

- **Text over gameplay needs a contrast of at least 4.5:1** with what is behind it.
  - Darken the picture from below in the game's background colour, or give the words the game's outline or glow.
  - `palette.mjs` prints each colour's contrast against the darkest one.
  - `npx hyperframes check` tests the text in the video.
- **Check at phone size.** A decorative font that reads at 1920 px can smear on a phone: look at the title and the end
  card at 360 px wide.

## 8. Into the template

The theme block at the top of the template's `<style>` holds the whole look:

| In the template | Takes |
|---|---|
| `--game-bg` | the background |
| `--game-panel`, `--game-line`, `--game-radius` | the panels: fill, outline, corners |
| `--game-text` | the text |
| `--game-accent`, `--game-on-accent` | the main button and the text on it |
| `--game-highlight` | the highlight |
| `--game-case`, `--game-title-spacing`, `--game-title-shadow` | how titles are set: capitals or not, letter spacing, glow or outline |
| `@font-face` "Game Title", "Game Text", "Game Code" | the three fonts (title, UI, code): copy the files into `fonts/` and point `src` at them |

HUSH's theme. Every value comes from its own code, except the code font, which follows its stylesheet's Courier
fallback:

```css
@font-face { font-family: "Game Title"; font-display: block; src: url("fonts/special-elite-400.woff2") format("woff2"); }
@font-face { font-family: "Game Text"; font-display: block; src: url("fonts/oswald-600.woff2") format("woff2"); }
@font-face { font-family: "Game Code"; font-display: block; src: url("fonts/courier-prime-400.woff2") format("woff2"); }
:root {
  --game-bg: #0a0807; --game-panel: rgba(10, 8, 7, 0.86); --game-line: rgba(160, 130, 100, 0.28); --game-radius: 0;
  --game-text: #d8ccb4; --game-accent: rgba(110, 22, 14, 0.55); --game-on-accent: #d8ccb4; --game-highlight: #d9a45b;
  --game-case: uppercase; --game-title-spacing: 0.18em;
  --game-title-shadow: 0 0 48px rgba(160, 20, 10, 0.55), 0 0 10px rgba(0, 0, 0, 0.9);
}
```

The sting and the corner bug stay as they are: they are Playgama's.
