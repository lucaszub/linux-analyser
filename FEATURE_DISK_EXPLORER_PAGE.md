# 📊 Feature: Page Dédiée d'Exploration Détaillée du Disque

## 🎯 Vue d'ensemble

Créer une **page dédiée complète** pour l'analyse du disque avec des fonctionnalités avancées :

- 📈 **Graphiques visuels** (Pie chart, Tree map)
- 🔍 **Exploration en profondeur** avec breadcrumb navigation
- 📊 **Statistiques détaillées** (pourcentage du total, comparaison avec partitions)
- 🎨 **Visualisation hiérarchique** du système de fichiers
- 📱 **Interface responsive** et moderne
- 💾 **Comparaison multi-partitions**
- 🔄 **Historique de navigation** amélioré
- 📁 **Filtrage par type de fichier**

---

## 🏗️ Architecture de la nouvelle page

```
/                           → Dashboard principal (existant)
/disk-explorer              → Nouvelle page d'exploration détaillée

Navigation:
Dashboard → Cliquer sur "Explorer en détail" → Page dédiée
```

### Stack technique supplémentaire
- **React Router** : Navigation entre pages
- **Recharts** : Graphiques interactifs
- **React Hot Toast** : Notifications
- **Tailwind CSS** : Styling avancé

---

## 📝 Étapes de mise en œuvre

---

## **PARTIE 1 : Backend - Améliorations API**

### **ÉTAPE 1.1 : Enrichir les données backend**

#### Objectif
Ajouter des informations plus détaillées : pourcentage du total, types de fichiers, métadonnées.

#### Fichier : `data.py`

```python
import os
import psutil
import json
import time
from typing import Dict, List, Any
from collections import defaultdict


def get_partition_total_size(path: str) -> int:
    """
    Récupère la taille totale de la partition contenant le chemin donné.
    """
    try:
        # Trouver le point de montage de la partition
        for partition in psutil.disk_partitions():
            if path.startswith(partition.mountpoint):
                usage = psutil.disk_usage(partition.mountpoint)
                return usage.total
        
        # Par défaut, retourner la taille de /
        return psutil.disk_usage('/').total
    except Exception:
        return psutil.disk_usage('/').total


def get_file_type_distribution(path: str) -> Dict[str, Dict[str, Any]]:
    """
    Analyse la distribution des types de fichiers dans un répertoire.
    
    Returns:
        Dict avec extensions comme clés et {count, size, percent} comme valeurs
    """
    file_types = defaultdict(lambda: {"count": 0, "size": 0})
    total_size = 0
    
    try:
        for entry in os.scandir(path):
            if entry.is_file(follow_symlinks=False):
                try:
                    size = entry.stat().st_size
                    ext = os.path.splitext(entry.name)[1].lower() or "no_extension"
                    file_types[ext]["count"] += 1
                    file_types[ext]["size"] += size
                    total_size += size
                except (OSError, FileNotFoundError):
                    continue
    except (PermissionError, OSError):
        pass
    
    # Calculer les pourcentages
    for ext in file_types:
        if total_size > 0:
            file_types[ext]["percent"] = round((file_types[ext]["size"] / total_size) * 100, 2)
        else:
            file_types[ext]["percent"] = 0
    
    # Trier par taille et retourner le top 10
    sorted_types = sorted(
        file_types.items(),
        key=lambda x: x[1]["size"],
        reverse=True
    )[:10]
    
    return dict(sorted_types)


def get_directory_sizes_enhanced(path: str = "/", max_depth: int = 1) -> Dict[str, Any]:
    """
    Version améliorée avec statistiques détaillées.
    
    Returns:
        Dict avec:
        - directories: Liste des répertoires avec stats
        - total_analyzed_size: Taille totale analysée
        - partition_total_size: Taille totale de la partition
        - file_type_distribution: Distribution par type de fichier
        - directory_count: Nombre de répertoires trouvés
    """
    directories = []
    total_analyzed_size = 0
    partition_total = get_partition_total_size(path)
    
    try:
        for entry in os.scandir(path):
            if entry.is_dir(follow_symlinks=False):
                try:
                    # Calculer la taille totale du répertoire
                    size = 0
                    file_count = 0
                    dir_count = 0
                    
                    for dirpath, dirnames, filenames in os.walk(entry.path):
                        dir_count += len(dirnames)
                        for filename in filenames:
                            try:
                                filepath = os.path.join(dirpath, filename)
                                file_size = os.path.getsize(filepath)
                                size += file_size
                                file_count += 1
                            except (OSError, FileNotFoundError):
                                continue
                    
                    # Calculer le pourcentage par rapport à la partition
                    percent_of_partition = (size / partition_total * 100) if partition_total > 0 else 0
                    
                    directories.append({
                        "path": entry.path,
                        "name": entry.name,
                        "size": size,
                        "size_gb": round(size / (1024**3), 2),
                        "size_mb": round(size / (1024**2), 2),
                        "percent_of_partition": round(percent_of_partition, 2),
                        "file_count": file_count,
                        "dir_count": dir_count
                    })
                    
                    total_analyzed_size += size
                    
                except (PermissionError, OSError):
                    continue
        
        # Trier par taille décroissante
        directories.sort(key=lambda x: x['size'], reverse=True)
        
        # Top 20
        top_directories = directories[:20]
        
        # Calculer le pourcentage par rapport au total analysé pour chaque dir
        for dir_info in top_directories:
            dir_info["percent_of_analyzed"] = round(
                (dir_info["size"] / total_analyzed_size * 100) if total_analyzed_size > 0 else 0,
                2
            )
        
        # Obtenir la distribution des types de fichiers
        file_types = get_file_type_distribution(path)
        
        return {
            "path": path,
            "directories": top_directories,
            "total_analyzed_size": total_analyzed_size,
            "total_analyzed_size_gb": round(total_analyzed_size / (1024**3), 2),
            "partition_total_size": partition_total,
            "partition_total_size_gb": round(partition_total / (1024**3), 2),
            "percent_of_partition_analyzed": round(
                (total_analyzed_size / partition_total * 100) if partition_total > 0 else 0,
                2
            ),
            "file_type_distribution": file_types,
            "directory_count": len(directories)
        }
        
    except (PermissionError, OSError, FileNotFoundError) as e:
        print(f"Erreur lors de l'analyse de {path}: {e}")
        return {
            "path": path,
            "directories": [],
            "total_analyzed_size": 0,
            "partition_total_size": partition_total,
            "error": str(e)
        }
```

