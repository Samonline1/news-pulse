import Link from "next/link";
import type { ClusterSummary } from "@/types/cluster";

interface ClusterCardProps {
  cluster: ClusterSummary;
}

export function ClusterCard({ cluster }: ClusterCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Cluster
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink-900">{cluster.label}</h2>
        <div className="mt-4 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {cluster.articleCount} article{cluster.articleCount === 1 ? "" : "s"}
        </div>
      </div>

      <Link
        href={`/clusters/${cluster.clusterId}`}
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-800 focus:outline-none focus:ring-2 focus:ring-ink-700 focus:ring-offset-2"
      >
        View Details
      </Link>
    </article>
  );
}
