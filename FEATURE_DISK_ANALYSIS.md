# 🗂️ Feature: Analyse Détaillée du Disque

## 📋 Vue d'ensemble

Cette fonctionnalité permet d'analyser en profondeur l'utilisation du disque dur pour identifier **ce qui prend le plus de place** sur votre serveur. Elle affiche :

- ✅ Toutes les partitions montées avec leurs détails
- ✅ Les 20 plus gros répertoires d'un chemin donné
- ✅ Une interface visuelle pour explorer les répertoires
- ✅ Navigation par clic pour descendre dans l'arborescence
- ✅ Tri automatique par taille décroissante

---

## 🎯 Objectif

Répondre à la question : **"Qu'est-ce qui prend le plus de place sur mon disque ?"**

---

## 🏗️ Architecture de la solution

### Stack technique
- **Backend** : FastAPI + Python (`psutil` pour la collecte de données)
- **Frontend** : React + TypeScript + Tailwind CSS
- **Communication** : REST API (JSON)

### Flux de données
```
[Utilisateur] → [React Component] → [API Service] → [FastAPI Route] → [Python psutil] → [Système de fichiers]
                                                                                              ↓
[Affichage UI] ← [React State] ← [JSON Response] ← [FastAPI Response] ← [Data Processing] ←┘
```

---

## 📝 Étapes de mise en œuvre

### **ÉTAPE 1 : Backend - Ajout des fonctions de collecte de données**

#### 1.1 Ouvrir le fichier `data.py`
```bash
code /home/lucas-zubiarrain/poc-linux-dash/data.py
```

#### 1.2 Ajouter les fonctions suivantes à la fin du fichier

```python
def get_disk_partitions_details():
    """
    Récupère les détails de toutes les partitions montées sur le système.
    
    Returns:
        list: Liste de dictionnaires contenant les informations des partitions
    """
    partitions = []
    for partition in psutil.disk_partitions():
        try:
            usage = psutil.disk_usage(partition.mountpoint)
            partitions.append({
                "device": partition.device,
                "mountpoint": partition.mountpoint,
                "fstype": partition.fstype,
                "total": usage.total,
                "used": usage.used,
                "free": usage.free,
                "percent": usage.percent
            })
        except PermissionError:
            # Ignore les partitions inaccessibles (ex: CD-ROM vides)
            continue
    return partitions


def get_directory_sizes(path="/", max_depth=1):
    """
    Analyse les répertoires pour trouver ce qui prend le plus de place.
    
    ATTENTION: Cette fonction peut être lente sur les gros systèmes de fichiers.
    Utilisez max_depth=1 pour limiter la profondeur de l'analyse.
    
    Args:
        path (str): Chemin du répertoire à analyser (défaut: "/")
        max_depth (int): Profondeur maximale de l'analyse (défaut: 1)
    
    Returns:
        list: Top 20 des répertoires triés par taille décroissante
    """
    import os
    directories = []
    
    try:
        for entry in os.scandir(path):
            if entry.is_dir(follow_symlinks=False):
                try:
                    # Calculer la taille totale du répertoire
                    size = 0
                    for dirpath, _, filenames in os.walk(entry.path):
                        for filename in filenames:
                            try:
                                filepath = os.path.join(dirpath, filename)
                                size += os.path.getsize(filepath)
                            except (OSError, FileNotFoundError):
                                # Fichier supprimé ou inaccessible pendant le scan
                                continue
                    
                    directories.append({
                        "path": entry.path,
                        "name": entry.name,
                        "size": size,
                        "size_gb": round(size / (1024**3), 2),
                        "size_mb": round(size / (1024**2), 2)
                    })
                except (PermissionError, OSError):
                    # Répertoire inaccessible (permissions insuffisantes)
                    continue
        
        # Trier par taille décroissante et retourner le top 20
        directories.sort(key=lambda x: x['size'], reverse=True)
        return directories[:20]
        
    except (PermissionError, OSError, FileNotFoundError) as e:
        print(f"Erreur lors de l'analyse de {path}: {e}")
        return []
```

#### 1.3 Importer `os` en haut du fichier si ce n'est pas déjà fait
```python
import os
```

**✅ Validation :** Le fichier `data.py` doit maintenant contenir 3 fonctions :
- `get_system_data()`
- `get_disk_partitions_details()`
- `get_directory_sizes(path, max_depth)`