---

### **ÉTAPE 1.2 : Nouvelle route API**

#### Fichier : `main.py`

```python
from data import (
    get_system_data, 
    get_disk_partitions_details, 
    get_directory_sizes,
    get_directory_sizes_enhanced  # Nouveau
)

# ... existing code ...

@app.get("/disk/analysis/detailed")
async def disk_analysis_detailed(path: str = "/"):
    """
    Endpoint pour l'analyse détaillée avec statistiques avancées.
    
    Query params:
        path (str): Chemin à analyser (défaut: "/")
    
    Returns:
        JSON: {
            "path": "/home",
            "directories": [...],
            "total_analyzed_size": 123456789,
            "partition_total_size": 987654321,
            "percent_of_partition_analyzed": 12.5,
            "file_type_distribution": {...},
            "directory_count": 42
        }
    """
    return get_directory_sizes_enhanced(path)
```

---

## **PARTIE 2 : Frontend - Configuration du routing**

### **ÉTAPE 2.1 : Installer React Router**

```bash
cd /home/lucas-zubiarrain/poc-linux-dash/app
npm install react-router-dom
npm install recharts
npm install react-hot-toast
```

---

### **ÉTAPE 2.2 : Mettre à jour les types TypeScript**

#### Fichier : `app/src/types/system.ts`

```typescript
// ... existing types ...

export interface DirectorySizeEnhanced extends DirectorySize {
  percent_of_partition: number;
  percent_of_analyzed: number;
  file_count: number;
  dir_count: number;
}

export interface FileTypeDistribution {
  [extension: string]: {
    count: number;
    size: number;
    percent: number;
  };
}

export interface DiskAnalysisDetailed {
  path: string;
  directories: DirectorySizeEnhanced[];
  total_analyzed_size: number;
  total_analyzed_size_gb: number;
  partition_total_size: number;
  partition_total_size_gb: number;
  percent_of_partition_analyzed: number;
  file_type_distribution: FileTypeDistribution;
  directory_count: number;
}
```

