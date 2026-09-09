import type { Locale } from '../types';

export const reports = {
  id: {
    title: 'Rapor pemain',
    subtitle: 'Generate draf AI, review, lalu setujui untuk pemain',
    createDraft: 'Buat draf rapor',
    generateDraft: 'Generate draf rapor',
    generating: 'Membuat draf...',
    selectPlayer: 'Pilih pemain terlebih dahulu.',
    generateFailed: 'Gagal membuat draf rapor.',
    emptyTitle: 'Belum ada rapor',
    emptyDesc: 'Generate draf rapor untuk pemain di tim Anda.',
    approve: 'Setujui',
    pdf: 'PDF',
    statusDraft: 'draft',
    statusApproved: 'approved',
  },
  en: {
    title: 'Player reports',
    subtitle: 'Generate AI drafts, review, then approve for players',
    createDraft: 'Create report draft',
    generateDraft: 'Generate report draft',
    generating: 'Generating draft...',
    selectPlayer: 'Select a player first.',
    generateFailed: 'Failed to generate report draft.',
    emptyTitle: 'No reports yet',
    emptyDesc: 'Generate report drafts for players on your team.',
    approve: 'Approve',
    pdf: 'PDF',
    statusDraft: 'draft',
    statusApproved: 'approved',
  },
} as const satisfies Record<Locale, Record<string, unknown>>;

export type ReportsMessages = (typeof reports)[Locale];
