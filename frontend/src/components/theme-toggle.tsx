"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() =>
        setTheme(theme === "dark" ? "light" : "dark")
      }
className="
flex
h-11
w-11
items-center
justify-center
rounded-full
border
border-slate-200
bg-white
text-slate-900
shadow-sm
transition-all
duration-200

hover:bg-slate-100
hover:border-slate-300
hover:scale-105

dark:border-slate-700
dark:bg-slate-900
dark:text-slate-100

dark:hover:bg-slate-800
dark:hover:border-slate-600
"    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700" />
      )}

      
    </button>
  );
}
