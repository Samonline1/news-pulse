import axios from "axios";
import type { ClustersResponse } from "@/types/cluster";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
});

export async function fetchClusters() {
  const response = await api.get<ClustersResponse>("/clusters");
  return response.data;
}

export default api;
