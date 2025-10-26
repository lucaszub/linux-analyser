import type { SystemData, DiskPartition, DiskAnalysis, DiskAnalysisDetailed } from '../types/system';

const API_URL = 'http://localhost:8000';

export const fetchSystemData = async (): Promise<SystemData> => {
  const response = await fetch(`${API_URL}/`);
  if (!response.ok) {
    throw new Error('Failed to fetch system data');
  }
  return response.json();
};

export const fetchDiskPartitions = async (): Promise<{ partitions: DiskPartition[] }> => {
  const response = await fetch(`${API_URL}/disk/partitions`);
  if (!response.ok) {
    throw new Error('Failed to fetch disk partitions');
  }
  return response.json();
};

export const fetchDiskAnalysis = async (path: string = '/'): Promise<DiskAnalysis> => {
  const response = await fetch(`${API_URL}/disk/analysis?path=${encodeURIComponent(path)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch disk analysis');
  }
  return response.json();
};

export const fetchDiskAnalysisDetailed = async (path: string = '/'): Promise<DiskAnalysisDetailed> => {
  const response = await fetch(`${API_URL}/disk/analysis/detailed?path=${encodeURIComponent(path)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch detailed disk analysis');
  }
  return response.json();
};
