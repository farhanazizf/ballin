'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Envelope, Lock, CircleNotch } from '@phosphor-icons/react';
import Image from 'next/image';
import Link from 'next/link';
import { loginSchema, type LoginInput } from '@/lib/validators/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
        ? 'Email atau password salah. Periksa kembali dan coba lagi.'
        : 'Gagal masuk. Periksa koneksi internet dan coba lagi.'
    );
  }
}

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(data: LoginInput) {
    setServerError(null);
    startTransition(async () => {
      try {
        await handleLogin(data);
        router.push('/dashboard');
      } catch (err) {
        setServerError(
          err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.'
        );
      }
    });
  }

  return (
    <div className="flex min-h-[100dvh]">
      {/* ── Left panel: branding (hidden on mobile) ── */}
      <div className="relative hidden lg:flex lg:w-[55%] flex-col justify-between overflow-hidden bg-[var(--color-field-bg)] p-10 xl:p-14">
        {/* Court line pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          {/* Half-court center circle */}
          <div className="absolute right-[-120px] top-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full border border-[var(--color-field-border)]/30" />
          <div className="absolute right-[-120px] top-1/2 -translate-y-1/2 h-[160px] w-[160px] rounded-full border border-[var(--color-field-border)]/20" />
          {/* Free-throw lane */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[280px] w-[200px] border-l border-t border-b border-[var(--color-field-border)]/20 rounded-l-sm" />
          {/* Baseline */}
          <div className="absolute right-0 top-0 bottom-0 w-px bg-[var(--color-field-border)]/25" />
          {/* Midcourt line */}
          <div className="absolute left-[55%] top-0 bottom-0 w-px bg-[var(--color-field-border)]/15" />
          {/* Three-point arc hint */}
          <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 h-[360px] w-[360px] rounded-full border border-dashed border-[var(--color-field-border)]/10" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Image
            src="/logo-lockup.svg"
            alt="Ballin"
            width={160}
            height={48}
            className="brightness-0 invert"
            priority
          />
        </div>

        {/* Headline — asymmetric placement */}
        <div className="relative z-10 max-w-md">
          <h1 className="font-[family-name:var(--font-display)] text-5xl xl:text-6xl font-bold leading-[1.08] tracking-tight text-[var(--color-field-text)]">
            Catat latihan,
            <br />
            <span className="text-[var(--color-leather)]">
              lihat perkembangan.
            </span>
          </h1>
          <p className="mt-5 text-lg text-[var(--color-field-text-2)] font-[family-name:var(--font-ui)] leading-relaxed max-w-sm">
            Satu ketukan per drill. Langsung dari pinggir lapangan,
            bahkan tanpa sinyal.
          </p>
        </div>

        {/* Bottom spacer for visual balance */}
        <div className="relative z-10" aria-hidden="true" />
      </div>

      {/* ── Right panel: login form ── */}
      <div className="flex w-full flex-col justify-center bg-[var(--color-field-surface)] px-6 py-12 sm:px-12 lg:w-[45%] lg:px-16 xl:px-20">
        <motion.div
          className="mx-auto w-full max-w-sm"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Mobile logo */}
          <motion.div variants={fadeUp} className="mb-10 lg:hidden">
            <Image
              src="/logo-lockup.svg"
              alt="Ballin"
              width={120}
              height={36}
              className="brightness-0 invert"
              priority
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-field-text)]">
              Masuk ke akun coach
            </h2>
            <p className="mt-2 text-sm text-[var(--color-field-text-2)] font-[family-name:var(--font-ui)]">
              Masukkan email dan password yang didaftarkan admin.
            </p>
          </motion.div>

          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5"
            noValidate
          >
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[var(--color-field-text-2)] font-[family-name:var(--font-ui)]"
              >
                Email
              </label>
              <div className="relative">
                <Envelope
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-field-text-3)]"
                  size={20}
                  weight="regular"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="coach@akademi.id"
                  disabled={isPending}
                  {...register('email')}
                  className={cn(
                    'h-12 w-full rounded-[var(--radius-button)] border bg-[var(--color-field-bg)] pl-11 pr-4',
                    'font-[family-name:var(--font-ui)] text-base text-[var(--color-field-text)]',
                    'placeholder:text-[var(--color-field-text-3)]',
                    'transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]/30 focus:border-[var(--color-leather)]',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    errors.email
                      ? 'border-[var(--color-miss)] focus:border-[var(--color-miss)] focus:ring-[var(--color-miss)]/20'
                      : 'border-[var(--color-field-border)]'
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-[var(--color-miss)] font-[family-name:var(--font-ui)]">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[var(--color-field-text-2)] font-[family-name:var(--font-ui)]"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-field-text-3)]"
                  size={20}
                  weight="regular"
                />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Minimal 8 karakter"
                  disabled={isPending}
                  {...register('password')}
                  className={cn(
                    'h-12 w-full rounded-[var(--radius-button)] border bg-[var(--color-field-bg)] pl-11 pr-4',
                    'font-[family-name:var(--font-ui)] text-base text-[var(--color-field-text)]',
                    'placeholder:text-[var(--color-field-text-3)]',
                    'transition-colors duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]/30 focus:border-[var(--color-leather)]',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    errors.password
                      ? 'border-[var(--color-miss)] focus:border-[var(--color-miss)] focus:ring-[var(--color-miss)]/20'
                      : 'border-[var(--color-field-border)]'
                  )}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-[var(--color-miss)] font-[family-name:var(--font-ui)]">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[var(--radius-panel)] border border-[var(--color-miss)]/20 bg-[var(--color-miss)]/8 px-4 py-3"
              >
                <p className="text-sm text-[var(--color-miss)] font-[family-name:var(--font-ui)]">
                  {serverError}
                </p>
              </motion.div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="field"
              disabled={isPending}
              className="w-full"
            >
              {isPending ? (
                <>
                  <CircleNotch
                    size={22}
                    weight="bold"
                    className="animate-spin"
                  />
                  <span>Memproses...</span>
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </motion.form>

          {/* Player login link */}
          <motion.div variants={fadeUp} className="mt-8 text-center">
            <Link
              href="/player-login"
              className={cn(
                'inline-block text-sm font-medium text-[var(--color-field-text-3)]',
                'font-[family-name:var(--font-ui)]',
                'transition-colors duration-150',
                'hover:text-[var(--color-field-text-2)]',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
                'rounded-[var(--radius-panel)] px-3 py-2 -mx-3'
              )}
            >
              Masuk sebagai pemain
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
