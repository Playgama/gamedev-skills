# Playgama gamedev skills

Agent skills for game developers, from [Playgama](https://playgama.com). Each one is a folder in the open
[Agent Skills](https://agentskills.io) format, so it works in Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot
and other agents that read skills.

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Format: Agent Skills](https://img.shields.io/badge/format-Agent%20Skills-9747ff.svg)](https://agentskills.io)

## Made this way

[![How to Make a Game with AI: from a 3D Model to Playgama](https://img.youtube.com/vi/KGID1fQxtxM/maxresdefault.jpg)](https://www.youtube.com/watch?v=KGID1fQxtxM)

[How to Make a Game with AI: from a 3D Model to Playgama](https://www.youtube.com/watch?v=KGID1fQxtxM), an 11-minute
tutorial on Playgama's YouTube channel. It was made the way `playgama-game-video` works: real gameplay filmed frame by
frame, the real prompts and the agent's steps on screen, a voice-over, rendered with HyperFrames.

## Skills

| Skill | What it does |
|---|---|
| [playgama-game-video](skills/playgama-game-video/) | Makes a video about your web game (a trailer, a Short, a devlog or a "how I made it" story) in the game's own look, opening on the Playgama AI sting |

## Who it's for

- **Developers building web games with an AI agent** who want a trailer, a Short or a devlog without opening a video
  editor.
- **Studios publishing on Playgama** that need a video for the game's page, a store or their channel.
- **Entrants in Playgama challenges** who need a video of their entry.

## Install

### Claude Code: as a plugin

```
/plugin marketplace add Playgama/gamedev-skills
/plugin install gamedev-skills@playgama
```

### Any agent: copy a skill's folder

Clone the repository, then copy the skill's folder into your agent's skills folder. Keep the folder's name: it must
match the skill's.

```bash
git clone https://github.com/Playgama/gamedev-skills.git

# Codex, Cursor, Gemini CLI, GitHub Copilot
cp -R gamedev-skills/skills/playgama-game-video ~/.agents/skills/

# Claude Code, without the plugin
cp -R gamedev-skills/skills/playgama-game-video ~/.claude/skills/
```

| Agent | For all your projects | For one project |
|---|---|---|
| Claude Code | `~/.claude/skills/` | `.claude/skills/` |
| Codex | `~/.agents/skills/` | `.agents/skills/` |
| Cursor | `~/.agents/skills/` or `~/.cursor/skills/` | `.agents/skills/` or `.cursor/skills/` |
| Gemini CLI | `~/.agents/skills/` or `~/.gemini/skills/` | `.agents/skills/` or `.gemini/skills/` |
| GitHub Copilot in VS Code | `~/.agents/skills/` or `~/.copilot/skills/` | `.agents/skills/` or `.github/skills/` |
| Another agent that reads skills | its skills folder (see its docs) | |

Each skill's own README says what it needs.

## Quick start

Open your game's project in your agent and ask, for example:

- "Make a 30-second trailer of my game running at localhost:5173."
- "Make a vertical Short about how I built this game with an AI agent."
- "Make a 'how I made it' video from this project's history."

The agent agrees on the video with you, collects the story, and shows you the script and the game's look before it
records any voice.

## Licence

The code and texts are licensed under the [Apache License 2.0](LICENSE). The Playgama and Playgama AI names and logos
belong to Playgama and are not covered by that licence: [`TRADEMARKS.md`](TRADEMARKS.md) says how you may use them.
[`NOTICE`](NOTICE) lists the copyright and the bundled fonts. Changes are in [`CHANGELOG.md`](CHANGELOG.md).
