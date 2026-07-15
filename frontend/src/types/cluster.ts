export interface ClusterSummary {
  clusterId: string;
  label: string;
  articleCount: number;
  sources?: string[];
  startTime?: string;
  endTime?: string;
  titleGenerated?: boolean;
  titleGeneratedAt?: string;
  summary?: string;
  summaryStatus?: "idle" | "generating" | "ready" | "stale" | "failed";
  summaryGeneratedAt?: string;
  summaryArticleCount?: number;
  lastArticleUpdatedAt?: string;
}

export interface ClustersResponse {
  data: ClusterSummary[];
  message?: string;
}

export interface TimelineResponse {
  data: ClusterSummary[];
  message?: string;
}

export interface ArticleDetails {
  title: string;
  summary: string;
  source: string;
  published: string;
  link: string;
}

export interface ClusterDetails {
  cluster: ClusterSummary;
  articles: ArticleDetails[];
}

export interface ClusterSummaryPayload {
  summary: string;
  summaryGeneratedAt?: string;
  summaryArticleCount?: number;
  lastArticleUpdatedAt?: string;
  summaryStatus?: "idle" | "generating" | "ready" | "stale" | "failed";
}
