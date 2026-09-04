import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export async function signOutAndRedirect(
  redirectTo: string,
  router: AppRouterInstance,
): Promise<{ ok: true } | { error: string }> {
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: 'Gagal keluar. Coba lagi dalam beberapa saat.' };
  }

  router.refresh();
  router.push(redirectTo);
  return { ok: true };
}
