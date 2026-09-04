'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, CircleNotch } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import type { PlayerNoteRow } from '@/lib/queries/notes';

export function CloseClient({ sessionId }: { sessionId: string }) {
  const [sessionNotes, setSessionNotes] = useState('');
  const [playerNotes, setPlayerNotes] = useState<PlayerNoteRow[]>([]);
  const [noteText, setNoteText] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [roster, setRoster] = useState<Array<{ id: string; nickname: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function refresh() {
    const res = await fetch(`/api/sessions/${sessionId}/notes`, { credentials: 'include' });
    if (!res.ok) return;
    const json = (await res.json()) as { sessionNotes: string | null; playerNotes: PlayerNoteRow[] };
    setSessionNotes(json.sessionNotes ?? '');
    setPlayerNotes(json.playerNotes);
  }

  useEffect(() => {
    void refresh();
    void fetch(`/api/sessions/${sessionId}/rubric`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) return;
        const json = (await res.json()) as { scores: Array<{ playerId: string; nickname: string }> };
        setRoster(json.scores.map((s) => ({ id: s.playerId, nickname: s.nickname })));
        setPlayerId(json.scores[0]?.playerId ?? '');
      });
  }, [sessionId]);

  function saveSessionNotes() {
    startTransition(async () => {
      setError(null);
      const res = await fetch(`/api/sessions/${sessionId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'session', notes: sessionNotes }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) setError(body.error ?? 'Gagal menyimpan catatan sesi.');
    });
  }

  function addPlayerNote() {
    if (!playerId || !noteText.trim()) {
      setError('Pilih pemain dan tulis catatan.');
      return;
    }
    startTransition(async () => {
      setError(null);
      const res = await fetch(`/api/sessions/${sessionId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'player', playerId, note: noteText.trim(), kind: 'observation' }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? 'Gagal menyimpan catatan pemain.');
        return;
      }
      setNoteText('');
      await refresh();
    });
  }

  return (
    <div className="min-h-[100dvh] pb-24 px-4 py-6">
      <Link href={`/session/${sessionId}/rubric`} className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-field-text-3)] mb-6">
        <ArrowLeft size={16} /> Rubrik
      </Link>

      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--color-field-text)] mb-6">Catatan sesi</h1>
      {error ? <p className="mb-4 font-mono text-xs text-[var(--color-hazard)]">{error}</p> : null}

      <label className="block mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-field-text-3)]">Catatan umum sesi</span>
        <textarea
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          rows={4}
          className="mt-2 w-full border border-[var(--color-field-border)] bg-[var(--color-field-bg)] p-3 text-sm text-[var(--color-field-text)]"
          placeholder="Ringkasan latihan hari ini..."
        />
      </label>

      <Button variant="primary" size="field" className="w-full mb-8" disabled={isPending} onClick={saveSessionNotes}>
        {isPending ? <CircleNotch className="animate-spin" size={18} /> : 'Simpan catatan sesi'}
      </Button>

      <h2 className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-field-text-3)] mb-3">Catatan per pemain</h2>
      <div className="flex flex-col gap-2 mb-4">
        <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} className="h-11 border border-[var(--color-field-border)] bg-[var(--color-field-bg)] px-3">
          {roster.map((p) => (
            <option key={p.id} value={p.id}>{p.nickname}</option>
          ))}
        </select>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={3}
          className="w-full border border-[var(--color-field-border)] bg-[var(--color-field-bg)] p-3 text-sm"
          placeholder="Observasi singkat..."
        />
        <Button variant="secondary" size="field" disabled={isPending} onClick={addPlayerNote}>Tambah catatan</Button>
      </div>

      <ul className="space-y-2">
        {playerNotes.map((note) => (
          <li key={note.id} className="border border-[var(--color-field-border)] p-3 text-sm">
            <p className="font-semibold text-[var(--color-field-text)]">{note.playerName}</p>
            <p className="text-[var(--color-field-text-2)] mt-1">{note.note}</p>
          </li>
        ))}
      </ul>

      <footer className="fixed bottom-0 inset-x-0 border-t border-[var(--color-field-border)] bg-[var(--color-field-bg)] p-4">
        <Link href="/sessions" className="block text-center font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-phosphor)]">
          Selesai — kembali ke daftar sesi
        </Link>
      </footer>
    </div>
  );
}
