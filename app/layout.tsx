import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import ChatbotWidget from "@/components/ai/ChatbotWidget";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BarangViral.store - Viral? Kami Semak Dulu.",
  description:
    "Platform kurasi produk viral TikTok, Shopee, Lazada & Instagram dengan komisen afiliasi sehingga 50%. Semak trend dengan Radar AI.",
  keywords: [
    "produk viral",
    "afiliasi malaysia",
    "tiktok shop",
    "shopee",
    "lazada",
    "komisen afiliasi",
  ],
  openGraph: {
    title: "BarangViral.store - Viral? Kami Semak Dulu.",
    description: "Platform kurasi produk viral & afiliasi AI komisen sehingga 50%.",
    url: "https://barangviral.store",
    siteName: "BarangViral.store",
    locale: "ms_MY",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" className={`${poppins.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Footer />
        <MobileNav />
        <ChatbotWidget />
      </body>
    </html>
  );
}
