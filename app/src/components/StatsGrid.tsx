import { Cpu, Database, HardDrive, Activity } from 'lucide-react';
import type { SystemData } from '../types/system';
import { formatBytes } from '../utils/formatters';

interface StatsGridProps {
  data: SystemData | null;
}

const StatsGrid = ({ data }: StatsGridProps) => {
  if (!data) return null;

  const downloadSpeed = formatBytes(data.network.io_counters.bytes_recv / data.system.uptime_seconds, 1);
  const uploadSpeed = formatBytes(data.network.io_counters.bytes_sent / data.system.uptime_seconds, 1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* CPU Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg font-medium">
            Live
          </span>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
            CPU
          </p>
          <p className="text-4xl font-bold tracking-tighter">
            {data.cpu.cpu_percent.toFixed(0)}
            <span className="text-2xl text-gray-400">%</span>
          </p>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${Math.min(data.cpu.cpu_percent, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Memory Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Database className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg font-medium">
            {formatBytes(data.memory.virtual.used)} / {formatBytes(data.memory.virtual.total)}
          </span>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
            Mémoire
          </p>
          <p className="text-4xl font-bold tracking-tighter">
            {data.memory.virtual.percent.toFixed(0)}
            <span className="text-2xl text-gray-400">%</span>
          </p>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${Math.min(data.memory.virtual.percent, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Disk Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <HardDrive className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg font-medium">
            {formatBytes(data.disk.usage.used)} / {formatBytes(data.disk.usage.total)}
          </span>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
            Disque
          </p>
          <p className="text-4xl font-bold tracking-tighter">
            {data.disk.usage.percent.toFixed(0)}
            <span className="text-2xl text-gray-400">%</span>
          </p>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${Math.min(data.disk.usage.percent, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Network Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg font-medium">
            eth0
          </span>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
            Réseau
          </p>
          <div className="flex items-baseline gap-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-400">↓</span>
              <p className="text-2xl font-bold tracking-tighter">
                {downloadSpeed.split(' ')[0]}
              </p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-gray-400">↑</span>
              <p className="text-2xl font-bold tracking-tighter">
                {uploadSpeed.split(' ')[0]}
              </p>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {downloadSpeed.split(' ')[1]}/s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsGrid;
