# Ballin — Product Requirements Document

**Versi:** 1.0
**Tanggal:** September 2026
**Status:** Siap untuk implementasi MVP
**Akademi pilot:** Dynasty Basketball Academy (DBA), Karawang, Jawa Barat

---

## 1. Ringkasan

Ballin adalah aplikasi web/PWA untuk akademi basket usia sekolah. Fungsinya mencatat latihan saat latihan berlangsung, lalu mengubah catatan itu menjadi perkembangan yang bisa dilihat anak, evaluasi yang bisa dipakai coach, dan rapor yang bisa dibaca orang tua.

**Masalah inti:** latihan menghasilkan ratusan repetisi tiap sesi, tapi tidak ada yang tercatat. Evaluasi bulanan dibuat dari ingatan, dan orang tua membayar tanpa bukti perkembangan.

**Taruhan produk:** kalau mencatat satu drill menambah lebih dari 30 detik kerja coach, produk ini akan ditinggalkan dalam tiga minggu. Seluruh keputusan desain tunduk pada batasan itu.

---

## 2. Konteks Pilot

| Aspek | Kondisi |
|---|---|
| Akademi | Dynasty Basketball Academy, berdiri 2 Oktober 2022 |
| Lokasi | Wonderland Basketball Arena, Galuh Mas, Karawang |
| Jadwal | Selasa & Kamis, Sesi 1 (16.00–18.00), Sesi 2 (18.00–20.00) |
| Kelas | Toddler (4–6), Hoops (7–11), Girls (12–17), Boys (12–17) |
| Skala | 30–60 anak per sesi |
| Coach | 3–5 orang input bersamaan dari perangkat masing-masing |
| Tagline akademi | #BerprosesBersama |

**Implikasi yang mengikat:**

1. **Akademi menjalankan dua slot waktu per hari, tapi satu anak hanya ikut satu sesi.** Sesi dibedakan berdasarkan waktu mulai, bukan hanya tanggal, karena dua kelas berbeda bisa berlatih di hari yang sama. Tetapi satu pemain tidak pernah tercatat di dua sesi pada tanggal yang sama.

   Konsekuensinya: kehadiran dan latihan beruntun dihitung **per hari latihan**, bukan per sesi. Sistem menolak absensi ganda untuk pemain yang sama di tanggal yang sama, dan menampilkan peringatan jika terjadi.
2. **Kelompok umur bukan format U-angka.** DBA memakai nama kelas sendiri (Toddler, Hoops, Girls, Boys) dengan rentang usia yang tumpang tindih. Kelompok umur harus configurable, bukan enum.
3. **Rentang usia lebar dalam satu kelas.** Hoops mencakup 7–11 tahun. Normalisasi statistik harus berbasis usia individu, bukan hanya nama kelas.
4. **Kelas Toddler (4–6 tahun) tidak cocok untuk pencatatan drill numerik.** Untuk kelas ini, cukup absensi dan catatan naratif. Jangan paksakan statistik.

---

## 3. Pengguna

### 3.1 Coach (pengguna utama)

Memegang 10–15 anak per pos. Berdiri, memegang HP satu tangan, mata di lapangan. Jarang punya waktu menatap layar lebih dari dua detik.

**Yang dia butuhkan:** mencatat tanpa berpikir, tidak kehilangan data, dan bisa menjawab orang tua yang bertanya "anak saya bagaimana, coach?"

**Yang membuatnya berhenti pakai:** input lambat, data hilang, harus login ulang, aplikasi minta internet.

### 3.2 Player (7–17 tahun)

Membuka aplikasi di HP orang tua, biasanya sesudah latihan atau saat rapor terbit. Tidak akan membaca teks panjang.

**Yang dia butuhkan:** melihat dirinya berkembang, dan merasa dihitung.

**Yang menyakitinya:** tahu dirinya paling rendah di antara teman-temannya.

### 3.3 Admin / Head Academy

Mengelola roster, jadwal, dan memastikan program berjalan. Peduli pada retensi murid.

**Yang dia butuhkan:** tahu siapa yang mulai jarang datang, sebelum anak itu berhenti.

