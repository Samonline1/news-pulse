"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { fetchClusters, fetchTimeline, triggerNewsRefresh } from "@/services/api";
import type { ClusterSummary } from "@/types/cluster";

type ToastType = "success" | "error";

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

interface NewsDataContextValue {
  clusters: ClusterSummary[];
  timeline: ClusterSummary[];
  clustersLoading: boolean;
  timelineLoading: boolean;
  clustersError: string | null;
  timelineError: string | null;
  refreshNews: () => Promise<void>;
  refreshing: boolean;
  toast: ToastState | null;
}

const NewsDataContext = createContext<NewsDataContextValue | null>(null);

function sortByStartTime(items: ClusterSummary[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.startTime ?? 0).getTime();
    const bTime = new Date(b.startTime ?? 0).getTime();
    return aTime - bTime;
  });
}

export function NewsDataProvider({ children }: { children: ReactNode }) {
  const [clusters, setClusters] = useState<ClusterSummary[]>([]);
  const [timeline, setTimeline] = useState<ClusterSummary[]>([]);
  const [clustersLoading, setClustersLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(true);
  const [clustersError, setClustersError] = useState<string | null>(null);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToast({ id, message, type });

    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3000);
  }, []);

  const loadClusters = useCallback(async () => {
    try {
      setClustersLoading(true);
      setClustersError(null);
      const response = await fetchClusters();
      setClusters(response.data || []);
    } catch {
      setClustersError("Failed to load clusters. Please try again.");
    } finally {
      setClustersLoading(false);
    }
  }, []);

  const loadTimeline = useCallback(async () => {
    try {
      setTimelineLoading(true);
      setTimelineError(null);
      const response = await fetchTimeline();
      setTimeline(sortByStartTime(response.data || []));
    } catch {
      setTimelineError("Failed to load the timeline. Please try again.");
    } finally {
      setTimelineLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClusters();
    void loadTimeline();
  }, [loadClusters, loadTimeline]);

  const refreshNews = useCallback(async () => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      await triggerNewsRefresh();
      await Promise.all([loadClusters(), loadTimeline()]);
      showToast("News updated successfully.", "success");
    } catch {
      showToast("Failed to refresh news. Please try again.", "error");
    } finally {
      setRefreshing(false);
    }
  }, [loadClusters, loadTimeline, refreshing, showToast]);

  const value = useMemo<NewsDataContextValue>(
    () => ({
      clusters,
      timeline,
      clustersLoading,
      timelineLoading,
      clustersError,
      timelineError,
      refreshNews,
      refreshing,
      toast,
    }),
    [
      clusters,
      timeline,
      clustersLoading,
      timelineLoading,
      clustersError,
      timelineError,
      refreshNews,
      refreshing,
      toast,
    ]
  );

  return (
    <NewsDataContext.Provider value={value}>
      {children}
      {toast ? <ToastBanner toast={toast} /> : null}
    </NewsDataContext.Provider>
  );
}

export function useNewsData() {
  const context = useContext(NewsDataContext);

  if (!context) {
    throw new Error("useNewsData must be used within a NewsDataProvider");
  }

  return context;
}

function ToastBanner({ toast }: { toast: ToastState }) {
  const isSuccess = toast.type === "success";

  return (
    <div
      className={`fixed right-4 top-4 z-50 max-w-sm rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-medium">{toast.message}</p>
    </div>
  );
}
