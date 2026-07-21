import { useQuery } from "@tanstack/react-query";
import { fetchClusterDetails } from "@/services/api";

export function useCluster(clusterId: string) {
    return useQuery({
        queryKey: ["cluster", clusterId],
        queryFn: () => fetchClusterDetails(clusterId),
        enabled: !!clusterId,

        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
}