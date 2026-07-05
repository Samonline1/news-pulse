"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { ArticleCard } from "@/components/ArticleCard";
import { ClusterHeader } from "@/components/ClusterHeader";
import { fetchClusterDetails } from "@/services/api";
import type { ClusterDetails } from "@/types/cluster";

interface ClusterDetailsPageProps {
  clusterId: string;
}

// Details
export function ClusterDetailsPage({ clusterId }: ClusterDetailsPageProps) {
  const [data, setData] = useState<ClusterDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Load
  const loadCluster = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setNotFound(false);

      const response = await fetchClusterDetails(clusterId);
      setData(response.data);
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 404) {
        setNotFound(true);
        setData(null);
      } else {
        setError("Failed to load cluster details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [clusterId]);

  useEffect(() => {
    void loadCluster();
  }, [loadCluster]);

  useEffect(() => {
    const handleRefresh = () => {
      void loadCluster();
    };

    window.addEventListener("news-data-refresh", handleRefresh);

    return () => {
      window.removeEventListener("news-data-refresh", handleRefresh);
    };
  }, [loadCluster]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="space-y-6 rounded-3xl border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="space-y-4">
                <div className="h-3 w-28 rounded-full bg-slate-200" />
                <div className="h-8 w-2/3 rounded-full bg-slate-200" />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="h-20 rounded-2xl bg-slate-100" />
                  <div className="h-20 rounded-2xl bg-slate-100" />
                  <div className="h-20 rounded-2xl bg-slate-100 xl:col-span-2" />
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"
                >
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 w-20 rounded-full bg-slate-200" />
                    <div className="h-6 w-5/6 rounded-full bg-slate-200" />
                    <div className="h-4 w-32 rounded-full bg-slate-100" />
                    <div className="h-20 rounded-xl bg-slate-100" />
                    <div className="h-10 w-32 rounded-xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : notFound ? (
          <section className="rounded-3xl border border-white/70 bg-white/75 p-6 text-center shadow-soft backdrop-blur sm:p-8">
            <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
              <span className="text-3xl" aria-hidden="true">
                ⌁
              </span>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                404
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
                Cluster not found
              </h1>
              <p className="text-sm text-slate-600">
                The cluster you requested does not exist or is no longer available.
              </p>
            </div>
          </section>
        ) : error ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-6 text-rose-700">
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                <span aria-hidden="true" className="text-lg">
                  !
                </span>
              </div>
              <div>
                <p className="font-semibold">Could not load cluster details</p>
                <p className="mt-1 text-sm text-rose-600">{error}</p>
              </div>
            </div>
          </section>
        ) : data ? (
          <div className="space-y-8">
            <ClusterHeader cluster={data.cluster} />

            <section className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                    Articles
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
                    {data.articles.length} article
                    {data.articles.length === 1 ? "" : "s"}
                  </h2>
                </div>
              </div>

              {data.articles.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center text-slate-500">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                    <span className="text-3xl" aria-hidden="true">
                      ◌
                    </span>
                    <p className="text-base font-medium text-slate-700">
                      No articles available for this cluster.
                    </p>
                    <p className="text-sm text-slate-500">
                      This cluster may only contain metadata right now.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {data.articles.map((article) => (
                    <ArticleCard
                      key={`${article.title}-${article.link}`}
                      article={article}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
