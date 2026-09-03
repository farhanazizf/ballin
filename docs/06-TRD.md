# Ballin — Technical Requirements Document

**Versi:** 1.0
**Mendampingi:** PRD v1.0
**Status:** Siap untuk implementasi MVP

---

## 1. Ringkasan Arsitektur

```
┌─────────────────────────────────────────────┐
│  PWA (Next.js App Router, TypeScript)       │
│  ┌────────────┐  ┌──────────────────────┐   │
│  │ UI (React) │←→│ Local store (Dexie)  │   │
│  └────────────┘  │ - roster & token     │   │
│                  │ - drill events       │   │
│                  │ - outbox             │   │
│                  └──────────┬───────────┘   │
│                             │ sync engine    │
└─────────────────────────────┼───────────────┘
                              ↓
┌─────────────────────────────────────────────┐
│  Supabase                                   │
│  Postgres + RLS · Auth · Storage · Realtime │
└─────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────┐
│  Next.js Route Handlers (server)            │
│  - AI report generation (batch)             │
│  - PDF & card generation                    │
│  - Attribute recalculation (cron)           │
└─────────────────────────────────────────────┘
```

**Prinsip arsitektur:**

1. **Local-first.** Perangkat adalah sumber kebenaran selama sesi berlangsung. Server adalah tujuan sinkronisasi, bukan prasyarat untuk bekerja.
2. **Append-only untuk data lapangan.** Setiap ketukan adalah baris peristiwa, bukan penimpaan angka. Ini yang membuat beberapa coach bisa mencatat bersamaan tanpa saling menimpa.
3. **Otorisasi di database.** Aturan siapa boleh melihat apa ditegakkan oleh RLS Postgres. UI hanya cermin, bukan penjaga.
4. **Tidak ada backend terpisah di pilot.** Route handler Next.js sudah cukup. NestJS bisa ditambahkan nanti tanpa membongkar database.

---

## 2. Tech Stack

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript strict | Satu repo, server actions, hosting mudah |
| Database | Supabase Postgres | RLS menyelesaikan aturan akses di level data |
| Auth | Supabase Auth | Email untuk coach/admin; PIN untuk pemain via route handler khusus |
| Penyimpanan lokal | Dexie (IndexedDB) | API sederhana, dukungan transaksi, matang |
| Service worker | Serwist | Perawatan aktif, konfigurasi lebih waras dari next-pwa |
| Styling | Tailwind v4 | Token dari brand guideline dipetakan ke CSS variable |
| Komponen | shadcn/ui sebagai dasar | Diambil ke repo, dimodifikasi bebas — bukan dipakai apa adanya |
| Grafik | Recharts | Cukup untuk garis dan radar |
| Form | React Hook Form + Zod | Skema Zod dipakai ulang di klien dan server |
| Scanner QR | `@zxing/browser` atau `BarcodeDetector` bila tersedia | Deteksi native jauh lebih cepat di Android |
| PDF | `@react-pdf/renderer` | Tanpa headless browser — jauh lebih murah di serverless |
| Gambar untuk WA | `satori` + `resvg` | Render PNG di server, hasil konsisten |
| AI | Claude API (Sonnet) via route handler | Batch, hasil di-cache |
| Hosting | Vercel | Integrasi Next.js, free tier cukup untuk pilot |
| Testing | Vitest + Playwright | Playwright wajib untuk skenario offline |

**Estimasi biaya pilot:** Supabase Pro $25 + Vercel Hobby $0 + AI ~$10 + domain ~Rp200rb/tahun ≈ **$35/bulan**.

---

## 3. Model Data

### 3.1 Aturan yang mengikat

1. **Semua tabel domain punya `organization_id`**, walaupun pilot hanya satu akademi. Ini bukan over-engineering; menambahkannya belakangan berarti migrasi seluruh RLS.
2. **Drill adalah data, bukan enum.** Tidak ada `CHECK (name IN ('layup','freethrow'))` di mana pun.
3. **Kelompok umur configurable.** DBA memakai Toddler/Hoops/Girls/Boys, bukan U12/U14.
3b. **Satu pemain, satu sesi per hari.** Akademi punya dua slot waktu, tapi seorang anak hanya ikut satu. Kehadiran dan latihan beruntun dihitung per hari, dan aturan ini ditegakkan lewat unique index — bukan lewat pengecekan di UI.
4. **Timestamp selalu `timestamptz`.** Aplikasi berjalan di WIB, tapi jangan simpan waktu lokal tanpa zona.

