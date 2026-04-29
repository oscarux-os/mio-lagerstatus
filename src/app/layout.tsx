import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-source-sans",
});

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
    <html lang="sv" className={`h-full antialiased ${sourceSans.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
