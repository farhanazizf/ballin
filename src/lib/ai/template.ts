import type { ReportContent } from '@/lib/validators/report';
import type { ReportDraftContext } from '@/lib/ai/provider';

export function generateTemplateDraft(context: ReportDraftContext): ReportContent {
  const highlights = [
    context.attendanceRate >= 75
      ? `Kehadiran ${context.attendanceRate}% selama periode ini`
      : 'Usaha hadir di latihan perlu ditingkatkan',
  ];

  if (context.recentDrills.length > 0) {
    highlights.push(`Drill aktif: ${context.recentDrills.slice(0, 2).join(', ')}`);
  }

  const improvements: string[] = [];
  if (context.attendanceRate < 75) {
    improvements.push('Tingkatkan konsistensi kehadiran latihan');
  }
  if (context.rubricSummary) {
    improvements.push('Perhatikan area rubrik yang masih bisa ditingkatkan');
  } else {
    improvements.push('Lanjutkan latihan fundamental secara rutin');
  }

  return {
    summary: `${context.nickname} menjalani periode ${context.periodStart} – ${context.periodEnd} dengan kehadiran ${context.attendanceRate}%. ${context.rubricSummary ?? 'Coach akan menambahkan detail setelah review.'}`,
    highlights,
    improvements,
  };
}