### 3.4 Parent (Fase 2)

Membayar bulanan. Ingin bukti anaknya berkembang.

---

## 4. Prinsip Produk

1. Lapangan dulu, baru data
2. Data parsial lebih baik daripada data lengkap yang berhenti
3. Offline adalah kondisi normal, bukan pengecualian
4. Tidak ada peringkat antar-anak yang terlihat oleh anak
5. Satu tangan, layar 6 inci, sambil berdiri
6. Semua output bisa dibagikan ke WhatsApp

---

## 5. Lingkup Rilis

| Fase | Isi | Durasi |
|---|---|---|
| **MVP** | Organisasi, roster, drill library, jadwal, absensi QR, pos & drill logging, kartu pemain sederhana, dashboard coach dasar | 5–7 minggu |
| **Fase 1** | Benchmark test, rubrik coach, match & box score, kartu pemain penuh, rapor + AI, export PDF | +6 minggu |
| **Fase 2** | Akses parent, notifikasi, portofolio publik | +5 minggu |
| **Fase 3** | Manajemen SPP, multi-akademi penuh | — |

**Kriteria lulus MVP:** satu coach memakai aplikasi secara mandiri selama 8 sesi berturut-turut tanpa diingatkan, dengan overhead di bawah 5 menit per sesi dan nol kehilangan data.

---

## 6. Kebutuhan Fungsional

Format: **[ID] Sebagai [peran], saya ingin [tujuan], agar [manfaat].**
AC = Acceptance Criteria. Semua AC harus terpenuhi sebelum story dianggap selesai.

---

### EPIC A — Organisasi & Roster (MVP)

**A1.** Sebagai admin, saya ingin membuat kelas latihan dengan nama dan rentang usia sendiri, agar sesuai penamaan akademi.

- AC1: Admin bisa membuat kelas dengan nama bebas dan rentang usia (min–maks)
- AC2: Rentang usia boleh tumpang tindih antar kelas
- AC3: Satu pemain bisa terdaftar di lebih dari satu kelas
- AC4: Kelas bisa dinonaktifkan tanpa menghapus data historisnya

**A2.** Sebagai admin, saya ingin mendaftarkan pemain beserta data dasarnya, agar bisa mulai dicatat.

- AC1: Wajib: nama lengkap, nama panggilan, tanggal lahir, kelas
- AC2: Opsional: foto, nomor punggung, posisi, tangan dominan, sekolah, kontak orang tua
- AC3: Nama panggilan wajib unik dalam satu kelas — ini yang muncul di layar lapangan
- AC4: Sistem menghitung usia otomatis dari tanggal lahir
- AC5: Impor massal via CSV tersedia
- AC6: Pendaftaran mencatat persetujuan orang tua (checkbox + tanggal + nama penyetuju)

**A3.** Sebagai admin, saya ingin mencatat data fisik pemain secara berkala, agar pertumbuhan terlihat.

- AC1: Tinggi, berat, wingspan, standing reach bisa dicatat berkali-kali dengan tanggal
- AC2: Riwayat tersimpan, tidak menimpa nilai sebelumnya
- AC3: Tren ditampilkan sebagai grafik garis

**A4.** Sebagai admin, saya ingin mencetak kartu QR pemain, agar absensi bisa dilakukan dengan scan.

- AC1: Sistem menghasilkan PDF siap cetak, 8 kartu per A4
- AC2: Tiap kartu berisi QR, foto, nama, nomor punggung, logo akademi
- AC3: QR minimum 25mm, error correction level M
- AC4: Kartu bisa dicetak ulang; token lama otomatis dicabut dan tidak berlaku lagi
- AC5: Ada daftar status kartu per pemain (aktif / dicabut / belum dicetak)

**A5.** Sebagai admin, saya ingin mengelola akun coach, agar mereka bisa login.

- AC1: Admin mengundang coach via email
- AC2: Coach ditugaskan ke satu atau lebih kelas
- AC3: Coach hanya melihat data kelas yang ditugaskan padanya
- AC4: Akun bisa dinonaktifkan