---

### **ÉTAPE 2.3 : Mettre à jour le service API**

#### Fichier : `app/src/services/api.ts`

```typescript
import type { 
  SystemData, 
  DiskPartition, 
  DiskAnalysis,
  DiskAnalysisDetailed  // Nouveau
} from '../types/system';

// ... existing functions ...

export const fetchDiskAnalysisDetailed = async (path: string = '/'): Promise<DiskAnalysisDetailed> => {
  const response = await fetch(`${API_URL}/disk/analysis/detailed?path=${encodeURIComponent(path)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch detailed disk analysis');
  }
  return response.json();
};
```

---

## **PARTIE 3 : Frontend - Création de la page dédiée**

### **ÉTAPE 3.1 : Créer la structure de routing**

#### Fichier : `app/src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import DiskExplorerPage from './pages/DiskExplorerPage.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/disk-explorer" element={<DiskExplorerPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
```

---

### **ÉTAPE 3.2 : Créer le dossier pages**

```bash
mkdir -p /home/lucas-zubiarrain/poc-linux-dash/app/src/pages
```

---

### **ÉTAPE 3.3 : Créer la page DiskExplorerPage**

#### Fichier : `app/src/pages/DiskExplorerPage.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Folder, 
  HardDrive, 
  RefreshCw, 
  Home,
  ChevronRight,
  PieChart,
  FileText
} from 'lucide-react';
import { fetchDiskAnalysisDetailed } from '../services/api';
import type { DiskAnalysisDetailed, DirectorySizeEnhanced } from '../types/system';
import { Toaster, toast } from 'react-hot-toast';
import DiskUsageChart from '../components/DiskUsageChart';
import FileTypeChart from '../components/FileTypeChart';
import DirectoryTreeView from '../components/DirectoryTreeView';

export default function DiskExplorerPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DiskAnalysisDetailed | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('/');
  const [pathHistory, setPathHistory] = useState<string[]>(['/']);

  const loadData = async (path: string) => {
    try {
      setLoading(true);
      const analysisData = await fetchDiskAnalysisDetailed(path);
      setData(analysisData);
      setCurrentPath(path);
      toast.success(`Analyse de ${path} terminée`);
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentPath);
  }, []);

  const handleDirectoryClick = (dir: DirectorySizeEnhanced) => {
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

  const handleHomeClick = () => {
    setPathHistory(['/']);
    loadData('/');
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  const getBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'root', path: '/' }];
    
    let accumulatedPath = '';
    parts.forEach((part) => {
      accumulatedPath += `/${part}`;
      breadcrumbs.push({ name: part, path: accumulatedPath });
    });
    
    return breadcrumbs;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Retour au dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <HardDrive className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">
                    Explorateur de Disque
                  </h1>
                  <p className="text-xs text-gray-500">Analyse détaillée de l'utilisation</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleHomeClick}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <Home className="w-3 h-3" />
                Racine
              </button>
              {pathHistory.length > 1 && (
                <button
                  onClick={handleBackClick}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ← Retour
                </button>
              )}
              <button
                onClick={() => loadData(currentPath)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Actualiser
              </button>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="mt-4 flex items-center gap-2 text-sm">
            {getBreadcrumbs().map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                <button
                  onClick={() => loadData(crumb.path)}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    crumb.path === currentPath
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-12 h-12 text-gray-400 animate-spin" />
          </div>
        ) : data ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <StatCard
                icon={<HardDrive className="w-5 h-5" />}
                label="Taille totale partition"
                value={`${data.partition_total_size_gb} GB`}
                color="blue"
              />
              <StatCard
                icon={<Folder className="w-5 h-5" />}
                label="Taille analysée"
                value={`${data.total_analyzed_size_gb} GB`}
                percentage={data.percent_of_partition_analyzed}
                color="purple"
              />
              <StatCard
                icon={<FileText className="w-5 h-5" />}
                label="Répertoires trouvés"
                value={data.directory_count.toString()}
                color="green"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <DiskUsageChart data={data} />
              <FileTypeChart data={data} />
            </div>

            {/* Directory List */}
            <DirectoryTreeView
              directories={data.directories}
              onDirectoryClick={handleDirectoryClick}
              formatSize={formatSize}
            />
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p>Aucune donnée disponible</p>
          </div>
        )}
      </main>
    </div>
  );
}

