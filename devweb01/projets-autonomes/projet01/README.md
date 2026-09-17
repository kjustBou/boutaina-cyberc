# DJB Studio — site vitrine pour une académie de MMA

Un site web vitrine multipage conçu pour **DJB Studio**, une académie fictive de sports de combat. Le projet présente l'identité du gym, ses disciplines, son équipe d'entraîneurs, son horaire et un parcours d'inscription à une séance d'essai.

> Projet front-end réalisé dans le cadre de ma formation, avec une attention particulière portée à la structure du contenu, à l'expérience mobile et aux interactions JavaScript sans framework.

## Aperçu

| Page | Objectif |
| --- | --- |
| Accueil | Présenter l'univers du studio, sa philosophie, ses disciplines et ses coachs. |
| Horaire | Rendre les créneaux hebdomadaires faciles à consulter. |
| Join us | Permettre à un visiteur de demander une séance d'essai gratuite. |

Le site est actuellement **déployé en privé sur Railway**, avec un flux de déploiement relié à GitHub. L'URL n'est donc pas publiée dans ce dépôt.

## Fonctionnalités principales

- Hero immersif et appel à l'action vers l'inscription.
- Navigation fixe, qui s'adapte au défilement, avec menu hamburger sur mobile.
- Cartes interactives des disciplines : un clic retourne la carte pour afficher la description.
- Section des entraîneurs générée dynamiquement depuis les données JSON.
- Tableau d'horaire hebdomadaire.
- Formulaire de demande de cours d'essai avec champs requis, contraintes HTML et validation JavaScript côté client.
- Pied de page avec adresse et carte Google Maps intégrée.
- Mise en page responsive grâce à CSS Grid, Flexbox, `clamp()` et une media query mobile.

## Stack technique

- **HTML5** — structure sémantique des pages.
- **CSS3** — design responsive, variables CSS, transitions et animation 3D des cartes.
- **JavaScript (vanilla)** — injection du contenu, interactions de navigation et validation du formulaire.
- **JSON** — source de données locale pour les disciplines et les coachs.
- **Cloudinary** — hébergement des visuels distants utilisés dans le contenu JSON.
- **Railway + GitHub** — déploiement privé continu du site.

## Architecture du projet

```text
.
├── index.html          # Accueil
├── schedule.html       # Horaire
├── joinUs.html         # Formulaire d'essai
├── style.css           # Styles, responsive design et animations
├── main.js             # Interactions et rendu dynamique
├── mma.json            # Données des disciplines et des coachs
└── assets/             # Logos et images locales
```

## Choix de conception

### Contenu piloté par les données

Les disciplines et les profils de coachs ne sont pas écrits en dur dans le HTML. Au chargement de l'accueil, `main.js` récupère `mma.json`, puis construit les cartes correspondantes dans le DOM. Cette approche permet d'ajouter ou de modifier un coach ou une discipline sans dupliquer la structure HTML.

### Une expérience orientée conversion

Le parcours proposé suit l'intention d'un futur membre : découvrir le studio, comprendre l'offre, consulter l'horaire, puis réserver une séance d'essai. Les appels à l'action et la navigation relient directement ces étapes.

### Mobile en priorité pratique

Sous 768 px, la navigation passe en menu hamburger, les cartes de disciplines passent sur deux colonnes et les coachs sont affichés sur une colonne afin de préserver la lisibilité.

## Lancer le projet en local

Le site est statique, mais le chargement de `mma.json` doit être servi via HTTP (et non en ouvrant directement `index.html` dans le navigateur).

```bash
python -m http.server 8000
```

Ouvrir ensuite `http://localhost:8000` dans le navigateur.

## Pistes d'évolution

Les fonctionnalités actuelles permettent de démontrer le front-end. Pour en faire un produit plus proche d'un site de gym en production, les prochaines priorités seraient :

1. **Brancher le formulaire à un service sécurisé** (API, e-mail transactionnel ou CRM) et afficher des états d'envoi/erreur réels. À ce stade, il valide les informations puis confirme localement la demande.
2. **Améliorer l'accessibilité** : gestion du clavier et des attributs ARIA pour les cartes retournables et le menu, indicateurs de focus visibles, contraste vérifié.
3. **Optimiser les médias** : images responsives, formats WebP/AVIF, attributs `width`/`height` et chargement différé pour améliorer les performances perçues.
4. **Rendre l'horaire administrable** à partir de JSON ou d'une API, plutôt que de le maintenir dans le HTML.
5. **Ajouter une base de tests** (validation du formulaire et rendu des données) ainsi qu'un audit Lighthouse avant publication publique.

## Compétences mises en pratique

- Transformer un brief de marque en interface web cohérente.
- Concevoir une architecture front-end simple et maintenable sans dépendance.
- Consommer et afficher des données JSON dans le DOM.
- Créer des interactions utilisateur et valider un formulaire côté client.
- Adapter une interface desktop aux écrans mobiles.
- Versionner et déployer un projet web via GitHub et Railway.

---

*DJB Studio est un projet de démonstration. Les coachs, le studio et les informations présentées sont utilisés à des fins de portfolio.*