**A6.** Sebagai admin, saya ingin membuat akun login untuk pemain, agar anak bisa melihat kartunya.

- AC1: Login pemain memakai **username + PIN 6 digit**, bukan email
- AC2: Username dibuat otomatis dari nama, bisa diedit admin
- AC3: PIN bisa direset oleh admin atau coach
- AC4: Setelah 5 kali salah PIN, akun terkunci 15 menit

---

### EPIC B — Jadwal & Absensi (MVP)

**B1.** Sebagai admin, saya ingin membuat jadwal latihan berulang, agar tidak perlu membuat sesi manual tiap minggu.

- AC1: Jadwal berulang mingguan (contoh: Selasa & Kamis)
- AC2: **Beberapa sesi per hari didukung** untuk kelas berbeda, dibedakan oleh jam mulai
- AC2b: Satu pemain **tidak boleh** tercatat hadir di dua sesi pada tanggal yang sama; sistem menolak dan memberi peringatan
- AC3: Tiap sesi terikat ke satu kelas dan satu lokasi
- AC4: Sesi bisa dibatalkan dengan alasan, tanpa menghapus jadwal berulangnya

**B2.** Sebagai coach, saya ingin mengabsen dengan memindai kartu QR secara berurutan, agar 60 anak selesai cepat.

- AC1: Kamera tetap terbuka antar-scan; coach tidak menekan apa pun
- AC2: Setiap scan berhasil menampilkan **foto + nama** pemain selama ~1 detik, disertai getar dan bunyi
- AC3: Scan duplikat pemain yang sama tidak menambah data, dan diberi tanda "sudah absen"
- AC4: QR yang tidak dikenali menampilkan pesan yang menjelaskan langkah berikutnya
- AC5: **Validasi berjalan penuh offline** — tidak ada panggilan jaringan saat scan
- AC6: Kecepatan: 60 anak dalam ≤ 2 menit
- AC7: Daftar nama yang sudah absen terlihat dan bisa digulir

**B3.** Sebagai coach, saya ingin mengabsen manual, agar kartu yang ketinggalan tidak menghambat.

- AC1: Daftar nama dengan pencarian, tap untuk menandai hadir
- AC2: Status: Hadir, Terlambat, Izin, Sakit, Alfa
- AC3: Status bisa diubah kapan saja selama sesi berlangsung
- AC4: Pemain yang punya catatan drill otomatis dianggap hadir

**B4.** Sebagai coach, saya ingin melihat siapa yang belum datang, agar bisa menindaklanjuti.

- AC1: Hitungan hadir / total terlihat sepanjang sesi
- AC2: Daftar yang belum absen bisa dibuka satu tap

---

### EPIC C — Pos & Drill Logging (MVP, inti produk)

**C1.** Sebagai coach kepala, saya ingin membagi anak ke beberapa pos, agar tiap coach hanya memegang kelompoknya.

- AC1: Pembagian otomatis merata, bisa diubah manual
- AC2: Jumlah pos bisa diatur (1–8)
- AC3: Tiap coach memilih pos yang dia pegang
- AC4: Tombol "Rotasi" menggeser semua kelompok satu pos, dengan konfirmasi
- AC5: Coach kepala bisa melihat progres semua pos secara realtime
- AC6: Sesi tetap bisa berjalan tanpa pos (mode satu coach)

**C2.** Sebagai coach, saya ingin memulai drill dalam beberapa ketukan, agar tidak menahan anak-anak.

- AC1: Pilih drill dari daftar, dengan drill terakhir dipakai muncul di atas
- AC2: Target repetisi per anak terisi otomatis dari template, bisa diubah
- AC3: Toggle "lacak meleset" default **mati**
- AC4: Dari layar sesi ke layar input: ≤ 3 ketukan, ≤ 10 detik

**C3.** Sebagai coach, saya ingin mencatat repetisi dengan satu ketukan per anak, agar mata saya tetap di lapangan.

