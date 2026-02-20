# Remotion Render Server (Docker)

Serveur Express qui reçoit un storyboard JSON (`scenes`) et génère une vidéo via Remotion.
Les médias distants (image/vidéo) sont téléchargés dans `public/assets` pour être servis au rendu.

---

## Prérequis pour Windows 10

- **Docker Desktop** (mode Linux containers, Docker Compose v2 inclus ) :
<https://docs.docker.com/desktop/setup/install/windows-install/>
- (Optionnel) **Node.js 20+** si on veux lancer hors Docker

### Notes

> - Le rendu Remotion utilise Chromium. On monte un cache local pour éviter de retélécharger Chromium à chaque rendu.
> - On monte aussi `./output` pour récupérer les vidéos sur la machine hôte.

## Structure (résumé)

- `src/server.ts` : API HTTP `/render`
- `src/compositions/Composition.tsx` : composition Remotion (React)
- `src/services/download.service.ts` : download des médias vers `public/assets`
- `public/assets/` : médias téléchargés (servis pendant le rendu)
- `output/` : vidéos rendues (monté depuis le container)

## Démarrage (Docker Compose)

### 1) Créer les dossiers locaux

`mkdir .\output -Force | Out-Null`
`mkdir .\chrome-cache -Force | Out-Null`

### 2) Lancer le serveur

`docker compose up --build`

Le serveur écoute sur <http://localhost:3000>.

### 3) Arrêter

`docker compose down`

## Tester un rendu (curl PowerShell)

Dans un autre PowerShell :

curl -Method POST <http://localhost:3000/render> `
-Headers @{"Content-Type"="application/json"} `
  -Body '{
    "scenes": [
      {
        "id": "s1",
        "type": "image",
        "url": "https://media.charentelibre.fr/19080144/1000x625/grand-angouleme-72c6ce6c1f1847768d9e6e868a861c16-103907-ph0.jpg?v=1711444825",
        "duration": 4
      },
      {
        "id": "s2",
        "type": "video",
        "url": "https://dirkemlfbqaybvddeeis.supabase.co/storage/v1/object/public/assets/1/tournoi.mp4",
        "duration": 6,
        "trimStart": 0
      }
    ]
  }'

### Réponse attendue (exemple)

  `{ "success": true, "output": "/app/out/video-XXXXXXXXXXXX.mp4" }`

Le fichier .mp4 doit apparaître dans `./output/.`

## Volumes & Cache

`./output:/app/out` : récupère les mp4 rendus

`./chrome-cache:/app/.remotion-browser-cache` : cache Chromium (évite les re-download)

### Variables d’env (déjà dans le compose)

`REMOTION_CHROME_CACHE_DIR=/app/.remotion-browser-cache`

`PUPPETEER_CACHE_DIR=/app/.remotion-browser-cache`

## Troubleshooting

### 1) Vidéo noire / médias non chargés

- Vérifie que les fichiers sont bien téléchargés dans public/assets (dans le container).
- Vérifie que Composition.tsx utilise staticFile() quand url commence par /.

### 2) Erreurs type Can't resolve 'path' / bundler

- Ne jamais importer express, fs, path, @remotion/bundler, @remotion/renderer dans les fichiers React (ex: src/compositions/**).

- Ces imports doivent rester côté serveur (src/server.ts, src/services/**).

### 3) Chromium retéléchargé à chaque render

- Vérifie que le volume ./chrome-cache:/app/.remotion-browser-cache est bien monté.

- Vérifie les variables REMOTION_CHROME_CACHE_DIR / PUPPETEER_CACHE_DIR.

## Commandes utiles

- Voir les mp4 générés :

`Get-ChildItem .\output\ -Filter *.mp4 | Sort-Object LastWriteTime -Descending | Select-Object -First 5 Name,Length,LastWriteTime`

- Logs :

`docker compose logs -f`
