# Instructions for Codex

## Project scope
The TurboDust project root is: `IA/B-videoGame`

The Git repository also contains unrelated projects.
Do not create, edit, move or delete files outside this directory unless explicitly requested.

## General
This is a learning project.
Keep the code simple and understandable. And explain the logic behind every choice, and how it works together with the other languages (mainly focus on html/css/js), anything additional if necessary, explain why taking that approach before we can approve of it. 

## Workflow 
First make a review of all the .md documents to suggest a clear structure, by also integrating the asset folder created..  
A work in progress, let's divide the tasks into different parts of the game to develop; 
First I'll share all the gathered ideas, then before implementing a new major feature, changing the architecture, or making significant changes to existing code:
- explain the approach 
- let's review it together 
- identify the files that will be created or changed and highlight the modifications (added or removed)
- wait for approval 
- Run the relevant tests/build/linter.

After each implementation:

- explain what changed
- explain how to test it
- mention any important technical decisions 
- explain how those decisions may affect other parts of the project

## Do not: 
- No Giant files, use seperation of concerns
- rewrite unrelated files
- add libraries without approval
- remove existing assets
- change the game design without asking
- Do not silently refactor unrelated systems.

## Confirmed Decisions 
- The game is 3D. 
- The player uses keyboard controls. 
- Music intensity changes with the vehicule speed. 
- Car engine also is reactive to speed variations.
- Make the engine + music balance each other out

## Asset licensing
Respect the licenses and attribution requirements documented in `credits.md`.
Do not remove attribution information or replace licensed assets without approval.

## Project Documents

Use these documents as the source of truth:

- `README.md` — game concept, confirmed gameplay decisions, MVP and future ideas
- `docs/project-plan.md` — production planning and development stages
- `credits.md` — third-party asset licenses and attribution
- Use `docs/references/moodboard/` — as visual guidance for atmosphere, lighting,
color palette, environment, camera composition, effects and UI.
Do not treat moodboard images as runtime game assets unless explicitly approved.
- `assets/` — runtime assets currently available for the game, including 3D models and audio

If documents appear to contradict each other, point out the conflict before implementing anything.