- AC1: Grid kartu menampilkan hanya anak di pos tersebut
- AC2: Urutan kartu **tetap**, tidak berpindah saat angka berubah
- AC3: Mode default: satu ketukan pada kartu = +1 masuk
- AC4: Mode lacak meleset: zona ✓ dan ✗ terpisah, ✓ lebih lebar, ✓ selalu di kiri
- AC5: Umpan balik: getar + perubahan angka dalam ≤ 100ms
- AC6: Angka berjalan terlihat di tiap kartu
- AC7: Penanda visual untuk anak yang repetisinya tertinggal, **tanpa memindahkan kartu**
- AC8: Anak bisa ditandai "tidak ikut drill ini" (DNP) — 0 tidak sama dengan tidak ikut
- AC9: **Undo tersedia terus-menerus**, menampilkan aksi terakhir dan bisa dibatalkan
- AC10: Layar tidak mati selama drill berjalan

**C4.** Sebagai coach, saya ingin mencatat drill berbasis waktu, agar tes kecepatan dan stamina bisa masuk.

- AC1: Timer dengan tombol start/stop berukuran besar
- AC2: Tombol lap mencatat waktu per anak
- AC3: Waktu bisa dikoreksi manual setelahnya

**C5.** Sebagai coach, saya ingin memeriksa hasil sebelum menyimpan, agar salah catat bisa diperbaiki.

- AC1: Semua angka bisa diedit manual di layar review
- AC2: Anak dengan 0 repetisi ditandai untuk dikonfirmasi
- AC3: Coach bisa mengubah jumlah percobaan (penyebut)
- AC4: Menyimpan tidak memerlukan internet

**C6.** Sebagai coach, saya ingin mencatat tanpa internet, agar sinyal GOR tidak menghambat.

- AC1: Semua fungsi sesi berjalan penuh offline
- AC2: Data tersimpan lokal seketika, sebelum dikirim
- AC3: Sesi berjalan pulih utuh setelah aplikasi ditutup atau HP mati
- AC4: Pengiriman otomatis saat koneksi kembali, tanpa aksi coach
- AC5: Status ditampilkan netral saat offline, **bukan sebagai error**
- AC6: Dua coach mencatat bersamaan tidak saling menimpa data

**C7.** Sebagai coach, saya ingin mencatat semua hasil setelah latihan, sebagai cadangan saat sesi terlalu ramai.

- AC1: Mode input massal: daftar nama dengan kolom angka
- AC2: Bisa dipakai kapan saja, termasuk setelah sesi ditutup (maksimal 7 hari)

---

### EPIC D — Kartu Pemain (MVP dasar, Fase 1 penuh)

**D1.** Sebagai pemain, saya ingin melihat perkembangan saya sendiri, agar tahu saya membaik.

- AC1: Login langsung membuka kartu pemain, tanpa menu perantara
- AC2: Menampilkan: foto, nama, nomor, kelas, latihan beruntun, statistik terbaru
- AC3: Setiap statistik ditampilkan bersama perbandingan periode sebelumnya
- AC4: **Tidak ada angka overall, peringkat, persentil, atau data pemain lain — dalam bentuk apa pun**
- AC5: Pemain hanya bisa mengakses datanya sendiri, ditegakkan di level database

**D2.** Sebagai pemain, saya ingin melihat rekor kehadiran beruntun dan lencana, agar termotivasi datang lagi.

- AC1: Latihan beruntun dihitung dari sesi hadir berturut-turut di kelasnya
- AC2: Beruntun putus jika Alfa; **tidak putus** jika Izin atau Sakit
- AC3: Lencana diberikan otomatis saat ambang tercapai
- AC4: Lencana berbasis akumulasi dan konsistensi, bukan perbandingan dengan anak lain
- AC5: Lencana baru ditampilkan sekali saat pertama dibuka

**D3.** Sebagai pemain, saya ingin melihat tipe pemain saya, agar punya identitas.

- AC1: Archetype dihitung dari pola statistik (Slasher, Shooter, Playmaker, Rim Protector, Glue Guy, Motor)
- AC2: Archetype bersifat deskriptif — tidak ada yang lebih tinggi dari yang lain
- AC3: Perlu minimal 8 sesi tercatat sebelum archetype muncul
- AC4: Coach bisa mengunci archetype secara manual jika tidak sesuai

