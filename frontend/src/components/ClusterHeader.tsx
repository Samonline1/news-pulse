import Link from "next/link";
import type { ClusterSummary } from "@/types/cluster";
import { formatDisplayDate } from "@/lib/formatDate";

interface ClusterHeaderProps {
  cluster: ClusterSummary;
}

// Summary
export function ClusterHeader({ cluster }: ClusterHeaderProps) {
  const timelineText =
    cluster.startTime || cluster.endTime
      ? `${formatDisplayDate(cluster.startTime)} → ${formatDisplayDate(cluster.endTime)}`
      : "Unavailable";

  return (
    <section className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Cluster Details
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 dark:text-slate-100 sm:text-4xl">
              {cluster.label}
            </h1>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-ink-700 focus:ring-offset-2 focus:ring-offset-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950"
          >
            Back
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Article Count
            </p>
            <p className="mt-1 text-lg font-semibold text-ink-900 dark:text-slate-100">
              {cluster.articleCount} article{cluster.articleCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Sources
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
              {cluster.sources?.length ? cluster.sources.join(", ") : "Unavailable"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 sm:col-span-2 xl:col-span-2 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Timeline
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{timelineText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
