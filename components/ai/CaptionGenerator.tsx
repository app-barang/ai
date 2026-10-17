"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronUp,
  Zap,
  MessageSquare,
  Film,
  Hash,
  ClipboardList,
  X,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tones = [
  { value: "Kelakar", label: "Kelakar", icon: MessageSquare, desc: "Gaya lawak, santai" },
  { value: "Informatif", label: "Informatif", icon: ClipboardList, desc: "Fokus faedah & spesifikasi" },
  { value: "Hard Selling", label: "Hard Selling", icon: Zap, desc: "Urgensi, FOMO, call-to-action keras" },
] as const;

const platforms = [
  { value: "TikTok", label: "TikTok", icon: Film, color: "text-pink-500" },
  { value: "Instagram", label: "Instagram", icon: Sparkles, color: "text-purple-500" },
  { value: "Facebook", label: "Facebook", icon: MessageSquare, color: "text-blue-500" },
] as const;

type Tone = (typeof tones)[number]["value"];
type Platform = (typeof platforms)[number]["value"];

interface Product {
  id: string;
  name: string;
  price: number;
  slug: string;
  viralScore?: number;
  radarScore?: number;
}

interface CaptionResult {
  hook: string;
  caption: string;
  hashtags: string[];
  tiktokScript: { timestamp: string; action: string }[];
  estimatedEngagement: "High" | "Medium" | "Low";
  fallback: boolean;
}

interface HistoryItem {
  id: string;
  productName: string;
  tone: Tone;
  platform: Platform;
  result: CaptionResult;
  createdAt: string;
}