**D4.** Sebagai pemain, saya ingin melihat bentuk kemampuan saya, agar tahu bagian mana yang tumbuh.

- AC1: Radar 6 atribut: Shooting, Finishing, Ballhandling, Defense, Athleticism, Attitude
- AC2: **Ditampilkan tanpa angka** — hanya bentuk
- AC3: Bentuk periode sebelumnya ditampilkan sebagai pembanding
- AC4: Atribut dinormalisasi terhadap kelompok usia, tapi hasil normalisasi tidak pernah ditampilkan ke pemain

---

### EPIC E — Dashboard Coach (MVP dasar, Fase 1 penuh)

**E1.** Sebagai coach, saya ingin melihat kondisi kelas saya dalam satu layar.

- AC1: Kehadiran minggu ini dan trennya
- AC2: Daftar pemain yang perlu perhatian
- AC3: Distribusi drill: kategori yang sering dan yang terabaikan
- AC4: Sesi terakhir beserta ringkasannya

**E2.** Sebagai coach, saya ingin membuka halaman satu pemain, agar bisa mengevaluasi.

- AC1: Tren tiap drill dalam grafik garis
- AC2: Riwayat kehadiran
- AC3: Riwayat catatan dan rubrik
- AC4: Perbandingan dengan rata-rata kelompok usia (hanya untuk coach)
- AC5: Angka atribut 0–100 terlihat di sini, dan hanya di sini

**E3.** Sebagai coach, saya ingin diberi tahu saat ada yang perlu ditindaklanjuti.

- AC1: Peringatan saat pemain tidak hadir 3 sesi berturut-turut
- AC2: Peringatan saat performa turun 3 periode berturut-turut
- AC3: Peringatan bisa ditandai selesai

---

### EPIC F — Benchmark Test (Fase 1)

**F1.** Sebagai coach, saya ingin menjalankan sesi tes berkala, agar punya data terukur dan bersih.

- AC1: Sesi bertipe "tes" berisi kumpulan tes terukur
- AC2: Battery standar tersedia: sprint 3/4 lapangan, lane agility, beep test, vertical jump, free throw 25, spot shooting 5 titik, antropometri
- AC3: Hasil disimpan dengan satuan dan tanggal
- AC4: Tren lintas periode ditampilkan sebagai grafik
- AC5: Perbandingan terhadap kelompok usia tersedia untuk coach

---

### EPIC G — Rubrik & Catatan (Fase 1)

**G1.** Sebagai coach, saya ingin menilai sikap beberapa anak di akhir sesi, agar aspek non-teknis ikut tercatat.

- AC1: Sistem menyodorkan **5 anak** yang dirotasi otomatis, memastikan pemerataan dalam ~4 sesi
- AC2: Tiga dimensi: Effort, Coachability, Disiplin
- AC3: Skala 1–5 berupa tombol besar
- AC4: Coach boleh menambah anak lain, tapi tidak diwajibkan
- AC5: Seluruh proses selesai dalam ≤ 60 detik
- AC6: Rubrik bisa dilewati tanpa memblokir penutupan sesi

**G2.** Sebagai coach, saya ingin menulis catatan sesi dan catatan per pemain.

- AC1: Catatan sesi berupa teks bebas, mendukung dikte suara
- AC2: Catatan per pemain bisa ditambahkan kapan saja
- AC3: Catatan ditandai sebagai apresiasi atau area perbaikan
- AC4: Catatan otomatis masuk ke bahan rapor periode berjalan

---

### EPIC H — Match & Box Score (Fase 1)

**H1.** Sebagai admin, saya ingin menjadwalkan pertandingan.

- AC1: Tipe: persahabatan, turnamen, internal
- AC2: Data: lawan, tanggal, lokasi, kelas yang bertanding
- AC3: Roster pemain yang dibawa bisa ditentukan
- AC4: Pertandingan mendatang terlihat oleh pemain di kartunya

