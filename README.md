# Remotion Render Server (Docker)

Serveur Express qui reçoit un storyboard JSON (`clips`) et génère une vidéo via Remotion.
Les médias distants (image/vidéo) sont téléchargés dans `public/assets` pour être servis au rendu.

---

## Prérequis pour Windows 10

- **Docker Desktop** (mode Linux containers, Docker Compose v2 inclus) :
<https://docs.docker.com/desktop/setup/install/windows-install/>
- (Optionnel) **Node.js 20+** si on veut lancer hors Docker

### Notes

> - Le rendu Remotion utilise Chromium. On monte un cache local pour éviter de retélécharger Chromium à chaque rendu.
> - On monte aussi `./output` pour récupérer les vidéos sur la machine hôte.

## Structure (résumé)

- `src/server.ts` : API HTTP `/render` et `/mcp`
- `src/mcp.ts` : serveur MCP pour Copilot Agent (VS Code)
- `src/Root.tsx` : point d'entrée Remotion, déclare les compositions
- `src/compositions/Composition.tsx` : rendu des clips (React)
- `src/compositions/ClipRenderer.tsx` : rendu d'un clip individuel avec effets
- `src/compositions/AudioTrack.tsx` : rendu de la musique de fond
- `src/compositions/VideoCompositionConfig.tsx` : config de la composition (durée, format, fps)
- `src/compositions/types.ts` : types partagés (MediaClip, VideoCompositionProps...)
- `src/components/transitions/` : transitions disponibles (`fade.ts`, `slide.ts`, `index.ts`)
- `src/components/effects/` : effets disponibles (`zoom.ts`, `index.ts`)
- `src/utils/frames.ts` : calcul de la durée totale en frames
- `src/utils/timing.ts` : construction du timing des transitions
- `src/utils/zoom.ts` : hook useZoomStyle
- `src/services/download.service.ts` : download des médias vers `public/assets`
- `src/services/render.service.ts` : orchestration du rendu Remotion
- `public/assets/` : médias téléchargés (servis pendant le rendu)
- `out/` : vidéos rendues

## Contrat JSON

```json
{
  "width": 1080,
  "height": 1920,
  "fps": 30,
  "clips": [
    {
      "id": "clip-1",
      "type": "image",
      "url": "https://...",
      "duration": 3.0,
      "effect": {
        "type": "kenBurns",
        "fromX": 50,
        "fromY": 50,
        "toX": 65,
        "toY": 35,
        "intensity": 1.3
      },
      "transitionToNext": {
        "type": "whiteFade",
        "timing": "spring",
        "damping": 200
      }
    },
    {
      "id": "clip-2",
      "type": "video",
      "url": "https://...",
      "duration": 5.0,
      "trimStart": 0
    }
  ],
  "audio": {
    "musicUrl": "/assets/music.mp3",
    "volume": 0.8
  }
}
```

### Champs racine

| Champ | Type | Défaut | Description |
| --- | --- | --- | --- |  
| `width` | number | 1080 | Largeur en pixels |
| `height` | number | 1920 | Hauteur en pixels |
| `fps` | number | 30 | Images par seconde |
| `clips` | MediaClip[] | — | Liste des plans |
| `audio.musicUrl` | string | — | URL ou `/assets/...` |
| `audio.volume` | number | 1 | Volume entre 0 et 1 |

### MediaClip

| Champ | Type | Requis | Description |
 | --- | --- | --- | --- |
| `id` | string | ✅ | Identifiant unique |
| `type` | `"image"` \| `"video"` | ✅ | Type de média |
| `url` | string | ✅ | URL externe ou `/assets/...` |
| `duration` | number | ✅ | Durée en secondes |
| `trimStart` | number | — | Offset de départ (vidéo) en secondes |
| `transitionToNext` | TransitionConfig | — | Transition vers le clip suivant |
| `effect` | EffectConfig | — | Effet visuel appliqué au clip |

### TransitionConfig

| Champ | Type | Défaut | Description |
 | --- | --- | --- | --- |  
| `type` | TransitionType | — | Nom de la transition |
| `timing` | `"linear"` \| `"spring"` | `"linear"` | Type d'animation |
| `durationInFrames` | number | défaut du fichier | Durée (linear uniquement) |
| `damping` | number | 200 | Amorti du ressort (spring uniquement) |

### Transitions disponibles

| Nom | Description |
 | --- | --- |  
| `whiteFade` | Fondu blanc |
| `swipeLeft` | Glissement depuis la droite |
| `swipeRight` | Glissement depuis la gauche |
| `swipeUp` | Glissement depuis le bas |
| `swipeDown` | Glissement depuis le haut |

### EffectConfig

| Champ | Type | Requis | Description |
 | --- | --- | --- | --- |  
| `type` | `"zoomIn"` \| `"zoomOut"` \| `"kenBurns"` | ✅ | Type d'effet |
| `intensity` | number | 1.2 | Ampleur du zoom |
| `fromX` | number | 50 | Position X départ (kenBurns) en % |
| `fromY` | number | 50 | Position Y départ (kenBurns) en % |
| `toX` | number | 60 | Position X arrivée (kenBurns) en % |
| `toY` | number | 40 | Position Y arrivée (kenBurns) en % |

