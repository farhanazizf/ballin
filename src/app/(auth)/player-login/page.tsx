'use client';

import {
  useState,
  useRef,
  useCallback,
  useTransition,
  type KeyboardEvent,
  type ClipboardEvent,
  type ChangeEvent,
} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, CircleNotch, Timer } from '@phosphor-icons/react';
import Image from 'next/image';
import Link from 'next/link';
import { playerLoginSchema, type PlayerLoginInput } from '@/lib/validators/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const PIN_LENGTH = 6;

async function handlePlayerLogin(data: PlayerLoginInput) {
  const res = await fetch('/api/auth/player', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body.error || 'Terjadi kesalahan. Coba lagi.');
  }

  return body;
}

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

/* ── PIN Input Component ── */
function PinInput({
  value,
  onChange,
  disabled,
  hasError,
  onComplete,
}: {
  value: string;
  onChange: (pin: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  onComplete?: () => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(PIN_LENGTH, '').split('').slice(0, PIN_LENGTH);

  const focusInput = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, PIN_LENGTH - 1));
    inputRefs.current[clamped]?.focus();
  }, []);

  const updatePin = useCallback(
    (newDigits: string[]) => {
      const newPin = newDigits.join('').slice(0, PIN_LENGTH);
      onChange(newPin);
      if (newPin.length === PIN_LENGTH) {
        onComplete?.();
      }
    },
    [onChange, onComplete]
  );

  function handleChange(index: number, e: ChangeEvent<HTMLInputElement>) {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    if (!char) return;

    const next = [...digits];
    next[index] = char;
    updatePin(next);
    if (index < PIN_LENGTH - 1) {
      focusInput(index + 1);
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (digits[index] && digits[index] !== ' ') {
        next[index] = '';
        updatePin(next);
      } else if (index > 0) {
        next[index - 1] = '';
        updatePin(next);
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < PIN_LENGTH - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH);
    if (!pasted) return;

    const next = pasted.padEnd(PIN_LENGTH, ' ').split('').slice(0, PIN_LENGTH);
    updatePin(next.map((c) => (c === ' ' ? '' : c)));
    focusInput(Math.min(pasted.length, PIN_LENGTH - 1));
  }

  return (
    <div className="flex gap-2 sm:gap-3 justify-center" role="group" aria-label="Masukkan PIN 6 digit">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit === ' ' ? '' : digit}
          disabled={disabled}
          aria-label={`Digit ${i + 1} dari ${PIN_LENGTH}`}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          onFocus={(e) => e.target.select()}
          className={cn(
            'h-14 w-12 sm:w-14 rounded-[var(--radius-button)] border text-center',
            'font-[family-name:var(--font-display)] text-2xl font-semibold tabular-nums',
            'bg-[var(--color-field-surface)] text-[var(--color-field-text)]',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]/40 focus:border-[var(--color-leather)]',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            hasError
              ? 'border-[var(--color-miss)] focus:border-[var(--color-miss)] focus:ring-[var(--color-miss)]/20'
              : 'border-[var(--color-field-border)]'
          )}
        />
      ))}
    </div>
  );
}

