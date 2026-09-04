import type { ReportContent } from '@/lib/validators/report';
import type { ReportDraftContext } from '@/lib/ai/provider';
import { reportContentSchema } from '@/lib/validators/report';

export async function generateWithClaude(context: ReportDraftContext): Promise<ReportContent> {
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL ?? 'claude-sonnet-4-20250514';
  if (!apiKey) throw new Error('AI_API_KEY tidak tersedia');

  const prompt = `Buat rapor bulanan pemain basket usia sekolah dalam bahasa Indonesia.
Pemain: ${context.playerName} (${context.nickname})
Periode: ${context.periodStart} sampai ${context.periodEnd}
Kehadiran: ${context.attendanceRate}%
Drill: ${context.recentDrills.join(', ') || 'belum ada'}
Rubrik: ${context.rubricSummary ?? 'belum ada'}
Catatan coach: ${context.notes.join(' | ') || 'belum ada'}

Balas HANYA JSON dengan keys: summary (string), highlights (string[]), improvements (string[]).
Jangan sebut peringkat atau bandingkan dengan pemain lain.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`);
  }

  const body = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const text = body.content?.find((part) => part.type === 'text')?.text ?? '';
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('AI response bukan JSON');
  }

  const parsed = reportContentSchema.parse(JSON.parse(text.slice(jsonStart, jsonEnd + 1)));
  return parsed;
}
