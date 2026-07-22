"use client";

import { useMemo } from "react";
import { TimelineItem } from "@/components/TimelineItem";
import { useTimeline } from "hooks/queries/useTimeline";

export function Timeline() {
   const {
      data,
      isLoading,
      error,
    } = useTimeline();

    const timeline = data?.data ?? [];

  const sortedTimeline = useMemo(() => {
    return [...timeline].sort((a, b) => {
      const aTime = new Date(a.endTime ?? a.startTime ?? 0).getTime();
      const bTime = new Date(b.endTime ?? b.startTime ?? 0).getTime();
      return bTime - aTime;
    });
  }, [timeline]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-5">
      <div className="rounded-3xl border border-white/70 bg-slate-300/30 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:p-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Timeline
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900 dark:text-slate-100 sm:text-3xl">
            News Timeline
          </h2>
          <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Clusters are arranged chronologically so you can scan how coverage evolved over time.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[1.75rem_1fr] gap-4 sm:grid-cols-[2.5rem_minmax(0,1fr)]"
              >
                <div className="flex justify-center">
                  <div className="mt-1.5 h-4 w-4 rounded-full bg-slate-200 dark:bg-slate-700 sm:h-5 sm:w-5" />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-950">
                  <div className="animate-pulse space-y-4">
                    <div className="h-3 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="h-6 w-2/3 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-900" />
                      <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-900" />
                    </div>
                    <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/60">
                <span aria-hidden="true" className="text-lg">
                  !
                </span>
              </div>
              <div>
                <p className="font-semibold">Could not load timeline</p>
                <p className="mt-1 text-sm text-rose-600 dark:text-rose-300/90">
                  {error instanceof Error ? error.message : "Something went wrong"}
                </p>
              </div>
            </div>
          </div>
        ) : sortedTimeline.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
            <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
              <span className="text-3xl" aria-hidden="true">
                â—Ž
              </span>
              <p className="text-base font-medium text-slate-700 dark:text-slate-200">
                No timeline data available yet.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Refresh News to populate the timeline with new clusters.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative mt-8">
            <div className="absolute left-[0.75rem] top-2 bottom-6 w-px bg-slate-200 dark:bg-slate-700 sm:left-[1.25rem]" />
            <div className="space-y-1">
              {sortedTimeline.map((cluster, index) => (
                <TimelineItem
                  key={cluster.clusterId}
                  cluster={cluster}
                  isLast={index === sortedTimeline.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
