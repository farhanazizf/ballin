# Ballin

Aplikasi PWA pencatatan latihan untuk akademi basket usia sekolah.
Akademi pilot: Dynasty Basketball Academy, Karawang.

## Konteks pemakaian
Coach memakai aplikasi ini sambil berdiri di lapangan, satu tangan,
mengawasi 10-15 anak, sering tanpa sinyal. Kalau mencatat satu drill
menambah lebih dari 30 detik kerja coach, desainnya salah.

## Aturan arsitektur — jangan dilanggar
1. Semua tabel domain punya `organization_id`, walaupun pilot satu akademi.
2. Drill adalah baris data, bukan enum. Jangan pernah hardcode nama drill.
3. Pencatatan drill bersifat append-only. Satu ketukan = satu baris di
   `drill_events` dengan `client_event_id` sebagai kunci idempotensi.
   Jangan pernah UPDATE angka made/attempts secara langsung.
4. Offline-first. Semua fungsi sesi berjalan tanpa jaringan. Tulisan lokal
   dulu, sinkronisasi belakangan. UI tidak pernah menunggu jaringan.
5. Otorisasi ditegakkan lewat RLS Postgres, bukan lewat pengecekan di UI.

## Aturan produk — jangan dilanggar
1. Pemain tidak pernah melihat angka overall, peringkat, persentil, atau
   data pemain lain. Dalam bentuk apa pun.
2. Status offline ditampilkan netral ("Tersimpan di HP"), bukan sebagai error.
3. Undo harus selalu tersedia di layar input drill.
4. Nilai 0 tidak sama dengan tidak ikut drill (DNP). Bedakan keduanya.
5. Rapor berstatus draf tidak bisa dibaca pemain sampai coach menyetujui.

## Stack
Next.js 15 App Router, TypeScript strict, Supabase (Postgres + RLS + Auth +
Storage), Dexie untuk penyimpanan lokal, Serwist untuk service worker,
Tailwind v4, shadcn/ui sebagai dasar, Recharts, @react-pdf/renderer.

## Konvensi
- Server component sebagai default. `'use client'` hanya di layar lapangan.
- Skema Zod di `lib/validators/`, dipakai ulang di klien dan server.
- Nama tabel dan kolom: snake_case. Kode TypeScript: camelCase.
- Bahasa antarmuka: Indonesia, sentence case, tanpa label huruf kapital semua.
- Tulis pesan error yang menjelaskan langkah berikutnya, bukan sekadar
  menyatakan kegagalan.

## Anggaran performa
- Ketukan sampai umpan balik visual: 100ms
- Grid 15 kartu render ulang: 16ms
- State hitungan per pemain harus terpisah dari state daftar

## Yang dikerjakan terpisah
Desain visual dan layout tidak diatur di sini. Brand guideline hanya
menetapkan batasan (kontras, ukuran sentuh, warna, keterbacaan angka).
Bentuk layar dikerjakan di tahap desain UI.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
