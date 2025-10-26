# 🖥️ Server Monitor Dashboard

Dashboard de monitoring serveur en temps réel avec FastAPI (backend) et React + TypeScript + Tailwind CSS (frontend).

![Dashboard Preview](https://via.placeholder.com/800x400/f9fafb/1f2937?text=Server+Monitor+Dashboard)

## 🚀 Fonctionnalités

- ✅ Monitoring CPU en temps réel (global + par cœur)
- 💾 Utilisation de la RAM et SWAP
- 💿 Statistiques disque et I/O
- 🌐 Statistiques réseau
- 📊 Informations système détaillées
- 🔄 Rafraîchissement automatique toutes les 3 secondes
- 🎨 Interface moderne avec Tailwind CSS

## 📋 Prérequis

- **Python 3.8+** avec `pip`
- **Node.js 18+** avec `npm`
- **Linux** (psutil fonctionne sur Windows/Mac mais certaines métriques peuvent différer)

## 🛠️ Installation

### 1. Backend (FastAPI)

```bash
# Créer un environnement virtuel
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt
```

### 2. Frontend (React + Vite)

```bash
cd app
npm install
```

## 🚀 Lancement

### Terminal 1 : Backend

```bash
# Depuis la racine du projet
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Le backend sera accessible sur : **http://localhost:8000**

### Terminal 2 : Frontend

```bash
# Depuis le dossier app/
cd app
npm run dev
```

Le frontend sera accessible sur : **http://localhost:5173**

## 📊 KPI Collectés

### CPU

- Pourcentage d'utilisation global
- Utilisation par cœur
- Nombre de cœurs (physiques/logiques)
- Fréquence CPU (actuelle/min/max)
- Load average (1, 5, 15 min)

### Mémoire

- RAM : total, utilisé, disponible, pourcentage
- SWAP : total, utilisé, libre, pourcentage

### Disque

- Espace : total, utilisé, libre, pourcentage
- I/O : lectures/écritures (bytes + opérations)

### Réseau

- Bande passante : upload/download
- Paquets envoyés/reçus
- Erreurs réseau
- Nombre de connexions actives

### Système

- Uptime (temps depuis le dernier boot)
- Nombre de processus
- Boot time

## 📁 Structure du projet

```
poc-linux-dash/
├── main.py                 # API FastAPI
├── data.py                 # Collecte des données système (psutil)
├── requirements.txt        # Dépendances Python
├── KPI_EXPLICATIONS.md     # Documentation des KPI
└── app/                    # Frontend React
    ├── src/
    │   ├── components/     # Composants React
    │   │   ├── Header.tsx
    │   │   ├── StatsGrid.tsx
    │   │   ├── SystemInfo.tsx
    │   │   ├── CPUCores.tsx
    │   │   └── DiskDetails.tsx
    │   ├── services/
    │   │   └── api.ts      # Appels API
    │   ├── types/
    │   │   └── system.ts   # Types TypeScript
    │   ├── utils/
    │   │   └── formatters.ts
    │   ├── App.tsx
    │   └── main.tsx
    └── package.json
```

## 🔧 Configuration

### Backend - CORS

Le backend autorise les requêtes depuis `http://localhost:5173` (Vite dev server).

Pour modifier, éditez `main.py` :

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Modifiez ici
    ...
)
```

### Frontend - API URL

L'URL de l'API est configurée dans `app/src/services/api.ts` :

```typescript
const API_URL = "http://localhost:8000";
```

## 📖 Documentation des KPI

Consultez [KPI_EXPLICATIONS.md](./KPI_EXPLICATIONS.md) pour une explication détaillée de tous les indicateurs.

## 🎨 Personnalisation

### Modifier l'intervalle de rafraîchissement

Dans `app/src/App.tsx` :

```typescript
const interval = setInterval(loadData, 3000); // 3000ms = 3 secondes
```

### Ajouter des seuils d'alerte

Modifiez les fonctions `getColorClass` dans les composants pour ajuster les seuils :

```typescript
const getColorClass = (percent: number) => {
  if (percent < 30) return "bg-green-50 text-green-700";
  if (percent < 60) return "bg-blue-50 text-blue-700";
  if (percent < 80) return "bg-orange-50 text-orange-700";
  return "bg-red-50 text-red-700";
};
```

## 🐛 Dépannage

### Erreur "Failed to fetch system data"

1. Vérifiez que le backend est lancé : `curl http://localhost:8000`
2. Vérifiez les CORS dans la console du navigateur
3. Assurez-vous que `psutil` est installé : `pip list | grep psutil`

### Données manquantes ou incorrectes

Certaines métriques peuvent nécessiter des privilèges root sur Linux :

```bash
sudo uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Port déjà utilisé

```bash
# Backend
lsof -ti:8000 | xargs kill -9

# Frontend
lsof -ti:5173 | xargs kill -9
```

## 📦 Production Build

### Frontend

```bash
cd app
npm run build
```

Les fichiers de production seront dans `app/dist/`.

### Backend

Pour la production, utilisez un serveur ASGI comme **Gunicorn** :

```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 📄 Licence

MIT

## 👤 Auteur

Lucas Zubiarrain

---

**Note :** Ce dashboard est conçu pour des environnements Linux. Sur Windows/Mac, certaines métriques peuvent être indisponibles ou afficher des valeurs différentes.
