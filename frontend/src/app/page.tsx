"use client";

import { Header } from "@/components/Header";
import { ClusterCard } from "@/components/ClusterCard";
import { useNewsData } from "@/components/NewsDataProvider";

export default function HomePage() {
  const { clusters, clustersLoading, clustersError } = useNewsData();

  return (
    <main className="min-h-screen">
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                Overview
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
                Latest News Clusters
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Powered by the backend cluster API
            </p>
          </div>

          {clustersLoading ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          ) : clustersError ? (
            <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
              {clustersError}
            </div>
          ) : clusters.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center text-slate-500">
              No clusters available yet.
            </div>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {clusters.map((cluster) => (
                <ClusterCard key={cluster.clusterId} cluster={cluster} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
