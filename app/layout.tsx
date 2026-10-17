import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import ChatbotWidget from "@/components/ai/ChatbotWidget";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";

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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon-16.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "BarangViral",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF6B00",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
        <Analytics />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