/* ── Player Login Page ── */
export default function PlayerLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const lockoutInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PlayerLoginInput>({
    resolver: zodResolver(playerLoginSchema),
    defaultValues: { username: '', pin: '' },
  });

  const startLockoutTimer = useCallback((seconds: number) => {
    setLockoutSeconds(seconds);
    if (lockoutInterval.current) clearInterval(lockoutInterval.current);
    lockoutInterval.current = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev === null || prev <= 1) {
          if (lockoutInterval.current) clearInterval(lockoutInterval.current);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  function onPinChange(newPin: string) {
    setPin(newPin);
    setValue('pin', newPin, { shouldValidate: false });
  }

  function onSubmit(data: PlayerLoginInput) {
    setServerError(null);
    startTransition(async () => {
      try {
        await handlePlayerLogin(data);
        router.push('/card');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.';
        setServerError(msg);

        const lockMatch = msg.match(/terkunci.*?(\d+)\s*menit/i);
        if (lockMatch) {
          startLockoutTimer(parseInt(lockMatch[1], 10) * 60);
        }

        setPin('');
        setValue('pin', '', { shouldValidate: false });
      }
    });
  }

  const isLocked = lockoutSeconds !== null && lockoutSeconds > 0;
  const lockDisplay = isLocked
    ? `${Math.floor(lockoutSeconds / 60)}:${String(lockoutSeconds % 60).padStart(2, '0')}`
    : null;

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 py-12">
      <motion.div
        className="w-full max-w-sm"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Logo mark */}
        <motion.div variants={fadeUp} className="mb-10">
          <Image
            src="/logo-icon.svg"
            alt="Ballin"
            width={48}
            height={48}
            priority
          />
        </motion.div>

        {/* Heading */}
        <motion.div variants={fadeUp}>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-field-text)]">
            Masuk ke kartu pemain
          </h1>
          <p className="mt-2 text-sm text-[var(--color-field-text-2)] font-[family-name:var(--font-ui)]">
            Masukkan username dan PIN dari coach kamu.
          </p>
        </motion.div>

        <motion.form
          variants={fadeUp}
          onSubmit={(e) => { handleSubmit(onSubmit)(e); }}
          className="mt-8 space-y-6"
          noValidate
        >
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="text-sm font-medium text-[var(--color-field-text-2)] font-[family-name:var(--font-ui)]"
            >
              Username
            </label>
            <div className="relative">
              <User
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-field-text-3)]"
                size={20}
                weight="regular"
              />
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="nama.pemain"
                disabled={isPending || isLocked}
                {...register('username')}
                className={cn(
                  'h-12 w-full rounded-[var(--radius-button)] border bg-[var(--color-field-surface)] pl-11 pr-4',
                  'font-[family-name:var(--font-ui)] text-base text-[var(--color-field-text)]',
                  'placeholder:text-[var(--color-field-text-3)]',
                  'transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]/30 focus:border-[var(--color-leather)]',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  errors.username
                    ? 'border-[var(--color-miss)] focus:border-[var(--color-miss)] focus:ring-[var(--color-miss)]/20'
                    : 'border-[var(--color-field-border)]'
                )}
              />
            </div>
            {errors.username && (
              <p className="text-xs text-[var(--color-miss)] font-[family-name:var(--font-ui)]">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* PIN */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--color-field-text-2)] font-[family-name:var(--font-ui)]">
              PIN
            </label>
            <PinInput
              value={pin}
              onChange={onPinChange}
              disabled={isPending || isLocked}
              hasError={!!errors.pin}
              onComplete={() => {
                const submitBtn = document.getElementById('player-submit');
                submitBtn?.focus();
              }}
            />
            {errors.pin && (
              <p className="text-xs text-center text-[var(--color-miss)] font-[family-name:var(--font-ui)]">
                {errors.pin.message}
              </p>
            )}
          </div>

          {/* Server error / lockout */}
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

          {isLocked && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-[var(--radius-panel)] border border-[var(--color-field-border)] bg-[var(--color-field-raised)] px-4 py-3"
            >
              <Timer
                size={20}
                weight="bold"
                className="shrink-0 text-[var(--color-field-text-3)]"
              />
              <p className="text-sm text-[var(--color-field-text-2)] font-[family-name:var(--font-ui)]">
                Coba lagi dalam{' '}
                <span className="font-[family-name:var(--font-display)] font-semibold tabular-nums text-[var(--color-field-text)]">
                  {lockDisplay}
                </span>
              </p>
            </motion.div>
          )}

          {/* Submit */}
          <Button
            id="player-submit"
            type="submit"
            variant="primary"
            size="field"
            disabled={isPending || isLocked}
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

        {/* Coach login link */}
        <motion.div variants={fadeUp} className="mt-8 text-center">
          <Link
            href="/login"
            className={cn(
              'inline-block text-sm font-medium text-[var(--color-field-text-3)]',
              'font-[family-name:var(--font-ui)]',
              'transition-colors duration-150',
              'hover:text-[var(--color-field-text-2)]',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
              'rounded-[var(--radius-panel)] px-3 py-2 -mx-3'
            )}
          >
            Masuk sebagai coach
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
