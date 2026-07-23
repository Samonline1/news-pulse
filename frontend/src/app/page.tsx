"use client";

import { Header } from "@/components/Header";
import { ClusterCard } from "@/components/ClusterCard";
import { useState } from "react";
import { LocalTime } from "@/components/WorldClock";
import { useClusters } from "hooks/queries/useClusters";

export default function HomePage() {
  const {
    data,
    isLoading,
    error,
  } = useClusters();

  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");

  const clusters = data?.data ?? [];

  const filteredClusters = clusters.filter((cluster) =>
    JSON.stringify(cluster)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const sortedClusters = [...filteredClusters];


  switch (sortBy) {
    case "latest":
      sortedClusters.sort(
        (a, b) =>
          new Date(b.endTime ?? b.startTime ?? 0).getTime() -
          new Date(a.endTime ?? a.startTime ?? 0).getTime()
      );
      break;

    case "articles":
      sortedClusters.sort((a, b) => b.articleCount - a.articleCount);
      break;
  }

  return (
    <main className="min-h-screen">
      <Header />

      <section className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-5 space-y-5 ">
        <div className="rounded-3xl border border-slate-200 bg-slate-300/40 p-6 dark:border-slate-800 dark:bg-slate-950/80 sm:px-8">

          <div>
            <div className="flex justify-between">

              <div>


                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Overview
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Latest News
                </h2>

              </div>

              <LocalTime />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {clusters.reduce((total, cluster) => total + cluster.articleCount, 0)}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Total Articles
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {clusters.length}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Total News
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {new Set(
                    clusters.flatMap((cluster) => cluster.sources)
                  ).size}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Active Sources
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {Math.max(...clusters.map((cluster) => cluster.articleCount), 0)}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Largest News
                </p>
              </div>
            </div>



          </div>

        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-300/40 p-6 dark:border-slate-800 dark:bg-slate-950/80 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">


            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-900/80">
                <svg
                  className="mr-2 h-4 w-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6 6a7.5 7.5 0 0 0 10.65 10.65Z"
                  />
                </svg>

                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-48 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center gap-2 rounded-2xl px-3 py-2 ">
                <button
                  onClick={() => setSortBy("latest")}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${sortBy === "latest"
                    ? "border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    : "border-transparent text-slate-600 dark:text-slate-400"
                    }`}
                >
                  Latest
                </button>

                <button
                  onClick={() => setSortBy("articles")}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${sortBy === "articles"
                    ? "border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    : "border-transparent text-slate-600 dark:text-slate-400"
                    }`}
                >
                  Most Articles
                </button>
              </div>
            </div>



          </div>

          {isLoading ? (
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
          ) : error ? (
            <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 dark:border-rose-900 dark:bg-rose-950/40">
              <h3 className="font-semibold text-rose-700 dark:text-rose-300">
                Could not load clusters
              </h3>

              <p className="mt-2 text-sm text-rose-600 dark:text-rose-300/90">
                {error instanceof Error ? error.message : "Something went wrong"}
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
