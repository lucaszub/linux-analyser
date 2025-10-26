# Instructions pour GitHub Copilot

## 📋 Vue d'ensemble du projet

**POC Linux Dashboard** - Application de monitoring système Linux avec explorateur de disque interactif pour identifier les fichiers/dossiers qui consomment le plus d'espace.

## 🏗️ Architecture

### Backend (FastAPI + Python)

- **Framework**: FastAPI avec uvicorn
- **Port**: 8000
- **Host**: 0.0.0.0 (accessible depuis le réseau local)
- **Reload**: Activé en développement (`--reload`)
- **Librairie système**: psutil pour toutes les métriques

**Fichiers principaux**:

- `main.py`: Routes API, configuration CORS, endpoints REST
- `data.py`: Collecte de données système, scan de disque, calculs de métriques
- `requirements.txt`: Dépendances Python (fastapi, uvicorn, psutil)

### Frontend (React + TypeScript + Vite)

- **Framework**: React 18 avec TypeScript 5.9.3
- **Build tool**: Vite 7.1.12
- **Styling**: Tailwind CSS 4.1.16
- **Routing**: React Router DOM (multi-page SPA)
- **Graphiques**: Recharts
- **Icônes**: lucide-react
- **Notifications**: react-hot-toast
- **Port dev**: 5173
- **Dossier**: `app/`

**Structure frontend**:

```
app/
├── src/
│   ├── components/      # Composants réutilisables
│   │   ├── Header.tsx
│   │   ├── StatsGrid.tsx
│   │   ├── CPUCores.tsx
│   │   ├── DiskAnalysis.tsx
│   │   ├── DiskDetails.tsx
│   │   ├── DiskUsageChart.tsx      # Pie chart (Recharts)
│   │   ├── FileTypeChart.tsx       # Bar chart (Recharts)
│   │   └── DirectoryTreeView.tsx   # Liste des dossiers
│   ├── pages/
│   │   └── DiskExplorerPage.tsx    # Page d'exploration de disque
│   ├── services/
│   │   └── api.ts                  # Fonctions fetch API
│   ├── types/
│   │   └── system.ts               # Interfaces TypeScript
│   ├── utils/
│   │   └── formatters.ts           # Fonctions utilitaires
│   ├── App.tsx                     # Dashboard principal
│   └── main.tsx                    # Entry point avec React Router
```

## 🔌 API Endpoints

### `GET /`

Retourne toutes les métriques système en temps réel.

**Response**:

```typescript
{
  cpu: { usage_percent, cores_count, cores_usage, frequency_mhz },
  memory: { total, available, percent, used, free },
  disk: { total, used, free, percent },
  network: { bytes_sent, bytes_recv, packets_sent, packets_recv },
  system: { os, hostname, uptime, boot_time, load_avg, processes, connections }
}
```

### `GET /disk/partitions`

Liste toutes les partitions montées.

**Response**:

```json
{
  "partitions": [
    {
      "device": "/dev/sda1",
      "mountpoint": "/",
      "fstype": "ext4",
      "total": 123456789,
      "used": 98765432,
      "free": 24691357,
      "percent": 80.0
    }
  ]
}
```

### `GET /disk/analysis?path=/home`

Analyse basique d'un répertoire (top 20 sous-dossiers).

**Query params**:

- `path` (string): Chemin à analyser (défaut: "/")

**Response**:

```json
{
  "path": "/home",
  "directories": [
    {
      "path": "/home/user",
      "name": "user",
      "size": 123456789,
      "size_gb": 0.12,
      "size_mb": 117.74
    }
  ]
}
```

### `GET /disk/analysis/detailed?path=/home&max_depth=1`

Analyse détaillée avec statistiques enrichies.

**Query params**:

- `path` (string): Chemin à analyser (défaut: "/")
- `max_depth` (int): Profondeur de scan (défaut: 1, max recommandé: 2)

**Response**:

```json
{
  "path": "/home/user",
  "directories": [
    {
      "path": "/home/user/.cache",
      "name": ".cache",
      "size": 750000000,
      "size_gb": 0.7,
      "size_mb": 715.09,
      "percent_of_partition": 1.2,
      "percent_of_analyzed": 45.3,
      "file_count": 1234,
      "dir_count": 56
    }
  ],
  "total_analyzed_size": 1650000000,
  "total_analyzed_size_gb": 1.54,
  "partition_total_size": 74260000000,
  "partition_total_size_gb": 69.15,
  "percent_of_partition_analyzed": 2.2,
  "file_type_distribution": {},
  "directory_count": 20
}
```

## 🎨 Conventions de Code

### Python (Backend)

- **Style**: PEP 8
- **Nommage**: snake_case pour tout (fonctions, variables, fichiers)
- **Type hints**: Utiliser `Dict`, `List`, `Any` de `typing`
- **Gestion d'erreurs**:
  ```python
  try:
      # opération risquée
  except (PermissionError, OSError):
      continue  # ou pass, ou return valeur par défaut
  ```
