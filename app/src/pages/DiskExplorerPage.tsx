import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Folder,
  HardDrive,
  RefreshCw,
  Home,
  ChevronRight,
  FileText,
} from "lucide-react";
import { fetchDiskAnalysisDetailed } from "../services/api";
import type {
  DiskAnalysisDetailed,
  DirectorySizeEnhanced,
} from "../types/system";
import { Toaster, toast } from "react-hot-toast";
import DiskUsageChart from "../components/DiskUsageChart";
import FileTypeChart from "../components/FileTypeChart";
import DirectoryTreeView from "../components/DirectoryTreeView";

export default function DiskExplorerPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DiskAnalysisDetailed | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState("/home");
  const [pathHistory, setPathHistory] = useState<string[]>(["/home"]);

  const loadData = async (path: string) => {
    try {
      setLoading(true);
      console.log("Loading data for path:", path);
      const analysisData = await fetchDiskAnalysisDetailed(path);
      console.log("Data received:", analysisData);
      setData(analysisData);
      setCurrentPath(path);
      toast.success(`Analyse de ${path} terminée`);
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error(
        `Erreur: ${
          err instanceof Error
            ? err.message
            : "Impossible de charger les données"
        }`
      );
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
    setPathHistory(["/"]);
    loadData("/");
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  const getBreadcrumbs = () => {
    const parts = currentPath.split("/").filter(Boolean);
    const breadcrumbs = [{ name: "root", path: "/" }];

    let accumulatedPath = "";
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
                onClick={() => navigate("/")}
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
                  <p className="text-xs text-gray-500">
                    Analyse détaillée de l'utilisation
                  </p>
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
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                <button
                  onClick={() => loadData(crumb.path)}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    crumb.path === currentPath
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
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
  color: "blue" | "purple" | "green" | "orange";
}

function StatCard({ icon, label, value, percentage, color }: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/30",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/30",
    green: "from-green-500 to-green-600 shadow-green-500/30",
    orange: "from-orange-500 to-orange-600 shadow-orange-500/30",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 bg-linear-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}
        >
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
