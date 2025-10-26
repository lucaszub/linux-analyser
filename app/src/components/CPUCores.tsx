import { List, RefreshCw } from "lucide-react";
import type { SystemData } from "../types/system";

interface CPUCoresProps {
  data: SystemData | null;
  onRefresh: () => void;
}

const CPUCores = ({ data, onRefresh }: CPUCoresProps) => {
  if (!data) return null;

  const getColorClass = (percent: number) => {
    if (percent < 30) return "bg-green-50 text-green-700";
    if (percent < 60) return "bg-blue-50 text-blue-700";
    if (percent < 80) return "bg-orange-50 text-orange-700";
    return "bg-red-50 text-red-700";
  };

  return (
    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <List className="w-4 h-4 text-gray-700" />
          </div>
          <h2 className="text-base font-semibold tracking-tight">
            Utilisation par cœur CPU
          </h2>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-3 h-3" />
          Actualiser
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide pb-3">
                Cœur
              </th>
              <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wide pb-3">
                Utilisation
              </th>
              <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wide pb-3 pl-4">
                Graphique
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.cpu.cpu_per_core.map((percent, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition-colors group"
              >
                <td className="py-3.5 text-sm font-semibold">Core {index}</td>
                <td className="py-3.5 text-sm font-semibold text-right">
                  <span
                    className={`px-2 py-1 rounded-lg ${getColorClass(percent)}`}
                  >
                    {percent.toFixed(1)}%
                  </span>
                </td>
                <td className="py-3.5 pl-4">
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CPUCores;
