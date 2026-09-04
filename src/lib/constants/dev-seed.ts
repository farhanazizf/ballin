/**
 * Referensi akun & entitas dev seed.
 *
 * Sumber data:
 * - Auth users: scripts/seed-dev.ts
 * - Domain data: supabase/seed.dev.sql
 *
 * Jalankan seed: pnpm seed:dev
 *
 * Hanya untuk development — jangan dipakai di production.
 */

export type DevProfileRole = 'admin' | 'coach' | 'player';

/** PIN dev untuk semua pemain yang punya login */
export const DEV_PLAYER_PIN = '123456' as const;

export const DEV_ORG = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Dynasty Basketball Academy',
  slug: 'dynasty-karawang',
} as const;

/** Login email + password — halaman /login */
export const DEV_STAFF_ACCOUNTS = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    role: 'admin' as const,
    fullName: 'Admin Dynasty',
    email: 'admin@dynasty.test',
    password: 'Admin123!',
    loginPath: '/login',
    teams: 'Semua kelas',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    role: 'coach' as const,
    fullName: 'Coach Ferdianka',
    email: 'coach@dynasty.test',
    password: 'Coach123!',
    loginPath: '/login',
    teams: ['Boys', 'Girls'],
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    role: 'coach' as const,
    fullName: 'Coach Asisten',
    email: 'asisten@dynasty.test',
    password: 'Coach123!',
    loginPath: '/login',
    teams: ['Hoops'],
  },
] as const;

/** Login username + PIN — halaman /player-login */
export const DEV_PLAYER_ACCOUNTS = [
  {
    profileId: '20000000-0000-0000-0000-000000000001',
    playerId: '30000000-0000-0000-0000-000000000001',
    role: 'player' as const,
    fullName: 'Rizky Ramadhan',
    nickname: 'Rizky',
    username: 'rizky',
    pin: DEV_PLAYER_PIN,
    email: 'rizky@player.ballin.dev',
    password: 'Player123!',
    team: 'Boys',
    jerseyNumber: 7,
    loginPath: '/player-login',
    afterLoginPath: '/card',
  },
  {
    profileId: '20000000-0000-0000-0000-000000000002',
    playerId: '30000000-0000-0000-0000-000000000002',
    role: 'player' as const,
    fullName: 'Adit Pratama',
    nickname: 'Adit',
    username: 'adit',
    pin: DEV_PLAYER_PIN,
    email: 'adit@player.ballin.dev',
    password: 'Player123!',
    team: 'Boys',
    jerseyNumber: 11,
    loginPath: '/player-login',
    afterLoginPath: '/card',
  },
  {
    profileId: '20000000-0000-0000-0000-000000000003',
    playerId: '30000000-0000-0000-0000-000000000003',
    role: 'player' as const,
    fullName: 'Sinta Ayu Lestari',
    nickname: 'Sinta',
    username: 'sinta',
    pin: DEV_PLAYER_PIN,
    email: 'sinta@player.ballin.dev',
    password: 'Player123!',
    team: 'Girls',
    jerseyNumber: 5,
    loginPath: '/player-login',
    afterLoginPath: '/card',
  },
] as const;

/** Pemain di roster tapi belum punya login PIN */
export const DEV_PLAYERS_WITHOUT_LOGIN = [
  {
    playerId: '30000000-0000-0000-0000-000000000004',
    fullName: 'Budi Santoso',
    nickname: 'Budi',
    team: 'Hoops',
    jerseyNumber: 3,
  },
  {
    playerId: '30000000-0000-0000-0000-000000000005',
    fullName: 'Dimas Kurniawan',
    nickname: 'Dimas',
    team: 'Toddler',
    jerseyNumber: null,
  },
] as const;

export const DEV_TEAMS = ['Boys', 'Girls', 'Hoops', 'Toddler'] as const;

/** Sesi latihan dev — untuk uji alur lapangan */
export const DEV_SESSIONS = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    team: 'Boys',
    status: 'completed' as const,
    location: 'GOR Dynasty',
    scheduledStart: '2026-08-28T16:00:00+07:00',
    attendancePath: '/session/40000000-0000-0000-0000-000000000001/attendance',
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    team: 'Boys',
    status: 'active' as const,
    location: 'GOR Dynasty',
    scheduledStart: '2026-09-03T16:00:00+07:00',
    attendancePath: '/session/40000000-0000-0000-0000-000000000002/attendance',
  },
] as const;

/** Akun coach paling sering dipakai untuk smoke test */
export const DEV_DEFAULT_COACH = DEV_STAFF_ACCOUNTS[1];

/** Akun pemain paling sering dipakai untuk smoke test */
export const DEV_DEFAULT_PLAYER = DEV_PLAYER_ACCOUNTS[0];
