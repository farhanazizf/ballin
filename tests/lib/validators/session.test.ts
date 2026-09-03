import { describe, expect, it } from 'vitest';
import { attendanceSchema, sessionSchema } from '@/lib/validators/session';

describe('sessionSchema', () => {
  it('accepts training session', () => {
    const result = sessionSchema.safeParse({
      teamId: '00000000-0000-4000-8000-000000000099',
      scheduledStart: '2026-09-03T09:00:00.000Z',
      sessionType: 'training',
    });
    expect(result.success).toBe(true);
  });

  it('defaults sessionType to training', () => {
    const result = sessionSchema.safeParse({
      teamId: '00000000-0000-4000-8000-000000000099',
      scheduledStart: '2026-09-03T09:00:00.000Z',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sessionType).toBe('training');
    }
  });
});

describe('attendanceSchema', () => {
  it('accepts QR present status', () => {
    const result = attendanceSchema.safeParse({
      sessionId: '40000000-0000-4000-8000-000000000001',
      playerId: '30000000-0000-4000-8000-000000000001',
      status: 'present',
      method: 'qr',
    });
    expect(result.success).toBe(true);
  });
});