// Composant StatCard
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  percentage?: number;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

function StatCard({ icon, label, value, percentage, color }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/30',
    green: 'from-green-500 to-green-600 shadow-green-500/30',
    orange: 'from-orange-500 to-orange-600 shadow-orange-500/30',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-linear-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-3xl font-bold tracking-tighter">{value}</p>
      {percentage !== undefined && (
        <p className="text-sm text-gray-500 mt-2">
          {percentage.toFixed(1)}% de la partition
        </p>
      )}
    </div>
  );
}
```

---

### **ÉTAPE 3.4 : Créer les composants de visualisation**

#### Fichier : `app/src/components/DiskUsageChart.tsx`

```typescript
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { DiskAnalysisDetailed } from '../types/system';

interface Props {
  data: DiskAnalysisDetailed;
}

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
  '#10b981', '#ef4444', '#6366f1', '#14b8a6'
];

export default function DiskUsageChart({ data }: Props) {
  const chartData = data.directories.slice(0, 8).map((dir) => ({
    name: dir.name,
    value: dir.size,
    percent: dir.percent_of_analyzed
  }));

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 className="text-base font-semibold mb-4">Répartition de l'espace (Top 8)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.percent.toFixed(1)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatBytes(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### Fichier : `app/src/components/FileTypeChart.tsx`

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DiskAnalysisDetailed } from '../types/system';

interface Props {
  data: DiskAnalysisDetailed;
}

