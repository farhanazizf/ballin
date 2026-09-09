import { describe, expect, it } from 'vitest';
import { parseQrPayload } from '@/lib/field/qr';
import { findLocalSessionDrill } from '@/lib/field/session-drill';
import { aggregateEvents } from '@/lib/field/drill-counts';

describe('parseQrPayload', () => {
  it('accepts Ballin card tokens', () => {
    expect(parseQrPayload('BLN1:aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')).toEqual({
      ok: true,
      token: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    });
  });

  it('explains the next step for foreign QR codes', () => {
    const result = parseQrPayload('QRIS-123');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('kartu Ballin');
    }
  });
});

describe('findLocalSessionDrill', () => {
  const rows = [
    { id: 'a', drillId: 'd1', stationId: undefined },
    { id: 'b', drillId: 'd1', stationId: 's1' },
  ];

  it('matches station-scoped and unscoped session drills separately', () => {
    expect(findLocalSessionDrill(rows, 'd1')?.id).toBe('a');
    expect(findLocalSessionDrill(rows, 'd1', 's1')?.id).toBe('b');
  });
});

describe('aggregateEvents DNP vs zero', () => {
  it('treats 0 made with no DNP as not DNP', () => {
    expect(aggregateEvents([])).toEqual({ made: 0, attempts: 0, isDnp: false });
  });

  it('treats a DNP event with no reps as DNP', () => {
    expect(aggregateEvents([{ result: 'dnp' }]).isDnp).toBe(true);
  });
});
