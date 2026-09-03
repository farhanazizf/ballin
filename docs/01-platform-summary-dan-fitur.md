# Platform Ekosistem Akademi Basket — Ringkasan & Detail Fitur

**Status:** Draft v1 untuk review
**Tahap:** Pra-PRD (dokumen ini jadi dasar PRD & TRD)
**Nama kerja:** Ballin

---

## 1. Ringkasan Platform

### 1.1 Satu kalimat

Platform pencatatan latihan dan perkembangan atlet untuk akademi basket usia sekolah (SD–SMA), yang mengubah latihan harian menjadi data terukur, rapor berkala, dan portofolio atlet.

### 1.2 Masalah yang diselesaikan

| Pihak | Masalah hari ini |
|---|---|
| Coach | Catatan latihan ada di kepala, buku tulis, atau grup WA. Evaluasi per periode dibuat dari ingatan, bukan data. |
| Player | Tidak tahu apakah dirinya berkembang. Motivasi bergantung pujian coach saja. |
| Orang tua | Membayar tiap bulan tanpa bukti perkembangan anak. Alasan utama berhenti berlangganan. |
| Akademi | Tidak punya aset data. Tidak bisa membuktikan kualitas program ke calon murid baru. |

### 1.3 Prinsip desain (tidak bisa diganggu gugat)

1. **Lapangan dulu, baru data.** Jika input satu drill menambah lebih dari ~30 detik kerja coach, fitur itu salah desain.
2. **Data parsial lebih baik daripada data lengkap yang berhenti.** Sistem tidak pernah memaksa coach mengisi semua.
3. **Offline adalah kondisi normal, bukan pengecualian.** Sinyal GOR jelek. Aplikasi harus jalan penuh tanpa internet.
4. **Tidak ada peringkat antar-anak yang terlihat oleh anak.** Usia SD–SMA masih rentan; perbandingan absolut merusak lebih banyak daripada memotivasi.
5. **Satu tangan, layar 6 inci, sambil berdiri.** Semua UI lapangan didesain untuk kondisi ini.
6. **Semua output bisa di-share ke WhatsApp.** Jangan melawan kebiasaan pengguna.

### 1.4 Pengguna & lingkup

**Fase pilot:** 1 akademi, 30–60 pemain per sesi, 3–5 coach/asisten yang input bersamaan dari perangkat masing-masing.

> Skala ini menentukan dua hal yang tidak bisa ditawar: **absensi harus berbasis scan QR** (daftar 60 nama terlalu lambat), dan **sesi harus dibagi ke station** dengan beberapa coach input paralel (satu orang tidak mungkin memantau 60 anak).
**Platform:** Web responsive + PWA (installable, offline-first). Tidak ada aplikasi native di fase awal.
**Bahasa:** Bahasa Indonesia.

---

## 2. Peran & Hak Akses

| Peran | Akses | Login | Fase |
|---|---|---|---|
| **Player** | Hanya data dirinya sendiri. Read-only. | Username + PIN 6 digit | 1 |
| **Coach** | Tim yang dia pegang: input, evaluasi, rapor. | Email + password | 1 |
| **Admin / Owner** | Semua tim, kelola user, jadwal, laporan, billing. | Email + password | 1 |
| **Parent** | Read-only anak sendiri + notifikasi. | Nomor HP + OTP / magic link | 2 |
| **Manager tim** | Input match & box score, jadwal. | Email + password | 3 |

**Catatan kunci:**
- Player tidak pakai email. Anak SD tidak punya email, dan verifikasi email akan jadi beban support terbesar. Username dibuat admin, PIN bisa direset coach.
- Aturan "player hanya lihat dirinya" diterapkan di level **database (RLS)**, bukan hanya di UI.
- Persetujuan orang tua (consent) dikumpulkan saat pendaftaran — relevan dengan UU PDP karena subjek data adalah anak di bawah umur.

---

## 3. Peta Modul

