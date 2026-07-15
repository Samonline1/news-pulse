"use client";

import { Header } from "@/components/Header";
import { ClusterCard } from "@/components/ClusterCard";
import { useNewsData } from "@/components/NewsDataProvider";

// Dashboard
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
              Number of clusters: {clusters.length}
            </p>
          </div>

          {clustersLoading ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                  <div className="animate-pulse space-y-4">
                    <div className="h-3 w-24 rounded-full bg-slate-200" />
                    <div className="h-6 w-3/4 rounded-full bg-slate-200" />
                    <div className="h-8 w-28 rounded-full bg-slate-100" />
                    <div className="mt-8 h-10 rounded-xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : clustersError ? (
            <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-rose-700">
              <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                  <span aria-hidden="true" className="text-lg">
                    !
                  </span>
                </div>
                <div>
                  <p className="font-semibold">Could not load clusters</p>
                  <p className="mt-1 text-sm text-rose-600">{clustersError}</p>
                </div>
              </div>
            </div>
          ) : clusters.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center text-slate-500">
              <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                <span className="text-3xl" aria-hidden="true">
                  ⟡
                </span>
                <p className="text-base font-medium text-slate-700">
                  No clusters available yet.
                </p>
                <p className="text-sm text-slate-500">
                  Refresh News to generate fresh coverage clusters.
                </p>
              </div>
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