**H2.** Sebagai coach, saya ingin mencatat box score pertandingan.

- AC1: Statistik: menit, poin, FGM/FGA, 3PM/3PA, FTM/FTA, rebound (off/def), assist, steal, block, turnover, foul
- AC2: Input bisa dilakukan setelah pertandingan selesai
- AC3: Tidak semua kolom wajib diisi — data parsial diterima
- AC4: Hasil akhir dan catatan tim bisa dicatat
- AC5: Total tim dihitung otomatis dari statistik individu

**H3.** Sebagai pemain, saya ingin melihat statistik pertandingan saya.

- AC1: Riwayat pertandingan terlihat di kartu pemain
- AC2: Statistik latihan dan pertandingan ditampilkan **terpisah**, tidak dicampur
- AC3: Statistik pertandingan tetap berkontribusi ke atribut, dengan bobot lebih tinggi

---

### EPIC I — Rapor & AI (Fase 1)

**I1.** Sebagai coach, saya ingin rapor bulanan tersusun otomatis, agar tidak menulis 60 rapor manual.

- AC1: Rapor dibuat massal untuk satu kelas dalam satu periode
- AC2: Isi: ringkasan kehadiran, tren atribut, 3 hal terbaik, 2 area pengembangan, catatan coach, saran latihan mandiri, archetype
- AC3: Draf narasi dihasilkan AI dalam Bahasa Indonesia
- AC4: **Rapor berstatus draf sampai coach menyetujuinya**
- AC5: Coach bisa mengedit seluruh teks sebelum menyetujui
- AC6: Rapor yang belum disetujui tidak terlihat oleh pemain maupun orang tua
- AC7: Waktu review per pemain ≤ 5 menit

**I2.** Sebagai coach, saya ingin mengekspor rapor untuk dibagikan.

- AC1: Ekspor PDF A4, satu halaman per pemain
- AC2: Ekspor gambar untuk dibagikan ke WhatsApp
- AC3: Kop memakai logo dan warna akademi
- AC4: Terbaca saat dicetak hitam-putih

**I3.** Sebagai pemain, saya ingin membaca rapor saya.

- AC1: Rapor yang disetujui muncul di kartu pemain
- AC2: Rapor lama tetap bisa dibuka
- AC3: Nada rapor: kemajuan disebut sebelum kekurangan, kekurangan ditulis sebagai langkah berikutnya

---

## 7. Aturan Bisnis

### 7.1 Perhitungan atribut

- Skala internal 0–100, dihitung ulang tiap akhir periode
- Nilai dinormalisasi terhadap kelompok usia (bukan nama kelas), memakai persentil
- Tiap drill punya bobot kontribusi ke satu atau lebih atribut, diatur di template drill
- Perlu minimal 3 titik data dalam periode agar atribut dihitung; jika kurang, nilai periode sebelumnya dipertahankan dan ditandai "data belum cukup"
- Statistik pertandingan berbobot 1,5× statistik latihan
- Atribut Attitude bersumber dari kehadiran (40%), latihan beruntun (20%), dan rubrik (40%)

### 7.2 Latihan beruntun

- Bertambah tiap **hari latihan** dengan status Hadir atau Terlambat (bukan per sesi)
- Putus oleh status Alfa
- **Tidak putus** oleh Izin atau Sakit — anak tidak dihukum karena sakit
- Sesi yang dibatalkan akademi tidak memengaruhi beruntun

### 7.3 Visibilitas data

| Data | Player | Coach | Admin | Parent (F2) |
|---|:--:|:--:|:--:|:--:|
| Statistik mentah sendiri | ✅ | ✅ | ✅ | ✅ |
| Bentuk radar (tanpa angka) | ✅ | ✅ | ✅ | ✅ |
| Angka atribut 0–100 | ❌ | ✅ | ✅ | ❌ |
| Persentil / peringkat | ❌ | ✅ | ✅ | ❌ |
| Data pemain lain | ❌ | ✅ | ✅ | ❌ |
| Rapor draf | ❌ | ✅ | ✅ | ❌ |
| Rapor disetujui | ✅ | ✅ | ✅ | ✅ |

