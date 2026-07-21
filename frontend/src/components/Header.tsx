"use client";

import Link from "next/link";
import { Search, Bell, RefreshCw, ArrowUpRight, Rss } from "lucide-react";
// import { useNewsData } from "@/components/NewsDataProvider";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  // const { refreshNews, refreshing } = useNewsData();

  return (
    <header className="px-4 pt-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between lg:px-6 py-4">

        {/* Left */}
        <div
          className="group inline-flex items-center gap-3 rounded-full  px-4 py-2 font-semibold text-slate-900  dark:border-slate-700  dark:text-slate-100">
          {/* <p className="text-xs text-slate-500">Welcome,</p> */}

          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white transition-transform duration-300 group-hover:hover:scale-110 dark:bg-slate-100 dark:text-slate-900">
            <Rss className="h-5 w-5" />

          </span>

          <p className="text-xl hidden lg:block text-slate-300 dark:text-slate-600">|</p>

          <h2 className="text-xl hidden lg:block font-semibold text-slate-900 dark:text-slate-100">
            News Pulse

          </h2>

        </div>

        {/* Search */}
        {/* <div className="mx-8 hidden max-w-xl flex-1 md:block">
          <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 transition focus-within:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:border-sky-400">

            <Search className="mr-3 h-4 w-4 text-slate-400" />

            <input
              type="text"
              placeholder="Search news title, source, or cluster..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            />

          </div>
        </div>  */}

        {/* Right */}
        <div className="flex items-center gap-3">

          <Link
            href="/"
            className="group inline-flex items-center gap-3 rounded-full border-2 border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">

            Dashboard
          </Link>

          <Link
            href="/timeline"
            className="group inline-flex items-center gap-3 rounded-full border-2 border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">

            Timeline
          </Link>

          {/* <button
            onClick={() => void refreshNews()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            {refreshing ? "Refreshing..." : "Refresh News"}
          </button> */}




          <ThemeToggle />


        </div>
      </div>
    </header>
  );
}