---

### **ÉTAPE 2 : Backend - Ajout des routes API**

#### 2.1 Ouvrir le fichier `main.py`
```bash
code /home/lucas-zubiarrain/poc-linux-dash/main.py
```

#### 2.2 Modifier les imports
```python
from data import get_system_data, get_disk_partitions_details, get_directory_sizes
```

#### 2.3 Ajouter les nouvelles routes après la route `@app.get("/")`

```python
@app.get("/disk/partitions")
async def disk_partitions():
    """
    Endpoint pour récupérer toutes les partitions montées.
    
    Returns:
        JSON: { "partitions": [...] }
    """
    return {"partitions": get_disk_partitions_details()}


@app.get("/disk/analysis")
async def disk_analysis(path: str = "/"):
    """
    Endpoint pour analyser l'utilisation du disque par répertoire.
    
    Query params:
        path (str): Chemin à analyser (défaut: "/")
    
    Returns:
        JSON: { "path": "/home", "directories": [...] }
    """
    return {
        "path": path,
        "directories": get_directory_sizes(path)
    }
```

**✅ Validation :** Tester les endpoints
```bash
# Terminal 1 - Lancer le serveur
cd /home/lucas-zubiarrain/poc-linux-dash
source venv/bin/activate
python -m uvicorn main:app --reload

# Terminal 2 - Tester les routes
curl http://localhost:8000/disk/partitions
curl http://localhost:8000/disk/analysis?path=/home
```

---

### **ÉTAPE 3 : Frontend - Mise à jour des types TypeScript**

#### 3.1 Ouvrir le fichier `app/src/types/system.ts`
```bash
code /home/lucas-zubiarrain/poc-linux-dash/app/src/types/system.ts
```

#### 3.2 Ajouter les nouveaux types à la fin du fichier

```typescript
export interface DiskPartition {
  device: string;
  mountpoint: string;
  fstype: string;
  total: number;
  used: number;
  free: number;
  percent: number;
}

export interface DirectorySize {
  path: string;
  name: string;
  size: number;
  size_gb: number;
  size_mb: number;
}

export interface DiskAnalysis {
  path: string;
  directories: DirectorySize[];
}
```

**✅ Validation :** Vérifier qu'il n'y a pas d'erreurs TypeScript
```bash
cd /home/lucas-zubiarrain/poc-linux-dash/app
npm run build
```

---

### **ÉTAPE 4 : Frontend - Mise à jour du service API**

#### 4.1 Ouvrir le fichier `app/src/services/api.ts`
```bash
code /home/lucas-zubiarrain/poc-linux-dash/app/src/services/api.ts
```

#### 4.2 Mettre à jour les imports
```typescript
import type { SystemData, DiskPartition, DiskAnalysis } from '../types/system';
```

#### 4.3 Ajouter les nouvelles fonctions

```typescript
export const fetchDiskPartitions = async (): Promise<{ partitions: DiskPartition[] }> => {
  const response = await fetch(`${API_URL}/disk/partitions`);
  if (!response.ok) {
    throw new Error('Failed to fetch disk partitions');
  }
  return response.json();
};

export const fetchDiskAnalysis = async (path: string = '/'): Promise<DiskAnalysis> => {
  const response = await fetch(`${API_URL}/disk/analysis?path=${encodeURIComponent(path)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch disk analysis');
  }
  return response.json();
};
```

**✅ Validation :** Le fichier `api.ts` doit maintenant exporter 3 fonctions :
- `fetchSystemData()`
- `fetchDiskPartitions()`
- `fetchDiskAnalysis(path)`

---

### **ÉTAPE 5 : Frontend - Création du composant DiskAnalysis**

#### 5.1 Créer le fichier `app/src/components/DiskAnalysis.tsx`
```bash
touch /home/lucas-zubiarrain/poc-linux-dash/app/src/components/DiskAnalysis.tsx
code /home/lucas-zubiarrain/poc-linux-dash/app/src/components/DiskAnalysis.tsx
```

#### 5.2 Copier le code suivant dans le fichier

```typescript
import { useEffect, useState } from 'react';
import { Folder, RefreshCw, ChevronRight } from 'lucide-react';
import { fetchDiskAnalysis } from '../services/api';
import type { DirectorySize } from '../types/system';

