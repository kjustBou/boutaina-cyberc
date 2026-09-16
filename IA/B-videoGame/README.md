# TurboDust - Game design document 

## 1. Game concept 
### Premise
An immersive game, let's call it, TurboDust, a late night car drive under a starry night in a mix scenery of various random cities across the world, from highskies to palm trees, with mainly the engine roar being music to your ears in addition to your favorite playlist, driving your old school car, it's more than a ride, it's a time travel, back to a retro ambiance almost looping through your thoughts and the landscapes.

A cinematic 3D driving experience where speed, music and environment are interconnected.

The initial focus is not racing or winning.
The initial focus is driving, atmosphere and immersion.

### Genre 
Cinematic 3D Driving / Exploration Game

### Target experience

The player should feel:
- relaxed but immersed
- slightly nostalgic
- curious about what exists farther down the road
- connected to the car through sound and movement
- increasingly energized as speed increases

The game should feel cinematic rather than arcade-like.

## MVP
The first playable version focuses on the sensory and driving core.

- "cœur sensoriel" (ambiance) et un "cœur fonctionnel" (conduite fluide) comme MVP, 
- le reste (défis, carte, progression) en couche 2

Required:
- one playable 3D car
- one environment / road
- keyboard driving controls (arrows)
- acceleration
- braking
- smooth steering
- third-person cinematic camera
- rotating wheels
- basic car lighting and reflections
- engine audio reacting to the RPM
- music reacting to speed
- simple speed indication
- starry nighttime atmosphere / sunrise / northern lights touch

Not required for the first version:
- multiplayer
- races
- car collection
- side quests
- progression system
- fuel system
- multiple levels

## 2. Core Gameplay

The player is a young adult, almost anonymous, in black, driving and cruising around the designed environment. 

## 3. Game mechanics (What the player can do/What other entities can do, in response to player's actions.)
- driving
- exiting the car
- taking pictures of the sky
- walking

The player will potentially be picking up random side quests to reach new roads and levels, that may include other players or just objects. 
These interactions are future possibilities and are not part of the initial MVP unless explicitly approved.

## Driving feel /Movement
Smooth speed transitions, no sudden nervous movements of the steering wheel, just putting the emphasis on the engine, the brakes (sounds + tire tracks), the scenery, the whole experience. 

The driving should prioritize smoothness over simulation realism.

### Acceleration
Acceleration should build progressively.

### Braking
Braking should feel weighted rather than instantaneous.

### Steering
Steering should be smooth and slightly cinematic.
Avoid twitchy arcade-like steering.

### Speed
Increasing speed should affect:
- vehicule movement
- camera
- engine sound
- music intensity
- environment sensation
- visual effects

## 4 Visual Direction 

- The visual, is starry dark blue sky, with shades of orange (remains of sunset), blue, green, sometimes it's northern lights, sometimes it's the full moon and its light, even some sunrises, but never full daylight, there's some inspo in the docs, stay as true as possible to them but also feel free to create and suggest better ones as well
Raining might be added, lightning, 

- The car models are in the folder, place it into the convenient file/folder, use these models and make them adapt with light effects and change of angles, keeping the mysterious atmosphere 

- The music is inspired by the new album of Jeremy Olander-When the rain falls (progressive house, with a retro, gam(ish) vibe, especially the tracks turbo-Kameleon-Apollo..)
The tracks in 'assets/audio' were created with AI, from the same inspo, more can be added later to adapt the speed levels of the car to make it as a continuous playlist 

- 3D Game so : 
  - optional cinematic camera orbiting around the car
  - reflections moving across the body
  - wheels physically rotating
  - suspension movement
  - road elevation

  - Adding on and adapting particles / FX

## Camera 

Primary camera:
Third-person chase camera behind the vehicule.

The camera should:
- follow smoothly rather than lock rigidly to the car
- react subtly to acceleration
- increase the sensation of speed
- maintain cinematic framing

Optional cinematic behavior:
When the player is cruising or stopped, the camera may slowly orbit
or provide alternative cinematic angles.

The camera must never interfere with driving controls.

## Visual references 

Visual references for the game's art direction are stored in:

- `docs/references/moodboard/lucid.jpg`
- `docs/references/moodboard/lucid4.jpg`
- `docs/references/moodboard/speed-indicator.jpg`

Use these files as visual references when proposing or implementing:
- environment design
- lighting
- color palette
- atmosphere
- camera composition
- UI/HUD
- particles and visual effects

Do not treat these reference images as runtime game assets unless explicitly approved.

When a visual implementation differs significantly from the references,
explain why before implementing it.

## Environment 

Mostly nighttime.

Possible transitions:
- deep blue starry night
- city lights
- palm-lined roads
- distant skylines
- moonlight
- aurora-like skies
- rain
- lightning
- early sunrise

Avoid:
- generic bright daylight
- overly realistic modern-city aesthetics
- overly colorful arcade aesthetics

## Audio

Audio is a core gameplay component.

There are two main layers:

1. Vehicule audio
2. Music

Both react to vehicule speed but should complement rather than overpower
each other.

### Engine

Low speed:
- engine is present and detailed

Higher speed:
- RPM/intensity increases
- engine becomes more energetic

### Music

Music should evolve with driving intensity.

At lower speed:
- calmer / atmospheric

At higher speed:
- more energetic parts should become perceptually dominant

The engine and music must remain balanced.

# Future Design Ideas — NOT CONFIRMED /Ideas, possibilities 

DO NOT IMPLEMENT THESE FEATURES AS PART OF THE MVP.

The following concepts are brainstorming only.
They must not be implemented unless explicitly approved.

- Adding more vehicule models to choose from 
- Adding side quests
- Player might crash and come back to the game (life levels/or gaz?)(ex: collecting stardust, or plants to fill the tank, open to suggestions)
- Maybe if we add other players later, we can activate competition mode where they race each other, and if they win, they get to keep the car and add it to their collection
And have another option, main one, chill discovery/driving mode, where they can by option pick up suggested side quests for extra credit (that can be used later in the race to gain some advantage);

## Exploration mode
Main relaxed driving experience.

Potential:
- optional side quests
- exploration rewards
- hidden roads

## Challenge mode
Potential races or timed challenges.

## Multiplayer
Possible future roles:
- passive drivers
- NPC-like traffic
- competitors
- cooperative exploration

## Progression
Possible ideas:
- vehicule collection
- credits
- unlocking cars
- fuel / energy
- stardust or collectible resources

## Questions 
- Should the game be freestyle, or have a timer? 
- Should the scenery of the city change with the different levels/side quests or just as the road goes by? 
- How to make it more interesting for players looking for a challenge/adrenaline? 
- If I add other players, what could potentially be their role, passive, like NPC's or part of the challenge? 

These are my ideas. Some are decisions and some are still uncertain. Do not assume that an uncertain idea is a requirement. But would love to keep brainstorming as the game evolves. 
