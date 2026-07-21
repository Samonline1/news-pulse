import { useQuery } from "@tanstack/react-query";
import { fetchClusterSummary } from "@/services/api";

export function useSummary(clusterId: string) {
  return useQuery({
    queryKey: ["summary", clusterId],
    queryFn: () => fetchClusterSummary(clusterId),
    enabled: !!clusterId,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });
}