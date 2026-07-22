import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Provider } from "@/components/theme-provider";
import { QueryProvider } from "providers/QueryProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Metadata
export const metadata: Metadata = {
  title: "News Pulse",
  icons: {
    icon: "/favicon.svg",
  },
  description: "News Pulse dashboard",
};

// Shell
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-300/30 antialiased text-slate-900 dark:text-slate-100">
        <Provider>
          <QueryProvider>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryProvider>
        </Provider>
      </body>
    </html>
  );
}