- **Retours**: Dictionnaires avec clés explicites
- **Documentation**: Docstrings avec description, Args, Returns

**Exemple**:

```python
def get_system_data() -> Dict[str, Any]:
    """
    Collecte toutes les métriques système.

    Returns:
        Dict contenant cpu, memory, disk, network, system
    """
    return {
        "cpu": get_cpu_info(),
        "memory": get_memory_info()
    }
```

### TypeScript/React (Frontend)

- **Style**: ESLint + Prettier
- **Nommage**:
  - Composants: PascalCase (ex: `DiskAnalysis.tsx`)
  - Fonctions: camelCase (ex: `fetchSystemData()`)
  - Types/Interfaces: PascalCase (ex: `SystemData`, `DirectorySizeEnhanced`)
  - Variables: camelCase
- **Composants**: Fonctionnels avec hooks (pas de class components)
- **Props**: Toujours typer avec interface
- **States**: Typer explicitement (`useState<SystemData | null>(null)`)
- **Gestion d'erreur**: try/catch avec états `loading` et `error`

**Exemple**:

```typescript
interface Props {
  data: SystemData;
  onRefresh: () => void;
}

export default function CPUCores({ data, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      await onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return <div>...</div>;
}
```

### Tailwind CSS

- **Utilisation**: Classes utilitaires uniquement (pas de CSS custom)
- **Responsive**: Mobile-first (`sm:`, `md:`, `lg:`)
- **Colors**: Utiliser la palette Tailwind (gray, blue, red, etc.)
- **Spacing**: Utiliser l'échelle Tailwind (px, py, gap, etc.)

**Patterns communs**:

```tsx
// Card avec hover et transition
<div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">

// Button primaire
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">

// Badge
<span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-lg">
```

## ⚡ Performance et Optimisation

### Scan de Disque - CRITIQUE

**Problème**: Le scan récursif complet est EXTRÊMEMENT LENT (plusieurs minutes sur `/`).

**Solution implémentée**:

- Limiter la profondeur à **2 niveaux maximum** (`max_depth=1` par défaut)
- Scanner uniquement les fichiers directs + 1 sous-niveau
- Utiliser `os.scandir()` au lieu de `os.walk()` récursif complet
- Timeout de 15 secondes max
- Skip les dossiers vides ou inaccessibles

**À NE PAS FAIRE**:

```python
# ❌ TROP LENT - Ne jamais faire ça
for dirpath, dirnames, filenames in os.walk(path):
    for filename in filenames:
        size += os.path.getsize(os.path.join(dirpath, filename))
```

**À FAIRE**:

```python
# ✅ RAPIDE - Profondeur limitée
for entry in os.scandir(path):
    if entry.is_file():
        size += entry.stat().st_size
    elif entry.is_dir() and depth < max_depth:
        # Scanner seulement 1 niveau en dessous
        for subentry in os.scandir(entry.path):
            if subentry.is_file():
                size += subentry.stat().st_size
```

### Frontend

- **Polling**: Refresh toutes les 3 secondes pour le dashboard principal
- **Lazy loading**: Pas encore implémenté (à faire si besoin)
- **Memoization**: Utiliser `useMemo` pour les calculs coûteux
- **Debouncing**: Pour les inputs de recherche (pas encore implémenté)

## 🎯 Fonctionnalités Principales

### 1. Dashboard Système (`/`)

- Affichage en temps réel (refresh 3s)
- KPIs: CPU, RAM, Disque, Réseau, Système
- Graphiques par cœur CPU
- Liste des partitions avec barres de progression
- Navigation vers l'explorateur de disque

### 2. Explorateur de Disque (`/disk-explorer`)

