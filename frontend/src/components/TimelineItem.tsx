import Link from "next/link";
import type { ClusterSummary } from "@/types/cluster";
import { formatDisplayDate } from "@/lib/formatDate";

interface TimelineItemProps {
  cluster: ClusterSummary;
  isLast?: boolean;
}

export function TimelineItem({ cluster, isLast = false }: TimelineItemProps) {
  return (
    <article className="relative grid grid-cols-[1.75rem_1fr] gap-4 sm:grid-cols-[2.5rem_minmax(0,1fr)]">
      <div className="relative flex justify-center">
        <div className="mt-1.5 h-4 w-4 rounded-full border-4 border-slate-100 bg-slate-900 shadow-sm sm:h-5 sm:w-5" />
        {!isLast ? (
          <div className="absolute top-6 bottom-[-1.5rem] w-px bg-gradient-to-b from-slate-300 via-slate-200 to-transparent sm:bottom-[-2rem]" />
        ) : null}
      </div>

      <div className="pb-8 sm:pb-10">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Cluster
              </p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink-900 sm:text-xl">
                {cluster.label}
              </h3>
            </div>

            <div className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {cluster.articleCount} article{cluster.articleCount === 1 ? "" : "s"}
            </div>
          </div>

          <dl className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Start Date
              </dt>
              <dd className="mt-1 font-medium text-slate-800">
                {formatDisplayDate(cluster.startTime)}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                End Date
              </dt>
              <dd className="mt-1 font-medium text-slate-800">
                {formatDisplayDate(cluster.endTime)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex justify-start">
            <Link
              href={`/clusters/${cluster.clusterId}`}
              className="inline-flex items-center justify-center rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-ink-800 focus:outline-none focus:ring-2 focus:ring-ink-700 focus:ring-offset-2"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