### 3.2 Skema inti

```sql
-- ORGANISASI ------------------------------------------------------
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text,              -- slot --academy-primary
  timezone text not null default 'Asia/Jakarta',
  created_at timestamptz not null default now()
);

create table teams (                -- "kelas" dalam bahasa akademi
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  name text not null,               -- 'Hoops', 'Girls', 'Boys', 'Toddler'
  age_min int,
  age_max int,
  track_drill_stats boolean not null default true,  -- Toddler = false
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- PENGGUNA --------------------------------------------------------
create type user_role as enum ('admin','coach','player','parent');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  organization_id uuid not null references organizations,
  role user_role not null,
  full_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table coach_teams (
  coach_id uuid not null references profiles on delete cascade,
  team_id uuid not null references teams on delete cascade,
  primary key (coach_id, team_id)
);

-- PEMAIN ----------------------------------------------------------
create table players (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  profile_id uuid unique references profiles on delete set null,  -- null = belum punya login
  full_name text not null,
  nickname text not null,           -- yang tampil di layar lapangan
  birth_date date not null,
  jersey_number int,
  position text,
  dominant_hand text,
  school text,
  photo_path text,                  -- storage privat
  guardian_name text,
  guardian_phone text,
  consent_given_at timestamptz,
  consent_given_by text,
  status text not null default 'active',   -- active|injured|leave|left
  joined_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table team_players (
  team_id uuid not null references teams on delete cascade,
  player_id uuid not null references players on delete cascade,
  joined_at date not null default current_date,
  left_at date,
  primary key (team_id, player_id)
);

create table player_measurements (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players on delete cascade,
  measured_on date not null,
  height_cm numeric(5,1),
  weight_kg numeric(5,1),
  wingspan_cm numeric(5,1),
  standing_reach_cm numeric(5,1),
  unique (player_id, measured_on)
);

-- KARTU QR --------------------------------------------------------
create table player_cards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  player_id uuid not null references players on delete cascade,
  token uuid not null unique default gen_random_uuid(),   -- acak, bukan sekuensial
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  printed_at timestamptz
);
create index on player_cards (organization_id) where revoked_at is null;
```

**Catatan kartu QR:** isi QR adalah `BLN1:<token>`. Prefix memungkinkan scanner menolak QR asing (QRIS, tiket, barcode produk) tanpa menyentuh database. Token adalah UUID v4 acak, bukan ID pemain — ID sekuensial bisa ditebak dan dipalsukan.

```sql
-- DRILL -----------------------------------------------------------
create type drill_type as enum ('attempt','timed','count_in_time','measure','rating');

create table drills (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  name text not null,
  category text not null,           -- Shooting|Finishing|Ballhandling|Defense|Athleticism|Conditioning
  type drill_type not null,
  default_target int,               -- penyebut default untuk tipe attempt
  unit text,                        -- 'detik','cm','repetisi'
  lower_is_better boolean not null default false,
  attribute_weights jsonb not null default '{}',  -- {"shooting":0.7,"attitude":0.3}
  instructions text,
  video_url text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- SESI ------------------------------------------------------------
create type session_status as enum ('scheduled','active','completed','cancelled');

create table sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  team_id uuid not null references teams,
  scheduled_start timestamptz not null,   -- dua slot/hari (kelas berbeda) dibedakan di sini
  scheduled_end timestamptz,
  location text,
  status session_status not null default 'scheduled',
  session_type text not null default 'training',  -- training|benchmark
  opened_at timestamptz,
  closed_at timestamptz,
  cancel_reason text,
  notes text,
  created_at timestamptz not null default now()
);
create index on sessions (team_id, scheduled_start desc);


create table session_stations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions on delete cascade,
  label text not null,              -- 'Pos 1'
  coach_id uuid references profiles,
  sort_order int not null default 0
);

create table station_players (
  station_id uuid not null references session_stations on delete cascade,
  player_id uuid not null references players on delete cascade,
  primary key (station_id, player_id)
);

-- ABSENSI ---------------------------------------------------------
create type attendance_status as enum ('present','late','excused','sick','absent');

create table attendance (
  session_id uuid not null references sessions on delete cascade,
  player_id uuid not null references players on delete cascade,
  session_date date not null,              -- diisi trigger dari sessions.scheduled_start (WIB)
  status attendance_status not null,
  checked_in_at timestamptz,
  method text not null default 'manual',   -- qr|manual|auto|kiosk
  recorded_by uuid references profiles,
  primary key (session_id, player_id)
);

-- Satu pemain hanya boleh hadir di satu sesi per hari.
create unique index attendance_one_session_per_day
  on attendance (player_id, session_date)
  where status in ('present','late');
```

