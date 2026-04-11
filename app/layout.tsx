import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "700"],
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Worthit — Al mı alma mı?",
  description: "Ürün adını yaz, yapay zeka ile saniyeler içinde al/alma kararını al.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${dmSans.variable} ${serif.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
