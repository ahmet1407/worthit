import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "700"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Worthit — Al mı alma mı?",
  description: "Ürün adını yaz, yapay zeka ile saniyeler içinde al/alma kararını al.",
  openGraph: {
    title: "Worthit — Al mı alma mı?",
    description: "500 yorumu saniyeler içinde analiz et, net karar al.",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${dmSans.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