### 3.3 Pencatatan drill — append-only

Ini bagian paling penting di seluruh sistem.

```sql
create table session_drills (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions on delete cascade,
  station_id uuid references session_stations on delete set null,
  drill_id uuid not null references drills,
  target int,                       -- penyebut saat lacak-meleset mati
  track_misses boolean not null default false,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_by uuid not null references profiles
);

-- SATU KETUKAN = SATU BARIS. Tidak pernah di-UPDATE.
create table drill_events (
  id uuid primary key default gen_random_uuid(),
  client_event_id uuid not null,    -- dibuat di perangkat, kunci idempotensi
  session_drill_id uuid not null references session_drills on delete cascade,
  player_id uuid not null references players on delete cascade,
  result text not null,             -- made|miss|dnp
  value numeric,                    -- detik / cm untuk tipe timed & measure
  occurred_at timestamptz not null,
  device_id text not null,
  recorded_by uuid not null references profiles,
  voided_at timestamptz,            -- undo setelah tersinkron
  created_at timestamptz not null default now(),
  unique (client_event_id)          -- pengiriman ulang tidak menggandakan
);
create index on drill_events (session_drill_id, player_id) where voided_at is null;
```

**Mengapa append-only, bukan menyimpan angka `made`/`attempts`:**

| Masalah | Kalau menyimpan angka | Dengan event |
|---|---|---|
| Dua coach mencatat anak yang sama | Tulisan terakhir menimpa yang pertama, data hilang diam-diam | Kedua peristiwa tersimpan, terlihat di review |
| Kiriman ulang setelah sinyal putus | Angka bertambah dua kali | `client_event_id` unik menolak duplikat |
| Coach salah tap lalu undo | Perlu logika sinkron yang rumit | Cukup tandai `voided_at` |
| Audit "kapan tembakan ini dicatat" | Hilang | Tersimpan permanen |

Hasil agregat disimpan terpisah untuk kecepatan baca, diperbarui oleh trigger:

```sql
create table drill_results (
  session_drill_id uuid not null references session_drills on delete cascade,
  player_id uuid not null references players on delete cascade,
  made int not null default 0,
  attempts int not null default 0,
  value numeric,
  is_dnp boolean not null default false,
  overridden boolean not null default false,  -- diedit manual di layar review
  updated_at timestamptz not null default now(),
  primary key (session_drill_id, player_id)
);
```

Trigger menghitung ulang dari `drill_events` setiap kali ada perubahan, **kecuali** baris ditandai `overridden` — koreksi manual coach selalu menang atas hitungan otomatis.

### 3.4 Tabel Fase 1

