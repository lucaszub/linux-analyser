import { Folder } from "lucide-react";
import type { SystemData } from "../types/system";
import { formatBytes } from "../utils/formatters";

interface DiskDetailsProps {
  data: SystemData | null;
}

const DiskDetails = ({ data }: DiskDetailsProps) => {
  if (!data) return null;

  const diskPercent = data.disk.usage.percent;
  const getColorClasses = (percent: number) => {
    if (percent < 70) return "from-gray-700 to-gray-900";
    if (percent < 85) return "from-orange-500 to-orange-600";
    return "from-red-500 to-red-600";
  };

  const getTextColor = (percent: number) => {
    if (percent < 70) return "text-gray-500";
    if (percent < 85) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <Folder className="w-4 h-4 text-gray-700" />
        </div>
        <h2 className="text-base font-semibold tracking-tight">
          Détails du disque principal
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold">/dev/root</span>
            <span className="text-xs text-gray-500 bg-white px-2.5 py-1 rounded-lg font-semibold">
              /
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-600">
                {formatBytes(data.disk.usage.used)} utilisé
              </span>
              <span className="text-gray-900">
                {formatBytes(data.disk.usage.total)}
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-linear-to-r ${getColorClasses(
                  diskPercent
                )} rounded-full shadow-sm transition-all duration-700`}
                style={{ width: `${Math.min(diskPercent, 100)}%` }}
              ></div>
            </div>
            <p className={`text-xs font-semibold ${getTextColor(diskPercent)}`}>
              {diskPercent.toFixed(1)}% utilisé
            </p>
          </div>
        </div>

        {/* I/O Statistics */}
        <div className="p-5 bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold">Statistiques I/O</span>
            <span className="text-xs text-gray-500 bg-white px-2.5 py-1 rounded-lg font-semibold">
              Lecture
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-600">Opérations</span>
              <span className="text-gray-900">
                {data.disk.io_counters.read_count.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-600">Données lues</span>
              <span className="text-gray-900">
                {formatBytes(data.disk.io_counters.read_bytes)}
              </span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-600">Temps total</span>
              <span className="text-gray-900">
                {(data.disk.io_counters.read_time / 1000).toFixed(2)}s
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold">Statistiques I/O</span>
            <span className="text-xs text-gray-500 bg-white px-2.5 py-1 rounded-lg font-semibold">
              Écriture
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-600">Opérations</span>
              <span className="text-gray-900">
                {data.disk.io_counters.write_count.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-600">Données écrites</span>
              <span className="text-gray-900">
                {formatBytes(data.disk.io_counters.write_bytes)}
              </span>
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-600">Temps total</span>
              <span className="text-gray-900">
                {(data.disk.io_counters.write_time / 1000).toFixed(2)}s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiskDetails;
