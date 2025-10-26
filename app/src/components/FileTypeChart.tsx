import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { DiskAnalysisDetailed } from '../types/system';

interface Props {
  data: DiskAnalysisDetailed;
}

export default function FileTypeChart({ data }: Props) {
  const chartData = Object.entries(data.file_type_distribution).map(([ext, info]) => ({
    extension: ext,
    size: info.size,
    count: info.count,
    percent: info.percent
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
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-base font-semibold">Distribution par type de fichier</h3>
        </div>
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          <p>Aucun fichier trouvé dans ce répertoire</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-gray-600" />
        <h3 className="text-base font-semibold">Distribution par type de fichier</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="extension" />
          <YAxis tickFormatter={formatBytes} />
          <Tooltip formatter={(value: number) => formatBytes(value)} />
          <Bar dataKey="size" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
