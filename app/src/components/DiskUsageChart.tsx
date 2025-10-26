import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import type { DiskAnalysisDetailed } from '../types/system';

interface Props {
  data: DiskAnalysisDetailed;
}

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
  '#10b981', '#ef4444', '#6366f1', '#14b8a6'
];

export default function DiskUsageChart({ data }: Props) {
  const chartData = data.directories.slice(0, 8).map((dir) => ({
    name: dir.name,
    value: dir.size,
    percent: dir.percent_of_analyzed
  }));

  const formatBytes = (bytes: number) => {
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-base font-semibold">Répartition de l'espace (Top 8)</h3>
        </div>
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          <p>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all">
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon className="w-5 h-5 text-gray-600" />
        <h3 className="text-base font-semibold">Répartition de l'espace (Top 8)</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props: any) => `${props.percent.toFixed(1)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatBytes(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
