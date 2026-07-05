import type { Metadata } from "next";
import "./globals.css";
import { NewsDataProvider } from "@/components/NewsDataProvider";

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
    <html lang="en">
      <body>
        <NewsDataProvider>{children}</NewsDataProvider>
      </body>
    </html>
  );
}
