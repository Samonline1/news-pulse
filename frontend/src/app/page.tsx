"use client";

import { Header } from "@/components/Header";
import { ClusterCard } from "@/components/ClusterCard";
import { useNewsData } from "@/components/NewsDataProvider";
import { useState } from "react";

export default function HomePage() {
  const { clusters, clustersLoading, clustersError } = useNewsData();

  const [sortBy, setSortBy] = useState("latest");

  const sortedClusters = [...clusters];

  switch (sortBy) {
    case "latest":
      sortedClusters.sort(
        (a, b) =>
         new Date(b.endTime ?? 0).getTime() -
    new Date(a.endTime ?? 0).getTime()
      );
      break;

    case "articles":
      sortedClusters.sort((a, b) => b.articleCount - a.articleCount);
      break;
  }

  return (
    <main className="min-h-screen">
      <Header />

      <section className="mx-auto max-w-7xl py-8 sm:px-6 lg:px-0">
        <div className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Overview
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Latest News
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Topics : {clusters.length}
                {clusters.length !== 1}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Sort by
              </span>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
              >
                <option value="latest"> Latest</option>
                <option value="articles"> Most Articles</option>
              </select>
            </div>
          </div>

          {clustersLoading ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="animate-pulse space-y-4">
                    <div className="h-3 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="h-6 w-3/4 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="h-8 w-28 rounded-full bg-slate-100 dark:bg-slate-900" />
                    <div className="mt-8 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : clustersError ? (
            <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900 dark:bg-rose-950/40">
              <h3 className="font-semibold text-rose-700 dark:text-rose-300">
                Could not load clusters
              </h3>

              <p className="mt-2 text-sm text-rose-600 dark:text-rose-300/90">
                {clustersError}
              </p>
            </div>
          ) : clusters.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
              <div className="space-y-3">
                <p className="text-4xl">ðŸ“°</p>

                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                  No clusters available
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Refresh the news to generate fresh clusters.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {sortedClusters.map((cluster) => (
                <ClusterCard key={cluster.clusterId} cluster={cluster} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
