import type { APIRequestContext, BrowserContext } from '@playwright/test';

const COACH_EMAIL = 'coach@dynasty.test';
const COACH_PASSWORD = 'Coach123!';

export async function authenticateCoach(request: APIRequestContext, context: BrowserContext) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL/ANON_KEY wajib ada untuk e2e.');
  }

  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]!;
  const response = await request.post(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    data: {
      email: COACH_EMAIL,
      password: COACH_PASSWORD,
    },
  });

  if (!response.ok()) {
    throw new Error(`Login coach gagal (${response.status()}). Jalankan pnpm seed:dev.`);
  }

  const auth = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    user: unknown;
  };

  const sessionPayload = {
    access_token: auth.access_token,
    refresh_token: auth.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + auth.expires_in,
    expires_in: auth.expires_in,
    token_type: auth.token_type,
    user: auth.user,
  };

  const encoded = `base64-${Buffer.from(JSON.stringify(sessionPayload)).toString('base64url')}`;

  await context.addCookies([
    {
      name: `sb-${projectRef}-auth-token`,
      value: encoded,
      domain: '127.0.0.1',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}
