-- ============================================================
-- Ballin — Seed data
-- Simpan sebagai: supabase/seed.sql
--
-- Drill di bawah ini adalah preset UMUM. Semuanya bisa diedit,
-- ditambah, atau diarsipkan coach lewat UI tanpa deploy ulang.
-- Jangan pernah mengubah ini menjadi enum di kode aplikasi.
-- ============================================================

-- ORGANISASI --------------------------------------------------
insert into organizations (id, name, slug, timezone, primary_color)
values (
  '00000000-0000-0000-0000-000000000001',
  'Dynasty Basketball Academy',
  'dynasty',
  'Asia/Jakarta',
  '#EE6A1E'          -- TODO: ganti dengan warna resmi DBA
);

-- KELAS -------------------------------------------------------
-- Nama dan rentang usia mengikuti penamaan akademi, bukan format U-angka.
-- track_drill_stats = false untuk kelas yang terlalu muda untuk statistik.
insert into teams (organization_id, name, age_min, age_max, track_drill_stats) values
  ('00000000-0000-0000-0000-000000000001', 'Toddler', 4, 6, false),
  ('00000000-0000-0000-0000-000000000001', 'Hoops',   7, 11, true),
  ('00000000-0000-0000-0000-000000000001', 'Girls',  12, 17, true),
  ('00000000-0000-0000-0000-000000000001', 'Boys',   12, 17, true);

-- ============================================================
-- DRILL PRESET
--
-- attribute_weights menentukan kontribusi drill ke atribut pemain.
-- Total bobot per drill sebaiknya 1.0.
-- Atribut yang tersedia: shooting, finishing, ballhandling,
--                        defense, athleticism, attitude
-- ============================================================

insert into drills (organization_id, name, category, type, default_target, unit, lower_is_better, attribute_weights, instructions) values

-- SHOOTING ----------------------------------------------------
('00000000-0000-0000-0000-000000000001',
 'Free throw', 'Shooting', 'attempt', 10, 'percobaan', false,
 '{"shooting":0.8,"attitude":0.2}',
 'Pemain menembak dari garis free throw. Catat yang masuk dari total percobaan.'),

('00000000-0000-0000-0000-000000000001',
 'Form shooting dekat ring', 'Shooting', 'attempt', 10, 'percobaan', false,
 '{"shooting":0.7,"finishing":0.3}',
 'Tembakan jarak dekat dengan fokus pada bentuk tangan dan follow through.'),

('00000000-0000-0000-0000-000000000001',
 'Spot shooting 5 titik', 'Shooting', 'attempt', 10, 'percobaan', false,
 '{"shooting":1.0}',
 'Dua percobaan di tiap titik: baseline kiri, wing kiri, top, wing kanan, baseline kanan.'),

('00000000-0000-0000-0000-000000000001',
 'Three point corner', 'Shooting', 'attempt', 10, 'percobaan', false,
 '{"shooting":1.0}',
 'Tembakan tiga angka dari sudut. Untuk kelompok usia 12 ke atas.'),

-- FINISHING ---------------------------------------------------
('00000000-0000-0000-0000-000000000001',
 'Layup tangan kanan', 'Finishing', 'attempt', 10, 'percobaan', false,
 '{"finishing":0.9,"ballhandling":0.1}',
 'Layup dari sisi kanan dengan tangan kanan. Perhatikan langkah dan tumpuan.'),

('00000000-0000-0000-0000-000000000001',
 'Layup tangan kiri', 'Finishing', 'attempt', 10, 'percobaan', false,
 '{"finishing":0.9,"ballhandling":0.1}',
 'Layup dari sisi kiri dengan tangan kiri. Biasanya jauh lebih lemah dari tangan dominan.'),

('00000000-0000-0000-0000-000000000001',
 'Finishing setelah drive', 'Finishing', 'attempt', 10, 'percobaan', false,
 '{"finishing":0.7,"ballhandling":0.3}',
 'Dribble dari perimeter lalu menyelesaikan di ring.'),

-- BALLHANDLING ------------------------------------------------
('00000000-0000-0000-0000-000000000001',
 'Dribble zigzag cone', 'Ballhandling', 'timed', null, 'detik', true,
 '{"ballhandling":0.7,"athleticism":0.3}',
 'Melewati enam cone secara zigzag. Catat waktu tercepat. Bola tidak boleh lepas.'),

('00000000-0000-0000-0000-000000000001',
 'Two-ball dribble 30 detik', 'Ballhandling', 'count_in_time', 30, 'repetisi', false,
 '{"ballhandling":1.0}',
 'Dribble dua bola bersamaan. Catat jumlah dribble bersih dalam 30 detik.'),

('00000000-0000-0000-0000-000000000001',
 'Crossover cone', 'Ballhandling', 'timed', null, 'detik', true,
 '{"ballhandling":0.8,"athleticism":0.2}',
 'Crossover di tiap cone sepanjang lapangan. Catat waktu.'),

('00000000-0000-0000-0000-000000000001',
 'Passing akurasi ke target', 'Ballhandling', 'attempt', 10, 'percobaan', false,
 '{"ballhandling":0.8,"attitude":0.2}',
 'Chest pass dan bounce pass ke target di dinding atau ke pasangan.'),

