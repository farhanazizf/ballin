import type { ReportContent } from '@/lib/validators/report';

export type ReportDraftContext = {
  playerName: string;
  nickname: string;
  periodStart: string;
  periodEnd: string;
  attendanceRate: number;
  recentDrills: string[];
  rubricSummary: string | null;
  notes: string[];
};

export async function generateReportDraft(context: ReportDraftContext): Promise<ReportContent> {
  if (process.env.AI_API_KEY) {
    try {
      const { generateWithClaude } = await import('@/lib/ai/claude');
      return await generateWithClaude(context);
    } catch {
      // fallback ke template jika API gagal
    }
  }

  const { generateTemplateDraft } = await import('@/lib/ai/template');
  return generateTemplateDraft(context);
}