```
FONDASI              LAPANGAN                 OUTPUT
─────────            ─────────                ──────
M1 Organisasi   →    M4 Sesi & Absensi   →    M9  Player Card
M2 Roster            M5 Drill Logging         M10 Dashboard Coach
M3 Drill Library     M6 Benchmark Test        M11 Rapor Berkala + AI
                     M7 Rubrik & Catatan      M12 Portofolio Publik
                     M8 Match & Box Score     M13 Notifikasi & Share
```

---

## 4. Detail Fitur

### M1 — Organisasi, Tim & Kelompok Umur

- Akademi (organization) sebagai tenant. **Semua tabel punya `organization_id` sejak hari pertama**, walaupun pilot hanya 1 akademi. Menghindari migrasi besar saat jadi multi-akademi.
- Tim / grup latihan (contoh: U12 Putra, U16 Putri, Kelas Pemula).
- Kelompok umur untuk normalisasi statistik — anak kelas 4 SD tidak dibandingkan dengan kelas 6.
- Satu pemain bisa berada di lebih dari satu tim (misal ikut kelas reguler + tim kompetisi).

### M2 — Roster & Profil Pemain

**Data dasar:** nama, nama panggilan, foto, tanggal lahir, sekolah, kelas, nomor punggung, posisi, tangan dominan, tanggal bergabung, kontak orang tua.

**Data fisik (di-update berkala, bukan sekali):** tinggi badan, berat, wingspan, standing reach.
→ Tinggi badan bulanan adalah data yang paling disukai orang tua. Murah dicatat, tinggi nilainya.

**Status:** aktif, cedera, cuti, keluar. Riwayat cedera sederhana (tanggal mulai, jenis, tanggal pulih).

### M3 — Drill Library (Template Drill)

Ini komponen paling kritikal secara arsitektur. **Drill tidak boleh di-hardcode.** Tiap coach punya drill sendiri; kalau di-hardcode, akan ada deploy tiap minggu.

Drill adalah template yang bisa dibuat/diedit coach, dengan tipe pengukuran:

| Tipe | Contoh | Data tersimpan |
|---|---|---|
| `attempt` | Free throw, layup line, 3-point | made / attempts |
| `timed` | Suicide run, sprint 3/4 court | detik (lebih kecil lebih baik) |
| `count_in_time` | Shooting 1 menit, dribble cone 30 detik | jumlah dalam durasi tetap |
| `measure` | Vertical jump, tinggi badan | angka + satuan |
| `rating` | Teknik dribble, footwork | skala 1–5 |

**Atribut tiap drill:**
- Nama, kategori (Shooting / Finishing / Ballhandling / Defense / Athleticism / Conditioning)
- Target default per anak (misal 10 attempt) — dipakai sebagai penyebut di mode cepat
- Kontribusi ke atribut player card (misal Free Throw → 70% Shooting, 30% Focus)
- Level kesulitan / kelompok umur yang cocok
- Catatan instruksi + link video (opsional)

Sistem datang dengan **18 drill preset umum** siap pakai (lihat `08-seed-data.sql`) agar coach tidak mulai dari kosong. Preset ini sengaja generik; disesuaikan dengan kurikulum akademi lewat UI, tanpa deploy ulang.

### M4 — Jadwal Sesi & Kehadiran

**Jadwal:** sesi berulang (misal Selasa & Jumat 16:00), lokasi, tim, coach penanggung jawab. Bisa dibatalkan/diubah dengan alasan.

**Absensi utama — Kartu QR + continuous scan.**

Tiap pemain memegang kartu fisik berisi QR (dicetak, dilaminasi, digantung di tas). Coach membuka scanner, kamera tetap terbuka, anak antre lewat satu per satu.