```sql
create table rubric_scores (
  session_id uuid not null references sessions on delete cascade,
  player_id uuid not null references players on delete cascade,
  effort int check (effort between 1 and 5),
  coachability int check (coachability between 1 and 5),
  discipline int check (discipline between 1 and 5),
  recorded_by uuid not null references profiles,
  created_at timestamptz not null default now(),
  primary key (session_id, player_id)
);

create table player_notes (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players on delete cascade,
  session_id uuid references sessions on delete set null,
  note text not null,
  kind text not null default 'observation',   -- praise|improvement|observation
  created_by uuid not null references profiles,
  created_at timestamptz not null default now()
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  team_id uuid not null references teams,
  opponent text not null,
  match_type text not null,          -- friendly|tournament|internal
  played_at timestamptz not null,
  location text,
  score_for int,
  score_against int,
  notes text
);

create table box_scores (
  match_id uuid not null references matches on delete cascade,
  player_id uuid not null references players on delete cascade,
  minutes int, points int,
  fgm int, fga int, tpm int, tpa int, ftm int, fta int,
  oreb int, dreb int, assists int, steals int, blocks int,
  turnovers int, fouls int,
  primary key (match_id, player_id)
);

create table player_attributes (      -- snapshot per periode
  player_id uuid not null references players on delete cascade,
  period_start date not null,
  period_end date not null,
  shooting numeric(5,2), finishing numeric(5,2), ballhandling numeric(5,2),
  defense numeric(5,2), athleticism numeric(5,2), attitude numeric(5,2),
  archetype text,
  archetype_locked boolean not null default false,
  data_sufficient boolean not null default true,
  computed_at timestamptz not null default now(),
  primary key (player_id, period_start)
);

create type report_status as enum ('draft','approved','sent');

create table reports (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players on delete cascade,
  period_start date not null,
  period_end date not null,
  status report_status not null default 'draft',
  ai_draft jsonb,                    -- keluaran mentah AI, disimpan untuk audit
  content jsonb not null,            -- versi final setelah diedit coach
  approved_by uuid references profiles,
  approved_at timestamptz,
  pdf_path text,
  unique (player_id, period_start)
);

create table badges (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  code text not null, name text not null, description text,
  criteria jsonb not null,           -- {"type":"attendance_streak","threshold":30}
  unique (organization_id, code)
);

create table player_badges (
  player_id uuid not null references players on delete cascade,
  badge_id uuid not null references badges on delete cascade,
  earned_at timestamptz not null default now(),
  seen_at timestamptz,
  primary key (player_id, badge_id)
);
```

---

## 4. Sinkronisasi Offline

Bagian tersulit di proyek ini. Harus benar sejak commit pertama.

### 4.1 Penyimpanan lokal (Dexie)

```typescript
db.version(1).stores({
  sessions:      'id, teamId, status',
  players:       'id, *teamIds',
  cardTokens:    'token, playerId',        // untuk validasi scan offline
  drills:        'id, category',
  sessionDrills: 'id, sessionId',
  outbox:        '++seq, clientEventId, status, createdAt',
  localEvents:   'clientEventId, sessionDrillId, playerId'
});
```

### 4.2 Alur kerja

**Saat sesi dibuka (masih online):** unduh roster, token kartu aktif, template drill, dan pos ke penyimpanan lokal. Setelah ini, seluruh sesi bisa berjalan tanpa jaringan.

**Saat coach menekan kartu:**

```typescript
async function recordRep(input: RepInput) {
  const event = { clientEventId: crypto.randomUUID(), ...input,
                  occurredAt: new Date().toISOString(), deviceId };
  await db.transaction('rw', db.localEvents, db.outbox, async () => {
    await db.localEvents.add(event);
    await db.outbox.add({ ...event, status: 'pending' });
  });
  bumpCounterInUI(input.playerId);   // optimistic, tidak menunggu apa pun
}
```

Tulisan lokal selesai dalam satu frame. UI tidak pernah menunggu jaringan.

**Undo:**
- Belum terkirim → hapus baris dari `localEvents` dan `outbox`
- Sudah terkirim → kirim peristiwa pembatalan yang mengisi `voided_at`

**Pengiriman:** batch 50 peristiwa, `INSERT ... ON CONFLICT (client_event_id) DO NOTHING`. Backoff eksponensial 1s → 30s. Dipicu oleh event `online`, timer 15 detik, dan `visibilitychange`.

**Validasi scan offline:** cocokkan token hasil scan dengan tabel `cardTokens` lokal. Nol panggilan jaringan.

