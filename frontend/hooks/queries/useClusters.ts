import { useQuery } from "@tanstack/react-query";
import { fetchClusters } from "@/services/api";

export function useClusters() {
    return useQuery({
        queryKey: ["clusters"],
        queryFn: fetchClusters,

        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    })
}