---

## Démarrage (Docker Compose)

### 1) Créer les dossiers locaux

```powershell
mkdir .\output -Force | Out-Null
mkdir .\chrome-cache -Force | Out-Null
```

### 2) Lancer le serveur

```powershell
docker compose up --build
```

Le serveur écoute sur <http://localhost:3000>.

### 3) Arrêter

```powershell
docker compose down
```

---

## Tester un rendu (PowerShell)

### Sans transition (cut)

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/render" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "clips": [
      { "id": "clip-1", "type": "image", "url": "https://sentience.pm/assets/img/poster.jpg", "duration": 2.0 },
      { "id": "clip-2", "type": "video", "url": "https://cdn.pixabay.com/video/2024/10/12/236095_small.mp4", "duration": 3.0, "trimStart": 0 }
    ]
  }'
```

### Fondu blanc

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/render" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "clips": [
      { "id": "clip-1", "type": "image", "url": "https://sentience.pm/assets/img/poster.jpg", "duration": 3.0, "transitionToNext": { "type": "whiteFade", "timing": "linear", "durationInFrames": 20 } },
      { "id": "clip-2", "type": "video", "url": "https://cdn.pixabay.com/video/2024/10/12/236095_small.mp4", "duration": 3.0, "trimStart": 0 }
    ]
  }'
```

### Swipe

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/render" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "clips": [
      { "id": "clip-1", "type": "video", "url": "https://cdn.pixabay.com/video/2024/10/12/236095_small.mp4", "duration": 3.0, "trimStart": 0, "transitionToNext": { "type": "swipeLeft", "timing": "spring", "damping": 200 } },
      { "id": "clip-2", "type": "video", "url": "https://cdn.pixabay.com/video/2025/08/18/298103_small.mp4", "duration": 3.0, "trimStart": 0 }
    ]
  }'
```

### Effet zoom + transition

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/render" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "clips": [
      { "id": "clip-1", "type": "image", "url": "https://sentience.pm/assets/img/poster.jpg", "duration": 4.0, "effect": { "type": "kenBurns", "fromX": 50, "fromY": 50, "toX": 65, "toY": 35, "intensity": 1.3 }, "transitionToNext": { "type": "whiteFade", "timing": "spring", "damping": 200 } },
      { "id": "clip-2", "type": "video", "url": "https://cdn.pixabay.com/video/2024/10/12/236095_small.mp4", "duration": 4.0, "trimStart": 0, "effect": { "type": "zoomIn", "intensity": 1.2 } }
    ]
  }'
```

### Réponse attendue

```json
{ "success": true, "output": "/app/out/video-XXXXXXXXXXXX.mp4" }
```

Le fichier `.mp4` apparaît dans `./output/`.

---

## MCP Server (Copilot Agent VS Code)

Le serveur expose un endpoint MCP sur `/mcp` pour permettre à Copilot Agent de lancer des rendus en langage naturel.

### Configuration `.vscode/mcp.json`

```json
{
  "servers": {
    "remotion-render": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

### Utilisation dans Copilot Agent

```json
Génère une vidéo avec ces deux clips :
- https://... pendant 3 secondes
- https://... pendant 3 secondes
avec une transition whiteFade entre les deux, format 9:16
```

---

## Volumes & Cache

| Volume | Description |
 | --- | --- |  
| `./output:/app/out` | Récupère les mp4 rendus |
| `./chrome-cache:/app/.remotion-browser-cache` | Cache Chromium |

### Variables d'env

```json
REMOTION_CHROME_CACHE_DIR=/app/.remotion-browser-cache
PUPPETEER_CACHE_DIR=/app/.remotion-browser-cache
```

---

## Troubleshooting

### 1) Vidéo noire / médias non chargés

- Vérifie que les fichiers sont bien téléchargés dans `public/assets` (dans le container).
- Vérifie que `Composition.tsx` utilise `staticFile()` quand `url` commence par `/`.

### 2) Erreurs type `Can't resolve 'path'` / bundler

- Ne jamais importer `express`, `fs`, `path`, `@remotion/bundler`, `@remotion/renderer` dans les fichiers React (`src/compositions/**`).
- Ces imports doivent rester côté serveur (`src/server.ts`, `src/services/**`).

### 3) Chromium retéléchargé à chaque render

- Vérifie que le volume `./chrome-cache:/app/.remotion-browser-cache` est bien monté.
- Vérifie les variables `REMOTION_CHROME_CACHE_DIR` / `PUPPETEER_CACHE_DIR`.

### 4) Écran noir en fin de vidéo

- Vérifier que `calculateTotalFrames` soustrait bien l'overlap des transitions spring (~0.8s par défaut).

---

## Commandes utiles

Voir les mp4 générés :

```powershell
Get-ChildItem .\output\ -Filter *.mp4 | Sort-Object LastWriteTime -Descending | Select-Object -First 5 Name,Length,LastWriteTime
```

Logs :

```powershell
docker compose logs -f
```
