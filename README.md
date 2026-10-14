# BarangViral.store 🔥

> **"Viral? Kami Semak Dulu."**

Platform e-commerce + afiliasi AI moden untuk pasaran Malaysia. Kurasi produk viral dari TikTok, Shopee, Lazada & Instagram dengan komisen afiliasi **sehingga 50%**, chatbot AI, dan Radar AI real-time.

## ✨ Ciri Utama

- 🔐 **Auth Lengkap** — NextAuth (Google + email/password), middleware lindungi route afiliator & admin
- 🔥 **Kurasi Produk Viral** — disemak manual + AI
- 📡 **Radar AI** — imbasan trend 4 platform setiap jam
- 💰 **Afiliasi 30–50%** — jana link `/r/[code]`, track klik/konversi real-time
- 💳 **Wallet** — tarik komisen (min RM50) ke bank/e-wallet
- 🤖 **Chatbot Aiden** — bantu pembeli & afiliator 24/7
- 🎨 **Reka bentuk moden** — gradient oren→merah jambu, animasi Framer Motion

## 🗺️ Peta Route

| Route | Fungsi |
|---|---|
| `/` | Homepage |
| `/produk/[slug]` | Detail produk |
| `/radar` | Radar AI trend |
| `/afiliator` | Landing afiliasi |
| `/masuk` `/daftar` | Auth |
| `/daftar/afiliasi` | Multi-step form afiliator (4 langkah) |
| `/dashboard/*` | Dashboard afiliator (dilindungi middleware) |
| `/admin` | Panel pentadbir (role ADMIN sahaja) |
| `/r/[shortCode]` | Link afiliasi — track klik + redirect |
| `/api/chat` `/api/radar` | AI endpoints |
| `/api/affiliate/*` | register, stats, commissions, withdraw |

## 🛠️ Tech Stack

Next.js 14 (App Router) • TypeScript • Tailwind CSS • Framer Motion • Lucide React • Zustand • Prisma + PostgreSQL (Supabase) • NextAuth (Google + Credentials) • OpenAI API

## 🚀 Mulakan

```bash
# 1. Salin fail
cd barangviral-store
npm install

# 2. Sediakan env
cp .env.example .env
# Isi DATABASE_URL, NEXTAUTH_SECRET, OPENAI_API_KEY

# 3. Database
npx prisma db push
npm run db:seed

# 4. Jalankan
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📁 Struktur

```
app/
├── (public)/    # produk/[id], radar, afiliator
├── (auth)/      # masuk, daftar
├── (afiliator)/ # dashboard (ikhtisar, link, promosi, wallet, tetapan)
├── (admin)/     # panel pentadbir
└── api/         # chat, radar, affiliate/link, auth, register
components/      # layout, home, product, ai, affiliate
lib/             # prisma, auth, ai, utils, mock-data
prisma/          # schema.prisma, seed.ts
types/           # TypeScript interfaces
```

## 🔑 Akaun Demo

| Peranan | Email | Kata Laluan |
|---|---|---|
| Admin | admin@barangviral.store | admin12345 |

> 💡 **Mod demo:** Tanpa `DATABASE_URL`, laman web berfungsi dengan data contoh (`lib/mock-data.ts`). Tanpa `OPENAI_API_KEY`, chatbot & radar menggunakan respons fallback.

## 🌐 Deploy (Vercel)

```bash
vercel
# Set env variables di Vercel Dashboard
# Jalankan prisma db push di Supabase
```

## 📜 Lesen

MIT
