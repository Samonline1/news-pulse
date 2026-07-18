import Link from "next/link";
import type { ArticleDetails } from "@/types/cluster";
import { formatDisplayDate } from "@/lib/formatDate";
import { ArrowUpRight } from "lucide-react";
interface ArticleCardProps {
  article: ArticleDetails;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const hasLink = Boolean(article.link);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 sm:p-6">
      <div className="flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-ink-900 dark:text-slate-100 sm:text-xl">
            {article.title || "Untitled article"}
          </h2>
          <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            {article.source || "Unknown source"}
          </span>
        </div>

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Published {formatDisplayDate(article.published)}
        </p>

        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {article.summary || "No summary available."}
        </p>
      </div>

      <div className="mt-6">
        {hasLink ? (
          <Link
            href={article.link}
            target="_blank"
            rel="noreferrer"
                    className="group inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"
          >
            <span>Read Original</span>

            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white transition-transform duration-300 group-hover:translate-x-1 dark:bg-slate-100 dark:text-slate-900">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-500"
          >
            Read Original
            
          </button>
        )}
      </div>
    </article>
  );
}