-- DEFENSE -----------------------------------------------------
('00000000-0000-0000-0000-000000000001',
 'Defensive slide (lane agility)', 'Defense', 'timed', null, 'detik', true,
 '{"defense":0.6,"athleticism":0.4}',
 'Bergerak menyamping mengelilingi lane tanpa menyilangkan kaki. Catat waktu.'),

('00000000-0000-0000-0000-000000000001',
 'Closeout', 'Defense', 'rating', null, 'skala 1-5', false,
 '{"defense":1.0}',
 'Nilai posisi tangan, kontrol langkah, dan keseimbangan saat menutup penembak. Skala 1-5.'),

('00000000-0000-0000-0000-000000000001',
 'Box out & rebound', 'Defense', 'rating', null, 'skala 1-5', false,
 '{"defense":0.6,"attitude":0.4}',
 'Nilai kemauan mencari kontak dan menahan posisi. Skala 1-5.'),

-- ATHLETICISM -------------------------------------------------
('00000000-0000-0000-0000-000000000001',
 'Sprint 3/4 lapangan', 'Athleticism', 'timed', null, 'detik', true,
 '{"athleticism":1.0}',
 'Sprint dari baseline ke garis free throw seberang. Catat waktu.'),

('00000000-0000-0000-0000-000000000001',
 'Shuttle run (suicide)', 'Conditioning', 'timed', null, 'detik', true,
 '{"athleticism":1.0}',
 'Lari bolak-balik ke garis free throw, tengah, free throw seberang, baseline.'),

('00000000-0000-0000-0000-000000000001',
 'Vertical jump', 'Athleticism', 'measure', null, 'cm', false,
 '{"athleticism":1.0}',
 'Selisih standing reach dengan jangkauan lompatan. Catat dalam sentimeter.'),

('00000000-0000-0000-0000-000000000001',
 'Beep test', 'Conditioning', 'measure', null, 'level', false,
 '{"athleticism":1.0}',
 'Lari bolak-balik 20 meter mengikuti audio. Catat level terakhir yang tercapai.');

-- ============================================================
-- LENCANA
--
-- Semua kriteria berbasis akumulasi dan konsistensi diri sendiri.
-- Tidak ada lencana yang membandingkan pemain dengan pemain lain.
-- ============================================================

insert into badges (organization_id, code, name, description, criteria) values
('00000000-0000-0000-0000-000000000001', 'streak_5',  'Hadir 5 Kali Beruntun',
 'Datang latihan lima kali berturut-turut.', '{"type":"attendance_streak","threshold":5}'),

('00000000-0000-0000-0000-000000000001', 'streak_15', 'Hadir 15 Kali Beruntun',
 'Datang latihan lima belas kali berturut-turut.', '{"type":"attendance_streak","threshold":15}'),

('00000000-0000-0000-0000-000000000001', 'streak_30', 'Hadir 30 Kali Beruntun',
 'Datang latihan tiga puluh kali berturut-turut.', '{"type":"attendance_streak","threshold":30}'),

('00000000-0000-0000-0000-000000000001', 'reps_500',  'Kerja Keras',
 'Mencatat 500 repetisi latihan.', '{"type":"total_reps","threshold":500}'),

('00000000-0000-0000-0000-000000000001', 'reps_2000', 'Tak Kenal Lelah',
 'Mencatat 2.000 repetisi latihan.', '{"type":"total_reps","threshold":2000}'),

('00000000-0000-0000-0000-000000000001', 'ft_1000',   'Seribu Free Throw',
 'Melakukan 1.000 percobaan free throw.', '{"type":"drill_attempts","drill":"Free throw","threshold":1000}'),

('00000000-0000-0000-0000-000000000001', 'pb_first',  'Rekor Pribadi Pertama',
 'Memecahkan rekor pribadi untuk pertama kalinya.', '{"type":"personal_best","threshold":1}'),

('00000000-0000-0000-0000-000000000001', 'pb_10',     'Pemecah Rekor',
 'Memecahkan rekor pribadi sepuluh kali.', '{"type":"personal_best","threshold":10}'),

('00000000-0000-0000-0000-000000000001', 'lefty',     'Tangan Kedua',
 'Mencapai 7 dari 10 pada layup tangan lemah.',
 '{"type":"drill_accuracy","drill":"Layup tangan kiri","threshold":0.7}'),

('00000000-0000-0000-0000-000000000001', 'sessions_50', 'Lima Puluh Latihan',
 'Mengikuti lima puluh sesi latihan.', '{"type":"total_sessions","threshold":50}');

-- ============================================================
-- CATATAN UNTUK IMPLEMENTASI
--
-- 1. Drill di atas sengaja umum. Ganti dan tambahkan sesuai
--    kurikulum DBA setelah berdiskusi dengan Coach Ferdianka.
-- 2. Drill bertipe 'rating' dinilai per pemain dengan skala 1-5,
--    memakai shell input yang sama dengan drill lain.
-- 3. lower_is_better = true berarti angka lebih kecil lebih baik
--    (waktu). Perhitungan persentil harus membalik urutannya.
-- 4. Kelas Toddler punya track_drill_stats = false. UI harus
--    menyembunyikan menu drill untuk kelas ini dan hanya
--    menampilkan absensi serta catatan naratif.
-- ============================================================
