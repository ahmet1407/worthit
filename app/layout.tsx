import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-dm-sans" });

export const metadata: Metadata = {
  title: "Worthit — Al mı alma mı?",
  description: "Ürün adını yaz, yapay zeka ile saniyeler içinde al/alma kararını al.",
  openGraph: {
    title: "Worthit — Al mı alma mı?",
    description: "Ürün adını yaz, yapay zeka ile saniyeler içinde al/alma kararını al.",
  },
};

export const viewport: Viewport = { themeColor: "#0a0a0a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={dmSans.variable}>
      <body className={`min-h-screen font-sans antialiased ${dmSans.className}`}>{children}</body>
    </html>
  );
}
