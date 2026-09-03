import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { playerLoginSchema } from '@/lib/validators/auth';

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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Look up player credentials
    const { data: cred, error: credError } = await supabase
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

    // Check if locked
    if (cred.locked_until && new Date(cred.locked_until) > new Date()) {
      const minutesLeft = Math.ceil(
        (new Date(cred.locked_until).getTime() - Date.now()) / 60000
      );
      return NextResponse.json(
        { error: `Akun terkunci. Coba lagi dalam ${minutesLeft} menit.` },
        { status: 429 }
      );
    }

    // Verify PIN using pgcrypto's crypt function
    const { data: pinCheck } = await supabase.rpc('verify_player_pin', {
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

      await supabase
        .from('player_credentials')
        .update(updates)
        .eq('player_id', cred.player_id);

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

    // Reset failed attempts on success
    await supabase
      .from('player_credentials')
      .update({ failed_attempts: 0, locked_until: null })
      .eq('player_id', cred.player_id);

    // Get the player's profile_id to create a session
    const { data: player } = await supabase
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

    // TODO: Generate a Supabase session for this player
    // This will use admin.generateLink or a custom JWT
    
    return NextResponse.json({ 
      success: true,
      playerId: cred.player_id,
    });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Coba lagi.' },
      { status: 500 }
    );
  }
}
