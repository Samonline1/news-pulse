import Link from "next/link";
import type { ClusterSummary } from "@/types/cluster";
import { ArrowUpRight } from "lucide-react";

import { formatDisplayDate, formatDisplayTime } from "@/lib/formatDate";

interface ClusterCardProps {
  cluster: ClusterSummary;
}

export function ClusterCard({ cluster }: ClusterCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          Topic
        </span>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-sky-500/10 dark:text-sky-300">
          {formatDisplayTime(cluster.endTime)}
        </span>
      </div>

      <h2 className="mt-5 line-clamp-2 text-xl font-bold leading-7 text-slate-900 dark:text-slate-100">
        {cluster.label}
      </h2>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {cluster.sources[0]?.charAt(0)}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {cluster.sources.join(", ")}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatDisplayDate(cluster.endTime)}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
          <div
            className="h-full rounded-full bg-blue-600 dark:bg-sky-400"
            style={{
              width: `${Math.min(cluster.articleCount * 20, 100)}%`,
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {cluster.articleCount} Article{cluster.articleCount !== 1 && "s"}
          </span>

          <Link
            href={`/clusters/${cluster.clusterId}`}
            className="group inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"
          >
            <span>View Details</span>

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white transition-transform duration-300 group-hover:translate-x-1 dark:bg-slate-100 dark:text-slate-900">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