| Aspek | Desain |
|---|---|
| Mode scan | **Continuous** — kamera tidak ditutup antar-anak, coach tidak menekan apa pun |
| Konfirmasi | Overlay besar berisi **foto + nama** selama ~1 detik, disertai getar & bunyi |
| Kecepatan | ~1–1,5 detik/anak → 60 anak ≈ 1,5 menit, berjalan paralel dengan anak masuk lapangan |
| Anti titip absen | Coach melihat wajah anak dan foto di layar bersamaan. Kartu pinjaman langsung ketahuan. |
| Umpan balik | Daftar nama yang sudah masuk tampil berjalan di bawah layar |

**Desain token kartu:**
- **UUID v4 acak**, bukan ID sekuensial — ID berurut bisa ditebak dan dipalsukan
- Isi QR berprefix, contoh `HL1:<uuid>` — scanner langsung menolak QR asing (QRIS, tiket, barcode jajanan) tanpa query database
- Token disimpan **terpisah dari tabel player**, punya status aktif/dicabut dan tanggal terbit
- Kartu hilang → cabut token lama, terbitkan baru, kartu lama mati permanen
- **Validasi offline**: saat sesi dimulai, roster + daftar token berlaku diunduh ke perangkat. Scan dicocokkan lokal. Kalau scan butuh server, sinyal GOR akan membuat antrean macet total.
- Kartu tetap bisa difotokopi — ini tidak dicegah teknologi, tapi sudah ditutup oleh overlay foto

**Generator kartu (wajib ada, sering terlupa):** PDF siap cetak, 8–10 kartu per A4, tiap kartu berisi QR + foto + nama + nomor punggung + logo akademi. Plus alur cetak ulang untuk kartu hilang.

**Fallback (wajib, tanpa pengecualian):**
1. **Tap list manual** — cari nama, tap hadir. Untuk kartu ketinggalan, kamera error, atau anak baru.
2. **Kiosk foto** (opsional) — tablet di pintu masuk menampilkan grid foto, anak tap fotonya sendiri. Waktu coach nol.
3. **Otomatis dari drill** — anak yang punya rep tercatat otomatis dianggap hadir. Jaring pengaman terakhir.

**Status kehadiran:** Hadir, Terlambat, Izin, Sakit, Alfa.
Terlambat & Alfa dibedakan — datanya penting untuk rapor disiplin.

### M5 — Drill Logging (Inti Produk)

Alur: **Mulai Sesi → Absensi → Bagi Station → Tiap Coach Pilih Station → Pilih Drill → Input → Review → Simpan**

#### Station: kunci agar 60 anak tetap terkelola

Grid berisi 60 kartu tidak bisa dipakai — coach akan scroll terus dan salah tap. Dan satu orang memang tidak mungkin memantau 60 anak. Realitanya selalu ada beberapa asisten yang memegang pos masing-masing, jadi sistem harus mengikuti kenyataan itu.

- Saat setup sesi, anak dibagi ke **station** (misal 5 station × 12 anak), otomatis atau manual
- Tiap coach login di perangkat sendiri, memilih station yang dia pegang
- **Layarnya hanya menampilkan 12 anak** — grid kembali nyaman, desain input tetap berlaku
- Kelompok bisa **rotasi antar station**; coach menekan "Rotasi" dan sistem menggeser semua kelompok satu langkah
- Beberapa coach input **bersamaan** dalam satu sesi, tersinkronisasi
- Coach kepala bisa melihat progres seluruh station secara realtime

**Aturan konflik:** input bersifat *append* (setiap tap adalah baris event, bukan penimpaan angka), sehingga dua perangkat tidak saling menimpa. Jika dua coach mencatat anak yang sama di drill yang sama, review screen menandainya untuk dikonfirmasi, bukan menggabungkannya diam-diam.

> Ini bagian tersulit di seluruh proyek: offline + multi-device sync berjalan bersamaan. Harus dirancang benar sejak awal, tidak bisa ditambahkan belakangan.

**Alternatif jika coach hanya 1–2 orang:** mode **sampling** — tiap sesi hanya 15 anak yang dicatat detail, dirotasi otomatis agar dalam ~4 sesi semua anak kebagian. Sama seperti pendekatan rubrik. Lebih jujur daripada memaksa mencatat 60 anak dan berakhir dengan data kosong.

