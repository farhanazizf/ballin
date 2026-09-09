'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleNotch } from '@phosphor-icons/react';
import Link from 'next/link';
import { createLoginSchema, type LoginInput } from '@/lib/validators/auth';
import { useTranslations } from '@/lib/i18n/use-translations';
import { LanguageToggle } from '@/components/i18n/language-toggle';
import { cn } from '@/lib/utils';
import { AuthFormPanel, AuthHeroPanel, AuthHeroTitle } from '@/components/motion/auth-hero-panel';
import { AuthQuoteRotator } from '@/components/motion/auth-quote-rotator';
import { COACH_ATHLETE_QUOTES } from '@/lib/constants/athlete-quotes';

const UNIT_ID = 'DBA-KRW';
const REV = 'REV 1.0';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const loginSchema = useMemo(() => createLoginSchema(t.validation.auth), [t.validation.auth]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  async function handleLogin(data: LoginInput) {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new Error(
        error.message === 'Invalid login credentials'
          ? t.auth.coach.invalidCredentials
          : t.auth.coach.loginFailed,
      );
    }
  }

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  });

  function onSubmit(data: LoginInput) {
    setServerError(null);
    startTransition(async () => {
      try {
        await handleLogin(data);
        router.push('/dashboard');
      } catch (err) {
        setServerError(
          err instanceof Error ? err.message : t.common.genericError,
        );
      }
    });
  }

  return (
    <main className="grid min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <section className="relative flex flex-col justify-between border-b border-[var(--color-field-border)] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
        <span
          aria-hidden
          className="pointer-events-none absolute right-6 top-6 font-mono text-[10px] tracking-[0.12em] text-[var(--color-field-text-3)] lg:right-10 lg:top-10"
        >
          +
        </span>

        <AuthHeroPanel>
          <header>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-hazard)]">
              {t.auth.coach.badge}
            </p>
            <AuthHeroTitle title={t.auth.coach.title} />
            <AuthQuoteRotator quotes={COACH_ATHLETE_QUOTES} />
          </header>
        </AuthHeroPanel>

        <dl className="mt-10 space-y-0 font-mono text-[10px] uppercase tracking-[0.1em] lg:mt-0">
          <div className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-[var(--color-field-border)] py-3">
            <dt className="text-[var(--color-field-text-3)]">{t.common.unit}</dt>
            <dd className="text-right text-[var(--color-phosphor)]">{UNIT_ID}</dd>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-[var(--color-field-border)] py-3">
            <dt className="text-[var(--color-field-text-3)]">{t.common.build}</dt>
            <dd className="text-right text-[var(--color-phosphor)]">{REV}</dd>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-b border-[var(--color-field-border)] py-3">
            <dt className="text-[var(--color-field-text-3)]">{t.common.status}</dt>
            <dd className="text-right text-[var(--color-phosphor)]">
              <samp>{t.common.ready}</samp>
            </dd>
          </div>
        </dl>
      </section>

      <AuthFormPanel>
      <section className="flex flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-field-border)] px-6 py-4 sm:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-field-text-3)]">
            {t.auth.coach.terminalLabel}
          </p>
          <LanguageToggle />
        </div>

        <div className="flex flex-1 flex-col px-6 py-6 sm:px-8">
          <form
            data-testid={hydrated ? 'login-ready' : 'login-form'}
            onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit(onSubmit)(event);
          }}
            className="flex flex-1 flex-col gap-px bg-[var(--color-field-border)]"
            noValidate
          >
            <div className="bg-[var(--color-field-surface)] p-4">
              <label htmlFor="email" className="brut-label text-[var(--color-field-text-3)]">
                Email
              </label>
              <div className="mt-2 border border-[var(--color-field-border)] bg-[var(--color-terminal-bg)]">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder={t.auth.coach.emailPlaceholder}
                  disabled={isPending}
                  {...register('email')}
                  className={cn(
                    'h-[var(--size-touch-min)] w-full border-0 bg-transparent px-4',
                    'font-mono text-sm tracking-[0.04em] text-[var(--color-phosphor)]',
                    'placeholder:text-[var(--color-field-text-3)]',
                    'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-hazard)]',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                  )}
                />
              </div>
              {errors.email && (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-hazard)]">
                  /// {errors.email.message}
                </p>
              )}
            </div>

            <div className="bg-[var(--color-field-surface)] p-4">
              <label htmlFor="password" className="brut-label text-[var(--color-field-text-3)]">
                Password
              </label>
              <div className="mt-2 border border-[var(--color-field-border)] bg-[var(--color-terminal-bg)]">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t.auth.coach.passwordPlaceholder}
                  disabled={isPending}
                  {...register('password')}
                  className={cn(
                    'h-[var(--size-touch-min)] w-full border-0 bg-transparent px-4',
                    'font-mono text-sm tracking-[0.04em] text-[var(--color-phosphor)]',
                    'placeholder:text-[var(--color-field-text-3)]',
                    'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-hazard)]',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                  )}
                />
              </div>
              {errors.password && (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-hazard)]">
                  /// {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="border-t-2 border-[var(--color-hazard)] bg-[var(--color-field-surface)] p-4">
                <output className="block font-mono text-[11px] leading-relaxed tracking-[0.04em] text-[var(--color-hazard)]">
                  ERR // {serverError}
                </output>
              </div>
            )}

            <div className="bg-[var(--color-field-surface)] p-4">
              <button
                type="submit"
                disabled={isPending}
                className={cn(
                  'flex h-[var(--size-touch-primary)] w-full items-center justify-center gap-3',
                  'border-2 border-[var(--color-hazard)] bg-[var(--color-hazard)]',
                  'font-mono text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-phosphor)]',
                  'transition-colors duration-200',
                  'hover:bg-transparent hover:text-[var(--color-hazard)]',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-phosphor)]',
                  'active:translate-y-px',
                  'disabled:pointer-events-none disabled:opacity-40',
                )}
              >
                {isPending ? (
                  <>
                    <CircleNotch size={20} weight="bold" className="animate-spin" />
                    {t.common.processing}
                  </>
                ) : (
                  t.auth.coach.submit
                )}
              </button>
            </div>
          </form>

          <hr className="my-6 border-[var(--color-field-border)]" />

          <p className="text-center font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-field-text-3)]">
            <Link
              href="/player-login"
              className="text-[var(--color-field-text-2)] underline decoration-[var(--color-field-border)] underline-offset-4 transition-colors hover:text-[var(--color-phosphor)] hover:decoration-[var(--color-hazard)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-phosphor)]"
            >
              {t.auth.coach.switchToPlayer}
            </Link>
          </p>
        </div>

        <footer className="mt-auto border-t border-[var(--color-field-border)] px-6 py-3 sm:px-8">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--color-field-text-3)]">
            {t.common.footer}
          </p>
        </footer>
      </section>
      </AuthFormPanel>
    </main>
  );
}
