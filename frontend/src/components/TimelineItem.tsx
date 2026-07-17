import Link from "next/link";
import type { ClusterSummary } from "@/types/cluster";
import { formatDisplayDate } from "@/lib/formatDate";

interface TimelineItemProps {
  cluster: ClusterSummary;
  isLast?: boolean;
}

// Item
export function TimelineItem({ cluster, isLast = false }: TimelineItemProps) {
  return (
    <article className="relative grid grid-cols-[1.75rem_1fr] gap-4 sm:grid-cols-[2.5rem_minmax(0,1fr)]">
      <div className="relative flex justify-center">
        <div className="mt-1.5 h-4 w-4 rounded-full border-4 border-slate-100 bg-slate-900 shadow-sm dark:border-slate-900 dark:bg-slate-100 sm:h-5 sm:w-5" />
        {!isLast ? (
          <div className="absolute top-6 bottom-[-1.5rem] w-px bg-gradient-to-b from-slate-300 via-slate-200 to-transparent dark:from-slate-600 dark:via-slate-700 sm:bottom-[-2rem]" />
        ) : null}
      </div>

      <div className="pb-8 sm:pb-10">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-soft backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/90 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Cluster
              </p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink-900 dark:text-slate-100 sm:text-xl">
                {cluster.label}
              </h3>
            </div>

            <div className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {cluster.articleCount} article{cluster.articleCount === 1 ? "" : "s"}
            </div>
          </div>

          <dl className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                Start Date
              </dt>
              <dd className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                {formatDisplayDate(cluster.startTime)}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-900">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                End Date
              </dt>
              <dd className="mt-1 font-medium text-slate-800 dark:text-slate-200">
                {formatDisplayDate(cluster.endTime)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex justify-start">
            <Link
              href={`/clusters/${cluster.clusterId}`}
              className="inline-flex items-center justify-center rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-800 focus:outline-none focus:ring-2 focus:ring-ink-700 focus:ring-offset-2 focus:ring-offset-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:focus:ring-offset-slate-950"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