export default function CaptionGenerator() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tone, setTone] = useState<Tone>("Informatif");
  const [platform, setPlatform] = useState<Platform>("TikTok");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CaptionResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showProducts, setShowProducts] = useState(false);

  // Load products on mount
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {
        // Mock fallback
        setProducts([
          { id: "p1", name: "LED Face Mask Therapy 7 Warna", price: 49.9, slug: "led-face-mask-therapy", radarScore: 94 },
          { id: "p2", name: "Mini Portable Printer Tanpa Ink", price: 39.9, slug: "mini-printer-tanpa-ink", radarScore: 88 },
          { id: "p3", name: "Gelas Ajaib Magic", price: 19.9, slug: "gelas-ajaib-magic", radarScore: 91 },
          { id: "p4", name: "Serum Vitamin C Brightening", price: 25.9, slug: "serum-vitamin-c-brightening", radarScore: 96 },
          { id: "p5", name: "Mop 360 Putar Tanpa Tangan", price: 29.9, slug: "mop-360-putar", radarScore: 85 },
          { id: "p6", name: "Powerbank 20000mAh Fast Charge", price: 49.9, slug: "powerbank-20000mah", radarScore: 89 },
        ]);
      });
  }, []);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("caption_history");
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((item: HistoryItem) => {
    setHistory((prev) => {
      const next = [item, ...prev.filter((h) => h.id !== item.id)].slice(0, 5);
      try {
        localStorage.setItem("caption_history", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("caption_history");
  };

  const generate = async () => {
    if (!selectedProduct || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ai/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: selectedProduct.name,
          price: selectedProduct.price,
          tone,
          platform,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal jana caption");
        return;
      }
      setResult(data);
      // Save to history
      saveHistory({
        id: Date.now().toString(),
        productName: selectedProduct.name,
        tone,
        platform,
        result: data,
        createdAt: new Date().toISOString(),
      });
    } catch {
      setError("Sambungan bermasalah. Semak internet dan cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const formatPrice = (p: number) => `RM${p.toFixed(2)}`;

  const engagementColor = {
    High: "bg-success text-white",
    Medium: "bg-amber-500 text-white",
    Low: "bg-gray-400 text-white",
  };

  const engagementIcon = {
    High: <Zap className="h-3.5 w-3.5" />,
    Medium: <Sparkles className="h-3.5 w-3.5" />,
    Low: <MessageSquare className="h-3.5 w-3.5" />,
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft md:p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
            <Wand2 className="h-5 w-5 text-white" />
          </span>
          <div>
            <h3 className="font-heading text-xl font-bold">AI Caption Generator</h3>
            <p className="text-sm text-textsec">Jana caption viral dalam 5 detik — pilih produk, tone & platform</p>
          </div>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all",
            showHistory
              ? "bg-gradient-brand text-white shadow-glow"
              : "border border-gray-200 text-gray-600 hover:border-primary"
          )}
        >
          {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showHistory ? "Tutup" : "Riwayat"}
        </button>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-gray-100 bg-bgalt p-5 mb-6">
        {/* Produk Dropdown */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold">Pilih Produk <span className="text-primary">*</span></label>
          <div className="relative">
            <Wand2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textsec" />
            <button
              onClick={() => setShowProducts(!showProducts)}
              className={cn(
                "w-full h-12 rounded-xl border border-gray-200 bg-white px-11 pr-10 text-left text-sm outline-none transition-colors placeholder:text-textsec focus:border-primary",
                !selectedProduct && "text-textsec"
              )}
            >
              {selectedProduct
                ? `${selectedProduct.name} • ${formatPrice(selectedProduct.price)}`
                : "Pilih produk viral..."}
            </button>
            <span
              className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 transition-transform",
                showProducts && "rotate-180"
              )}
            >
              <ChevronDown className="h-4 w-4 text-textsec" />
            </span>
            <AnimatePresence>
              {showProducts && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border border-gray-200 bg-white shadow-soft-lg max-h-60 overflow-auto"
                >
                  {products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProduct(p);
                        setShowProducts(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-bgalt first:rounded-t-xl last:rounded-b-xl transition-colors"
                    >
                      <div className="font-semibold">{p.name}</div>
                      <div className="flex items-center gap-2 text-xs text-textsec">
                        <span>{formatPrice(p.price)}</span>
                        <span className="flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5">
                          <Zap className="h-3 w-3 text-primary" /> {p.viralScore ?? p.radarScore ?? 0}
                        </span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tone Selection */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold">Tone <span className="text-primary">*</span></label>
          <div className="grid grid-cols-3 gap-2">
            {tones.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={cn(
                  "relative rounded-xl border p-3 text-center transition-all",
                  tone === t.value
                    ? "border-transparent bg-gradient-brand text-white shadow-glow"
                    : "border-gray-200 text-gray-600 hover:border-primary"
                )}
              >
                <t.icon className="mx-auto h-5 w-5 mb-1" />
                <div className="font-semibold">{t.label}</div>
                <div className="text-[10px] opacity-75">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Platform Selection */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold">Platform <span className="text-primary">*</span></label>
          <div className="grid grid-cols-3 gap-2">
            {platforms.map((p) => (
              <button
                key={p.value}
                onClick={() => setPlatform(p.value)}
                className={cn(
                  "relative rounded-xl border p-3 text-center transition-all",
                  platform === p.value
                    ? "border-transparent bg-gradient-brand text-white shadow-glow"
                    : "border-gray-200 text-gray-600 hover:border-primary"
                )}
              >
                <p.icon className="mx-auto h-5 w-5 mb-1" style={{ color: p.color }} />
                <div className="font-semibold">{p.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={generate}
          disabled={!selectedProduct || loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> AI sedang menaip...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" /> Jana Caption dengan AI
            </>
          )}
        </button>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}
      </div>

      {/* Result Card */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft"
          >
            {/* Engagement Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold", engagementColor[result.estimatedEngagement])}>
                {engagementIcon[result.estimatedEngagement]}
                Engagement: {result.estimatedEngagement}
              </span>
              {result.fallback && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <Sparkles className="h-3 w-3" /> Mode Demo (Tiada OpenAI Key)
                </span>
              )}
            </div>

            {/* Hook */}
            <div className="mb-4 p-4 rounded-xl bg-yellow-50 border border-yellow-100">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-600" />
                <span className="font-heading font-semibold text-amber-800">Hook (3 detik pertama)</span>
              </div>
              <p className="font-semibold text-gray-800 leading-snug">{result.hook}</p>
              <button
                onClick={() => copy(result.hook, "hook")}
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                {copied === "hook" ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === "hook" ? "Disalin" : "Salin Hook"}
              </button>
            </div>

            {/* Caption */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-semibold">Caption</span>
                <button
                  onClick={() => copy(result.caption, "caption")}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  {copied === "caption" ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === "caption" ? "Disalin" : "Salin"}
                </button>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result.caption}</p>
            </div>

            {/* Hashtags */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Hash className="h-4 w-4 text-primary" />
                  <span className="font-heading font-semibold">Hashtags</span>
                </div>
                <button
                  onClick={() => copy(result.hashtags.join(" "), "hashtags")}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  {copied === "hashtags" ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === "hashtags" ? "Disalin Semua" : "Salin Semua"}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {tag}
                    <button
                      onClick={() => copy(tag, `tag-${tag}`)}
                      className="ml-1 opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* TikTok Script */}
            <div className="rounded-xl bg-gray-950 border border-gray-800 p-4 font-mono text-sm text-green-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-primary" />
                  <span className="font-heading font-semibold text-white">TikTok Script (30s)</span>
                </div>
                <button
                  onClick={() => copy(
                    result.tiktokScript.map((s) => `[${s.timestamp}] ${s.action}`).join("\n"),
                    "script"
                  )}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  {copied === "script" ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === "script" ? "Disalin" : "Salin Script"}
                </button>
              </div>
              <div className="space-y-1">
                {result.tiktokScript.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-amber-400 w-16 shrink-0">{s.timestamp}</span>
                    <span className="text-gray-200">{s.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Card */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 rounded-2xl border border-gray-100 bg-white p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-heading text-lg font-bold">Riwayat Caption (5 Terakhir)</span>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1.5 rounded-lg text-red-600 hover:text-red-700 text-sm font-semibold"
                >
                  <Trash2 className="h-4 w-4" /> Kosongkan
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-center py-8 text-textsec">Belum ada riwayat. Jana caption pertama anda!</p>
            ) : (
              <div className="space-y-3">
                {history.map((h) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl border border-gray-100 p-3 hover:bg-bgalt transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{h.productName}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-textsec">
                          <span className="flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5">
                            <Zap className="h-2.5 w-2.5 text-primary" /> {h.tone}
                          </span>
                          <span className="flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5">
                            <Film className="h-2.5 w-2.5" style={{ color: platforms.find(p => p.value === h.platform)?.color }} /> {h.platform}
                          </span>
                          <span className="flex items-center gap-1 rounded bg-yellow-100 px-2 py-0.5 text-amber-700">
                            <Sparkles className="h-2.5 w-2.5" /> {h.result.estimatedEngagement}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copy(h.result.hook, `hist-hook-${h.id}`)}
                          className="rounded-lg p-1.5 text-textsec hover:text-primary hover:bg-gray-100"
                          title="Salin Hook"
                        >
                          <Zap className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => copy(h.result.caption, `hist-cap-${h.id}`)}
                          className="rounded-lg p-1.5 text-textsec hover:text-primary hover:bg-gray-100"
                          title="Salin Caption"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}