- **Navigation**: Breadcrumbs cliquables + bouton retour
- **Tri**: Toujours du plus grand au plus petit
- **Affichage**:
  - Nom du dossier + badge avec pourcentage
  - Taille en GB/MB
  - Position (#1, #2, #3...)
  - Pourcentage par rapport au parent (barre bleue)
  - Pourcentage par rapport à la partition (barre colorée)
  - Nombre de fichiers et sous-répertoires
- **Graphiques**:
  - Pie chart des 8 plus gros dossiers
  - Bar chart des types de fichiers (désactivé car trop lent)
- **Stats cards**:
  - Taille totale de la partition
  - Taille analysée
  - Nombre de répertoires trouvés

### 3. Composants Clés

#### `DiskUsageChart.tsx` (Recharts Pie)

**Important**: Le type `label` de Recharts nécessite `any`:

```typescript
<Pie
  data={chartData}
  label={(props: any) => `${props.percent.toFixed(1)}%`} // ✅ any requis
  dataKey="value"
/>
```

#### `DirectoryTreeView.tsx`

- Liste des dossiers avec double barre de progression
- Click handler pour naviguer dans un dossier
- Affichage du pourcentage en badge bleu

## 🐛 Problèmes Résolus

### 1. ❌ Scan trop lent sur `/`

**Solution**: Limiter à 2 niveaux de profondeur max

### 2. ❌ TypeScript error sur Recharts label

**Solution**: Utiliser `(props: any)` au lieu de `(entry: { percent: number })`

### 3. ❌ CORS entre frontend et backend

**Solution**: Configuration dans `main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. ❌ Navigation lente entre dossiers

**Solution**: Chemin par défaut `/home` au lieu de `/`, affichage instantané

### 5. ❌ `du` command trop spécifique et lente

**Solution**: Remplacer par `os.scandir()` avec profondeur limitée

## 📝 Types TypeScript Importants

```typescript
// Types système de base
interface SystemData {
  cpu: CPUInfo;
  memory: MemoryInfo;
  disk: DiskInfo;
  network: NetworkInfo;
  system: SystemInfo;
}

// Types pour l'analyse de disque
interface DirectorySizeEnhanced {
  path: string;
  name: string;
  size: number;
  size_gb: number;
  size_mb: number;
  percent_of_partition: number;
  percent_of_analyzed: number;
  file_count: number;
  dir_count: number;
}

interface DiskAnalysisDetailed {
  path: string;
  directories: DirectorySizeEnhanced[];
  total_analyzed_size: number;
  total_analyzed_size_gb: number;
  partition_total_size: number;
  partition_total_size_gb: number;
  percent_of_partition_analyzed: number;
  file_type_distribution: Record<string, FileTypeDistribution>;
  directory_count: number;
}
```

## 🚀 Commandes Importantes

### Développement

```bash
# Backend
cd /home/lucas-zubiarrain/poc-linux-dash
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd /home/lucas-zubiarrain/poc-linux-dash/app
npm run dev
```

### Build Production

```bash
cd /home/lucas-zubiarrain/poc-linux-dash/app
npm run build  # Output: dist/
```

### Installation

```bash
# Backend
pip install -r requirements.txt

# Frontend
cd app
npm install
```

## 📚 Documentation Complémentaire

- `KPI_EXPLICATIONS.md`: Détails sur les métriques système
- `FEATURE_DISK_ANALYSIS.md`: Spécifications de l'analyse de disque
- `FEATURE_DISK_EXPLORER_PAGE.md`: Spécifications de la page d'exploration
- `README.md`: Guide utilisateur

## 🔮 Backlog / À Implémenter

- [ ] Cache des résultats de scan (LRU cache avec TTL)
- [ ] Export CSV/JSON des analyses
- [ ] Recherche de fichiers par nom/extension
- [ ] Filtres sur la liste (taille min/max, date)
- [ ] Alertes sur seuils critiques (>90% disque)
- [ ] Dark mode
- [ ] Historique des scans
- [ ] Graphiques de tendance (évolution dans le temps)
- [ ] Support multi-utilisateurs avec authentification
- [ ] API REST complète (DELETE, UPDATE)
- [ ] Websockets pour le temps réel au lieu de polling
- [ ] Compression des gros dossiers
- [ ] Déploiement Docker

## ⚠️ Points d'Attention

1. **Ne jamais** scanner récursivement sans limite de profondeur
2. **Toujours** gérer les `PermissionError` sur les scans de disque
3. **Toujours** afficher un état de chargement pour les opérations longues
4. **Préférer** `os.scandir()` à `os.listdir()` (plus rapide)
5. **Trier** les résultats du plus grand au plus petit (user requirement)
6. **Afficher** les pourcentages par rapport au parent ET à la partition
7. **Utiliser** `lucide-react` pour toutes les icônes (cohérence)
8. **Éviter** `du` command (trop lent, spécifique Linux)

## 🎓 Contexte Utilisateur

L'utilisateur (lucas-zubiarrain) a créé ce projet pour :

- Identifier rapidement ce qui prend de l'espace sur son disque
- Naviguer facilement dans l'arborescence des dossiers
- Voir les pourcentages pour prioriser le nettoyage
- Avoir un dashboard de monitoring système simple et rapide

**Priorité**: Performance > Précision absolue (estimation rapide OK)

## 💡 Best Practices

### Python

- Utiliser `psutil` pour tout ce qui est système (pas de subprocess sauf exception)
- Gérer les symlinks avec `follow_symlinks=False`
- Utiliser `entry.stat()` au lieu de `os.path.getsize()` (plus rapide)
- Limiter les appels système coûteux

### React

- Un état de chargement pour chaque opération async
- Toast notifications pour le feedback utilisateur
- Navigation history pour le bouton retour
- Breadcrumbs pour la navigation contextuelle

### API

- Valeurs par défaut sensibles (path="/", max_depth=1)
- Timeout sur les opérations longues
- Messages d'erreur clairs et exploitables
- Structure JSON cohérente

---

**Dernière mise à jour**: 26 octobre 2025  
**Version**: 1.0.0  
**Statut**: Production-ready ✅
