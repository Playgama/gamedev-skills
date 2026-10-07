# Voice and music

## The voice

Two good options:

- **The developer's own voice.** It earns the most trust and the most comments.
  - Record each script line on a phone in a quiet room.
  - Trim the silence, and time the edit to the recording.
- **Text-to-speech** (Gemini TTS, ElevenLabs, OpenAI and others).
  - Pick one narrator voice and keep it for all the developer's videos.
  - A second voice can read an AI agent's own words, the lines it really wrote. The contrast helps the story.

Narration pace is about 2.5 words a second. Shorts can run faster, never rushed.

### Saying "Playgama" right

It is "play-GAH-ma", every "a" open as in "father". English voices say "play-GAY-ma" or "play-GAM-ma" unless you
steer them.
- **What worked:** send the voice the name written in Cyrillic, **Плейгама**, while the captions and on-screen text
  keep "Playgama". Add an instruction for that line: "The brand name is written in Russian letters: say that one
  word the way a Russian speaker says it, play-GAH-ma. The rest is English."
- **Respell it everywhere the model reads.** Do it in the scene description and the speaker profile as well as the
  line. A Latin "Playgama" anywhere beside the line pulls the voice back to the English reading.
- **A person listens.** A transcript can't tell you which reading came out.

### Keep the instructions out of the voice

A text-to-speech model can read its own instructions aloud.
- Keep the scene, profile and style fields short and plain, nothing that sounds like a line. Good examples: "A story
  video on a games channel."; "Warm and clear. Finish every word."
- Ending a scene with "…and test ideas with data" once put those words at the end of two takes.

### Check every take

Seen in real takes that sounded fine on their own:
- a repeated last sentence;
- an extra sentence nobody wrote;
- the instructions read aloud;
- a swallowed last syllable ("publish" for "publishing").

So:
- **Transcribe every take** with Whisper or any speech-to-text, and compare it with the script word for word. Number
  formats ("14" for "fourteen") are fine; extra or missing words are not.
- **Watch the length.** A take much longer than its word count predicts (over about 1.45x at 2.5 words a second)
  usually repeated something.
- **Have a person listen** to the takes, ideally all of them in one clip with each take numbered. Keep the rejected
  takes in a `takes/` folder.
- **If a last word gets swallowed,** add a line-level note to finish the word, and record it again.

## Music and sound

- **The game's own music first:** it already sounds like the game. If it has none, use a bed, not a song:
  instrumental, steady, no big drops, matched to the game's mood. For a cosy-spooky game, that might be a slightly
  eerie music box over a soft lo-fi beat.
- **Levels:**
  - Voice at about −18 LUFS, the music bed at about −26 LUFS.
  - Duck the bed another ~7 dB while someone speaks.
  - Game sounds at their moments, peaking around −12 to −16 dBFS.
- **The finished mix** sits around −14 to −16 LUFS integrated, true peak −1 dBTP or lower:
  `ffmpeg -i video.mp4 -af loudnorm=print_format=summary -f null -`
- **Licences:**
  - Generated music (Suno and similar): check that the plan you used allows commercial use before publishing.
  - Sound effects: CC0 is safest. Credit CC-BY sounds and icons in the description.