#### Layar input: grid kartu, bebas urutan

Tidak ada asumsi urutan antrean. Coach bebas tap siapa saja, kapan saja.

- Grid 2 kolom, kartu ~80px tinggi, scrollable
- Tiap kartu: nama panggilan (besar), angka berjalan (5/8), avatar kecil
- Urutan kartu **tetap** (nomor punggung / abjad) — kartu yang berpindah-pindah menyebabkan salah tap
- Indikator lembut (titik warna) untuk anak yang repnya paling tertinggal, **tanpa memindahkan kartu**

#### Toggle "Lacak Meleset"

**OFF (default) — paling cepat.**
Seluruh kartu adalah satu tombol. Tap = +1 masuk.
Penyebut diambil dari target drill (misal 10) dan bisa dikoreksi di review.
Cocok untuk: layup line, shooting line, drill di mana tiap anak dapat jatah sama.
Hasil tetap tersimpan sebagai "8/10".

**ON — presisi.**
Kartu terbagi: zona hijau ✓ (60% lebar) dan zona merah ✗ (40%).
Tetap satu tap per rep, hanya beda zona. Attempts terhitung otomatis.
Cocok untuk: free throw test, drill dengan jumlah percobaan tidak sama.

#### Mode input lain (tetap tersedia)

- **Mode Bulk** — input setelah sesi selesai. Daftar nama + field angka (8/10). Jaring pengaman kalau sesi terlalu ramai.
- **Mode Timer** — untuk drill `timed`. Tombol start besar + lap per anak, atau timer per anak.
- **Mode Ukur** — untuk drill `measure`. Keypad angka per anak.

#### Pendukung yang wajib ada

| Fitur | Alasan |
|---|---|
| **Undo persisten** | Toast bawah: "Andi +1 — Batalkan". Tidak hilang cepat. Salah tap pasti sering terjadi. |
| **Status DNP** | Long-press kartu → "Tidak ikut drill ini". Agar 0 tidak salah dibaca sebagai performa buruk. |
| **Review screen** | Sebelum simpan: semua angka bisa diedit manual, anak dengan 0 rep di-flag untuk konfirmasi. |
| **Auto-save lokal** | Drill yang sedang berjalan tidak hilang walau app tertutup, HP mati, atau browser di-refresh. |
| **Wake lock** | Layar tidak mati saat drill berjalan. |
| **Haptic feedback** | Getar halus tiap tap — konfirmasi tanpa harus melihat layar. |
| **Mode gelap/terang otomatis** | Kontras tinggi untuk lapangan outdoor. |

#### Target performa

| Aksi | Target |
|---|---|
| Absensi 20 anak | < 15 detik |
| Setup drill | < 10 detik |
| Satu rep | < 1,5 detik |
| Review + simpan | < 30 detik |
| **Total overhead per sesi (4 drill)** | **< 5 menit** |

### M6 — Benchmark Test (Combine Day)

Sesi khusus tiap 4–6 minggu untuk data terukur dan bersih, tanpa membebani latihan harian.

**Battery standar:**
| Tes | Mengukur |
|---|---|
| Sprint 3/4 lapangan | Kecepatan |
| Lane agility drill | Kelincahan |
| Beep test / shuttle run | Stamina |
| Vertical jump (reach vs jangkau) | Power |
| Free throw 25 percobaan | Konsistensi shooting |
| Spot shooting 5 titik | Akurasi |
| Tinggi, berat, wingspan | Pertumbuhan fisik |

Hasil ditampilkan sebagai **tren garis lintas periode** — ini bahan utama rapor. Bisa juga dibandingkan dengan rata-rata kelompok umur (hanya visible ke coach).

### M7 — Rubrik & Catatan Coach

**Rubrik di akhir sesi, bukan per drill.** Kalau per drill, coach rating 5x per sesi dan hasilnya jadi asal-asalan.

