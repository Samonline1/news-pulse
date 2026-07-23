"use client";

import { useEffect, useState } from "react";
import { formatDisplayDate } from "@/lib/formatDate";
import { Sparkles } from "lucide-react";
import { useSummary } from "hooks/queries/useSummary";
interface ClusterAssistantDrawerProps {
  clusterId: string;
  showTrigger?: boolean;
}


export function ClusterAssistantDrawer({ clusterId, showTrigger = true, }: ClusterAssistantDrawerProps) {
  const [open, setOpen] = useState(false);

  const {
    data,
    isLoading,
    error,
    refetch
  } = useSummary(clusterId, open);

  const summary = data?.data;


  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!open || !summary?.summary) {
      setDisplayText("");
      return;
    }

    let index = 0;

    const interval = setInterval(() => {
      index++;

      setDisplayText(summary.summary.slice(0, index));

      if (index >= summary.summary.length) {
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [open, summary?.summary]);




  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);


  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={showTrigger ? `fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-ink-900 bg-ink-900 px-1 py-1 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-ink-800 ` : `inline-flex items-center gap-2 rounded-full border border-ink-900 bg-ink-900 px-1 py-1 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-ink-800 `}
      >
        <Sparkles className="h-4 w-4 text-violet-500" />
        {/* <span>AI Summary</span> */}
      </button>

      {open && (
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-assistant-title"
          className="fixed bottom-5 right-5 z-[9999] flex h-[75vh] min-h-[500px] max-h-[700px] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-5">
            <h2
              id="ai-assistant-title"
              className="text-lg font-semibold"
            >
              AI Summary
            </h2>

            <button
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              ✕
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-5">
            {isLoading ? (
              <ModalSkeleton />
            ) : summary ? (
              <>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4">
                  <p className="whitespace-pre-wrap leading-7">
                    {displayText}
                  </p>
                </div>

                <div className="mt-5 grid gap-3">
                  <InfoRow
                    label="Status"
                    value={summary.summaryStatus}
                  />

                  <InfoRow
                    label="Generated"
                    value={
                      summary.summaryGeneratedAt
                        ? formatDisplayDate(summary.summaryGeneratedAt)
                        : "Unavailable"
                    }
                  />

                  <InfoRow
                    label="Last Updated"
                    value={
                      summary.lastArticleUpdatedAt
                        ? formatDisplayDate(summary.lastArticleUpdatedAt)
                        : "Unavailable"
                    }
                  />
                </div>
              </>
            ) : (
              <p>No summary available.</p>
            )}
          </div>

          <footer className="border-t border-slate-200 dark:border-slate-700 p-4">
            <button
              onClick={() => setOpen(false)}
              className="w-full rounded-xl bg-slate-900 py-3 font-medium text-white transition hover:bg-slate-800"
            >
              Close
            </button>
          </footer>

        </section>
      )}
    </>
  );
}

function ModalSkeleton() {
  return (
    <div className="flex h-full min-h-[280px] flex-col gap-4">
      <section className="rounded-2xl border border-slate-800 bg-slate-50 p-4">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-3 space-y-2">
          <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-11/12 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-10/12 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-9/12 animate-pulse rounded-full bg-slate-200" />
        </div>
      </section>

      <section className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-800 bg-white  dark:border-slate-700 dark:bg-slate-900 px-4 py-3">
            <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-2 h-4 w-32 animate-pulse rounded-full bg-slate-900" />
          </div>
        ))}
      </section>

      <div className="mt-auto flex flex-col gap-2 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-4 w-44 animate-pulse rounded-full bg-slate-200" />
        <div className="h-11 w-36 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-2xl border border-slate-800 bg-white  dark:bg-slate-900 dark:border-slate-700  px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-200">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">{value || "Unavailable"}</p>
    </div>
  );
}
