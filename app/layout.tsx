import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Scorecard — Ürün skoru",
  description: "Amazon verisi ve yapay zeka ile ürün kararı özeti.",
  openGraph: {
    title: "Scorecard",
    description: "Ürün araştırması ve skor kartı",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f6fb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={dmSans.variable}>
      <body className={`min-h-screen font-sans antialiased ${dmSans.className}`}>{children}</body>
    </html>
  );
}
