import { useQuery } from "@tanstack/react-query";
import { fetchTimeline } from "@/services/api";


export function useTimeline() {
    return useQuery({
        queryKey: ["timeline"],
        queryFn: fetchTimeline,

        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
    });
}