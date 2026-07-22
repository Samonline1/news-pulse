import { useQuery } from "@tanstack/react-query";
import { fetchClusterDetails } from "@/services/api";

export function useCluster(clusterId: string) {
    return useQuery({
        queryKey: ["cluster", clusterId],
        queryFn: () => fetchClusterDetails(clusterId),
        enabled: !!clusterId,

    });
}