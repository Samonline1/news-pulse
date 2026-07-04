import type { Metadata } from "next";
import "./globals.css";
import { NewsDataProvider } from "@/components/NewsDataProvider";

export const metadata: Metadata = {
  title: "News Pulse",
  description: "News Pulse dashboard",
};

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
