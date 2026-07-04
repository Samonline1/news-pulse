"use client";

import { TimelineItem } from "@/components/TimelineItem";
import { useNewsData } from "@/components/NewsDataProvider";

export function Timeline() {
  const { timeline, timelineLoading, timelineError } = useNewsData();

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur sm:p-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Timeline
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
            News Timeline
          </h2>
          <p className="max-w-2xl text-sm text-slate-500 sm:text-base">
            Clusters are arranged chronologically so you can scan how coverage
            evolved over time.
          </p>
        </div>

        {timelineLoading ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="grid grid-cols-[1.75rem_1fr] gap-4 sm:grid-cols-[2.5rem_minmax(0,1fr)]">
                <div className="flex justify-center">
                  <div className="mt-1.5 h-4 w-4 rounded-full bg-slate-200 sm:h-5 sm:w-5" />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                  <div className="animate-pulse space-y-4">
                    <div className="h-3 w-28 rounded-full bg-slate-200" />
                    <div className="h-6 w-2/3 rounded-full bg-slate-200" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="h-16 rounded-xl bg-slate-100" />
                      <div className="h-16 rounded-xl bg-slate-100" />
                    </div>
                    <div className="h-10 w-32 rounded-xl bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : timelineError ? (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-rose-700">
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                <span aria-hidden="true" className="text-lg">
                  !
                </span>
              </div>
              <div>
                <p className="font-semibold">Could not load timeline</p>
                <p className="mt-1 text-sm text-rose-600">{timelineError}</p>
              </div>
            </div>
          </div>
        ) : timeline.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center text-slate-500">
            <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
              <span className="text-3xl" aria-hidden="true">
                ◎
              </span>
              <p className="text-base font-medium text-slate-700">
                No timeline data available yet.
              </p>
              <p className="text-sm text-slate-500">
                Refresh News to populate the timeline with new clusters.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative mt-8">
            <div className="absolute left-[0.75rem] top-2 bottom-6 w-px bg-slate-200 sm:left-[1.25rem]" />
            <div className="space-y-1">
              {timeline.map((cluster, index) => (
                <TimelineItem
                  key={cluster.clusterId}
                  cluster={cluster}
                  isLast={index === timeline.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
