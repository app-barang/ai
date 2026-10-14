// Utility functions - barangviral.store
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Gabung class Tailwind dengan selamat */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format harga dalam Ringgit Malaysia */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ms-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(price);
}

/** Format nombor (1.2k, 3.4j) */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(".0", "") + "j";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(".0", "") + "k";
  return num.toString();
}

/** Format peratusan komisen */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

/** Jana short code unik untuk link afiliasi */
export function generateShortCode(length = 8): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/** Dapatkan warna badge mengikut skor radar */
export function getRadarColor(score: number): string {
  if (score >= 80) return "#FF007A";
  if (score >= 60) return "#FF6B00";
  if (score >= 40) return "#FFB300";
  return "#888888";
}

/** Dapatkan label trend mengikut skor radar */
export function getRadarLabel(score: number): string {
  if (score >= 80) return "Sangat Viral";
  if (score >= 60) return "Sedang Trend";
  if (score >= 40) return "Mula Naik";
  return "Perlahan";
}

/** Potong teks */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

/** Format tarikh pendek (BM) */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("ms-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