### 4.3 Aturan penyelesaian konflik

| Situasi | Aturan |
|---|---|
| Dua coach mencatat pemain sama, drill sama | Kedua peristiwa tersimpan. Layar review menandainya untuk dikonfirmasi manusia — **tidak digabung diam-diam** |
| Peristiwa dikirim dua kali | Ditolak oleh batasan unik `client_event_id` |
| Koreksi manual vs hitungan otomatis | Koreksi manual menang (`overridden = true`) |
| Jam perangkat tidak sinkron | Simpan `occurred_at` dari perangkat **dan** `created_at` dari server; urutkan pakai server |

### 4.4 Pemulihan setelah aplikasi tertutup

Saat aplikasi dibuka, jika ada sesi berstatus `active` di penyimpanan lokal, langsung buka kembali layar itu dengan seluruh hitungan utuh. Tidak ada dialog "lanjutkan?" — coach sedang di tengah latihan.

---

## 5. Autentikasi & Otorisasi

### 5.1 Coach & admin

Supabase Auth, email + password. Sesi berumur panjang (30 hari) — memaksa coach login ulang di pinggir lapangan adalah kegagalan produk.

### 5.2 Pemain

Anak SD tidak punya email. Alur khusus:

1. Klien mengirim `username` + `pin` ke `POST /api/auth/player`
2. Server memverifikasi terhadap `player_credentials` (PIN di-hash dengan bcrypt)
3. Server membuat sesi Supabase memakai `admin.generateLink` atau JWT khusus
4. Rate limit: 5 percobaan, kunci 15 menit

```sql
create table player_credentials (
  player_id uuid primary key references players on delete cascade,
  username text not null unique,
  pin_hash text not null,
  failed_attempts int not null default 0,
  locked_until timestamptz
);
```

### 5.3 Row Level Security

RLS aktif di **semua** tabel. Contoh yang paling kritikal:

```sql
-- Pemain hanya melihat dirinya sendiri
create policy player_reads_own on players for select
using (
  profile_id = auth.uid()
  or exists (
    select 1 from profiles p
    where p.id = auth.uid()
      and p.organization_id = players.organization_id
      and p.role in ('admin','coach')
  )
);

-- Coach hanya melihat pemain di kelas yang dia pegang
create policy coach_reads_team_players on team_players for select
using (
  exists (select 1 from coach_teams ct
          where ct.coach_id = auth.uid() and ct.team_id = team_players.team_id)
);

-- Rapor draf tidak terlihat oleh pemain
create policy player_reads_approved_reports on reports for select
using (
  status in ('approved','sent')
  and exists (select 1 from players pl
              where pl.id = reports.player_id and pl.profile_id = auth.uid())
);
```

**Angka atribut tidak pernah dikirim ke klien pemain.** Ini ditegakkan dengan view terpisah, bukan dengan menyembunyikannya di UI:

```sql
create view player_card_view as
select p.id, p.nickname, p.jersey_number, pa.archetype,
       -- bentuk radar dinormalisasi 0..1, tanpa nilai mentah
       round(pa.shooting/100.0, 2) as shape_shooting,
       round(pa.finishing/100.0, 2) as shape_finishing
       -- dst
from players p join player_attributes pa on pa.player_id = p.id;
```

---

## 6. Pemindai QR

```typescript
const QR_PREFIX = 'BLN1:';

async function onScan(raw: string) {
  if (!raw.startsWith(QR_PREFIX)) return reject('unknown_format');
  const token = raw.slice(QR_PREFIX.length);
  const card = await db.cardTokens.get(token);     // lokal, tanpa jaringan
  if (!card) return reject('card_not_found');
  if (alreadyCheckedIn(card.playerId)) return notice('already_present');
  await markPresent(card.playerId, 'qr');
  showConfirmation(card.playerId);                  // foto + nama, ~1 detik
}
```

- Pakai `BarcodeDetector` bila tersedia (jauh lebih cepat di Android), jatuh ke `@zxing/browser` bila tidak
- Debounce 800ms untuk token yang sama agar tidak terbaca berulang
- Wake lock aktif selama mode scan
- Getar via `navigator.vibrate(50)` dan bunyi pendek — coach tidak selalu melihat layar