### 7.4 Retensi data

- Data sesi tidak pernah dihapus otomatis
- Pemain yang keluar diarsipkan, datanya tetap tersimpan
- Penghapusan data atas permintaan orang tua diproses manual oleh admin, dengan pencatatan

---

## 8. Kebutuhan Non-Fungsional

### 8.1 Performa

| Aksi | Target |
|---|---|
| Umpan balik ketukan repetisi | ≤ 100ms |
| Buka aplikasi sampai siap pakai (offline) | ≤ 2 detik |
| Absensi 60 anak via scan | ≤ 2 menit |
| Setup drill | ≤ 10 detik |
| **Overhead coach per sesi (4 drill)** | **≤ 5 menit** |
| Ukuran bundle awal | ≤ 250KB gzip |

### 8.2 Keandalan

- Nol kehilangan data adalah syarat mutlak, bukan target
- Semua fungsi sesi berjalan penuh offline
- Sesi berjalan pulih utuh setelah aplikasi tertutup paksa
- Pengiriman ulang bersifat idempoten — data tidak menggandakan diri

### 8.3 Perangkat

- Android kelas menengah, Chrome, layar 6 inci
- Dukungan minimum: Android 10, iOS 15
- Bisa dipasang sebagai PWA
- Berfungsi di bawah cahaya terang

### 8.4 Aksesibilitas

- Kontras teks minimal 4.5:1
- Target sentuh minimal 48px
- Warna tidak pernah menjadi satu-satunya penanda makna
- `prefers-reduced-motion` dihormati

### 8.5 Privasi

- Persetujuan orang tua dicatat sebelum data anak diproses
- Portofolio publik default mati, dan tidak tersedia untuk pemain di bawah 13 tahun
- Foto disimpan di penyimpanan privat dengan URL bertanda tangan
- Akses data ditegakkan di level database, bukan di antarmuka

---

## 9. Metrik Keberhasilan

| Metrik | Target | Cara ukur |
|---|---|---|
| Sesi tercatat / sesi terjadwal | > 80% | Data sistem |
| Overhead coach per sesi | < 5 menit | Selisih waktu sesi dibuka–ditutup |
| Coach aktif setelah 8 minggu | 100% | Data sistem |
| Pemain login ≥ 1×/minggu | > 50% | Data sistem |
| Rapor terbit tepat waktu | 100% | Data sistem |
| Kehilangan data | 0 | Audit log |

Metrik overhead dan kehilangan data adalah penentu. Sisanya mengikuti.

---

## 10. Di Luar Lingkup

Analisis video, integrasi wearable, live scoring realtime, aplikasi native, marketplace, multi-cabang olahraga (arsitektur disiapkan, implementasi ditunda).

---

## 11. Risiko

| Risiko | Mitigasi |
|---|---|
| Coach berhenti input setelah 3 minggu | Overhead <5 menit, mode massal, tidak wajib lengkap, pendampingan langsung di 4 sesi pertama |
| Sinyal GOR mati | Offline-first sejak MVP |
| Data tertimpa antar-coach | Model event append-only dengan kunci idempotensi |
| Orang tua toxic soal angka | Tidak ada overall/peringkat yang terlihat; rapor fokus tren pribadi |
| AI menghasilkan narasi keliru | Wajib persetujuan coach sebelum terbit |
| Scope creep | MVP dikunci; fitur baru tidak dikerjakan sebelum kriteria lulus tercapai |

---

## 12. Pertanyaan Terbuka

1. Apakah kelas Toddler ikut dicatat statistiknya, atau cukup absensi dan catatan naratif?
2. Warna resmi DBA dalam kode hex

**Sudah terjawab:**
- Satu pemain hanya ikut satu sesi per hari. Satu sesi berisi banyak drill.
- Drill preset: dipakai 18 drill umum dulu (`08-seed-data.sql`), disesuaikan dengan Coach Ferdianka setelah pilot berjalan.
- Logo: placeholder tersedia, tidak memblokir implementasi.
