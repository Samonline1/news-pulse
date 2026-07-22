import { useQuery } from "@tanstack/react-query";
import { fetchClusters } from "@/services/api";

export function useClusters() {
    return useQuery({
        queryKey: ["clusters"],
        queryFn: fetchClusters,

    
    })
}