**Kartu cetak:** dihasilkan server-side dengan `@react-pdf/renderer`, 8 kartu per A4, QR ≥ 25mm, error correction level M. Level H membuat QR terlalu padat dan justru melambatkan pembacaan.

---

## 7. Perhitungan Atribut

Berjalan sebagai cron harian (Supabase pg_cron) dan bisa dipicu manual sebelum rapor dibuat.

```
untuk tiap pemain, tiap periode:
  1. ambil drill_results dalam periode
  2. kelompokkan per drill, hitung rata-rata (atau terbaik untuk tipe measure)
  3. konversi ke persentil terhadap kelompok usia (usia individu ±1 tahun)
  4. sebar ke atribut memakai drills.attribute_weights
  5. box_scores diberi bobot 1.5×
  6. attitude = kehadiran(0.4) + beruntun(0.2) + rubrik(0.4)
  7. bila titik data < 3 → pertahankan nilai periode lalu, tandai data_sufficient=false
  8. tentukan archetype (lewati bila archetype_locked)
  9. simpan ke player_attributes
```

**Archetype** ditentukan oleh aturan sederhana, bukan model. Aturan bisa dijelaskan ke coach dan tidak butuh data latih:

```
Shooter       → shooting persentil tertinggi, dan > 60
Slasher       → finishing tertinggi, dan > 60
Playmaker     → ballhandling tertinggi + assist/turnover baik
Rim Protector → defense tertinggi + block di atas rata-rata
Motor         → athleticism tertinggi
Glue Guy      → attitude tertinggi, atau sebaran atribut merata
```

---

## 8. Pembuatan Rapor & AI

```
Coach menekan "Buat rapor bulan ini"
  → server mengumpulkan data terstruktur per pemain
  → satu panggilan AI per pemain (batch, paralel maksimal 5)
  → hasil disimpan sebagai reports.ai_draft (status = draft)
  → coach meninjau, mengedit, menyetujui
  → PDF dibuat saat disetujui
```

**Batasan yang mengikat:**
- AI tidak pernah dipanggil dari klien
- Keluaran AI diwajibkan berbentuk JSON dan divalidasi dengan Zod; kegagalan validasi → coba ulang sekali, lalu jatuh ke template statis
- `ai_draft` disimpan permanen untuk audit
- Rapor berstatus `draft` tidak dapat dibaca pemain — ditegakkan oleh RLS, bukan UI
- Data yang dikirim ke AI hanya nama panggilan dan angka. **Nama lengkap, tanggal lahir, dan kontak orang tua tidak pernah dikirim.**

Estimasi biaya: ~1.500 token masukan + ~800 keluaran per pemain. Untuk 60 pemain per bulan ≈ **di bawah $2/bulan**.

---

## 9. Anggaran Performa

| Metrik | Anggaran | Cara mencapai |
|---|---|---|
| Ketukan → umpan balik visual | ≤ 100ms | Tulisan lokal optimistic, tanpa await jaringan |
| Buka aplikasi (offline) | ≤ 2 detik | Shell di-cache service worker |
| JS awal | ≤ 250KB gzip | Server component sebagai default; `'use client'` hanya di layar lapangan |
| Grid 15 kartu render ulang | ≤ 16ms | `React.memo` per kartu, state counter terpisah dari state daftar |
| Sinkron 500 peristiwa | ≤ 5 detik | Batch 50, insert paralel |

**Aturan render yang mudah dilanggar:** state hitungan tiap pemain harus terpisah dari state daftar. Kalau seluruh grid dirender ulang tiap ketukan, aplikasi akan terasa lambat di HP kelas menengah dan coach akan mengira ketukannya tidak masuk — lalu menekan dua kali.

---

## 10. Struktur Repo

