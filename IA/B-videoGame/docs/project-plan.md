# TurboDust - Organisation des étapes  

TurboDust is a browser-based cinematic 3D driving experience where
speed, music and environment react to one another.

## Étape 1: Pitch narratif (brainstorming)- Outil: Clavardage Claude
**Découpage**
- "cœur sensoriel" (ambiance) et un "cœur fonctionnel" (conduite fluide) comme MVP, 
- le reste (défis, carte, progression) en couche 2;

## Étape 2 : Direction artistique et concept art

Création de références visuelles et d’un moodboard pour définir :

l’ambiance nocturne
les environnements
les voitures
la palette visuelle
l’esthétique rétro / cinématique

Outil utilisé : Leonardo AI

## Étape 3 : Conception de niveaux et structure de jeu

Définition du premier environnement jouable :

- une route principale
- un environnement 3D
- une circulation minimale ou inexistante pour le MVP
- une progression visuelle basée sur la conduite

Les niveaux de jeu seront définis plus tard

## Étape 4 : Sélection et préparation d'assets visuels

- modèle 3D de voiture
- environnement
- textures
- références visuelles

Source principale pour les modèles 3D : Sketchfab 

## Étape 5: Son et musique 
Inspiration du jeu et de la bande son : 
L'album de *Jeremy Olander - When The Rain Falls*

Le système audio comprend deux parties principales :

### Musique

Création de morceaux originaux générés avec Suno.

### Son du véhicule

Utilisation de samples de moteur qui pourront être manipulés dynamiquement selon :

- la vitesse
- l’accélération
- le régime moteur simulé

Les variations pourront être produites avec les outils audio du navigateur ou une bibliothèque JavaScript adaptée.

## Étape 6 : Génération de code

- HTML
- CSS
- JavaScript
- Three.js
- Vite

Des bibliothèques supplémentaires pourront être ajoutées uniquement si elles sont nécessaires au prototype.

## Étape 7 : Test, itération et polish

- tester les contrôles
- ajuster la sensation de conduite
- améliorer le son
- améliorer l’éclairage et l’environnement
- optimiser les performances
- corriger les bugs
- intégrer un debug panel pour observer et ajuster les paramètres du jeu avec Codex 

# Texte de présentation 
TurboDust is a browser-based cinematic 3D driving experience where
speed, music and environment react to one another.

## Status

Early development / prototype.


## Project structure

- `assets/` — runtime models and audio
- `docs/` — game design, planning and visual references
- `AGENTS.md` — development instructions for Codex
- `README.md` — source of truth for game design decisions

## Development

Setup instructions will be added when the first prototype is initialized.

>Ressources 
[Modèle auto 3D](https://sketchfab.com)
[Generated audio music](https://suno.com/create)
[Moodboard support](https://app.leonardo.ai)
                                                                                                     