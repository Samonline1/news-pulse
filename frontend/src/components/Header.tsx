"use client";

import Link from "next/link";
import { useNewsData } from "@/components/NewsDataProvider";

// Header
export function Header() {
  const { refreshNews, refreshing } = useNewsData();

  return (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            News Pulse
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
            Cluster Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void refreshNews()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-ink-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? (
              <>
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"
                  aria-hidden="true"
                />
                Refreshing...
              </>
            ) : (
              "Refresh News"
            )}
          </button>
          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-ink-700 focus:ring-offset-2"
          >
            Dashboard
          </Link>
          <Link
            href="/timeline"
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-600 transition-all hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-ink-700 focus:ring-offset-2"
          >
            Timeline
          </Link>
        </div>
      </div>
    </header>
  );
}