- Sistem menampilkan **5 anak** yang dirotasi otomatis (dalam ~4 sesi semua anak kebagian)
- **3 dimensi saja:** Effort, Coachability, Disiplin/Fokus
- Skala 1–5 berupa 5 tombol besar
- Total ~30 detik. Coach boleh menambah anak lain, tapi tidak diwajibkan

**Catatan sesi (naratif):** satu kolom teks bebas, dengan dukungan voice-to-text.
Untuk rapor, catatan naratif coach sering lebih berharga daripada angkanya.

**Catatan per pemain:** coach bisa menambahkan catatan khusus ke anak tertentu kapan saja (positif/perlu diperbaiki), yang otomatis masuk ke rapor.

### M8 — Match & Box Score *(Fase 1)*

- Jadwal pertandingan: persahabatan, turnamen, internal scrimmage
- Roster pemain yang dibawa
- Box score sederhana: menit, poin, rebound, assist, steal, block, turnover, foul, FG, FT
- Input ringan — bisa oleh manager tim atau coach setelah pertandingan
- Hasil pertandingan + catatan tim
- Statistik pertandingan **terpisah** dari statistik latihan, tapi keduanya masuk ke player card

### M9 — Player Card & Progression

Tampilan utama bagi player saat login. Terinspirasi kartu EAFC, **tanpa angka overall**.

**Yang dilihat player:**
- Avatar/foto, nama, nomor punggung, posisi, tim
- **Archetype** — label deskriptif tanpa peringkat: Slasher, Shooter, Playmaker, Rim Protector, Glue Guy, Motor. Tidak ada yang "lebih tinggi", hanya beda karakter.
- **Radar chart 6 atribut tanpa angka** — hanya bentuk. Dibandingkan dengan bentuk dirinya 3 bulan lalu (overlay bayangan).
- **Streak kehadiran** — jumlah sesi berturut-turut. Motivator paling kuat untuk usia ini.
- **Badge & milestone** — "1.000 percobaan free throw", "hadir 30 sesi", "personal best layup"
- **Personal best** per drill
- **Perbandingan dengan diri sendiri:** "Free throw bulan ini 62%, bulan lalu 48%" ✅
- Statistik mentah: "8/10", "62%" — ini boleh dan harus terlihat

**Yang TIDAK dilihat player:**
- Angka overall / komposit
- Peringkat atau persentil terhadap teman
- Atribut anak lain

**Yang dilihat coach:** semua di atas, **plus** angka komposit 0–100, persentil per kelompok umur, dan perbandingan antar-pemain.

**6 atribut:**
| Atribut | Sumber |
|---|---|
| Shooting | Free throw, spot shooting, 3-point |
| Finishing | Layup, floater, drive |
| Ballhandling | Dribble drill, turnover rate |
| Defense | Defensive drill, rubrik, steal/block |
| Athleticism | Sprint, agility, vertical, beep test |
| Attitude | Kehadiran, streak, rubrik Effort & Coachability |

Atribut Attitude sengaja dimasukkan agar anak yang belum unggul secara teknis tetap punya jalur untuk merasa berkembang.

### M10 — Dashboard Coach

**Ringkasan tim:**
- Kehadiran minggu ini & tren
- Pemain yang perlu perhatian (kehadiran turun, performa stagnan ≥6 minggu, baru pulih cedera)
- Drill yang paling sering dilakukan vs kategori yang terabaikan
- Distribusi performa tim per kategori

**Halaman per pemain:**
- Tren tiap drill (grafik garis)
- Riwayat kehadiran
- Riwayat rubrik & catatan
- Perbandingan dengan rata-rata kelompok umur
- Tombol cepat: tambah catatan, buat rapor

**Alert otomatis:**
- "3 sesi tidak hadir berturut-turut" → langsung berhubungan dengan retensi & revenue akademi
- "Performa turun 3 periode berturut-turut"
- "Lonjakan beban latihan" (indikasi risiko cedera)

