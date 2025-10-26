import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Folder, RefreshCw, ChevronRight, ExternalLink } from "lucide-react";
import { fetchDiskAnalysis } from "../services/api";
import type { DirectorySize } from "../types/system";

export function DiskAnalysis() {
  const navigate = useNavigate();
  const [directories, setDirectories] = useState<DirectorySize[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState("/");
  const [error, setError] = useState<string | null>(null);
  const [pathHistory, setPathHistory] = useState<string[]>(["/"]);

  const loadData = async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDiskAnalysis(path);
      setDirectories(data.directories);
      setCurrentPath(data.path);
    } catch (err) {
      setError(
        "Erreur lors du chargement des données. Vérifiez que le serveur est lancé."
      );
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
    if (percent > 80) return "from-red-500 to-red-600";
    if (percent > 60) return "from-orange-500 to-orange-600";
    if (percent > 40) return "from-yellow-500 to-yellow-600";
    return "from-blue-500 to-blue-600";
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
          <h2 className="text-base font-semibold tracking-tight">
            Analyse détaillée du disque
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/disk-explorer")}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Explorer en détail
          </button>
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
        <p className="text-sm font-semibold text-gray-900 font-mono break-all">
          {currentPath}
        </p>
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
                  <Folder className="w-5 h-5 text-gray-600 shrink-0" />
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
                    className={`h-full bg-linear-to-r ${getBarColor(
                      percentOfMax
                    )} rounded-full shadow-sm transition-all duration-500`}
                    style={{ width: `${percentOfMax}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 font-mono truncate max-w-md">
                    {dir.path}
                  </p>
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
            <p className="text-xs mt-1">
              Essayez un autre chemin ou vérifiez les permissions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
