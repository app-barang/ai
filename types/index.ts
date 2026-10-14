// Types shared - barangviral.store

export type Role = "BUYER" | "AFFILIATE" | "ADMIN";
export type AffStatus = "PENDING" | "ACTIVE" | "SUSPENDED";
export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";
export type WithdrawStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  phone?: string | null;
  role: Role;
  createdAt: string;
  affiliate?: Affiliate | null;
}

export interface Affiliate {
  id: string;
  userId: string;
  username: string;
  tiktok?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  followers?: number | null;
  bankName?: string | null;
  bankAccount?: string | null;
  commissionRate: number;
  totalEarnings: number;
  balance: number;
  status: AffStatus;
  createdAt: string;
  user?: User;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  category: string;
  rating: number;
  sold: number;
  stock: number;
  isViral: boolean;
  radarScore: number;
  marketplace: string;
  externalUrl?: string | null;
  createdAt: string;
}

export interface AffLink {
  id: string;
  affiliateId: string;
  productId: string;
  shortCode: string;
  clicks: number;
  conversions: number;
  earnings: number;
  createdAt: string;
  product?: Product;
  affiliate?: Affiliate;
}

export interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  total: number;
  status: OrderStatus;
  affLinkId?: string | null;
  createdAt: string;
  product?: Product;
}

export interface Withdrawal {
  id: string;
  affiliateId: string;
  amount: number;
  method: string;
  status: WithdrawStatus;
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TrendItem {
  id: string;
  keyword: string;
  platform: string;
  score: number;
  growth: number;
  mentions: number;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface AffiliateStats {
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  balance: number;
  conversionRate: number;
  commissionRate: number;
}
