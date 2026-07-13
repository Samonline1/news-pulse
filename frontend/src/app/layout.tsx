import type { Metadata } from "next";
import "./globals.css";
import { NewsDataProvider } from "@/components/NewsDataProvider";
import type { Metadata, Viewport } from "next";


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
    <html lang="en">
      <body>
        <NewsDataProvider>{children}</NewsDataProvider>
      </body>
    </html>
  );
}
