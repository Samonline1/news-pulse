import axios from "axios";
import type { ClusterDetails, ClusterSummary, ClusterSummaryPayload } from "@/types/cluster";

// Client
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
});

// Refresh
const refreshApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 180000,
});

// Envelope
type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

// Unwrap
async function unwrapResponse<T>(request: Promise<{ data: ApiEnvelope<T> }>) {
  const response = await request;
  return response.data;
}

// Clusters
export async function fetchClusters() {
  return unwrapResponse<ClusterSummary[]>(api.get("/clusters"));
}

// Timeline
export async function fetchTimeline() {
  return unwrapResponse<ClusterSummary[]>(api.get("/timeline"));
}

// Details
export async function fetchClusterDetails(clusterId: string) {
  return unwrapResponse<ClusterDetails>(api.get(`/clusters/${clusterId}`));
}

// Summary
export async function fetchClusterSummary(clusterId: string) {
  return unwrapResponse<ClusterSummaryPayload>(api.get(`/clusters/${clusterId}/summary`));
}

export async function refreshClusterSummary(clusterId: string) {
  return unwrapResponse<ClusterSummaryPayload>(api.post(`/clusters/${clusterId}/summary/refresh`));
}

// Trigger
// export async function triggerNewsRefresh() {
//   return unwrapResponse<null>(refreshApi.post("/ingest/trigger"));
// }

export default api;
