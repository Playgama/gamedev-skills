# Story and script

## Contents
1. What to collect before writing
2. Beat sheets for the four formats, with real lines
3. The script format
4. What may appear on screen

## 1. What to collect before writing

A video about a game is believable because it is specific: the exact prompt, the minute it first ran, the bug that
showed up. Collect these first, and write only from them.

- **The prompts, word for word, with their times.** Keep the first idea, "let's make it", the request to publish, and
  any correction the developer made.
- **The agent's notable messages.**
  - Its estimate ("A first prototype in 2–3 days").
  - Its first look ("It runs. Too bright and orange for horror, though").
  - The bugs it found and how it found them.
- **Milestones with timestamps:** the first run, the first playable link, version 1, published on Playgama.
  - Subtract them from the starting prompt to get a clock ("2 h 01 min from 'let's make it' to version 1").
  - That clock can run in the corner of the whole video.
- **Hard numbers:** lines of code, tests passed and failed, assets and their sizes, rooms, levels, FPS, the minutes
  from creating the game on Playgama to a public link.
- **Pictures that exist:** screenshots the agent took to check its work, renders, sprite sheets, covers. These are
  the best B-roll: they are the real process.
- **The publishing steps.** These are the Playgama MCP tool calls in order, with their results, for example:
  1. `create_application` (the game is created)
  2. `start_archive_upload` (the build is sent)
  3. `get_archive_status`: "Bridge SDK found · PASSED"
  4. `start_cover_upload` ×3 (the covers)
  5. `publish_sandbox`: a public playable link

Where to find them:
- **The agent's chat history.** Claude Code keeps it in `~/.claude/projects/<project>/<session>.jsonl`, Codex in
  `~/.codex/sessions/<yyyy>/<mm>/<dd>/rollout-*.jsonl`: one JSON event per line, with UTC timestamps. Other agents
  keep theirs elsewhere (see their docs), or can export the chat.
- **git log and the project's journal or README.**
- **Test output, build logs, the dev's screenshots folder.**

## 2. Beat sheets

### A · "How I made it" story (16:9, 3–6 min)

One clock and one claim carry it. Example: the HUSH video, 5:23, 36 lines.

| Beat | What happens | A real line |
|---|---|---|
| Cold open (0:00–0:25) | The best gameplay moment; the claim | "This is HUSH. You're locked in a house with Nana, and she hears everything." / (the agent) "A first prototype in two to three days." / "That was Claude's estimate. It took two hours. And in those two hours, I typed exactly three words." |
| The idea | The first prompt on screen, typed; what the agent proposed | "It started with a shooter Claude made for me last week. I asked: keep the pistol, and make it horror." |
| The start | The one-word approval; the clock starts | "I wrote back: let's make it. Twelve twenty-six. The clock starts." |
| Building | What the agent did, with numbers and real failures | "On the first run, eleven passed. Four things were out of reach, the front door wouldn't open, and Nana stood stuck for three seconds." |
| First look | The first time it ran; the bugs the screenshots showed | "Two windows had glowing eyes in them. They were picture frames." |
| The game | A gameplay montage: the core loop in four takes | "The front door has three planks, a padlock and a lock. You need a hammer and two keys, and they're somewhere different every game." |
| Publishing | The agent's Playgama MCP steps; time to a public link | "From creating the game on Playgama to a public link: one minute and forty-two seconds." |
| Call to action | Play it, like it, the link in the description | "So play HUSH. Try to get out in five days, and if you like it, hit like on its page." |

### B · Trailer / promo (16:9, 30–90 s)

1. The sting (3 s).
2. The best gameplay under a title: the name, plus one line on what it is.
3. Two or three features: one take each, with a 2–4-word label ("THREE PLANKS. TWO KEYS.").
4. Optionally, one line on how it was made ("Built with an AI agent, published with Playgama MCP").
5. The end card: "PLAY IT FREE" and the game's Playgama link.

### C · Short (9:16, 15–35 s)

The first frame is the game, moving and full screen, with a claim of at most four words ("AI MADE THIS IN 10 MIN").
Then come the twist (a fail, a surprise, the wow moment) and the result. End where the start can follow, so it loops.
- The logo sits small in a corner from the first frame. There is no sting.
- One idea per Short.
- If a viewer's comment asked for the game, show it at 2–3 s, one line, small. Never use it as the opening frame.

### D · Tutorial: publish a game with Playgama MCP (16:9, 1–3 min per part)

1. The result first: the game playing on its Playgama page.
2. The one prompt that does it, typed on screen: "Publish this game to Playgama and give me a public playable link."
3. The agent's steps as a card, rows appearing as the voice names them.
4. The public link opening.
5. Where to start: `playgama.com/mcp`.

Keep the publishing half simple: a viewer needs the shape of it, not every call.

## 3. The script format

One row per voice line. The developer approves this table before any voice is recorded.

| # | Line (spoken) | Voice | On screen |
|---|---|---|---|
| n01 | This is HUSH. You're locked in a house with Nana, and she hears everything. | narrator | the dark hall in the torch; a floorboard creaks; Nana crosses the end of the hall |
| c01 | A first prototype in two to three days. | the agent | its real message, the line highlighted |

- Narration runs at about 2.5 words a second: 60 s holds 140–160 words, and 5 minutes about 700.
- Keep lines short (under 25 words) and end each on its point.
- Write numbers as words ("fifty-four", "one minute and forty-two seconds") so the voice reads them right.
- An agent's own words can be read in a second voice, but only words it really wrote, with the message on screen.

## 4. What may appear on screen

- **Real, or labelled.**
  - Prompts, messages, numbers, times, code (with its real line numbers) and test output are all copied, not
    retyped from memory.
  - Anything illustrative carries "EXAMPLE DATA" for as long as it shows.
- **Translate, don't reword.** Show prompts in the video's language, cut with "[…]", never paraphrased.
- **Your own art only.** Don't use other games' characters, logos or art, and don't put a famous game's name on the
  screen. Describe your game by its genre ("a horror escape game"); a copied character is a copy.
- **The Playgama link** goes to the game's own page on Playgama.
