"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ArticleCard } from "@/components/ArticleCard";
import { ClusterHeader } from "@/components/ClusterHeader";
import { fetchClusterDetails } from "@/services/api";
import type { ClusterDetails } from "@/types/cluster";

interface ClusterDetailsPageProps {
  clusterId: string;
}

export function ClusterDetailsPage({ clusterId }: ClusterDetailsPageProps) {
  const [data, setData] = useState<ClusterDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCluster() {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);

        const response = await fetchClusterDetails(clusterId);

        if (!isMounted) {
          return;
        }

        setData(response);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        if (axios.isAxiosError(requestError) && requestError.response?.status === 404) {
          setNotFound(true);
          setData(null);
        } else {
          setError("Failed to load cluster details. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCluster();

    return () => {
      isMounted = false;
    };
  }, [clusterId]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="space-y-6 rounded-3xl border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="h-40 animate-pulse rounded-3xl bg-slate-100" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-60 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          </div>
        ) : notFound ? (
          <section className="rounded-3xl border border-white/70 bg-white/75 p-6 text-center shadow-soft backdrop-blur sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              404
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
              Cluster not found
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              The cluster you requested does not exist or is no longer available.
            </p>
          </section>
        ) : error ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700">
            {error}
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
                  No articles available for this cluster.
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
