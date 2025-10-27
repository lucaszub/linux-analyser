from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from data import (
    get_system_data,
    get_disk_partitions_details,
    get_directory_sizes,
    get_directory_sizes_enhanced,
    get_root_directories_sizes
)

app = FastAPI()

# Configuration CORS pour permettre les requêtes depuis le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return get_system_data()


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


@app.get("/disk/analysis/detailed")
async def disk_analysis_detailed(path: str = "/", max_depth: int = 1):
    """
    Endpoint pour l'analyse détaillée avec statistiques avancées.
    
    Query params:
        path (str): Chemin à analyser (défaut: "/")
        max_depth (int): Profondeur maximale de scan (défaut: 1)
    
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
    return get_directory_sizes_enhanced(path, max_depth)


@app.get("/disk/root-analysis")
async def disk_root_analysis(max_depth: int = 1, force: bool = False):
    """
    Endpoint pour analyser les dossiers racine (/).
    Équivalent de: du -h / --max-depth=1 | sort -hr | head -n 20
    
    Query params:
        max_depth (int): Profondeur maximale de scan (défaut: 1)
        force (bool): Forcer un nouveau scan en ignorant le cache (défaut: False)
    
    Returns:
        JSON: {
            "items": [
                {
                    "path": "/usr",
                    "name": "usr",
                    "size": 123456789,
                    "size_human": "117.7M",
                    "percent": 45.3,
                    "file_count": 1234,
                    "dir_count": 56
                }
            ],
            "total_size": 1650000000,
            "total_size_human": "1.5G",
            "directory_count": 20,
            "skipped_count": 2,
            "path": "/",
            "timestamp": 1630000000.0
        }
    """
    # TODO: Implémenter le cache avec force parameter
    return get_root_directories_sizes(max_depth)


