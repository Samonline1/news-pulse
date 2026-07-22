"use client";

import Link from "next/link";
import { Menu, X, Rss } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="px-4 pt-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between lg:px-6 py-4">
        {/* Left */}
        <div className="group inline-flex items-center gap-3 rounded-full  px-4 py-2 font-semibold text-slate-900  dark:border-slate-700  dark:text-slate-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white transition-transform duration-300 group-hover:hover:scale-110 dark:bg-slate-100 dark:text-slate-900">
            <Rss className="h-5 w-5" />
          </span>

          <p className="text-xl hidden lg:block text-slate-300 dark:text-slate-600">
            |
          </p>

          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            News Pulse
          </h2>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className=" hidden lg:block group inline-flex items-center gap-3 rounded-full border-2 border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            Dashboard
          </Link>

          <Link
            href="/timeline"
            className=" hidden lg:block group inline-flex items-center gap-3 rounded-full border-2 border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            Timeline
          </Link>

          <ThemeToggle />
          <button
            onClick={() => setOpen(true)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[90%] max-w-sm rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Menu</h2>

              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="block rounded-xl p-3 border "
              >
                Dashboard
              </Link>

              <Link
                href="/timeline"
                onClick={() => setOpen(false)}
                className="block rounded-xl p-3 border"
              >
                Timeline
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
