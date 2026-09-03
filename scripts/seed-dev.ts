/**
 * Dev seed: buat akun auth + muat supabase/seed.dev.sql
 * Jalankan: pnpm seed:dev
 */
import { createClient } from '@supabase/supabase-js';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!existsSync(envPath)) {
    throw new Error('.env.local tidak ditemukan. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.');
  }
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

const DEV_USERS = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    email: 'admin@dynasty.test',
    password: 'Admin123!',
    name: 'Admin Dynasty',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    email: 'coach@dynasty.test',
    password: 'Coach123!',
    name: 'Coach Ferdianka',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    email: 'asisten@dynasty.test',
    password: 'Coach123!',
    name: 'Coach Asisten',
  },
  {
    id: '20000000-0000-0000-0000-000000000001',
    email: 'rizky@player.ballin.dev',
    password: 'Player123!',
    name: 'Rizky Ramadhan',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    email: 'adit@player.ballin.dev',
    password: 'Player123!',
    name: 'Adit Pratama',
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    email: 'sinta@player.ballin.dev',
    password: 'Player123!',
    name: 'Sinta Ayu Lestari',
  },
] as const;

async function ensureAuthUsers() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib ada di .env.local');
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const user of DEV_USERS) {
    const { data: existing } = await supabase.auth.admin.getUserById(user.id);

    if (existing?.user) {
      const { error } = await supabase.auth.admin.updateUserById(user.id, {
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.name },
      });
      if (error) throw new Error(`Gagal update ${user.email}: ${error.message}`);
      console.log(`✓ Auth diperbarui: ${user.email}`);
      continue;
    }

    const { error } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.name },
    });
    if (error) throw new Error(`Gagal buat ${user.email}: ${error.message}`);
    console.log(`✓ Auth dibuat: ${user.email}`);
  }
}

function runDevSeedSql() {
  const seedFile = path.join(ROOT, 'supabase/seed.dev.sql');
  execSync(`npx supabase db query --linked -f "${seedFile}"`, {
    cwd: ROOT,
    stdio: 'inherit',
  });
}

function printAccounts() {
  console.log('\n--- Akun dev ---');
  console.log('Coach login (/login):');
  console.log('  admin@dynasty.test / Admin123!');
  console.log('  coach@dynasty.test / Coach123!');
  console.log('  asisten@dynasty.test / Coach123!');
  console.log('\nPlayer login (/player-login) — PIN semua: 123456');
  console.log('  rizky, adit, sinta');
  console.log('\nPemain tanpa login: Budi (Hoops), Dimas (Toddler)');
}

async function main() {
  loadEnv();
  console.log('Membuat/memperbarui akun auth...');
  await ensureAuthUsers();
  console.log('\nMemuat seed.dev.sql...');
  runDevSeedSql();
  printAccounts();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
