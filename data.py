import psutil
import json
import time
import os
import subprocess
from typing import Dict, List, Any
from collections import defaultdict

# Fonction pour convertir les namedtuples en dictionnaires
def convert_to_dict(obj):
    if hasattr(obj, '_asdict'):
        return obj._asdict()
    elif isinstance(obj, list):
        return [convert_to_dict(item) for item in obj]
    return obj

# Collecte des données système

def get_system_data():
    data = {
        "timestamp": time.time(),
        "cpu": { 
            "cpu_percent": psutil.cpu_percent(interval=1),
        "cpu_count_logical": psutil.cpu_count(logical=True),
        "cpu_count_physical": psutil.cpu_count(logical=False),
        "cpu_per_core": psutil.cpu_percent(interval=1, percpu=True),
        "cpu_freq": convert_to_dict(psutil.cpu_freq()),
        "load_avg": list(psutil.getloadavg())
    },
    "memory": {
        "virtual": convert_to_dict(psutil.virtual_memory()),
        "swap": convert_to_dict(psutil.swap_memory())
    },
    "disk": {
        "usage": convert_to_dict(psutil.disk_usage('/')),
        "io_counters": convert_to_dict(psutil.disk_io_counters())
    },
    "network": {
        "io_counters": convert_to_dict(psutil.net_io_counters()),
        "connections_count": len(psutil.net_connections())
    },
    "system": {
        "boot_time": psutil.boot_time(),
        "uptime_seconds": time.time() - psutil.boot_time(),
        "process_count": len(psutil.pids())
    }
}

    return data


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
    Version RAPIDE : estimation sans scan récursif complet.
    Compte seulement les fichiers directs + une estimation pour les sous-dossiers.
    BEAUCOUP plus rapide mais moins précis que 'du'.
    """
    directories = []
    total_analyzed_size = 0
    partition_total = get_partition_total_size(path)
    
    try:
        # Scanner les sous-répertoires directs
        for entry in os.scandir(path):
            if entry.is_dir(follow_symlinks=False):
                try:
                    dir_path = entry.path
                    dir_name = entry.name
                    
                    # Calculer la taille : fichiers directs + estimation des sous-dossiers
                    size = 0
                    file_count = 0
                    dir_count = 0
                    
                    # Niveau 1 : scanner les fichiers directs
                    try:
                        for item in os.scandir(dir_path):
                            try:
                                if item.is_file(follow_symlinks=False):
                                    size += item.stat().st_size
                                    file_count += 1
                                elif item.is_dir(follow_symlinks=False):
                                    dir_count += 1
                                    # Estimation rapide : ajouter la taille des fichiers du 1er niveau seulement
                                    if max_depth > 0:
                                        try:
                                            for subitem in os.scandir(item.path):
                                                if subitem.is_file(follow_symlinks=False):
                                                    size += subitem.stat().st_size
                                        except (PermissionError, OSError):
                                            pass
                            except (OSError, PermissionError):
                                continue
                    except (PermissionError, OSError):
                        pass
                    
                    # Skip les dossiers vides ou trop petits
                    if size == 0:
                        continue
                    
                    # Calculer le pourcentage par rapport à la partition
                    percent_of_partition = (size / partition_total * 100) if partition_total > 0 else 0
                    
                    directories.append({
                        "path": dir_path,
                        "name": dir_name,
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
        
        # Limiter au top 20
        directories = directories[:20]
        
        # Calculer le pourcentage par rapport au total analysé
        for dir_info in directories:
            dir_info["percent_of_analyzed"] = round(
                (dir_info["size"] / total_analyzed_size * 100) if total_analyzed_size > 0 else 0,
                2
            )
        
        # Distribution des types de fichiers (désactivé car trop lent)
        file_types = {}
        
        return {
            "path": path,
            "directories": directories,
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
        
    except subprocess.TimeoutExpired:
        print(f"Timeout lors de l'analyse de {path}")
        return {
            "path": path,
            "directories": [],
            "total_analyzed_size": 0,
            "total_analyzed_size_gb": 0,
            "partition_total_size": partition_total,
            "partition_total_size_gb": round(partition_total / (1024**3), 2),
            "percent_of_partition_analyzed": 0,
            "file_type_distribution": {},
            "directory_count": 0,
            "error": "Timeout"
        }
    except Exception as e:
        print(f"Erreur lors de l'analyse de {path}: {e}")
        return {
            "path": path,
            "directories": [],
            "total_analyzed_size": 0,
            "total_analyzed_size_gb": 0,
            "partition_total_size": partition_total,
            "partition_total_size_gb": round(partition_total / (1024**3), 2),
            "percent_of_partition_analyzed": 0,
            "file_type_distribution": {},
            "directory_count": 0,
            "error": str(e)
        }