### M11 — Rapor Berkala + AI

Rapor bulanan (periode bisa diatur) per pemain, berisi:

1. **Ringkasan kehadiran** — hadir/total, streak, keterlambatan
2. **Perkembangan per atribut** — grafik tren, bukan sekadar angka akhir
3. **Highlight** — 3 hal terbaik periode ini
4. **Area pengembangan** — 2–3 hal yang perlu diperbaiki
5. **Catatan coach** — naratif, bagian yang paling dibaca orang tua
6. **Saran latihan mandiri** — konkret, bisa dilakukan di rumah
7. **Archetype & role** saat ini

**Peran AI:**
- Mengubah data terstruktur menjadi narasi berbahasa Indonesia yang ramah untuk anak & orang tua
- Menyarankan fokus latihan berdasarkan kelemahan terdeteksi
- Mendeteksi archetype dari pola statistik

**Aturan mutlak:** semua output AI melewati **review & approval coach** sebelum dipublikasikan. Tidak ada narasi AI yang langsung sampai ke anak atau orang tua. Coach bisa mengedit teks sebelum kirim.

**Efisiensi biaya:** AI dipanggil secara batch saat rapor dibuat, hasilnya di-cache. Bukan per-request.

**Output:** PDF + gambar siap-share ke WhatsApp.

### M12 — Portofolio / CV Pemain Publik

Halaman publik dengan URL unik (contoh: `hooplog.id/p/andi-pratama`), bisa dimatikan kapan saja.

Isi: foto, posisi, tinggi/wingspan, tahun lahir, akademi, statistik pilihan, hasil benchmark, prestasi tim, link video highlight, kontak coach.

**Nilai:** untuk anak SMA yang mencari klub atau beasiswa kampus, ini differentiator besar. Sekaligus marketing gratis untuk akademi karena tiap halaman membawa nama akademi.

**Kontrol privasi:** default OFF. Perlu persetujuan orang tua untuk mengaktifkan. Untuk pemain di bawah 13 tahun, sebaiknya tidak diaktifkan sama sekali.

### M13 — Notifikasi & Share

- Ringkasan sesi otomatis siap-share ke grup WA (gambar)
- Pengingat jadwal latihan
- Notifikasi rapor terbit (fase 2, ke orang tua)
- Semua PDF & gambar bisa diunduh dan dibagikan

### M14 — Administrasi *(Fase 3)*

- Manajemen SPP: tagihan, status bayar, riwayat, pengingat
- Laporan keuangan sederhana
- Manajemen user & undangan

> Catatan bisnis: fitur performa yang membuat **coach** tertarik, tapi fitur keuangan yang sering membuat **pemilik akademi** mau membayar software. Layak dipertimbangkan lebih awal jika target akhirnya SaaS.

---

## 5. Gamifikasi: Aturan Main

**Boleh:**
- Streak kehadiran
- Badge & milestone berbasis akumulasi (bukan perbandingan)
- Personal best
- Perbandingan dengan diri sendiri di masa lalu
- Leaderboard **kehadiran** dan **most improved** (aman, karena anak mana pun bisa menang)
- Statistik mentah (8/10, 62%)

**Tidak boleh (visible ke player):**
- Angka overall
- Leaderboard skill absolut
- Persentil atau ranking terhadap teman
- Perbandingan lintas kelompok umur

Alasannya sederhana: anak dengan rating 62 di antara teman-teman 70-an bisa berhenti latihan, dan orang tua bisa jadi toxic soal angka. Motivasi harus datang dari "aku lebih baik dari bulan lalu", bukan "aku lebih baik dari Rian".

---

## 6. Roadmap Rilis

