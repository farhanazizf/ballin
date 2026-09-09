'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { cn } from '@/lib/utils';
import { parseQrPayload } from '@/lib/field/qr';
import { useTranslations } from '@/lib/i18n/use-translations';

type QrScannerProps = {
  onScan: (token: string) => void;
  onError: (message: string) => void;
  className?: string;
};

export function QrScanner({ onScan, onError, className }: QrScannerProps) {
  const { t } = useTranslations();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const lastTokenRef = useRef<{ token: string; at: number } | null>(null);

  useEffect(() => {
    let reader: BrowserMultiFormatReader | null = null;
    let cancelled = false;

    async function start() {
      if (!videoRef.current) return;
      reader = new BrowserMultiFormatReader();
      setActive(true);

      try {
        await reader.decodeFromVideoDevice(undefined, videoRef.current, (result, _err) => {
          if (!result || cancelled) return;
          const raw = result.getText();
          const parsed = parseQrPayload(raw);
          if (!parsed.ok) {
            onError(parsed.reason);
            return;
          }

          const now = Date.now();
          const last = lastTokenRef.current;
          if (last && last.token === parsed.token && now - last.at < 800) {
            return;
          }
          lastTokenRef.current = { token: parsed.token, at: now };

          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50);
          }
          onScan(parsed.token);
        });
      } catch {
        onError(t.field.qrScanner.cameraError);
        setActive(false);
      }
    }

    void start();

    return () => {
      cancelled = true;
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
      setActive(false);
    };
  }, [onScan, onError, t.field.qrScanner.cameraError]);

  return (
    <div className={cn('relative overflow-hidden rounded-[var(--radius-panel)] bg-black', className)}>
      <video ref={videoRef} className="w-full aspect-[4/3] object-cover" muted playsInline />
      <div className="absolute inset-0 pointer-events-none border-2 border-[var(--color-made)]/40 m-8 rounded-none" />
      {!active && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-white font-[family-name:var(--font-ui)]">
          {t.field.qrScanner.openingCamera}
        </div>
      )}
    </div>
  );
}
