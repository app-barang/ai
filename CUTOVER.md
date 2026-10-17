# ✅ Checklist Cutover — barangviral.store v2

> Jangan laksana sehingga **semua** kod v2 siap + diuji di branch `v2-rebuild`.
> Cutover = deploy kod v2 + tukar env Vercel serentak.

## Status Semasa

| Item | Status | Nota |
|---|---|---|
| Supabase v2 region | ✅ Sydney (`ap-southeast-2`) | `plpmzykvqhvmnhmonnfz` |
| Vercel region | ✅ `syd1` (dalam `vercel.json`) | Belum di-deploy |
| Branch v2 | 🔒 `v2-rebuild` (lokal) | Belum push |
| Produksi (lama) | ✅ Berjalan | Skema lama + DB lama |
| DB v2 | ✅ 16 jadual + seed | Berasingan dari produksi |

## Sebelum Cutover (WAJIB)

- [ ] Semua API v2 siap + diuji HTTP
- [ ] Semua UI v2 siap (landing, merchant, afiliator, admin)
- [ ] `npm run build` lulus **0 error** pada branch `v2-rebuild`
- [ ] Ujian E2E: register merchant → langganan → produk → klik → bonus → payout
- [ ] Backup data produksi lama (pg_dump) — walaupun hanya data demo
- [ ] Push branch `v2-rebuild` ke GitHub (hasil Vercel **Preview**, bukan Production)

## Env Vercel (Settings → Environment Variables → Production)

- [ ] `DATABASE_URL` → **pooler v2** (`aws-0-ap-southeast-2.pooler.supabase.com:6543?pgbouncer=true`)
- [ ] `DIRECT_URL` → **session pooler v2** (`...pooler.supabase.com:5432`)
- [ ] `NEXTAUTH_URL` → `https://barangviral.store` ⚠️ (belum diset — wajib ada)
- [ ] `NEXTAUTH_SECRET` → kekal
- [ ] `GROQ_API_KEY`, `GROQ_MODEL`, `GROQ_BASE_URL` → kekal
- [ ] `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` → kekal (+ redirect URI sudah didaftar)
- [ ] `CRON_SECRET` → kekal
- [ ] `NEXT_PUBLIC_APP_URL` → `https://barangviral.store`

## Semasa Cutover

- [ ] Deploy produksi dari branch yang disahkan (atau merge ke `main` → auto-deploy)
- [ ] Sahkan `https://barangviral.store/api/auth/providers` → signinUrl domain produksi
- [ ] Sahkan login (credentials + Google)
- [ ] Sahkan `POST /api/track/click` di produksi (reward + pool)
- [ ] Sahkan halaman utama, produk, radar, dashboard

## Selepas Cutover

- [ ] Pantau Vercel logs 24 jam (ralat Prisma/auth)
- [ ] Sahkan cron harian `/api/cron/radar` berjalan
- [ ] Revoke token Supabase yang pernah terdedah dalam chat
- [ ] Tukar password demo (admin/merchant/afiliator)

## Status Fasa Akhir (17 Okt 2026)

- ✅ `npm run build` **PASS** (BUILD_ID dijana, 29 route, middleware 50.5 kB)
- ✅ E2E setempat (`next start`): public 10/10 200; login affiliate/merchant/admin 200; protected tanpa auth 307
- ✅ Preview deploy Vercel **Ready**: `barangviral-store-nze6sk1g5-app-barang-1935.vercel.app`
- ✅ Env Vercel **Preview** → DB v2 (DATABASE_URL/DIRECT_URL)
- ⏳ Belum: tukar env Vercel **Production** ke DB v2 + `vercel deploy --prod` (cutover sebenar)

## Rollback

Jika gagal: kembalikan env Vercel ke DB lama + deploy semula commit `d9f2da4` (main lama).
