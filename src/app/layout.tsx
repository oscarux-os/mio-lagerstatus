import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mio Lagerstatus",
  description: "Next.js-prototyp för lagerstatuslogik i butik och online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
