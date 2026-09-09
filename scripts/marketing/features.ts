export type PosterTheme = 'field' | 'report';

export type MarketingFeature = {
  id: string;
  unit: string;
  title: string;
  subtitle: string;
  body: string;
  theme: PosterTheme;
  screenshots: string[];
};

export const MARKETING_FEATURES: MarketingFeature[] = [
  {
    id: '01-absensi',
    unit: '01',
    title: 'Absensi scan kartu',
    subtitle: '60 anak selesai dalam 1,5 menit',
    body: 'Coach arahkan HP, scan kartu member. Foto pemain muncul di layar — tidak bisa titip absen.',
    theme: 'field',
    screenshots: ['01-absensi-main.png'],
  },
  {
    id: '02-drill',
    unit: '02',
    title: 'Satu ketukan, satu tembakan',
    subtitle: 'Catat sambil latihan jalan',
    body: 'Tap nama anak setiap kali masuk. Mata coach tetap di lapangan, bukan di buku catatan.',
    theme: 'field',
    screenshots: ['02-drill-grid.png', '02-drill-player.png'],
  },
  {
    id: '03-offline',
    unit: '03',
    title: 'Tersimpan di HP',
    subtitle: 'Tetap jalan tanpa sinyal',
    body: 'Semua data latihan tersimpan lokal dulu. Status netral — bukan error. Kirim otomatis saat online.',
    theme: 'field',
    screenshots: ['03-offline-drill.png'],
  },
  {
    id: '04-stations',
    unit: '04',
    title: 'Beberapa coach, satu sesi',
    subtitle: 'Tiap pos punya daftar sendiri',
    body: 'Anak dibagi ke beberapa pos. Data dari semua coach otomatis menyatu jadi satu latihan.',
    theme: 'field',
    screenshots: ['04-stations.png'],
  },
  {
    id: '05-review',
    unit: '05',
    title: 'Review sebelum simpan',
    subtitle: 'Cek angka sebelum tutup sesi',
    body: 'Ringkasan per drill dan per pemain. Coach bisa koreksi sebelum data final tersimpan.',
    theme: 'field',
    screenshots: ['05-review.png'],
  },
  {
    id: '06-rubric',
    unit: '06',
    title: 'Penilaian sikap 30 detik',
    subtitle: 'Usaha, coachability, disiplin',
    body: 'Rotasi 5 pemain per latihan. Bintang untuk hal yang tidak bisa diukur angka saja.',
    theme: 'field',
    screenshots: ['06-rubric.png'],
  },
  {
    id: '07-dashboard',
    unit: '07',
    title: 'Layar pantau coach',
    subtitle: 'Siapa perlu perhatian minggu ini',
    body: 'Peringatan otomatis: absen beruntun, drill mandeg, rekor kehadiran. Dari 60 anak, fokus ke yang penting.',
    theme: 'report',
    screenshots: ['07-dashboard.png'],
  },
  {
    id: '08-profil',
    unit: '08',
    title: 'Profil pemain lengkap',
    subtitle: 'Tren drill, absensi, atribut',
    body: 'Coach lihat riwayat latihan dan grafik perkembangan per anak — tanpa peringkat antar pemain.',
    theme: 'report',
    screenshots: ['08-profil.png', '08-profil-detail.png'],
  },
  {
    id: '09-rapor',
    unit: '09',
    title: 'Rapor bulanan otomatis',
    subtitle: 'Draf AI, disetujui coach',
    body: 'Kehadiran, grafik, hal terbaik, langkah berikutnya. Export PDF siap kirim ke orang tua.',
    theme: 'report',
    screenshots: ['09-rapor.png'],
  },
  {
    id: '10-kartu',
    unit: '10',
    title: 'Kartu pemain untuk anak',
    subtitle: 'Hanya progres sendiri — bukan peringkat',
    body: 'Anak lihat streak, rekor pribadi, bentuk permainan, dan lencana. Tanpa angka teman atau ranking overall.',
    theme: 'field',
    screenshots: ['10-kartu.png'],
  },
];
