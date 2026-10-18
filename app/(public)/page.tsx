import Link from "next/link";
import {
  Store,
  Users,
  Sparkles,
  MousePointerClick,
  HandCoins,
  ShoppingBag,
  Trophy,
  Check,
  ArrowRight,
  Flame,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const merchantBenefits = [
  {
    icon: Wallet,
    title: "90–100% Profit Jualan",
    desc: "Tanpa afiliator, 100% hasil jualan milik merchant. Jika jualan melalui afiliator, platform fee 10% — merchant tetap dapat 90%.",
  },
  {
    icon: Users,
    title: "Akses 1,000+ Afiliator",
    desc: "Ribuan afiliator sedia promote produk anda tanpa bayaran iklan. Marketing percuma, jangkauan lebih luas.",
  },
  {
    icon: Sparkles,
    title: "AI Tools Terbina",
    desc: "Jana caption viral, analisis trend dan insight jualan dengan AI — terus dari dashboard merchant.",
  },
];

const affiliateIncomes = [
  {
    icon: MousePointerClick,
    title: "Bonus Klik",
    desc: "Setiap klik sah pada link anda dibayar dari Floating Fund. 60% untuk anda, 25% upline, 15% upline L2.",
    tag: "Sehingga RM500/bulan",
  },
  {
    icon: HandCoins,
    title: "Bonus Sewa Merchant",
    desc: "Bawa merchant berlanggan dan terima bonus berulang selagi mereka aktif. 60/30/10 ikut level.",
    tag: "Sehingga RM2,000/bulan",
  },
  {
    icon: ShoppingBag,
    title: "Komisen Jualan",
    desc: "Jualan melalui link anda memberi komisen 30% daripada Platform Fee (10% harga jualan). Jualan RM100 = RM3 komisen.",
    tag: "30% platform fee",
  },
  {
    icon: Trophy,
    title: "Team Bonus",
    desc: "Bina team 5–30 ahli dan terima bonus coach RM100–RM2,000 sebulan — dibayar oleh platform, bukan team.",
    tag: "RM100–2,000/bulan",
  },
];

const tiers = [
  {
    name: "STARTER",
    price: 30,
    products: "5 produk",
    features: ["5 produk aktif", "Akses afiliator", "Dashboard asas", "AI caption"],
    popular: false,
  },
  {
    name: "PRO",
    price: 99,
    products: "20 produk",
    features: [
      "20 produk aktif",
      "Featured listing",
      "Analytics lanjutan",
      "AI caption + insight",
      "Sokongan keutamaan",
    ],
    popular: true,
  },
  {
    name: "BUSINESS",
    price: 199,
    products: "Unlimited",
    features: [
      "Produk tanpa had",
      "Featured listing",
      "Analytics + laporan",
      "AI penuh",
      "Sokongan dedicated",
    ],
    popular: false,
  },
];

const steps = [
  {
    n: "01",
    title: "Merchant daftar & langgan",
    desc: "Pilih tier, bayar yuran bulanan, dan mula muat naik produk. Tanpa afiliator, 100% hasil jualan milik anda.",
  },
  {
    n: "02",
    title: "Afiliator promote",
    desc: "Afiliator jana link, kongsi di TikTok/IG, dan bawa trafik berkualiti ke produk merchant.",
  },
  {
    n: "03",
    title: "Semua dapat income",
    desc: "Merchant untung penuh, afiliator dapat 4 income stream, platform terus berkembang.",
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* ================= HERO ================= */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-viral-pink/20 blur-3xl" />

        <div className="container-custom relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
              <Flame className="h-3.5 w-3.5" />
              Platform e-Dagang + Afiliasi #1 Malaysia
            </span>

            <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Merchant <span className="text-gradient">RM1 Sehari.</span>
              <br />
              Afiliator <span className="text-gradient">4 Income Streams.</span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-textsec md:text-lg">
              Platform e-dagang + afiliasi #1 Malaysia.{" "}
              <strong className="text-secondary">90–100% profit untuk merchant</strong>,{" "}
              <strong className="text-secondary">komisen tertinggi untuk afiliator</strong>.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/daftar-merchant" className="btn-primary">
                <Store className="h-4 w-4" /> Daftar Merchant
              </Link>
              <Link href="/daftar-afiliator" className="btn-outline">
                <Users className="h-4 w-4" /> Daftar Afiliator
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-textsec">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-success" /> 0% fee tanpa afiliator
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-success" /> 3 level sah
              </span>
              <span className="flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-primary" /> Bayaran telus
              </span>
            </div>
          </div>

          {/* Visual */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="card-soft relative overflow-hidden !p-6">
              <div className="rounded-2xl bg-secondary p-6 text-white">
                <p className="text-xs uppercase tracking-wider text-gray-400">
                  Contoh pendapatan afiliator
                </p>
                <p className="mt-2 font-heading text-4xl font-extrabold text-gradient">
                  RM 2,840
                </p>
                <p className="text-xs text-gray-400">bulan lepas • 4 income stream</p>

                <div className="mt-5 space-y-3">
                  {[
                    { label: "Bonus Klik", value: "RM 420", pct: 62 },
                    { label: "Bonus Sewa", value: "RM 1,200", pct: 88 },
                    { label: "Komisen Jualan", value: "RM 960", pct: 74 },
                    { label: "Team Bonus", value: "RM 260", pct: 38 },
                  ].map((r) => (
                    <div key={r.label}>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300">{r.label}</span>
                        <span className="font-semibold text-white">{r.value}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-brand"
                          style={{ width: `${r.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-soft-lg">
              <p className="text-xs text-textsec">Yuran merchant</p>
              <p className="font-heading text-lg font-extrabold text-primary">
                RM1/hari
              </p>
            </div>
            <div className="absolute -right-3 top-6 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-soft-lg">
              <p className="text-xs text-textsec">Profit merchant</p>
              <p className="font-heading text-lg font-extrabold text-success">90–100%</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= KENAPA MERCHANT ================= */}
      <section className="container-custom py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            Untuk Merchant
          </span>
          <h2 className="mt-4 font-heading text-3xl font-extrabold md:text-4xl">
            Jual dengan <span className="text-gradient">potongan telus</span>
          </h2>
          <p className="mt-3 text-textsec">
            Tanpa afiliator, anda pegang 100% hasil jualan. Jualan melalui afiliator
            dikenakan platform fee 10% — anda tetap dapat 90%.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {merchantBenefits.map((b) => (
            <div key={b.title} className="card-soft">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <b.icon className="h-6 w-6" />
              </span>
              <h3 className="font-heading text-lg font-bold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-textsec">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= KENAPA AFILIATOR ================= */}
      <section className="bg-bgalt py-16 md:py-24">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-viral-pink/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-viral-pink">
              Untuk Afiliator
            </span>
            <h2 className="mt-4 font-heading text-3xl font-extrabold md:text-4xl">
              4 <span className="text-gradient">Income Streams</span>
            </h2>
            <p className="mt-3 text-textsec">
              Percuma selamanya. Tiada modal, tiada stok — hanya kongsi dan janji duit.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {affiliateIncomes.map((inc) => (
              <div key={inc.title} className="card-soft">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-viral-pink/10 text-viral-pink">
                    <inc.icon className="h-6 w-6" />
                  </span>
                  <span className="rounded-full bg-success/10 px-3 py-1 text-[11px] font-bold text-success">
                    {inc.tag}
                  </span>
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold">{inc.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-textsec">{inc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section className="container-custom py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            Harga Merchant
          </span>
          <h2 className="mt-4 font-heading text-3xl font-extrabold md:text-4xl">
            Pilih tier <span className="text-gradient">anda</span>
          </h2>
          <p className="mt-3 text-textsec">
            Semua tier dapat 90–100% hasil jualan + akses rangkaian afiliator.
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={
                t.popular
                  ? "relative rounded-2xl bg-gradient-brand p-[2px] shadow-glow-lg"
                  : "rounded-2xl border border-gray-100 bg-white shadow-soft"
              }
            >
              <div
                className={
                  t.popular
                    ? "flex h-full flex-col rounded-2xl bg-white p-6"
                    : "flex h-full flex-col p-6"
                }
              >
                {t.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-4 py-1 text-[11px] font-bold text-white shadow-glow">
                    PALING POPULAR
                  </span>
                )}
                <p className="font-heading text-sm font-bold uppercase tracking-wider text-primary">
                  {t.name}
                </p>
                <p className="mt-3 font-heading text-4xl font-extrabold">
                  RM{t.price}
                  <span className="text-sm font-medium text-textsec">/bulan</span>
                </p>
                <p className="mt-1 text-xs font-semibold text-textsec">{t.products}</p>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/daftar-merchant?tier=${t.name}`}
                  className={t.popular ? "btn-primary mt-6 w-full" : "btn-outline mt-6 w-full"}
                >
                  Pilih {t.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= CARA BERFUNGSI ================= */}
      <section className="bg-secondary py-16 text-white md:py-24">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-light">
              Cara Berfungsi
            </span>
            <h2 className="mt-4 font-heading text-3xl font-extrabold md:text-4xl">
              Tiga langkah, <span className="text-gradient">satu ekosistem</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <span className="font-heading text-4xl font-extrabold text-gradient">
                  {s.n}
                </span>
                <h3 className="mt-3 font-heading text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA AKHIR ================= */}
      <section className="container-custom py-16 md:py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-8 text-center md:p-14">
          <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="relative">
            <h2 className="font-heading text-3xl font-extrabold text-white md:text-5xl">
              Sedia mula? <br className="sm:hidden" />
              Pilih peranan anda.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 md:text-base">
              Sama ada anda mahu jual produk atau jana komisen — ekosistem ini dibina
              untuk kedua-duanya menang.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/daftar-merchant"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-heading font-bold text-primary shadow-lg transition-transform hover:scale-105"
              >
                <Store className="h-4 w-4" /> Mula Sebagai Merchant
              </Link>
              <Link
                href="/daftar-afiliator"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/50 px-6 py-3 font-heading font-bold text-white transition-colors hover:bg-white/10"
              >
                <Users className="h-4 w-4" /> Mula Sebagai Afiliator
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
