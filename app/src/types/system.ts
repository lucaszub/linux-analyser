export interface SystemData {
  timestamp: number;
  cpu: {
    cpu_percent: number;
    cpu_count_logical: number;
    cpu_count_physical: number;
    cpu_per_core: number[];
    cpu_freq: {
      current: number;
      min: number;
      max: number;
    };
    load_avg: number[];
  };
  memory: {
    virtual: {
      total: number;
      available: number;
      used: number;
      percent: number;
      free: number;
      active: number;
      inactive: number;
      buffers: number;
      cached: number;
    };
    swap: {
      total: number;
      used: number;
      free: number;
      percent: number;
    };
  };
  disk: {
    usage: {
      total: number;
      used: number;
      free: number;
      percent: number;
    };
    io_counters: {
      read_count: number;
      write_count: number;
      read_bytes: number;
      write_bytes: number;
      read_time: number;
      write_time: number;
    };
  };
  network: {
    io_counters: {
      bytes_sent: number;
      bytes_recv: number;
      packets_sent: number;
      packets_recv: number;
      errin: number;
      errout: number;
      dropin: number;
      dropout: number;
    };
    connections_count: number;
  };
  system: {
    boot_time: number;
    uptime_seconds: number;
    process_count: number;
  };
}

export interface DiskPartition {
  device: string;
  mountpoint: string;
  fstype: string;
  total: number;
  used: number;
  free: number;
  percent: number;
}

export interface DirectorySize {
  path: string;
  name: string;
  size: number;
  size_gb: number;
  size_mb: number;
}

export interface DiskAnalysis {
  path: string;
  directories: DirectorySize[];
}

export interface DirectorySizeEnhanced extends DirectorySize {
  percent_of_partition: number;
  percent_of_analyzed: number;
  file_count: number;
  dir_count: number;
}

export interface FileTypeDistribution {
  [extension: string]: {
    count: number;
    size: number;
    percent: number;
  };
}

export interface DiskAnalysisDetailed {
  path: string;
  directories: DirectorySizeEnhanced[];
  total_analyzed_size: number;
  total_analyzed_size_gb: number;
  partition_total_size: number;
  partition_total_size_gb: number;
  percent_of_partition_analyzed: number;
  file_type_distribution: FileTypeDistribution;
  directory_count: number;
}

// Types pour l'analyse des dossiers racine (/)
export interface RootDirectoryItem {
  path: string;
  name: string;
  size: number;
  size_human: string;
  percent: number;
  file_count: number;
  dir_count: number;
}

export interface RootAnalysisResponse {
  items: RootDirectoryItem[];
  total_size: number;
  total_size_human: string;
  directory_count: number;
  skipped_count: number;
  path: string;
  timestamp: number;
}
