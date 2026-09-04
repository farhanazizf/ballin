import type { SupabaseClient } from '@supabase/supabase-js';
import { playerCredentialsSchema, type PlayerCredentialsInput } from '@/lib/validators/auth';

export type PlayerCredentialsView = {
  username: string | null;
  hasLogin: boolean;
  lockedUntil: string | null;
  failedAttempts: number;
  hasProfile: boolean;
};

export async function getPlayerCredentialsView(
  admin: SupabaseClient,
  playerId: string,
): Promise<PlayerCredentialsView | null> {
  const { data: player } = await admin
    .from('players')
    .select('profile_id')
    .eq('id', playerId)
    .maybeSingle();

  if (!player) return null;

  const { data: cred } = await admin
    .from('player_credentials')
    .select('username, locked_until, failed_attempts')
    .eq('player_id', playerId)
    .maybeSingle();

  return {
    username: cred?.username ?? null,
    hasLogin: Boolean(cred),
    lockedUntil: cred?.locked_until ?? null,
    failedAttempts: cred?.failed_attempts ?? 0,
    hasProfile: Boolean(player.profile_id),
  };
}

export async function upsertPlayerCredentials(
  admin: SupabaseClient,
  orgId: string,
  playerId: string,
  rawInput: PlayerCredentialsInput,
): Promise<{ ok: true } | { error: string }> {
  const parsed = playerCredentialsSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { error: 'Username dan PIN tidak valid.' };
  }

  const { data: player } = await admin
    .from('players')
    .select('id, full_name, nickname, profile_id, organization_id')
    .eq('id', playerId)
    .maybeSingle();

  if (!player || player.organization_id !== orgId) {
    return { error: 'Pemain tidak ditemukan.' };
  }

  const { data: usernameOwner } = await admin
    .from('player_credentials')
    .select('player_id')
    .eq('username', parsed.data.username)
    .maybeSingle();

  if (usernameOwner && usernameOwner.player_id !== playerId) {
    return { error: 'Username sudah dipakai pemain lain. Pilih username berbeda.' };
  }

  if (!player.profile_id) {
    const email = `${parsed.data.username}@player.ballin.dev`;
    const password = `Player${parsed.data.pin}!`;

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: player.full_name },
    });

    if (authError || !authUser.user) {
      return { error: 'Gagal membuat akun auth pemain. Coba lagi.' };
    }

    const { error: profileError } = await admin.from('profiles').insert({
      id: authUser.user.id,
      organization_id: orgId,
      role: 'player',
      full_name: player.full_name,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(authUser.user.id);
      return { error: 'Gagal menghubungkan profil pemain. Coba lagi.' };
    }

    const { error: linkError } = await admin
      .from('players')
      .update({ profile_id: authUser.user.id })
      .eq('id', playerId);

    if (linkError) {
      return { error: 'Gagal menghubungkan pemain ke profil. Coba lagi.' };
    }
  }

  const { error: rpcError } = await admin.rpc('upsert_player_credentials', {
    p_player_id: playerId,
    p_username: parsed.data.username,
    p_pin: parsed.data.pin,
  });

  if (rpcError) {
    return { error: 'Gagal menyimpan kredensial. Periksa username dan PIN lalu coba lagi.' };
  }

  return { ok: true };
}