| Fase | Durasi | Isi | Kriteria lulus |
|---|---|---|---|
| **MVP** | 4–6 minggu | M1, M2, M3, M4, M5 (mode attempt + bulk), player card sederhana, dashboard coach dasar | 1 coach memakai konsisten 8 sesi berturut-turut tanpa disuruh |
| **Fase 1** | +6 minggu | M6 Benchmark, M7 Rubrik, **M8 Match & box score**, M9 penuh (radar, streak, badge), M11 Rapor + AI, export PDF | Rapor bulanan pertama terbit dan diterima orang tua |
| **Fase 2** | +6 minggu | Akses Parent, M13 notifikasi, M12 portofolio publik | 1 akademi penuh (semua tim) aktif |
| **Fase 3** | — | M14 SPP, multi-akademi penuh, mobile native (jika perlu) | Akademi kedua onboarding mandiri |

**Aturan pilot:** satu akademi, satu tim, satu coach yang benar-benar mau kerja sama. Jangan membangun untuk 5 akademi sebelum 1 coach memakai konsisten selama 8 minggu.

---

## 7. Metrik Keberhasilan Pilot

| Metrik | Target |
|---|---|
| Sesi tercatat / sesi aktual | > 80% |
| Overhead waktu coach per sesi | < 5 menit |
| Coach masih aktif setelah 8 minggu | 100% (dari 1–2 coach pilot) |
| Player login minimal 1x/minggu | > 50% |
| Rapor terbit tepat waktu | 100% |
| Error sync / kehilangan data | 0 |

Metrik nomor 2 dan 6 adalah yang paling menentukan. Sisanya mengikuti.

---

## 8. Di Luar Lingkup (Sementara)

- Video analysis / tagging otomatis
- Wearable & heart rate integration
- Live scoring pertandingan real-time
- Marketplace pelatih / turnamen
- Aplikasi native iOS/Android
- Multi-cabang olahraga (arsitektur disiapkan, implementasi nanti)

---

## 9. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Coach berhenti input setelah 3 minggu | Fatal | Overhead <5 menit, mode bulk, tidak wajib lengkap, onboarding langsung dampingi |
| Sinyal GOR mati | Tinggi | Offline-first sejak MVP, bukan ditambahkan belakangan |
| Orang tua toxic soal angka | Sedang–tinggi | Tidak ada overall & ranking yang visible; rapor fokus tren pribadi |
| Data anak & privasi | Legal | Consent orang tua, RLS ketat, portofolio publik default OFF |
| AI menghasilkan narasi keliru/kaku | Sedang | Wajib approval coach, coach bisa edit |
| Scope creep di pilot | Tinggi | MVP dikunci pada M1–M5; sisanya tidak dikerjakan sebelum kriteria lulus tercapai |

---

## 10. Arah Teknis (Ringkas — detail di TRD)

- **Next.js + TypeScript** (App Router), satu repo, tanpa backend terpisah di fase pilot
- **Supabase** — Postgres, Auth, Storage, Row Level Security, Realtime
- **PWA** installable, offline-first dengan IndexedDB queue
- **Tailwind + shadcn/ui**, Recharts untuk grafik
- **AI** dipanggil batch, di-cache
- Estimasi biaya infrastruktur pilot: **< $50/bulan**

Dua keputusan arsitektur yang harus benar sejak commit pertama:
1. `organization_id` di semua tabel
2. Drill sebagai template configurable, bukan enum hardcoded

---

## 11. Keputusan yang Sudah Diambil

| Topik | Keputusan |
|---|---|
| Nama produk | **Ballin** (nama kerja) |
| Match & box score | Naik ke **Fase 1** |
| Manajemen SPP | Tetap **Fase 3** |
| Akademi pilot | Dynasty Basketball Academy (DBA), Karawang |
| Warna akademi | Disediakan slot `--academy-primary` yang bisa diatur |

| Drill preset | 18 drill umum, disesuaikan belakangan lewat UI |
| Logo | Placeholder tersedia, logo final menyusul |
| Absensi | Satu pemain hanya satu sesi per hari |

Masih terbuka: warna resmi DBA, dan apakah kelas Toddler dicatat statistiknya.