export function DiskAnalysis() {
  const [directories, setDirectories] = useState<DirectorySize[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('/');
  const [error, setError] = useState<string | null>(null);
  const [pathHistory, setPathHistory] = useState<string[]>(['/']);

  const loadData = async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDiskAnalysis(path);
      setDirectories(data.directories);
      setCurrentPath(data.path);
    } catch (err) {
      setError('Erreur lors du chargement des données. Vérifiez que le serveur est lancé.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentPath);
  }, []);

  const handleDirectoryClick = (dir: DirectorySize) => {
    setPathHistory([...pathHistory, dir.path]);
    loadData(dir.path);
  };

  const handleBackClick = () => {
    if (pathHistory.length > 1) {
      const newHistory = [...pathHistory];
      newHistory.pop();
      const previousPath = newHistory[newHistory.length - 1];
      setPathHistory(newHistory);
      loadData(previousPath);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  const getBarColor = (percent: number) => {
    if (percent > 80) return 'from-red-500 to-red-600';
    if (percent > 60) return 'from-orange-500 to-orange-600';
    if (percent > 40) return 'from-yellow-500 to-yellow-600';
    return 'from-blue-500 to-blue-600';
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-12 h-12 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="text-red-600 text-center p-8">
          <p className="font-semibold mb-2">{error}</p>
          <button
            onClick={() => loadData(currentPath)}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const maxSize = directories.length > 0 ? directories[0].size : 1;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <Folder className="w-4 h-4 text-gray-700" />
          </div>
          <h2 className="text-base font-semibold tracking-tight">Analyse détaillée du disque</h2>
        </div>
        <div className="flex items-center gap-2">
          {pathHistory.length > 1 && (
            <button
              onClick={handleBackClick}
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              ← Retour
            </button>
          )}
          <button
            onClick={() => loadData(currentPath)}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Actualiser
          </button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 font-medium">Chemin analysé</p>
        <p className="text-sm font-semibold text-gray-900 font-mono break-all">{currentPath}</p>
      </div>

      <div className="space-y-3">
        {directories.map((dir, index) => {
          const percentOfMax = (dir.size / maxSize) * 100;
          
          return (
            <div
              key={dir.path}
              className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md cursor-pointer group"
              onClick={() => handleDirectoryClick(dir)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Folder className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <span className="text-sm font-bold truncate">{dir.name}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 bg-white px-2.5 py-1 rounded-lg font-semibold">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatSize(dir.size)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getBarColor(percentOfMax)} rounded-full shadow-sm transition-all duration-500`}
                    style={{ width: `${percentOfMax}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 font-mono truncate max-w-md">{dir.path}</p>
                  <p className="text-xs text-gray-600 font-semibold">
                    {percentOfMax.toFixed(1)}% du plus gros
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {directories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Aucun répertoire trouvé ou accessible</p>
            <p className="text-xs mt-1">Essayez un autre chemin ou vérifiez les permissions</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

**✅ Validation :** Vérifier qu'il n'y a pas d'erreurs TypeScript

---

### **ÉTAPE 6 : Frontend - Intégration dans App.tsx**

#### 6.1 Ouvrir le fichier `app/src/App.tsx`
```bash
code /home/lucas-zubiarrain/poc-linux-dash/app/src/App.tsx
```

#### 6.2 Ajouter l'import du composant
```typescript
import { DiskAnalysis } from './components/DiskAnalysis';
```

#### 6.3 Ajouter le composant dans le JSX après le composant `<CPUCores />`

```typescript
{/* CPU Cores */}
<div className="mb-6">
  <CPUCores data={data} />
</div>

{/* Nouvelle section: Analyse détaillée du disque */}
<div className="mb-6">
  <DiskAnalysis />
</div>

{/* Disk Details */}
<DiskDetails data={data} />
```

**✅ Validation :** L'application doit compiler sans erreurs

---

### **ÉTAPE 7 : Tests et validation**

#### 7.1 Lancer le backend
```bash
# Terminal 1
cd /home/lucas-zubiarrain/poc-linux-dash
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 7.2 Lancer le frontend
```bash
# Terminal 2
cd /home/lucas-zubiarrain/poc-linux-dash/app
npm run dev
```

#### 7.3 Ouvrir le navigateur
```
http://localhost:5173
```

#### 7.4 Tests à effectuer

**✅ Test 1 : Affichage initial**
- [ ] Le composant "Analyse détaillée du disque" s'affiche
- [ ] Les 20 plus gros répertoires de `/` sont listés
- [ ] Les barres de progression sont visibles
- [ ] Les tailles sont formatées correctement (GB, MB, KB)

**✅ Test 2 : Navigation**
- [ ] Cliquer sur un répertoire pour explorer son contenu
- [ ] Le chemin actuel s'affiche correctement
- [ ] Le bouton "Retour" apparaît et fonctionne
- [ ] L'historique de navigation fonctionne

**✅ Test 3 : Actualisation**
- [ ] Le bouton "Actualiser" recharge les données
- [ ] Le spinner de chargement s'affiche pendant le chargement

**✅ Test 4 : Gestion des erreurs**
- [ ] Si le backend est arrêté, un message d'erreur s'affiche
- [ ] Si un répertoire est inaccessible, un message approprié s'affiche

---

## ⚠️ Limitations et considérations

### Performance
- ⏱️ **Lenteur sur gros systèmes** : L'analyse peut prendre plusieurs secondes voire minutes sur des systèmes avec beaucoup de fichiers
- 💡 **Solution** : Limiter `max_depth=1` dans `get_directory_sizes()`

### Permissions
- 🔒 **Accès refusé** : Certains répertoires système nécessitent `sudo`
- 💡 **Solution** : Lancer le backend avec `sudo` (⚠️ risques de sécurité)
  ```bash
  sudo venv/bin/python -m uvicorn main:app --reload
  ```

### Sécurité
- 🚨 **Path traversal** : Un utilisateur pourrait analyser n'importe quel chemin
- 💡 **Solution** : Ajouter une whitelist de chemins autorisés
  ```python
  ALLOWED_PATHS = ['/home', '/var/log', '/tmp']
  
  def get_directory_sizes(path="/"):
      if not any(path.startswith(allowed) for allowed in ALLOWED_PATHS):
          raise ValueError("Chemin non autorisé")
      # ...
  ```

### Optimisations futures
- 📊 **Cache** : Mettre en cache les résultats pendant 5 minutes
- 🔄 **Pagination** : Ajouter une pagination pour les listes longues
- 📈 **Graphiques** : Ajouter un graphique en camembert (pie chart)
- 🔍 **Recherche** : Ajouter une barre de recherche pour filtrer les résultoires

---

## 🐛 Débogage

### Problème : "Failed to fetch system data"
**Cause** : Le backend n'est pas lancé ou CORS mal configuré

**Solution** :
```bash
# Vérifier que le backend tourne
curl http://localhost:8000/

# Vérifier les logs du backend
# Le terminal doit afficher :
# INFO:     Application startup complete.
```

### Problème : "Aucun répertoire trouvé"
**Cause** : Permissions insuffisantes

**Solution** :
```bash
# Vérifier les permissions
ls -la /home

# Lancer avec sudo si nécessaire (⚠️ attention)
sudo venv/bin/python -m uvicorn main:app --reload
```

### Problème : Analyse très lente
**Cause** : Trop de fichiers à scanner

**Solution** : Réduire la profondeur dans `data.py`
```python
# Limiter à 1 niveau de profondeur
def get_directory_sizes(path="/", max_depth=1):
    # ...
```

---

## 📚 Ressources

- [psutil Documentation](https://psutil.readthedocs.io/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Hooks](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)

---

## ✅ Checklist finale

- [ ] Backend : Fonctions `get_disk_partitions_details()` et `get_directory_sizes()` ajoutées
- [ ] Backend : Routes `/disk/partitions` et `/disk/analysis` créées
- [ ] Frontend : Types TypeScript ajoutés
- [ ] Frontend : Fonctions API ajoutées
- [ ] Frontend : Composant `DiskAnalysis` créé
- [ ] Frontend : Composant intégré dans `App.tsx`
- [ ] Tests : Tous les tests passent
- [ ] Documentation : README mis à jour

---

## 🎉 Résultat attendu

Une interface moderne et intuitive qui permet de :
1. Voir immédiatement les 20 plus gros répertoires
2. Cliquer pour explorer un répertoire
3. Naviguer dans l'arborescence avec un bouton "Retour"
4. Visualiser les tailles avec des barres de progression colorées
5. Rafraîchir les données en temps réel

**Félicitations ! Vous avez maintenant un outil puissant pour analyser l'utilisation de votre disque ! 🚀**
