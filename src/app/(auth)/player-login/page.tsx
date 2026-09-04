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
import { useRouter } from 'next/navigation';
import { CircleNotch } from '@phosphor-icons/react';
import Link from 'next/link';
import { playerLoginSchema, type PlayerLoginInput } from '@/lib/validators/auth';
import { cn } from '@/lib/utils';

const PIN_LENGTH = 6;
const UNIT_ID = 'DBA-KRW';
const REV = 'REV 1.0';

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

function pinDigits(value: string): string[] {
  return Array.from({ length: PIN_LENGTH }, (_, i) => value[i] ?? '');
}

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
  const digits = pinDigits(value);

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
    [onChange, onComplete],
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
      if (digits[index]) {
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

    const next = pinDigits(pasted);
    updatePin(next);
    focusInput(Math.min(pasted.length, PIN_LENGTH - 1));
  }

  return (
    <div
      className={cn(
        'grid grid-cols-6 gap-px bg-[var(--color-field-border)]',
        hasError && 'outline outline-1 outline-[var(--color-hazard)]',
      )}
      role="group"
      aria-label="Masukkan PIN 6 digit"
    >
      {digits.map((digit, i) => (
        <div key={i} className="relative bg-[var(--color-field-border)]">
          <input
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`Digit ${i + 1} dari ${PIN_LENGTH}`}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            onFocus={(e) => e.target.select()}
            className={cn(
              'h-[var(--size-touch-min)] w-full border-0 bg-[var(--color-terminal-bg)] text-center',
              'font-mono text-xl font-semibold tabular-nums text-[var(--color-phosphor)]',
              'focus:outline-none focus:bg-[var(--color-field-bg)]',
              'focus:ring-2 focus:ring-inset focus:ring-[var(--color-hazard)]',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            )}
          />
          {!digit && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-sm text-[var(--color-field-text-3)]"
            >
              _
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

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
    formState: { errors, isSubmitted },
    setValue,
  } = useForm<PlayerLoginInput>({
    resolver: zodResolver(playerLoginSchema),
    defaultValues: { username: '', pin: '' },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
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
    setValue('pin', newPin, { shouldValidate: isSubmitted });
  }

  function onSubmit(data: PlayerLoginInput) {
    setServerError(null);
    startTransition(async () => {
      try {
        const result = await handlePlayerLogin(data);
        router.refresh();
        router.push(result.redirect ?? '/card');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.';
        setServerError(msg);

        const lockMatch = msg.match(/terkunci.*?(\d+)\s*menit/i);
        if (lockMatch) {
          startLockoutTimer(parseInt(lockMatch[1], 10) * 60);
        }

        if (/pin/i.test(msg)) {
          setPin('');
          setValue('pin', '', { shouldValidate: false });
        }
      }
    });
  }

  const isLocked = lockoutSeconds !== null && lockoutSeconds > 0;
  const lockDisplay = isLocked
    ? `${Math.floor(lockoutSeconds / 60)}:${String(lockoutSeconds % 60).padStart(2, '0')}`
    : null;

  return (
    <main className="grid min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      {/* ── Telemetry panel ── */}
      <section className="relative flex flex-col justify-between border-b border-[var(--color-field-border)] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
        <span
          aria-hidden
          className="pointer-events-none absolute right-6 top-6 font-mono text-[10px] tracking-[0.12em] text-[var(--color-field-text-3)] lg:right-10 lg:top-10"
        >
          +
        </span>

        <header>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-hazard)]">
            [ AUTH / PLAYER ]
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2.75rem,11vw,6.5rem)] font-black uppercase leading-[0.88] tracking-[-0.05em] text-[var(--color-phosphor)]">
            Kartu
            <br />
            pemain
          </h1>
          <p className="mt-5 max-w-[34ch] font-[family-name:var(--font-ui)] text-sm leading-relaxed text-[var(--color-field-text-2)]">
            Username dan PIN dari coach. Tanpa peringkat, tanpa data teman.
          </p>
        </header>

        <dl className="mt-10 space-y-0 font-mono text-[10px] uppercase tracking-[0.1em] lg:mt-0">
          <div className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-[var(--color-field-border)] py-3">
            <dt className="text-[var(--color-field-text-3)]">Unit</dt>
            <dd className="text-right text-[var(--color-phosphor)]">{UNIT_ID}</dd>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-[var(--color-field-border)] py-3">
            <dt className="text-[var(--color-field-text-3)]">Build</dt>
            <dd className="text-right text-[var(--color-phosphor)]">{REV}</dd>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-b border-[var(--color-field-border)] py-3">
            <dt className="text-[var(--color-field-text-3)]">Status</dt>
            <dd className="text-right text-[var(--color-phosphor)]">
              {isLocked ? (
                <samp className="text-[var(--color-hazard)]">LOCKED</samp>
              ) : (
                <samp>READY</samp>
              )}
            </dd>
          </div>
        </dl>
      </section>

      {/* ── Credential terminal ── */}
      <section className="flex flex-col">
        <div className="border-b border-[var(--color-field-border)] px-6 py-4 sm:px-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-field-text-3)]">
            &gt;&gt;&gt; credentials / terminal
          </p>
        </div>

        <div className="flex flex-1 flex-col px-6 py-6 sm:px-8">
          <form
            onSubmit={(e) => {
              handleSubmit(onSubmit)(e);
            }}
            className="flex flex-1 flex-col gap-px bg-[var(--color-field-border)]"
            noValidate
          >
            {/* Username cell */}
            <div className="bg-[var(--color-field-surface)] p-4">
              <label
                htmlFor="username"
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-field-text-3)]"
              >
                Username
              </label>
              <div className="mt-2 border border-[var(--color-field-border)] bg-[var(--color-terminal-bg)]">
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="rizky"
                  disabled={isPending || isLocked}
                  {...register('username')}
                  className={cn(
                    'h-[var(--size-touch-min)] w-full border-0 bg-transparent px-4',
                    'font-mono text-sm tracking-[0.06em] text-[var(--color-phosphor)] lowercase',
                    'placeholder:text-[var(--color-field-text-3)] placeholder:normal-case',
                    'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--color-hazard)]',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                  )}
                />
              </div>
              {errors.username && (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-hazard)]">
                  /// {errors.username.message}
                </p>
              )}
            </div>

            {/* PIN cell */}
            <div className="bg-[var(--color-field-surface)] p-4">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-field-text-3)]">
                  Pin 6 digit
                </label>
                <data
                  value={pin.length}
                  className="font-mono text-[10px] uppercase tracking-[0.1em] tabular-nums text-[var(--color-phosphor)]"
                >
                  {String(pin.length).padStart(2, '0')}/{PIN_LENGTH}
                </data>
              </div>
              <PinInput
                value={pin}
                onChange={onPinChange}
                disabled={isPending || isLocked}
                hasError={!!errors.pin}
                onComplete={() => {
                  document.getElementById('player-submit')?.focus();
                }}
              />
              {errors.pin && (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-hazard)]">
                  /// {errors.pin.message}
                </p>
              )}
            </div>

            {/* Error / lockout cell */}
            {(serverError || isLocked) && (
              <div className="border-t-2 border-[var(--color-hazard)] bg-[var(--color-field-surface)] p-4">
                {serverError && (
                  <output className="block font-mono text-[11px] leading-relaxed tracking-[0.04em] text-[var(--color-hazard)]">
                    ERR // {serverError}
                  </output>
                )}
                {isLocked && (
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-field-text-2)]">
                    Retry in{' '}
                    <samp className="text-[var(--color-phosphor)] tabular-nums">{lockDisplay}</samp>
                  </p>
                )}
              </div>
            )}

            {/* Submit cell */}
            <div className="bg-[var(--color-field-surface)] p-4">
              <button
                id="player-submit"
                type="submit"
                disabled={isPending || isLocked}
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
                    Processing
                  </>
                ) : (
                  '>>> Masuk ke kartu'
                )}
              </button>
            </div>
          </form>

          <hr className="my-6 border-[var(--color-field-border)]" />

          <p className="text-center font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-field-text-3)]">
            <Link
              href="/login"
              className="text-[var(--color-field-text-2)] underline decoration-[var(--color-field-border)] underline-offset-4 transition-colors hover:text-[var(--color-phosphor)] hover:decoration-[var(--color-hazard)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-phosphor)]"
            >
              Masuk sebagai coach
            </Link>
          </p>
        </div>

        <footer className="mt-auto border-t border-[var(--color-field-border)] px-6 py-3 sm:px-8">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--color-field-text-3)]">
            Dynasty Basketball Academy · Karawang · © Ballin
          </p>
        </footer>
      </section>
    </main>
  );
}
