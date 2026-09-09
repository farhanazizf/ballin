# Ballin

Aplikasi PWA pencatatan latihan basket untuk akademi usia sekolah. Coach mencatat drill di lapangan (sering offline, satu tangan); pemain melihat kartu perkembangan dan rapor setelah disetujui coach.

**Akademi pilot:** Dynasty Basketball Academy, Karawang.

## Fitur utama

- **Absensi sesi** — check-in pemain, termasuk scan QR
- **Pencatatan drill** — satu ketukan = satu event (append-only), undo tersedia
- **Stasiun latihan** — rotasi kelompok kecil
- **Rubrik & catatan** — penilaian kualitatif dan catatan akhir sesi
- **Offline-first** — data tersimpan di HP dulu, sinkronisasi belakangan
- **Dashboard coach** — alert kehadiran, sesi aktif, ringkasan tim
- **Profil pemain & rapor** — draf rapor disetujui coach sebelum dibaca pemain
- **Kartu pemain** — tampilan perkembangan tanpa peringkat antar-anak
- **Bahasa** — Indonesia & English (toggle di header / Pengaturan → Bahasa)

## Stack

| Lapisan | Teknologi |
|---------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Backend | Supabase (Postgres, Auth, RLS, Storage) |
| Offline | Dexie (IndexedDB), Serwist (service worker) |
| Validasi | Zod |
| Grafik & PDF | Recharts, @react-pdf/renderer |
| Animasi | Framer Motion |
| Tes | Vitest, Playwright |

## Prasyarat

- Node.js 20+
- [pnpm](https://pnpm.io/) 10+
- Proyek Supabase (local atau cloud)
- Supabase CLI (`pnpm exec supabase`)

## Setup lokal

```bash
# Clone & install
pnpm install

# Salin env
cp .env.example .env.local
# Isi NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# Migrasi & seed dev
pnpm db:push          # atau supabase db push --linked
pnpm seed:dev         # auth users + data domain dari supabase/seed.dev.sql
```

Jalankan dev server:

```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Akun development

Hanya untuk lingkungan dev setelah `pnpm seed:dev`. Detail lengkap di `src/lib/constants/dev-seed.ts`.

| Peran | Login | Kredensial |
|-------|-------|------------|
| Admin | `/login` | `admin@dynasty.test` / `Admin123!` |
| Coach | `/login` | `coach@dynasty.test` / `Coach123!` |
| Pemain | `/player-login` | username `rizky` / PIN `123456` |

**Sesi latihan aktif (dev):** `40000000-0000-0000-0000-000000000002` — Boys, GOR Dynasty.

## Skrip

| Perintah | Keterangan |
|----------|------------|
| `pnpm dev` | Dev server (:3000) |
| `pnpm build` | Build produksi |
| `pnpm start` | Server produksi |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit test (Vitest) |
| `pnpm test:e2e` | E2E (Playwright) |
| `pnpm seed:dev` | Seed auth + data dev |
| `pnpm db:push` | Push migrasi ke Supabase |

### Poster marketing

Pipeline untuk screenshot dan export poster Instagram:

```bash
pnpm build && pnpm start -p 3001
pnpm seed:dev
MARKETING_BASE_URL=http://127.0.0.1:3001 pnpm tsx scripts/capture-marketing-screenshots.ts
pnpm tsx scripts/generate-feature-posters.ts
pnpm tsx scripts/export-posters.ts
```

Output PNG ada di `docs/marketing/posters/export/`. Gunakan server produksi `:3001` — dev server `:3000` bisa gagal pada layar drill karena HMR Playwright.

## Struktur proyek

```
src/
├── app/
│   ├── (app)/          # Shell coach: dashboard, pemain, sesi, laporan, pengaturan
│   ├── (auth)/         # Login coach & pemain
│   ├── (field)/        # Alur lapangan: absensi, drill, stasiun, rubrik, review
│   ├── (player)/       # Kartu pemain
│   └── api/            # Route handlers
├── components/         # UI, field, motion, i18n
└── lib/
    ├── i18n/           # Locale ID/EN, messages, provider
    ├── sync/           # Mesin sinkronisasi offline
    ├── validators/     # Skema Zod
    └── queries/        # Akses data server

supabase/
├── migrations/         # Skema Postgres + RLS
└── seed.dev.sql        # Data domain dev

tests/                  # Unit & E2E
docs/                   # PRD, marketing, spesifikasi
```

## Aturan arsitektur

1. Semua tabel domain punya `organization_id`.
2. Drill adalah baris data, bukan enum.
3. Pencatatan drill append-only (`drill_events` + `client_event_id` untuk idempotensi).
4. Offline-first — UI tidak menunggu jaringan.
5. Otorisasi lewat RLS Postgres, bukan cek di UI saja.

## Aturan produk

1. Pemain tidak melihat overall, peringkat, persentil, atau data pemain lain.
2. Status offline netral: "Tersimpan di HP".
3. Undo selalu tersedia di layar input drill.
4. Nilai 0 ≠ DNP (did not participate).
5. Rapor draf tidak bisa dibaca pemain sampai coach menyetujui.

## Dokumentasi

- [PRD](docs/05-PRD.md) — requirement produk MVP
- [Dev seed](src/lib/constants/dev-seed.ts) — akun & entitas uji

## Lisensi

Proyek privat — Dynasty Basketball Academy / Ballin.
