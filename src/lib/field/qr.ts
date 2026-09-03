export const QR_PREFIX = 'BLN1:';

export function parseQrPayload(raw: string): { ok: true; token: string } | { ok: false; reason: string } {
  if (!raw.startsWith(QR_PREFIX)) {
    return { ok: false, reason: 'Format QR tidak dikenali. Pastikan memindai kartu Ballin.' };
  }
  const token = raw.slice(QR_PREFIX.length).trim();
  if (!token) {
    return { ok: false, reason: 'Token kartu kosong. Minta pemain menunjukkan kartu yang benar.' };
  }
  return { ok: true, token };
}
