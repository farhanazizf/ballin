import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PREFIXES = ['/login', '/player-login', '/api/auth'];
const PLAYER_PREFIXES = ['/card', '/player-login', '/api/auth'];

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPlayerPath(pathname: string) {
  return PLAYER_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function redirectWithCookies(url: URL, supabaseResponse: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
    redirectResponse.cookies.set(name, value);
  });
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user) {
    if (pathname.startsWith('/card')) {
      const url = request.nextUrl.clone();
      url.pathname = '/player-login';
      return redirectWithCookies(url, supabaseResponse);
    }

    if (isPublicPath(pathname)) {
      return supabaseResponse;
    }

    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return redirectWithCookies(url, supabaseResponse);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = profile?.role;

  if (role === 'player') {
    if (!isPlayerPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/card';
      return redirectWithCookies(url, supabaseResponse);
    }
    return supabaseResponse;
  }

  if (role === 'admin' || role === 'coach') {
    if (pathname.startsWith('/card')) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return redirectWithCookies(url, supabaseResponse);
    }

    if (isPublicPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return redirectWithCookies(url, supabaseResponse);
    }
  }

  return supabaseResponse;
}
