"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { fetchClusterSummary, refreshClusterSummary } from "@/services/api";
import type { ClusterSummaryPayload } from "@/types/cluster";
import { formatDisplayDate } from "@/lib/formatDate";

interface ClusterAssistantDrawerProps {
  clusterId: string;
}

type LoadState = "idle" | "loading" | "ready" | "error";
type SummarySource = "NewsPulseAI" | "RSS";

export function ClusterAssistantDrawer({ clusterId }: ClusterAssistantDrawerProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<LoadState>("idle");
  const [summary, setSummary] = useState<ClusterSummaryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = useCallback(async () => {
    try {
      setState("loading");
      setError(null);
      const response = await fetchClusterSummary(clusterId);
      setSummary(response.data);
      setState("ready");
    } catch (requestError) {
      setState("error");
      if (axios.isAxiosError(requestError)) {
        const message =
          (requestError.response?.data as { message?: string; details?: string } | undefined)
            ?.details ||
          (requestError.response?.data as { message?: string } | undefined)?.message;
        setError(message || "Unable to load summary.");
      } else {
        setError("Unable to load summary.");
      }
    }
  }, [clusterId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    void loadSummary();
  }, [loadSummary, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const isUpToDate = useMemo(() => {
    if (!summary || summary.summaryStatus !== "ready") {
      return false;
    }

    if (!summary.summaryGeneratedAt || !summary.lastArticleUpdatedAt) {
      return true;
    }

    return new Date(summary.summaryGeneratedAt).getTime() >= new Date(summary.lastArticleUpdatedAt).getTime();
  }, [summary]);

  const summarySource: SummarySource = summary?.summaryGeneratedAt ? "NewsPulseAI" : "RSS";

  const handleRefresh = useCallback(async () => {
    if (!summary || refreshing || isUpToDate) {
      return;
    }

    try {
      setRefreshing(true);
      setError(null);
      setState("loading");
      const response = await refreshClusterSummary(clusterId);
      setSummary(response.data);
      setState("ready");
    } catch (requestError) {
      setState("error");
      if (axios.isAxiosError(requestError)) {
        const message =
          (requestError.response?.data as { message?: string; details?: string } | undefined)
            ?.details ||
          (requestError.response?.data as { message?: string } | undefined)?.message;
        setError(message || "Unable to load summary.");
      } else {
        setError("Unable to load summary.");
      }
    } finally {
      setRefreshing(false);
    }
  }, [clusterId, isUpToDate, refreshing, summary]);

  const statusLabel = summary?.summaryStatus || "idle";
  const showUpToDate = Boolean(summary && summary.summaryStatus === "ready" && isUpToDate);
  const refreshDisabled = !summary || refreshing || showUpToDate || summary.summaryStatus !== "stale";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-ink-900 bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-ink-800 focus:outline-none focus:ring-2 focus:ring-ink-700 focus:ring-offset-2"
      >
        <span aria-hidden="true">AI</span>
        Assistant
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-3 sm:px-4 sm:py-4 ">
          <button
            type="button"
            aria-label="Close AI assistant"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-assistant-title"
            className="relative flex max-h-[calc(100vh-3rem)] w-[95%] max-w-[720px] flex-col overflow-hidden rounded-3xl border border-white/70 bg-white  dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900dark:border-slate-700 dark:bg-slate-900 shadow-[0_28px_80px_rgba(15,23,42,0.3)] sm:w-[90%]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6 ">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-200">
                  AI Assistant
                </p>
                <h2 id="ai-assistant-title" className="mt-1 text-xl font-semibold text-ink-900 dark:text-slate-200">
                  Cluster Summary
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-900 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-ink-700 focus:ring-offset-2"
                aria-label="Close modal"
              >
                x
              </button>
            </div>

            <div className="flex-1 overflow-hidden px-5 py-4 sm:px-6 sm:py-5">
              {state === "loading" ? (
                <ModalSkeleton />
              ) : error ? (
                <div className="flex min-h-[280px] flex-col justify-between gap-4">
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-rose-700">
                    <p className="text-base font-semibold">Unable to load summary.</p>
                    <p className="mt-1 text-sm text-rose-600">{error}</p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => void loadSummary()}
                      className="inline-flex items-center justify-center rounded-2xl bg-ink-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink-800 focus:outline-none focus:ring-2 focus:ring-ink-700 focus:ring-offset-2"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : summary ? (
                <div className="flex h-full min-h-0 flex-col gap-4">
                  <section className="rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-900  p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]  ">
                      AI Summary
                    </p>
                    <div className="mt-3 max-h-[260px] overflow-y-auto pr-2 text-sm leading-7 text-slate-700 dark:text-slate-200 ">
                      {summary.summary || "No summary available."}
                    </div>
                  </section>

                  <section className="grid gap-2 sm:grid-cols-2">
                    <InfoRow label="Status" value={statusLabel} />
                    <InfoRow label="Source" value={summarySource} />
                    <InfoRow
                      label="Generated At"
                      value={formatDisplayDate(summary.summaryGeneratedAt)}
                    />
                    <InfoRow
                      label="Articles Summarized"
                      value={String(summary.summaryArticleCount ?? 0)}
                    />
                  </section>

                  <div className="mt-auto flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-slate-500 ">
                      {showUpToDate
                        ? "Up to date"
                        : summary.summaryStatus === "stale"
                          ? "Summary is stale and can be refreshed."
                          : "Summary will refresh when stale or when requested."}
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleRefresh()}
                      disabled={refreshDisabled}
                      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ink-700 focus:ring-offset-2 ${
                        refreshDisabled
                          ? "cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-200"
                          : "bg-ink-900 text-white hover:bg-ink-800"
                      }`}
                    >
                      {showUpToDate ? "Up to date" : "Refresh Summary"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function ModalSkeleton() {
  return (
    <div className="flex h-full min-h-[280px] flex-col gap-4">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-11/12 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-10/12 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-9/12 animate-pulse rounded-full bg-slate-200" />
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white  dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900dark:border-slate-700 dark:bg-slate-900 px-4 py-3">
            <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-2 h-4 w-32 animate-pulse rounded-full bg-slate-900" />
          </div>
        ))}
      </section>

      <div className="mt-auto flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-4 w-44 animate-pulse rounded-full bg-slate-200" />
        <div className="h-11 w-36 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white  dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900dark:border-slate-700 dark:bg-slate-900 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-200">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200 dark:text-slate-200 dark:text-slate-200 dark:text-slate-200 dark:text-slate-200 dark:text-slate-200 dark:text-slate-200 dark:text-slate-200 dark:text-slate-200 dark:text-slate-200">{value || "Unavailable"}</p>
    </div>
  );
}
