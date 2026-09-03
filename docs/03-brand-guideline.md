# Brand Guideline & Design System

**Status:** Draft v2 untuk review
**Berlaku untuk:** aplikasi web/PWA, rapor PDF, kartu QR cetak, materi pitch

> **Lingkup dokumen ini.** Ini adalah **batasan dan token**, bukan desain UI. Isinya menetapkan hal-hal yang kalau dilanggar akan membuat produk gagal dipakai di lapangan: kontras, ukuran sentuh, keterbacaan angka, dan aturan warna. Bentuk layar, komposisi, karakter visual, dan detail estetika dikerjakan terpisah di tahap desain UI, dengan kebebasan penuh selama batasan di sini terpenuhi.

---

## 1. Nama & Positioning

**Nama kerja: Ballin**

"Ballin" adalah kata yang sudah dipakai anak basket sehari-hari, terdengar akrab, dan tidak terasa seperti nama software. Kelebihannya: mudah diingat, cocok untuk audiens anak SMP–SMA, dan tidak bernada korporat.

Dua hal yang perlu disadari sejak sekarang:
- Nama ini **terkunci ke basket**. Kalau nanti masuk futsal atau bulutangkis, nama ini akan jadi beban. Tidak masalah untuk pilot, tapi catat sebagai keputusan yang mungkin ditinjau ulang.
- Ejaannya perlu dipastikan konsisten: **Ballin** (tanpa apostrof). "Ballin'" akan menyulitkan pencarian, domain, dan penulisan di dokumen resmi.

### Kepribadian merek

| Ya | Tidak |
|---|---|
| Tenang, jelas, bisa diandalkan | Riuh, penuh seruan, hype |
| Sportif tapi tidak macho | Estetika gym/fitness bro |
| Ramah anak tanpa kekanak-kanakan | Kartun, warna pastel, maskot lucu |
| Angka sebagai bintang utama | Ilustrasi dekoratif |

Produk ini dipakai sambil berdiri di lapangan panas, satu tangan, sambil mengawasi 12 anak. Semua keputusan visual tunduk pada itu.

---

## 2. Konsep Visual: Papan Skor

Bahasa visual diambil dari **papan skor GOR**, bukan dari dashboard SaaS.

Alasannya fungsional, bukan selera: papan skor memang dirancang untuk dibaca sekilas, dari jauh, di bawah lampu terang. Itu persis kondisi pemakaian aplikasi ini. Cirinya — latar gelap pekat, angka besar bercahaya, kontras ekstrem, tanpa dekorasi — semuanya kebetulan adalah solusi untuk masalah kita.

### Dua permukaan, dua kepribadian

Produk ini punya dua konteks pemakaian yang sangat berbeda, jadi punya dua tema:

**Field (gelap)** — dipakai di lapangan: absensi, input drill, timer.
Latar gelap pekat, angka raksasa, tombol besar. Hemat baterai, tidak menyilaukan di GOR remang, dan tetap terbaca di bawah matahari.

**Report (terang)** — dipakai di luar lapangan: dashboard coach, rapor, halaman orang tua, PDF.
Latar terang, tipografi lebih tenang, ruang untuk grafik dan narasi. Ini yang dibaca sambil duduk.

Keduanya berbagi tipografi, warna aksen, dan bahasa yang sama — yang berbeda hanya permukaan dan kepadatannya. Ini bukan sekadar "dark mode"; ini dua mode kerja.

---

## 3. Palet Warna

### Tema Field (lapangan)

| Token | Hex | Pakai untuk |
|---|---|---|
| `field-bg` | `#0D1520` | Latar utama |
| `field-surface` | `#15202E` | Kartu, panel |
| `field-raised` | `#1E2B3B` | Kartu aktif, elemen menonjol |
| `field-border` | `#2A3A4D` | Garis pemisah, outline |
| `field-text` | `#F2F6FA` | Teks utama |
| `field-text-2` | `#9BAABC` | Teks sekunder |
| `field-text-3` | `#64768A` | Teks samar, placeholder |

### Tema Report (laporan)

| Token | Hex | Pakai untuk |
|---|---|---|
| `report-bg` | `#EDF0F3` | Latar utama |
| `report-surface` | `#FFFFFF` | Kartu, panel |
| `report-border` | `#D6DDE4` | Garis pemisah |
| `report-text` | `#101A26` | Teks utama |
| `report-text-2` | `#4C5D70` | Teks sekunder |
| `report-text-3` | `#7C8CA0` | Teks samar |

