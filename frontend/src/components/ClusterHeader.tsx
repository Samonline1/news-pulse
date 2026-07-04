import Link from "next/link";
import type { ClusterSummary } from "@/types/cluster";
import { formatDisplayDate } from "@/lib/formatDate";

interface ClusterHeaderProps {
  cluster: ClusterSummary;
}

export function ClusterHeader({ cluster }: ClusterHeaderProps) {
  const timelineText =
    cluster.startTime || cluster.endTime
      ? `${formatDisplayDate(cluster.startTime)} → ${formatDisplayDate(cluster.endTime)}`
      : "Unavailable";

  return (
    <section className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur sm:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Cluster Details
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              {cluster.label}
            </h1>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-ink-700 focus:ring-offset-2"
          >
            Back
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Article Count
            </p>
            <p className="mt-1 text-lg font-semibold text-ink-900">
              {cluster.articleCount} article{cluster.articleCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Sources
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700">
              {cluster.sources?.length ? cluster.sources.join(", ") : "Unavailable"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 sm:col-span-2 xl:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Timeline
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700">{timelineText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
