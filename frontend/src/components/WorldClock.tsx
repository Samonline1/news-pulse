"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function LocalTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Intl.DateTimeFormat(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date())
      );
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-2xl  px-4 py-3 ">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Local Time
        </p>

        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {time}
        </p>
      </div>
    </div>
  );
}
