import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const QR_PREFIX = 'BLN1:';

const styles = StyleSheet.create({
  page: { padding: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '48%',
    border: '1pt solid #ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  name: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  meta: { fontSize: 10, color: '#555', marginBottom: 6 },
  qr: { fontSize: 9, fontFamily: 'Courier', backgroundColor: '#f5f5f5', padding: 6 },
});

type CardRow = { nickname: string; jerseyNumber: number | null; token: string };

function buildDocument(cards: CardRow[]) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      ...cards.map((card) =>
        React.createElement(
          View,
          { key: card.token, style: styles.card },
          React.createElement(Text, { style: styles.name }, card.nickname),
          React.createElement(
            Text,
            { style: styles.meta },
            card.jerseyNumber != null ? `#${card.jerseyNumber}` : 'Tanpa nomor',
          ),
          React.createElement(Text, { style: styles.qr }, `${QR_PREFIX}${card.token}`),
        ),
      ),
    ),
  );
}

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'coach'].includes(profile.role)) {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  const playerId = request.nextUrl.searchParams.get('playerId');

  let query = supabase
    .from('player_cards')
    .select('token, players ( nickname, jersey_number )')
    .eq('organization_id', profile.organization_id)
    .is('revoked_at', null);

  if (playerId) {
    query = query.eq('player_id', playerId);
  }

  const { data: rows } = await query.limit(40);

  type Row = { token: string; players: { nickname: string; jersey_number: number | null } | null };

  const cards = ((rows ?? []) as Row[])
    .filter((r) => r.players)
    .map((r) => ({
      nickname: r.players!.nickname,
      jerseyNumber: r.players!.jersey_number,
      token: r.token,
    }));

  if (cards.length === 0) {
    return NextResponse.json(
      { error: 'Tidak ada kartu aktif. Buat kartu pemain dulu lewat admin.' },
      { status: 404 },
    );
  }

  const buffer = await renderToBuffer(buildDocument(cards));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="kartu-pemain-ballin.pdf"',
    },
  });
}
