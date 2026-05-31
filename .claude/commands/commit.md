# /commit

> Sauvegarde le workspace avec git.

## Ce que fait cette commande

1. Initialise git si ce n'est pas encore fait
2. Vérifie que `.gitignore` protège bien `.env` et `.secrets/`
3. Affiche ce qui va être sauvegardé (`git status`)
4. Demande un message de commit (ou en génère un automatiquement si non fourni)
5. Stage tous les fichiers et crée le commit

## Instructions pour Claude

Quand Aaron lance `/commit` :

### Étape 1 — Vérifier l'état du repo

```bash
git status
```

Si git n'est pas initialisé (`fatal: not a git repository`), lancer :

```bash
git init
```

### Étape 2 — Vérifier le .gitignore

S'assurer que `.env` et `.secrets/` sont bien dans `.gitignore`. Si ce n'est pas le cas, le corriger avant de continuer.

### Étape 3 — Message de commit

Si Aaron a passé un argument à la commande (ex: `/commit ajout flyer restaurant`), utiliser cet argument comme message.

Sinon, générer automatiquement un message court et descriptif basé sur `git status` (ex: "ajout structure livrables et README").

### Étape 4 — Commiter

```bash
git add .
git commit -m "[message]"
```

### Étape 5 — Confirmer

Afficher un résumé de ce qui a été sauvegardé.

## Rappel de sécurité

Avant chaque commit, vérifier que `.env` et `.secrets/` n'apparaissent PAS dans les fichiers stagés. Si c'est le cas, stopper et corriger.