Latar terang sengaja **abu kebiruan dingin**, bukan krem hangat. Krem sedang jadi default di mana-mana, dan warna dingin lebih cocok berdampingan dengan permukaan gelap tema Field.

### Warna aksi & makna

| Token | Hex | Arti | Catatan |
|---|---|---|---|
| `leather` | `#EE6A1E` | Aksi utama, identitas merek | Diambil dari warna kulit bola. Teks di atasnya **harus gelap** (`#101A26`), bukan putih — putih tidak lolos kontras. |
| `leather-deep` | `#C9540F` | Status ditekan | |
| `leather-tint` | `#FFE7D6` | Latar sorotan di tema terang | |
| `made` | `#17B26A` | Masuk, berhasil, hadir | |
| `miss` | `#E5484D` | Meleset, alfa, peringatan | |
| `gold` | `#F4B740` | Rekor hadir, lencana, pencapaian | Hanya untuk perayaan. Jangan dipakai sebagai warna netral. |
| `focus` | `#5AA9FF` | Cincin fokus keyboard | |

**Aturan warna yang mengikat:**

1. **Hijau dan merah tidak boleh berdiri sendiri.** Sekitar 8% coach laki-laki kesulitan membedakannya. Setiap kali warna dipakai untuk menandai masuk/meleset, wajib disertai **simbol** (✓ / ✗) dan **posisi tetap** (masuk selalu di kiri, meleset selalu di kanan). Angka `8/10` juga selalu ditampilkan.
2. **Oranye hanya untuk aksi utama dan identitas** — jangan dipakai sebagai warna data, nanti bertabrakan makna dengan tombol.
3. **Emas hanya untuk pencapaian.** Kalau dipakai di mana-mana, lencana kehilangan artinya.

### Palet grafik

Untuk grafik tren dan radar, urut dari yang pertama dipakai:

`#EE6A1E` · `#1FA9C4` · `#7A5AF8` · `#17B26A` · `#F4B740` · `#E5484D`

Untuk grafik satu-seri (paling sering), gunakan `#1FA9C4` — bukan oranye, agar garis data tidak tertukar dengan tombol aksi.

---

## 4. Tipografi

Dua keluarga, dibedakan jelas oleh lebar hurufnya.

### Archivo — angka & judul

Dipakai untuk semua **angka**, judul layar, dan nama pemain di kartu. Gunakan sumbu lebar `Expanded` untuk angka besar; huruf yang melebar terbaca lebih cepat dari jarak jauh, seperti papan skor.

Selalu aktifkan **tabular numerals** (`font-variant-numeric: tabular-nums`) agar angka tidak bergeser saat berubah dari 9 ke 10 — penting karena angka ini berubah tiap detik saat drill.

### Instrument Sans — antarmuka & teks

Dipakai untuk label, tombol, paragraf, dan isi rapor. Humanis, sedikit lebih hangat dari grotesque standar, dan tidak terlihat seperti font bawaan dashboard.

Alternatif jika perlu font sistem: `system-ui` untuk UI, dan angka tetap Archivo.

### Skala

| Peran | Ukuran | Font | Bobot | Catatan |
|---|---|---|---|---|
| Angka raksasa | 56px | Archivo Expanded | 700 | Skor drill di layar input |
| Angka besar | 40px | Archivo Expanded | 700 | Statistik di kartu pemain |
| Angka kartu | 28px | Archivo Expanded | 600 | Counter per anak di grid |
| Judul layar | 24px | Archivo | 600 | |
| Nama pemain (lapangan) | 20px | Archivo | 600 | Minimum agar terbaca sambil berdiri |
| Judul bagian | 18px | Instrument Sans | 600 | |
| Teks utama | 16px | Instrument Sans | 400 | **Minimum absolut di layar lapangan** |
| Teks kecil | 14px | Instrument Sans | 400 | Hanya di tema Report |
| Keterangan | 12px | Instrument Sans | 500 | Hanya di tema Report, tidak pernah untuk info penting |

**Aturan tipografi:**
- **Tidak ada label HURUF BESAR SEMUA.** Gunakan sentence case di seluruh produk. Huruf kapital semua lebih lambat dibaca dan terasa seperti template.
- Panjang baris teks rapor maksimal 70 karakter.
- Tinggi baris: 1.2 untuk angka dan judul, 1.6 untuk paragraf rapor.
- Di layar lapangan tidak boleh ada teks di bawah 16px. Sama sekali.

