# TurboDust

TurboDust is a browser-based cinematic 3D driving experience where speed,
music and environment react to one another: an endless night road, an old
machine, and nowhere you need to be.

Built with Three.js and Vite. No gameplay framework, no physics engine — the
driving feel, camera, audio reactivity and environment are all hand-written
to keep the project easy to read end to end.

![TurboDust gameplay](references/gameplay.gif)

## Play it

**[Live demo](#)** — _link added once deployed_

## Controls

| Key | Action |
| --- | --- |
| `↑` | Accelerate |
| `↓` | Brake / reverse |
| `← →` | Steer |
| `M` | Mute / unmute |

Needs a physical keyboard, so it's a desktop experience — opening it on a
phone shows a short notice instead of a broken screen.

## Run it locally

```bash
npm install
npm run dev      # starts a local dev server
npm run build    # produces a static build in dist/
```

## What it does

- A third-person chase camera that stretches back and loosens its follow as
  speed increases, and drifts into a slow orbit around the car if you stop
  for a few seconds.
- Progressive acceleration and weighted braking — no instant starts or stops.
- An endless road and desert built by recycling a handful of segments around
  the car, instead of generating an infinite world.
- A layered aurora, a moonlit horizon glow and a starfield, all drawn as
  textured planes rather than a 3D shader — kept deliberately simple so every
  line stays readable (see *How this was built*, below).
- Engine audio pitched and filtered by simulated RPM, crossfading between a
  calmer and a more energetic version of the same music track as the car
  speeds up, plus a synthesized brake screech (there was no recorded sample
  for it).
- A stylised speed/RPM dial and a dust trail that appears above a speed
  threshold.

## Project structure

```
assets/            3D models and audio (see credits.md for licenses)
docs/              design notes and the visual moodboard
src/
  scene/           sky, road, lighting, the car model and its lights
  game/             vehicle physics, camera, wheels, input, dust, suspension
  audio/            engine + music mixing, synthesized brake screech
  ui/               start screen and the HUD
  config/           shared constants (road dimensions)
```

Each file does one job — see `AGENTS.md` for the ground rules this project
was built under (small files, no silent refactors, explain before building).

## How this was built

This project was built by prompting AI coding assistants (first Codex, then
Claude) rather than hand-writing most of the code — the point of the project
was to practice directing an AI well, not to avoid using one.

What that looked like in practice:

- **Design first, code second.** The game design, the MVP scope and the
  moodboard (`docs/`) were written before any code, and the assistant was
  told to treat them as the source of truth, not to invent scope.
- **Explain before building.** Every non-trivial change started with the
  assistant explaining its approach and naming the files it would touch,
  before writing anything — so decisions (like using textured planes instead
  of a GLSL shader for the aurora, to keep the code readable) were made
  deliberately, not defaulted into.
- **Small, separated files over one big one.** `src/` is split by concern
  (scene, game, audio, ui) so any single file stays easy to read.
- **Verify, don't assume.** Changes were built and driven in a headless
  browser after each step to catch real errors, rather than trusting that
  code likely to run would run.

## Credits

Third-party 3D model licenses and attribution are listed in `credits.md`.

## Status

Playable prototype / portfolio demo. See `docs/project-plan.md` for the
original production plan and `README.md` for the full game design document.
