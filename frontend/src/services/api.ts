import axios from "axios";
import type { ClusterDetails, ClusterSummary, ClusterSummaryPayload } from "@/types/cluster";

// Client
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
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
    console.log("API: fetchClusters");

  return unwrapResponse<ClusterSummary[]>(api.get("/clusters"));
}

// Timeline
export async function fetchTimeline() {
    console.log("API: fetchTimeline");

  return unwrapResponse<ClusterSummary[]>(api.get("/timeline"));
}

// Details
export async function fetchClusterDetails(clusterId: string) {
    console.log("API: fetchClusterDetails");

  return unwrapResponse<ClusterDetails>(api.get(`/clusters/${clusterId}`));
}

// Summary
export async function fetchClusterSummary(clusterId: string) {
      console.log("API: fetchClusterSummary");

  return unwrapResponse<ClusterSummaryPayload>(api.get(`/clusters/${clusterId}/summary`));
}

export async function refreshClusterSummary(clusterId: string) {
        console.log("API: refreshClusterSummary");

  return unwrapResponse<ClusterSummaryPayload>(api.post(`/clusters/${clusterId}/summary/refresh`));
}


export default api;
