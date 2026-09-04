import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getReportById } from '@/lib/queries/reports';
import { buildReportDocument } from '@/lib/pdf/report-document';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesi berakhir.' }, { status: 401 });

  const report = await getReportById(supabase, id);
  if (!report) return NextResponse.json({ error: 'Rapor tidak ditemukan.' }, { status: 404 });

  const doc = buildReportDocument({
    playerName: report.playerName,
    periodStart: report.periodStart,
    periodEnd: report.periodEnd,
    content: report.content,
  });

  const buffer = await renderToBuffer(doc);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="rapor-${report.playerName.replace(/\s+/g, '-')}.pdf"`,
    },
  });
}
