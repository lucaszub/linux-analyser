import { Server } from "lucide-react";
import type { SystemData } from "../types/system";
import { formatUptime } from "../utils/formatters";

interface SystemInfoProps {
  data: SystemData | null;
}

const SystemInfo = ({ data }: SystemInfoProps) => {
  if (!data) return null;

  return (
    <div className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <Server className="w-4 h-4 text-gray-700" />
        </div>
        <h2 className="text-base font-semibold tracking-tight">
          Informations système
        </h2>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between items-center py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors">
          <span className="text-sm text-gray-500 font-medium">OS</span>
          <span className="text-sm font-semibold">Linux</span>
        </div>
        <div className="flex justify-between items-center py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors">
          <span className="text-sm text-gray-500 font-medium">CPU Cores</span>
          <span className="text-sm font-semibold">
            {data.cpu.cpu_count_physical} / {data.cpu.cpu_count_logical}
          </span>
        </div>
        <div className="flex justify-between items-center py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors">
          <span className="text-sm text-gray-500 font-medium">CPU Freq</span>
          <span className="text-sm font-semibold">
            {data.cpu.cpu_freq.current.toFixed(0)} MHz
          </span>
        </div>
        <div className="flex justify-between items-center py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors">
          <span className="text-sm text-gray-500 font-medium">Load Avg</span>
          <span className="text-sm font-semibold">
            {data.cpu.load_avg.map((l) => l.toFixed(2)).join(", ")}
          </span>
        </div>
        <div className="flex justify-between items-center py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors">
          <span className="text-sm text-gray-500 font-medium">Uptime</span>
          <span className="text-sm font-semibold">
            {formatUptime(data.system.uptime_seconds)}
          </span>
        </div>
        <div className="flex justify-between items-center py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors">
          <span className="text-sm text-gray-500 font-medium">Processus</span>
          <span className="text-sm font-semibold">
            {data.system.process_count}
          </span>
        </div>
        <div className="flex justify-between items-center py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors">
          <span className="text-sm text-gray-500 font-medium">Connexions</span>
          <span className="text-sm font-semibold">
            {data.network.connections_count}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SystemInfo;
