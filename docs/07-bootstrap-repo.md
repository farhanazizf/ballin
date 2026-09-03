# Bootstrap Repo — Panduan untuk Cursor / VS Code

Cara memulai repo Ballin dengan bantuan AI, tanpa membuang konteks pada dokumen yang tidak relevan.

---

## 1. File yang Di-include

**Aturan utama: jangan masukkan semua dokumen sekaligus.** Konteks yang terlalu besar membuat AI kehilangan fokus pada detail yang penting. Masukkan sesuai tahap pekerjaan.

### Selalu di-include (letakkan di `docs/` di dalam repo)

| File | Kegunaan |
|---|---|
| `06-TRD.md` | Skema database, arsitektur sync, struktur repo. **Paling penting.** |
| `05-PRD.md` | User story dan acceptance criteria. Rujukan saat membangun fitur. |
| `03-brand-guideline.md` | Token warna, tipografi, batasan UI. |
| `08-seed-data.sql` | Seed drill preset, kelas, dan lencana. Langsung pakai sebagai `supabase/seed.sql`. |

### Di-include sesuai kebutuhan

| File | Kapan |
|---|---|
| `01-platform-summary-dan-fitur.md` | Saat butuh konteks fitur yang lebih luas atau merencanakan fase berikutnya |
| `02-materi-pitch.md` | **Jangan** dimasukkan ke repo. Ini dokumen bisnis, bukan spesifikasi teknis |
| `04-theme-preview.html` | **Jangan** dimasukkan. Ini hanya lembar contoh token, dan justru akan membuat AI meniru layout yang tidak diinginkan |
| `09-logo-icon-placeholder.svg` | Taruh di `public/`. Dipakai untuk favicon dan ikon PWA |
| `10-logo-lockup-placeholder.svg` | Taruh di `public/`. Dipakai di header dan kop rapor |

### Per tahap pekerjaan

| Tahap | Include |
|---|---|
| Setup awal & database | TRD bagian 2–3, `CLAUDE.md` |
| Mesin sinkronisasi | TRD bagian 4 saja — ini bagian tersulit, beri fokus penuh |
| Layar lapangan | TRD bagian 9, brand guideline, PRD Epic C |
| Dashboard & rapor | PRD Epic E & I, brand guideline |

---

## 2. File Konteks untuk AI

Buat `CLAUDE.md` di akar repo (dibaca otomatis oleh Claude Code; untuk Cursor, salin isinya ke `.cursorrules`).

```markdown
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
```

---

## 3. Urutan Membangun

Ikuti urutan ini. Setiap langkah menghasilkan sesuatu yang bisa dites.

| # | Pekerjaan | Selesai bila |
|---|---|---|
| 1 | Skema database + RLS + seed | Uji RLS lulus: pemain A tidak bisa membaca data pemain B |
| 2 | Autentikasi coach + login PIN pemain | Kedua peran bisa masuk, rate limit bekerja |
| 3 | CRUD roster, kelas, drill | Data DBA asli bisa dimasukkan |
| 4 | Shell PWA + Dexie + mesin sinkronisasi | Uji offline Playwright lulus |
| 5 | Sesi + absensi QR + generator kartu | 60 kartu bisa dicetak dan dipindai |
| 6 | Pos + grid input drill + undo + review | Uji multi-perangkat lulus |
| 7 | Kartu pemain + dashboard coach | Data asli tampil benar |
| 8 | Pengerasan performa | Anggaran performa terpenuhi |

**Jangan lompat ke langkah 6 sebelum langkah 4 benar-benar lulus.** Mesin sinkronisasi adalah fondasi; membangun UI di atas fondasi yang salah berarti menulis ulang keduanya.

---

## 4. Prompt Pembuka

```
Baca docs/06-TRD.md bagian 2 dan 3, lalu CLAUDE.md.

Buat proyek Next.js 15 dengan TypeScript strict, Tailwind v4, dan
Supabase. Hasilkan migrasi SQL awal sesuai skema di TRD bagian 3.2
dan 3.3, lengkap dengan kebijakan RLS dari bagian 5.3.

Jangan buat komponen UI dulu. Jangan buat halaman selain struktur
folder kosong sesuai TRD bagian 10.

Seed sudah tersedia di docs/08-seed-data.sql — salin ke
supabase/seed.sql, jangan buat ulang.

Tunjukkan migrasi skema dulu untuk saya review sebelum lanjut.
```

Perhatikan dua hal: prompt ini **membatasi cakupan** dan **meminta review sebelum lanjut**. Tanpa keduanya, AI akan menghasilkan seluruh aplikasi sekaligus dan sulit dikoreksi.

---

## 5. Kesalahan yang Perlu Dihindari

| Kesalahan | Akibat |
|---|---|
| Memasukkan seluruh dokumen sekaligus | AI kehilangan detail penting di tengah konteks |
| Menyerahkan `04-theme-preview.html` | AI meniru layout contoh yang memang tidak diinginkan |
| Meminta "buatkan seluruh aplikasi" | Kode banyak, arsitektur salah, sulit diperbaiki |
| Membangun UI sebelum sinkronisasi selesai | Keduanya harus ditulis ulang |
| Membiarkan AI memakai `localStorage` | Tidak memadai untuk data sesi; harus IndexedDB |
| Membiarkan AI membuat enum drill | Melanggar aturan arsitektur inti |

---

## 6. Checklist Sebelum Menulis Baris Pertama

- [ ] Proyek Supabase dibuat, kredensial di `.env.local`
- [ ] Repo Git dibuat, `docs/` berisi PRD, TRD, brand guideline
- [ ] `CLAUDE.md` (atau `.cursorrules`) sudah ada di akar repo
- [ ] Logo placeholder disalin ke `public/`
- [ ] `08-seed-data.sql` disalin ke `supabase/seed.sql`
- [ ] Daftar nama pemain DBA sudah siap dalam CSV

Tidak memblokir: warna resmi DBA (ada placeholder), drill final (ada 18 preset umum).
