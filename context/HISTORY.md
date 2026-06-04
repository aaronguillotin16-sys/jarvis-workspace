# Workspace History

> Journal chronologique de toutes les sessions et décisions importantes.
> Le plus récent en haut. Mis à jour automatiquement par Claude.
>
> **Comment ça marche :** Quand je lance la commande `/update` après une session importante, ou quand je raconte un changement significatif, Claude ajoute une entrée ici automatiquement. Je n'ai pas à écrire ce fichier manuellement.

---

## 2026-06-02

### Nomad Barber V1 — terminé

**Projet**
- Deuxième prototype de site pour la stratégie "vente de sites aux commerces locaux"
- Client cible : nomadbarber44, barbier à domicile en Loire-Atlantique (TikTok/Calendly)
- Approche : proto envoyé par mail, si intéressé → vente du site
- Statut : V1 confirmée terminée par Aaron (02/06/2026)

**Stack**
- Next.js 16 + TypeScript + Tailwind + Framer Motion
- Projet : `livrables/sites/nomad-barber-v1/`
- Photos réelles du barber intégrées (`public/photos/`)

**Fonctionnalités**
- Hero ScrollExpandMedia : photo client cornrows qui s'agrandit au scroll, fond blanc, titre "NOMAD BARBER"
- Tarifs style Apple/iPhone : cards blanches sur fond #f5f5f7, 6 prestations avec prix
- Calendrier de réservation custom intégré (bottom sheet iOS, sélection date + créneau, pas de redirect Calendly)
- Galerie de coupes + avis clients
- Prix indicatifs (à confirmer avec le barber)

**Todo restant**
- Obtenir les vrais tarifs de nomadbarber44
- Envoyer le mail de prospection au barber

---

### Refonte section Boissons — The Butcher Food

**Images**
- Remplacement des images Unsplash par les vraies photos locales (`public/boisson/`)
- Ajout Coca-Cola (1.50€, rouge) avec `images.jpeg`
- Fanta : 4 parfums (Fruit du Dragon, Citron, Orange, Mangue) avec leurs vraies photos
- Oasis : 2 parfums (Tropicale, Pomme Poire) avec vraies photos
- Sprite, Red Bull, Brest Cola, Ice Tea, Cristaline, Cristaline Aromatisée mappés

**Design cartes**
- Style calqué sur référence type Uber Eats : fond coloré par marque + canette détourée
- `mix-blend-multiply` sur toutes les images pour supprimer les fonds blancs (détourage CSS)
- Badge prix : fond jaune `#F5C000` + texte noir (inversion de l'ancien style)
- Dégradé diagonal `145deg` sur la zone colorée : blanc/22% en haut-gauche → noir/28% en bas-droite

**Navigation**
- Desktop : flèches `‹` / `›` (z-20, semi-transparentes) sur les cartes multi-parfums
- Mobile : points de navigation inchangés

**Todo restant**
- Vérifier que le mapping images.jpeg = Coca-Cola, images(1).jpeg = Brest Cola, etc. est correct
- Remplacer `public/logo.svg` par le vrai logo
- Confirmer les prix du menu avec le gérant
- Présenter le prototype au gérant

---

## 2026-06-01

### Refonte v2 du site The Butcher Food

**Design & ambiance**
- Passage en palette noir et blanc strict (fini le dark industriel rouge)
- Fond blanc uni sur tout le site, footer noir pour la séparation
- Logo Butcher en hero (SVG placeholder créé, à remplacer par logo.png réel)
- Fond hero : blanc pur sans image de fond

**Menu**
- Catégorie "Sandwichs" renommée "Kebabs" (meilleure lisibilité client)
- Ajout catégorie "Menu Enfant" avec Winders clairement identifié (bannière dorée, badge "Petites Portions")
- Ajout catégorie "Desserts" : Tiramisu Maison + Tarte au Daim (4€ chacun, à confirmer)
- 6 onglets au total : Kebabs, Burgers, Tacos, Assiettes, Menu Enfant, Desserts
- Effet 3D tilt (react-parallax-tilt) réactivé sur toutes les cartes produits

**Boutons**
- Intégration du composant LiquidButton (effet verre liquide) sur tous les boutons cliquables :
  onglets menu, bouton téléphone, "J'ai passé ma commande", "Nouvelle commande", liens footer
- Correction bug Slot Radix (multi-enfants) : ajout prop `href` natif sur LiquidButton

**Technique**
- Nouvelles dépendances : @radix-ui/react-slot, class-variance-authority, clsx, tailwind-merge
- Composant créé : `components/ui/liquid-glass-button.tsx` + `lib/utils.ts`
- Config Next.js : dangerouslyAllowSVG activé pour le logo

**Todo restant**
- Remplacer `public/logo.svg` par la vraie photo du logo (sauvegarder en `public/logo.png` et changer mediaSrc dans page.tsx)
- Confirmer les prix du menu avec le gérant du Butcher Food
- Présenter le prototype au gérant

---

## 2026-05-31

### Premier prototype de site web client — The Butcher Food
- Création d'un site vitrine pour The Butcher Food, snack à Montoir-de-Bretagne
- Premier projet concret de la stratégie "vente de sites aux commerces locaux"
- Stack : Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion, react-parallax-tilt
- Fonctionnalités : hero scroll-expansion, carte complète (23 produits), style dark industriel, mobile-first, suivi commande style Uber Eats
- Projet dans `C:\Users\GAELASTOU44\Downloads\butcher-food`, livrable dans `livrables/sites/2026-05-31_the-butcher-food/`
- Statut : prototype terminé, à présenter au gérant pour décrocher la mission

---

## 2026-05-20

### Approfondissement du profil personnel
- Ajout de la section "Ma personnalité et mes centres d'intérêt" dans CONTEXT.md
- Origines sénégalaises, vit avec sa mère et sa soeur
- Personnalité : sociable par effort, empathique, bavard, impatient, facilement distrait
- Centres d'intérêt : TikTok, animés, jeux vidéo, dessin, basket, sorties avec les potes
- Inspirations : Mous-K, Yomi Denzel, MarV
- Potes proches : Jules, Enzo, Siad, Maxence
- Galères identifiées : frustration financière, difficulté de concentration, tendance à consommer du contenu sans agir
- Point scolaire : 12,50 de moyenne, stratégie du minimum suffisant pour le bac

---

### Installation initiale du Jarvis
- Workspace personnalisé pour Aaron, basé à Montoir-de-Bretagne (44)
- Profil principal : étudiant (Bac Pro Vente, 2e année) avec mentalité entrepreneur
- Activité : lycéen à Saint-Nazaire, job en centre de loisirs, préparation de business en ligne
- Objectifs court terme identifiés : générer ses premiers revenus en ligne, lancer une boutique e-commerce, décrocher des clients en création de sites web, réussir l'année scolaire, reconstituer le capital cet été
- Vision long terme : 10 000 euros de CA mensuel, boutique en ligne rentable, potentiellement une agence web, obtenir le Bac
- Projets actifs au démarrage : boutique e-commerce (réflexion), vente de sites web aux commerces locaux (réflexion), année scolaire, jobs d'été
- Domaine d'aide prioritaire : création de sites web et boutiques en ligne
- Style de communication choisi : direct, comme un pote, cash et honnête
