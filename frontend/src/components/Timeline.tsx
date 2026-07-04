"use client";

import { useEffect, useState } from "react";
import { fetchTimeline } from "@/services/api";
import type { ClusterSummary } from "@/types/cluster";
import { TimelineItem } from "@/components/TimelineItem";

export function Timeline() {
const [timeline, setTimeline] = useState<ClusterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTimeline() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchTimeline();

        if (!isMounted) {
          return;
        }

        const orderedTimeline = [...(response.data || [])].sort((a, b) => {
          const aTime = new Date(a.startTime ?? 0).getTime();
          const bTime = new Date(b.startTime ?? 0).getTime();

          return aTime - bTime;
        });

        setTimeline(orderedTimeline);
      } catch {
        if (!isMounted) {
          return;
        }

        setError("Failed to load the timeline. Please try again.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTimeline();

    return () => {
      isMounted = false;
    };
  }, []);

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

        {loading ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="grid grid-cols-[1.75rem_1fr] gap-4 sm:grid-cols-[2.5rem_minmax(0,1fr)]">
                <div className="flex justify-center">
                  <div className="mt-1.5 h-4 w-4 rounded-full bg-slate-200 sm:h-5 sm:w-5" />
                </div>
                <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
            {error}
          </div>
        ) : timeline.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center text-slate-500">
            No timeline data available yet.
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
