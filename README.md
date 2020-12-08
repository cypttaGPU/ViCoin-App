# Introduction
Ce projet a été développé afin de répondre aux exigences d'un mini-projet pour le cours Vi du Master MSE.
Ce cours demande de créer un programme permettant de visualiser des informations.

# Motivation et histoire derrière ce programme
Avec l'avancement constant de la cryptomonnaie et le besoin insatiable d'anonymat, la cryptomonnaie prend une place essentielle à tout achat en ligne.

Cependant, pour qu'une personne utilise cette monnaie virtuelle, il est nécessaire de connaître son fonctionnement avant.

Notre programme répondra donc aux questions :
- Est-ce que cette monnaie est falsifiable ?
- Comment fonctionne une blockchain ?
- Quels sont les liens entre les différents blocs ?
- Comment se visualiser simplement une blockchain ?

De plus, afin de répondre aux exigences du cours, notre programme contient également :
- Un concept intéressant
- Une argumentation sur le sujet simple à interpréter
- Une réalisation par groupe de 3 personnes avec une gestion de projet (Trello, Jira, ...)
- Permettre d'interagir avec notre programme afin de préciser les informations visualisées
- Une documentation expliquant:
    - l'utilisation du programme 
    - notre motivation,
    - l'histoire que notre programme apporte
    - la problématique de départ
    - et notre public cible
- Quelles informations avons-nous utilisées afin de réaliser ce projet (références) ?
- Volume de travail

# Problématique de départ
Notre problématique de départ est: `Comment fonctionne une blockchain et comment peut-on interagir avec elle ?`

# Public cible
Nous ciblons les personnes qui souhaiteraient utiliser une monnaie virtuelle (comme le Bitcoin, Éther ...) et souhaiteraient, afin d'y parvenir, comprendre le fonctionnement derrière ce type de monnaie: "La blockchain".

# Principes du cours mis en pratique dans ce projet
Notre programme a pour but de permettre de visualiser mentalement le fonctionnement d'une cryptomonnaie (Slide 17 du Cours 3 sur les représentations mentales). 

Afin d'y parvenir, nous avons utilisé les règles de Gestalt suivantes:
- 2: Figure-Ground (a chest contains money)
- 4: Similarity (Multiples chests are a group: "A Blockchain")
- 5: Common fate (All chests move in same time in the same direction because it's a chain ("Blockchain").
- 7: Continuity (Same reason of the rule 5)
- 9: Common region (The chests are separate of the labels to represent a group)

<div style="text-align: center"><img src="./doc_img/314e3064c750fbf7d73146b67e81a4f6.png" title="Gestalt rules" height="300px"/></div>

Pour développer le système, le programme utilise la technologie "p5.js" auquel nous avions pensé depuis le cours 5 durant l'explication "Processing" (Slide 9 à 12). 
Son fonctionnement est très simple et permet de visualiser des données rapidement et efficacement.
En apprenant la technologie, nous avons mis en place 2 catégories d'interactions (Cours 5 à la slide 8, "Stalko 2007"):
- Abstract/Elaborate: Permettre d'afficher les données dans nos coffres en cliquant sur eux.
- Explore: Permettre de modifier la liste de transactions pour voir le résultat.

Il était important pour nous de conserver ce système sous forme de simulateur, cependant nous cherchions également à rendre ce système ludique afin de permettre de permettre d'avoir une certaine satisfaction.
De plus, nous avons décidé de simplifier l'algorithme de cryptomonnaie pour faciliter la compréhension et la mémorisation de nos utilisateurs (Slide 9 du cours 7).

Toute notre mise en place a été mûrement réfléchie avant d'être réalisée. Après avoir décidé du sujet, nous avons décidé de son contenu et de son apparence en faisant une maquette/Mockup (Slide 17 du cours 7) avec un Whiteboard collaboratif.

<div style="text-align: center"><img src="./doc_img/whiteboard_meeting_interface.png" title="Whiteboard collaboratif" height="150px"/></div>

Le principe utilisé pour la visualisation était d'avoir un point de vue global ("Overview") et détaillé par interactions (Slide 19 et 20 du cours 8).

# Fonctionnalités du projet
- Visualisation d'une blockchain interactive et animée
- Permettre de créer des transactions à partir d'une monnaie virtuelle
- Permettre de gagner de l'argent en minant du ViCoin
