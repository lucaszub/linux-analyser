import { Folder, ChevronRight, File } from "lucide-react";
import type { DirectorySizeEnhanced } from "../types/system";

interface Props {
  directories: DirectorySizeEnhanced[];
  onDirectoryClick: (dir: DirectorySizeEnhanced) => void;
  formatSize: (bytes: number) => string;
}

export default function DirectoryTreeView({
  directories,
  onDirectoryClick,
  formatSize,
}: Props) {
  const getColorByPercent = (percent: number) => {
    if (percent > 50) return "from-red-500 to-red-600";
    if (percent > 30) return "from-orange-500 to-orange-600";
    if (percent > 15) return "from-yellow-500 to-yellow-600";
    return "from-blue-500 to-blue-600";
  };

  if (directories.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-base font-semibold mb-6">Répertoires (Top 20)</h3>
        <div className="text-center py-12 text-gray-500">
          <Folder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="font-medium">Aucun répertoire trouvé</p>
          <p className="text-xs mt-2">
            Essayez un autre chemin ou vérifiez les permissions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all">
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
                    <span className="text-base font-bold truncate">
                      {dir.name}
                    </span>
                    <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-lg">
                      {dir.percent_of_analyzed.toFixed(1)}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 font-mono truncate">
                    {dir.path}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatSize(dir.size)}
                  </p>
                  <p className="text-xs text-gray-500">#{index + 1}</p>
                </div>
              </div>
            </div>

            {/* Progress bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500 font-medium">
                    % de la partition
                  </span>
                  <span className="text-xs font-bold text-gray-700">
                    {dir.percent_of_partition.toFixed(2)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-linear-to-r ${getColorByPercent(
                      dir.percent_of_partition
                    )} transition-all duration-500`}
                    style={{
                      width: `${Math.min(dir.percent_of_partition, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500 font-medium">
                    % du total analysé
                  </span>
                  <span className="text-xs font-bold text-blue-700">
                    {dir.percent_of_analyzed.toFixed(2)}%
                  </span>
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
                  <span className="font-semibold">
                    {dir.file_count.toLocaleString()}
                  </span>{" "}
                  fichiers
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-600">
                  <span className="font-semibold">
                    {dir.dir_count.toLocaleString()}
                  </span>{" "}
                  sous-répertoires
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
