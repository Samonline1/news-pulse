import axios from "axios";
import type { ClusterDetails, ClusterSummary } from "@/types/cluster";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
});

const refreshApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 180000,
});

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

async function unwrapResponse<T>(request: Promise<{ data: ApiEnvelope<T> }>) {
  const response = await request;
  return response.data;
}

export async function fetchClusters() {
  return unwrapResponse<ClusterSummary[]>(api.get("/clusters"));
}

export async function fetchTimeline() {
  return unwrapResponse<ClusterSummary[]>(api.get("/timeline"));
}

export async function fetchClusterDetails(clusterId: string) {
  return unwrapResponse<ClusterDetails>(api.get(`/clusters/${clusterId}`));
}

export async function triggerNewsRefresh() {
  return unwrapResponse<null>(refreshApi.post("/ingest/trigger"));
}

export default api;