```
ballin/
├── app/
│   ├── (auth)/login/               # coach & admin
│   ├── (auth)/player-login/        # username + PIN
│   ├── (field)/                    # tema gelap, layar lapangan
│   │   ├── session/[id]/attendance/
│   │   ├── session/[id]/stations/
│   │   └── session/[id]/drill/[drillId]/
│   ├── (app)/                      # tema terang
│   │   ├── dashboard/
│   │   ├── players/[id]/
│   │   ├── reports/
│   │   └── matches/
│   ├── (player)/card/              # kartu pemain
│   └── api/
│       ├── auth/player/
│       ├── reports/generate/
│       └── cards/print/
├── components/
│   ├── field/                      # PlayerRepCard, ScanConfirm, UndoToast
│   ├── charts/
│   └── ui/                         # shadcn, sudah dimodifikasi
├── lib/
│   ├── db/                         # skema & klien Dexie
│   ├── sync/                       # outbox, pengirim, penyelesaian konflik
│   ├── supabase/
│   ├── attributes/                 # perhitungan atribut & archetype
│   └── validators/                 # skema Zod
├── supabase/
│   ├── migrations/
│   └── seed.sql                    # drill preset, lencana, org contoh
├── tests/e2e/                      # Playwright, termasuk skenario offline
└── docs/                           # PRD, TRD, brand guideline
```

---

## 11. Testing

**Wajib lulus sebelum MVP dinyatakan selesai:**

1. **Skenario offline (Playwright):** buka sesi → matikan jaringan → catat 100 repetisi → tutup paksa aplikasi → buka lagi → hitungan utuh → nyalakan jaringan → semua terkirim tanpa duplikat
2. **Multi-perangkat:** dua konteks browser mencatat di pos berbeda secara bersamaan → kedua data masuk → tidak ada yang hilang
3. **Idempotensi:** kirim batch peristiwa yang sama tiga kali → jumlah baris di database tetap
4. **RLS:** pemain A mencoba membaca data pemain B → kosong. Coach mencoba membaca kelas lain → kosong. Uji dengan klien Supabase asli, bukan mock
5. **Performa:** grid 15 kartu, 200 ketukan berturut-turut → tidak ada frame lebih dari 16ms

---

## 12. Keamanan

- RLS aktif di semua tabel; tidak ada tabel yang terbuka
- Foto di bucket privat, diakses lewat signed URL berumur 1 jam
- PIN pemain di-hash bcrypt (cost 10), tidak pernah dikirim balik ke klien
- Rate limit pada endpoint login pemain dan generate rapor
- Token kartu acak, dapat dicabut, divalidasi terhadap daftar aktif
- Audit log untuk: perubahan roster, pencabutan kartu, persetujuan rapor, penghapusan data
- Tidak ada data pribadi di log klien

---

## 13. Milestone Teknis

| # | Isi | Durasi |
|---|---|---|
| 1 | Skema database + RLS + seed + autentikasi | 1 minggu |
| 2 | Shell PWA, Dexie, mesin sinkronisasi, indikator status | 1 minggu |
| 3 | Sesi, absensi QR, generator kartu cetak | 1 minggu |
| 4 | Pos + grid input drill + undo + layar review | 1,5 minggu |
| 5 | Kartu pemain dasar + dashboard coach dasar | 1 minggu |
| 6 | Pengerasan: uji offline, uji multi-perangkat, performa | 1 minggu |

**Total MVP: 6,5 minggu.**

Milestone 2 dan 4 adalah yang paling berisiko. Kalau harus memotong waktu, potong dari milestone 5 — bukan dari 2, 4, atau 6.

---

## 14. Keputusan Arsitektur yang Tidak Bisa Diubah Belakangan

Empat hal ini, kalau salah di awal, memerlukan penulisan ulang:

1. **`organization_id` di semua tabel domain** — menambahkannya nanti berarti migrasi seluruh kebijakan RLS
2. **Drill sebagai data, bukan enum** — enum berarti deploy tiap kali coach ingin drill baru
3. **Pencatatan berbasis peristiwa append-only** — menyimpan angka langsung membuat multi-coach mustahil diperbaiki tanpa membongkar model data
4. **Offline-first sejak awal** — offline tidak bisa "ditambahkan nanti"; ia menentukan bentuk seluruh lapisan data