export default function FileTypeChart({ data }: Props) {
  const chartData = Object.entries(data.file_type_distribution).map(([ext, info]) => ({
    extension: ext,
    size: info.size,
    count: info.count,
    percent: info.percent
  }));

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 className="text-base font-semibold mb-4">Distribution par type de fichier</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="extension" />
          <YAxis tickFormatter={formatBytes} />
          <Tooltip formatter={(value: number) => formatBytes(value)} />
          <Bar dataKey="size" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### Fichier : `app/src/components/DirectoryTreeView.tsx`

```typescript
import { Folder, ChevronRight, File, Users } from 'lucide-react';
import type { DirectorySizeEnhanced } from '../types/system';

interface Props {
  directories: DirectorySizeEnhanced[];
  onDirectoryClick: (dir: DirectorySizeEnhanced) => void;
  formatSize: (bytes: number) => string;
}

export default function DirectoryTreeView({ directories, onDirectoryClick, formatSize }: Props) {
  const getColorByPercent = (percent: number) => {
    if (percent > 50) return 'from-red-500 to-red-600';
    if (percent > 30) return 'from-orange-500 to-orange-600';
    if (percent > 15) return 'from-yellow-500 to-yellow-600';
    return 'from-blue-500 to-blue-600';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h3 className="text-base font-semibold mb-6">Répertoires (Top 20)</h3>
      
      <div className="space-y-3">
        {directories.map((dir, index) => (
          <div
            key={dir.path}
            onClick={() => onDirectoryClick(dir)}
            className="p-5 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                  <Folder className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold truncate">{dir.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 font-mono truncate">{dir.path}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatSize(dir.size)}</p>
                  <p className="text-xs text-gray-500">#{index + 1}</p>
                </div>
              </div>
            </div>

            {/* Progress bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500 font-medium">% de la partition</span>
                  <span className="text-xs font-bold text-gray-700">{dir.percent_of_partition.toFixed(2)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-linear-to-r ${getColorByPercent(dir.percent_of_partition)} transition-all duration-500`}
                    style={{ width: `${Math.min(dir.percent_of_partition, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500 font-medium">% du total analysé</span>
                  <span className="text-xs font-bold text-blue-700">{dir.percent_of_analyzed.toFixed(2)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${dir.percent_of_analyzed}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-600">
                  <span className="font-semibold">{dir.file_count.toLocaleString()}</span> fichiers
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-600">
                  <span className="font-semibold">{dir.dir_count.toLocaleString()}</span> sous-répertoires
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### **ÉTAPE 3.5 : Ajouter un bouton dans le dashboard**

#### Fichier : `app/src/components/DiskAnalysis.tsx`

Ajouter un bouton "Explorer en détail" :

```typescript
import { useNavigate } from 'react-router-dom';

// Dans le composant, ajouter :
const navigate = useNavigate();

// Dans le JSX, ajouter après le titre :
<button
  onClick={() => navigate('/disk-explorer')}
  className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
>
  Explorer en détail →
</button>
```

---

## **PARTIE 4 : Fonctionnalités avancées (optionnelles)**

### **Fonctionnalité 4.1 : Recherche de fichiers**

Ajouter une barre de recherche pour filtrer les répertoires.

### **Fonctionnalité 4.2 : Export des données**

Exporter l'analyse en CSV/JSON.

### **Fonctionnalité 4.3 : Comparaison temporelle**

Stocker l'historique et comparer l'évolution.

### **Fonctionnalité 4.4 : Alertes personnalisées**

Définir des seuils et recevoir des notifications.

---

## 🎯 **Résultat attendu**

Une page dédiée avec :

- ✅ **Navigation breadcrumb** fluide
- ✅ **3 cartes de statistiques** en haut
- ✅ **2 graphiques** (Pie chart + Bar chart)
- ✅ **Liste détaillée** des répertoires avec :
  - 2 barres de progression (% partition + % analysé)
  - Nombre de fichiers et sous-répertoires
  - Click pour explorer plus profondément
- ✅ **Design moderne** et responsive
- ✅ **Notifications toast** pour le feedback utilisateur

---

## 📋 **Checklist d'implémentation**

### Backend
- [ ] Ajouter `get_directory_sizes_enhanced()` dans `data.py`
- [ ] Ajouter `get_partition_total_size()` dans `data.py`
- [ ] Ajouter `get_file_type_distribution()` dans `data.py`
- [ ] Créer la route `/disk/analysis/detailed` dans `main.py`
- [ ] Tester les endpoints avec `curl`

### Frontend - Configuration
- [ ] Installer `react-router-dom`, `recharts`, `react-hot-toast`
- [ ] Mettre à jour `main.tsx` avec le routing
- [ ] Ajouter les nouveaux types dans `system.ts`
- [ ] Ajouter `fetchDiskAnalysisDetailed()` dans `api.ts`

### Frontend - Composants
- [ ] Créer le dossier `pages/`
- [ ] Créer `DiskExplorerPage.tsx`
- [ ] Créer `DiskUsageChart.tsx`
- [ ] Créer `FileTypeChart.tsx`
- [ ] Créer `DirectoryTreeView.tsx`
- [ ] Ajouter le bouton "Explorer en détail" dans `DiskAnalysis.tsx`

### Tests
- [ ] Backend démarre sans erreur
- [ ] Frontend compile sans erreur
- [ ] Navigation entre pages fonctionne
- [ ] Graphiques s'affichent correctement
- [ ] Click sur répertoires fonctionne
- [ ] Breadcrumbs fonctionnent
- [ ] Bouton retour fonctionne

---

## 🚀 **Commandes de lancement**

```bash
# Terminal 1 - Backend
cd /home/lucas-zubiarrain/poc-linux-dash
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd /home/lucas-zubiarrain/poc-linux-dash/app
npm run dev
```

**URLs :**
- Dashboard : `http://localhost:5173/`
- Explorer : `http://localhost:5173/disk-explorer`

---

## 💡 **Améliorations futures**

1. **Mode sombre** : Ajouter un toggle pour le thème sombre
2. **Favoris** : Sauvegarder des chemins favoris
3. **WebSocket** : Streaming des données en temps réel
4. **Cache intelligent** : Éviter de recalculer les mêmes chemins
5. **Multi-utilisateurs** : Gestion des permissions et sessions
6. **Mobile app** : Version PWA pour mobile

---

**🎉 Cette nouvelle page offrira une expérience d'exploration professionnelle et complète du système de fichiers !**
