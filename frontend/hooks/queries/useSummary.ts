import { useQuery } from "@tanstack/react-query";
import { fetchClusterSummary } from "@/services/api";

export function useSummary(clusterId: string) {
  return useQuery({
    queryKey: ["summary", clusterId],
    queryFn: () => fetchClusterSummary(clusterId),
    enabled: !!clusterId,
   
  });
}