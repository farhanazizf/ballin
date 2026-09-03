import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { playerLoginSchema } from '@/lib/validators/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const RATE_LIMIT_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = playerLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Username dan PIN wajib diisi.' },
        { status: 400 }
      );
    }

    const { username, pin } = parsed.data;
    const admin = createAdminClient();

    const { data: cred, error: credError } = await admin
      .from('player_credentials')
      .select('player_id, pin_hash, failed_attempts, locked_until')
      .eq('username', username)
      .single();

    if (credError || !cred) {
      return NextResponse.json(
        { error: 'Username tidak ditemukan. Hubungi coach untuk bantuan.' },
        { status: 401 }
      );
    }

    if (cred.locked_until && new Date(cred.locked_until) > new Date()) {
      const minutesLeft = Math.ceil(
        (new Date(cred.locked_until).getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        { error: `Akun terkunci. Coba lagi dalam ${minutesLeft} menit.` },
        { status: 429 }
      );
    }

    const { data: pinCheck } = await admin.rpc('verify_player_pin', {
      p_player_id: cred.player_id,
      p_pin: pin,
    });

    if (!pinCheck) {
      const newAttempts = (cred.failed_attempts || 0) + 1;
      const updates: Record<string, unknown> = { failed_attempts: newAttempts };

      if (newAttempts >= RATE_LIMIT_ATTEMPTS) {
        updates.locked_until = new Date(
          Date.now() + LOCK_DURATION_MINUTES * 60000
        ).toISOString();
      }

      await admin.from('player_credentials').update(updates).eq('player_id', cred.player_id);

      const remaining = RATE_LIMIT_ATTEMPTS - newAttempts;
      return NextResponse.json(
        {
          error:
            remaining > 0
              ? `PIN salah. ${remaining} percobaan tersisa.`
              : `PIN salah. Akun terkunci selama ${LOCK_DURATION_MINUTES} menit.`,
        },
        { status: 401 }
      );
    }

    await admin
      .from('player_credentials')
      .update({ failed_attempts: 0, locked_until: null })
      .eq('player_id', cred.player_id);

    const { data: player } = await admin
      .from('players')
      .select('profile_id')
      .eq('id', cred.player_id)
      .single();

    if (!player?.profile_id) {
      return NextResponse.json(
        { error: 'Akun pemain belum terhubung. Hubungi admin.' },
        { status: 500 }
      );
    }

    const { data: authUser, error: authUserError } =
      await admin.auth.admin.getUserById(player.profile_id);

    const email = authUser?.user?.email;
    if (authUserError || !email) {
      return NextResponse.json(
        { error: 'Akun pemain belum terhubung. Hubungi admin.' },
        { status: 500 }
      );
    }

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({ type: 'magiclink', email });

    const tokenHash = linkData?.properties?.hashed_token;
    if (linkError || !tokenHash) {
      return NextResponse.json(
        { error: 'Gagal masuk. Coba lagi dalam beberapa detik.' },
        { status: 500 }
      );
    }

    let response = NextResponse.json({ success: true, redirect: '/card' });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error: sessionError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'magiclink',
    });

    if (sessionError) {
      return NextResponse.json(
        { error: 'Gagal masuk. Coba lagi.' },
        { status: 500 }
      );
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Coba lagi.' },
      { status: 500 }
    );
  }
}
