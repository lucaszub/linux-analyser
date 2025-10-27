import { useEffect, useState } from "react";
import { HardDrive, RefreshCw, Folder, FileText, FolderTree } from "lucide-react";
import { fetchRootAnalysis } from "../services/api";
import type { RootDirectoryItem, RootAnalysisResponse } from "../types/system";
import toast from "react-hot-toast";

export function RootDiskAnalysis() {
  const [data, setData] = useState<RootAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (force: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (force) {
        toast.loading("Scan en cours...", { id: "root-scan" });
      }
      
      const result = await fetchRootAnalysis(force);
      setData(result);
      
      if (force) {
        toast.success("Scan terminé !", { id: "root-scan" });
      }
    } catch (err) {
      const errorMsg = "Erreur lors du chargement de l'analyse racine.";
      setError(errorMsg);
      console.error(err);
      
      if (force) {
        toast.error(errorMsg, { id: "root-scan" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  const handleRefresh = () => {
    loadData(true);
  };

  const getBarColor = (percent: number) => {
    if (percent > 40) return "from-blue-500 to-blue-600";
    if (percent > 20) return "from-green-500 to-green-600";
    if (percent > 10) return "from-yellow-500 to-yellow-600";
    return "from-gray-400 to-gray-500";
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-12 h-12 text-gray-400 animate-spin" />
          <span className="ml-4 text-gray-600 font-medium">
            Analyse en cours...
          </span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="text-red-600 text-center p-8">
          <p className="font-semibold mb-2">{error || "Aucune donnée disponible"}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Top 10 seulement pour l'affichage
  const topDirectories = data.items.slice(0, 10);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <HardDrive className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-semibold tracking-tight">
            Analyse Dossiers Racine (/)
          </h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span className="text-sm font-medium">Rafraîchir</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Total Analysé</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{data.total_size_human}</p>
          <p className="text-xs text-blue-600 mt-1">
            {data.directory_count} dossiers trouvés
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FolderTree className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Top Dossier</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{topDirectories[0]?.name || "-"}</p>
          <p className="text-xs text-green-600 mt-1">
            {topDirectories[0]?.size_human || "0B"} ({topDirectories[0]?.percent.toFixed(1) || 0}%)
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-700">Dossiers Ignorés</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">{data.skipped_count}</p>
          <p className="text-xs text-orange-600 mt-1">
            (ex: /proc, /sys, /dev)
          </p>
        </div>
      </div>

      {/* Directory List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Folder className="w-4 h-4" />
          Top 10 Plus Gros Dossiers
        </h3>
        {topDirectories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucun dossier trouvé
          </p>
        ) : (
          topDirectories.map((dir: RootDirectoryItem, index: number) => (
            <div
              key={dir.path}
              className="group bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-4 transition-all duration-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded-lg">
                    #{index + 1}
                  </span>
                  <Folder className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-800">
                    {dir.name}
                  </span>
                  <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-lg">
                    {dir.percent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700">
                    {dir.size_human}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getBarColor(dir.percent)} transition-all duration-500`}
                    style={{ width: `${dir.percent}%` }}
                  />
                </div>
              </div>

              {/* Footer Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>{dir.file_count.toLocaleString()} fichiers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Folder className="w-3 h-3" />
                  <span>{dir.dir_count.toLocaleString()} sous-dossiers</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <span className="font-mono">{dir.path}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Dernière mise à jour :{" "}
            {new Date(data.timestamp * 1000).toLocaleTimeString("fr-FR")}
          </span>
          <span>
            Affichage des 10 plus gros sur {data.directory_count} dossiers
          </span>
        </div>
      </div>
    </div>
  );
}
