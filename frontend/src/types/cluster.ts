export interface ClusterSummary {
  clusterId: string;
  label: string;
  articleCount: number;
  sources?: string[];
  startTime?: string;
  endTime?: string;
}

export interface ClustersResponse {
  data: ClusterSummary[];
  message?: string;
}
