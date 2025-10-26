import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { SystemData } from "./types/system";
import { fetchSystemData } from "./services/api";
import Header from "./components/Header";
import StatsGrid from "./components/StatsGrid";
import SystemInfo from "./components/SystemInfo";
import CPUCores from "./components/CPUCores";
import DiskDetails from "./components/DiskDetails";
import { DiskAnalysis } from "./components/DiskAnalysis";
import { FolderSearch, ArrowRight } from "lucide-react";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const [data, setData] = useState<SystemData | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const systemData = await fetchSystemData();
      setData(systemData);
      setIsOnline(true);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch system data:", err);
      setIsOnline(false);
      setError("Impossible de se connecter au serveur");
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      <Header isOnline={isOnline} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <p className="text-xs text-red-600 mt-1">
              Assurez-vous que le serveur FastAPI est en cours d'exécution sur
              http://localhost:8000
            </p>
          </div>
        )}

        {!data && !error && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">
                Chargement des données...
              </p>
            </div>
          </div>
        )}

        {data && (
          <>
            {/* Carte de navigation rapide vers l'explorateur */}
            <div
              onClick={() => navigate("/disk-explorer")}
              className="mb-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 cursor-pointer hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 transform hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <FolderSearch className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      Explorateur de Disque
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Trouvez les fichiers et dossiers qui prennent le plus
                      d'espace
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white group-hover:translate-x-1 transition-transform">
                  <span className="text-sm font-semibold">Explorer</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>

            <StatsGrid data={data} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <SystemInfo data={data} />
              <CPUCores data={data} onRefresh={loadData} />
            </div>

            {/* Analyse détaillée du disque */}
            <div className="mb-6">
              <DiskAnalysis />
            </div>

            <DiskDetails data={data} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
