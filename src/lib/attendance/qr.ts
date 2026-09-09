export const QR_PREFIX = 'BLN1:';

export type QrParseResult =
  | { ok: true; token: string }
  | { ok: false; reason: 'unknown_format' | 'empty_token' };

export function parseQrPayload(raw: string): QrParseResult {
  const trimmed = raw.trim();
  if (!trimmed.startsWith(QR_PREFIX)) {
    return { ok: false, reason: 'unknown_format' };
  }

  const token = trimmed.slice(QR_PREFIX.length).trim();
  if (!token) {
    return { ok: false, reason: 'empty_token' };
  }

  return { ok: true, token };
}

export { isPresentStatus } from '@/lib/attendance/status';