---

## 5. Bentuk, Jarak, dan Ukuran Sentuh

### Jarak

Basis 4px. Skala: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`.
Layar lapangan pakai jarak lebih longgar (minimum 12px antar tombol) supaya tidak salah tap. Layar rapor boleh lebih padat.

### Sudut membulat

Radius mengkodekan hierarki, bukan dekorasi:

| Elemen | Radius |
|---|---|
| Kartu pemain di grid input | 14px |
| Tombol aksi utama | 12px |
| Panel & kartu di tema Report | 8px |
| Chip, lencana, status | penuh (999px) |
| Grafik, tabel | 0 |

Jangan pakai satu radius untuk semua. Perbedaannya membantu mata memisahkan "ini bisa ditekan" dari "ini informasi".

### Ukuran sentuh

| Konteks | Minimum |
|---|---|
| Tombol apa pun | 48 × 48px |
| Kartu pemain di grid input | 80px tinggi |
| Tombol aksi utama di lapangan | 88px tinggi |
| Jarak antar target di lapangan | 12px |

**Zona jempol:** semua aksi utama diletakkan di **60% bawah layar**. Bagian atas hanya untuk informasi. Coach memegang HP satu tangan sambil memegang bola atau peluit.

### Bayangan

Nyaris tidak dipakai. Tema Field memisahkan lapisan dengan **perbedaan terang permukaan**, bukan bayangan — bayangan tidak terlihat di latar gelap dan hanya menambah beban render. Tema Report boleh memakai satu bayangan halus untuk elemen mengambang (modal, toast).

---

## 6. Batasan Komponen (bukan layout final)

Bagian ini menetapkan **apa yang tidak boleh dilanggar**, bukan bagaimana layar harus terlihat. Bentuk, komposisi, dan karakter visual diserahkan ke tahap desain UI — selama batasan di bawah terpenuhi.

### Kartu pemain di grid input

Elemen paling sering disentuh di seluruh produk.

**Wajib:** nama panggilan minimal 20px · angka berjalan dengan tabular numerals · seluruh kartu adalah target sentuh · tinggi minimal 80px · penanda status (tertinggal rep / tidak ikut) yang tidak mengandalkan warna saja.

**Saat mode lacak meleset aktif:** zona ✓ lebih lebar dari zona ✗ (sekitar 60/40). Tembakan masuk lebih sering ditekan, dan zona lebih besar mengurangi salah tap. Posisi tetap: masuk selalu di kiri.

**Umpan balik saat ditekan:** getar + perubahan pada angka. **Jangan** mengandalkan perubahan warna latar saja — coach tidak sedang melihat layar saat menekan.

### Overlay konfirmasi scan

**Wajib:** foto pemain berukuran besar sebagai elemen dominan · nama · waktu absen · getar dan bunyi pendek · tampil sekitar 1 detik lalu kembali ke kamera tanpa aksi coach.

Foto adalah elemen terpenting di layar ini, bukan tanda centang. Coach membandingkan wajah anak di depannya dengan foto di layar — ini satu-satunya pengaman terhadap titip absen.

### Kartu pemain (untuk anak)

**Wajib ada:** archetype, bentuk perkembangan (radar atau bentuk lain) dibanding dirinya sendiri di periode lalu, latihan beruntun, statistik mentah, rekor pribadi.

**Dilarang keras:** angka overall · peringkat · persentil · perbandingan dengan anak lain dalam bentuk apa pun.

Ini layar yang paling boleh punya karakter visual kuat — satu-satunya layar yang dilihat anak, dan satu-satunya tempat merek boleh tampil berani.

### Status koneksi

**Wajib:** selalu terlihat saat sesi berjalan.

- Tersimpan lokal → **netral, tanpa alarm.** Ini kondisi normal.
- Sedang mengirim → warna aksi
- Selesai terkirim → hijau, hilang sendiri

**Dilarang:** ikon offline berwarna merah atau bahasa kegagalan. Offline adalah kondisi yang diharapkan; menampilkannya sebagai error akan membuat coach mengira aplikasinya rusak dan berhenti memakainya.

---

## 7. Gerak

Gerak hanya dipakai untuk **menjawab tindakan orang**, tidak pernah sebagai dekorasi.

| Momen | Durasi | Efek |
|---|---|---|
| Tap +1 | 120ms | Angka membesar sesaat, getar |
| Scan berhasil | 150ms | Overlay masuk cepat, getar + bunyi pendek |
| Undo | 150ms | Angka mengecil kembali |
| Rotasi pos | 250ms | Geser horizontal, menjelaskan apa yang berpindah |
| Rapor terbit | sekali | Satu momen kecil, hanya di layar anak |

**Tidak boleh ada:** animasi masuk saat scroll, transisi hover di setiap kartu, gradient bergerak, skeleton berkilau berkepanjangan.

`prefers-reduced-motion` dihormati sepenuhnya: semua diganti transisi opacity 0ms–100ms.

---

## 8. Bahasa & Nada

Bahasa Indonesia, sentence case, kalimat aktif, tanpa basa-basi.

### Kosakata baku

Satu istilah untuk satu hal, konsisten di seluruh produk:

| Pakai | Jangan pakai |
|---|---|
| Latihan | Sesi, training |
| Absen | Kehadiran, presensi, check-in |
| Drill | Latihan, exercise |
| Pos | Station, pos latihan |
| Rapor | Laporan, report card |
| Kartu pemain | Profil, player card |
| Latihan beruntun | Streak |
| Lencana | Badge, achievement |
| Rekor pribadi | Personal best, PB |

### Tombol

Tombol menyebut apa yang akan terjadi, dan kata itu tidak berubah sepanjang alur.

| Ya | Tidak |
|---|---|
| Mulai latihan | Submit |
| Simpan hasil drill | OK |
| Kirim rapor | Publish |
| Batalkan | Undo |

Tombol "Kirim rapor" menghasilkan pesan "Rapor terkirim" — kata kerjanya sama.

### Layar kosong dan error

Layar kosong adalah ajakan, bukan pengumuman.

- Kosong: "Belum ada drill di latihan ini. Pilih drill untuk mulai mencatat."
- Error: "Kartu tidak dikenali. Kartu mungkin sudah dicabut — absen manual dari daftar nama."

Error menjelaskan apa yang terjadi dan apa yang bisa dilakukan. Error tidak minta maaf dan tidak pernah kabur.

### Nada di rapor

Rapor dibaca anak dan orang tua. Aturannya:
- Sebut kemajuan sebelum kekurangan
- Bandingkan anak dengan dirinya sendiri, tidak pernah dengan temannya
- Kekurangan ditulis sebagai langkah berikutnya, bukan penilaian
  - Ya: "Layup tangan kiri masih 3 dari 10. Bulan depan fokus ke sana."
  - Tidak: "Layup tangan kiri lemah."

---

## 9. Aset Cetak

### Kartu QR pemain

Ukuran kartu member standar (85 × 54mm), lanskap, dilaminasi.

```
┌────────────────────────────────┐
│ [logo akademi]        ▛▚▞▘▙    │
│                       ▞▘▚▛▖    │  ← QR minimum 25mm
│  [foto]               ▙▚▘▞▛    │
│                                │
│  ANDI PRATAMA                  │  ← Archivo Expanded
│  #7 · U14 Putra                │
└────────────────────────────────┘
```

- QR minimum 25mm agar terbaca dari jarak 20–30cm oleh kamera HP kelas menengah
- Error correction level **M** (bukan H — QR jadi terlalu padat dan lambat dibaca)
- Kontras tinggi: hitam pekat di putih. Jangan pakai QR berwarna atau di atas foto
- Nama dan nomor dicetak besar agar kartu tetap berguna saat kamera bermasalah

### Rapor PDF

- A4, satu halaman per anak
- Tema Report, latar putih penuh untuk hemat tinta
- Grafik memakai warna, tapi tetap terbaca kalau dicetak hitam-putih (bedakan juga dengan pola garis)
- Kop berisi logo akademi, bukan logo produk — akademi yang menyerahkan rapor ke orang tua, bukan kita

---

## 10. Standar Kualitas Minimum

Setiap layar harus lolos ini sebelum dianggap selesai:

- [ ] Kontras teks minimal 4.5:1, teks besar 3:1
- [ ] Semua target sentuh ≥ 48px, aksi utama di 60% bawah layar
- [ ] Bisa dioperasikan dengan keyboard, cincin fokus terlihat jelas
- [ ] `prefers-reduced-motion` dihormati
- [ ] Warna tidak pernah jadi satu-satunya penanda makna
- [ ] Terbaca di layar HP kelas menengah, di bawah cahaya terang
- [ ] Layar kosong punya ajakan tindakan
- [ ] Bekerja penuh tanpa internet

---

## 11. Token Siap Pakai

```css
:root {
  /* Field */
  --field-bg: #0D1520;
  --field-surface: #15202E;
  --field-raised: #1E2B3B;
  --field-border: #2A3A4D;
  --field-text: #F2F6FA;
  --field-text-2: #9BAABC;
  --field-text-3: #64768A;

  /* Report */
  --report-bg: #EDF0F3;
  --report-surface: #FFFFFF;
  --report-border: #D6DDE4;
  --report-text: #101A26;
  --report-text-2: #4C5D70;
  --report-text-3: #7C8CA0;

  /* Aksi & makna */
  --leather: #EE6A1E;
  --leather-deep: #C9540F;
  --leather-tint: #FFE7D6;
  --on-leather: #101A26;
  --made: #17B26A;
  --miss: #E5484D;
  --gold: #F4B740;
  --focus: #5AA9FF;

  /* Slot warna akademi — diatur per akademi */
  --academy-primary: #EE6A1E;

  /* Grafik */
  --chart-1: #EE6A1E;
  --chart-2: #1FA9C4;
  --chart-3: #7A5AF8;
  --chart-4: #17B26A;
  --chart-5: #F4B740;
  --chart-6: #E5484D;

  /* Tipografi */
  --font-display: "Archivo", system-ui, sans-serif;
  --font-ui: "Instrument Sans", system-ui, sans-serif;

  /* Jarak */
  --sp-1: 4px;  --sp-2: 8px;  --sp-3: 12px; --sp-4: 16px;
  --sp-5: 24px; --sp-6: 32px; --sp-7: 48px; --sp-8: 64px;

  /* Radius */
  --r-card: 14px;
  --r-button: 12px;
  --r-panel: 8px;
  --r-chip: 999px;

  /* Sentuh */
  --touch-min: 48px;
  --touch-card: 80px;
  --touch-primary: 88px;
}
```

---

## 12. Logo

Logo placeholder tersedia dalam dua bentuk:

| File | Pakai untuk |
|---|---|
| `09-logo-icon-placeholder.svg` | Ikon aplikasi, favicon, PWA icon, avatar |
| `10-logo-lockup-placeholder.svg` | Header, kop dokumen, materi presentasi |

**Konsep:** bola dengan seam, tapi seam horizontalnya diganti garis menanjak — bacaannya "bola" sekaligus "naik".

**Batasan placeholder:**
- Wordmark masih memakai font sistem. Untuk logo final, teks **wajib** dikonversi jadi path agar tidak bergantung pada font yang terpasang.
- Belum ada varian monokrom dan varian untuk latar gelap.
- Ruang aman dan ukuran minimum belum ditetapkan.

Logo ini cukup untuk pilot dan demo. Jangan dipakai untuk materi cetak resmi sebelum diselesaikan desainer.

---

## 13. Yang Perlu Diputuskan

1. **Warna Dynasty.** Palet di dokumen ini masih palet produk, belum menyesuaikan akademi pilot. Perlu kode hex atau file logo asli dari tim Dynasty.
2. Apakah logo akademi menggantikan logo produk di rapor dan kartu QR (white-label parsial)?
3. Ejaan final: **Ballin** atau **Ballin'**?

### Catatan warna akademi pilot

Akademi pilot: **Dynasty Basketball Academy (DBA)**, Karawang, Jawa Barat. Berdiri 2 Oktober 2022, latihan di Wonderland Basketball Arena, Galuh Mas. Tagline mereka: **#BerprosesBersama** — kebetulan sangat selaras dengan produk ini, dan layak dipinjam nadanya untuk copywriting rapor.

Sistem perlu **satu slot warna akademi yang bisa diatur** (`--academy-primary`), dipakai untuk kop rapor, kartu QR, dan aksen halaman portofolio. Warna produk (`leather`) tetap dipakai untuk tombol aksi agar konsisten lintas akademi.

Pemisahan ini penting karena warna akademi bisa apa saja, termasuk merah atau hijau — yang di produk ini sudah punya arti tetap (meleset / masuk). Warna akademi tidak boleh dipakai untuk hal yang bermakna status.
