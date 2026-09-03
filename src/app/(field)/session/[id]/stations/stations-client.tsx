'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Barbell } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { cacheFieldBootstrap } from '@/lib/field/bootstrap';

type DrillRow = { id: string; name: string; category: string };

export function StationsClient({ sessionId, teamName }: { sessionId: string; teamName: string }) {
  const [drills, setDrills] = useState<DrillRow[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/field/bootstrap?sessionId=${sessionId}`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      await cacheFieldBootstrap(data);
      setDrills(data.drills.map((d: DrillRow) => ({ id: d.id, name: d.name, category: d.category })));
    }
    void load();
  }, [sessionId]);

  return (
    <div className="min-h-[100dvh] p-4">
      <header className="flex items-center gap-3 mb-6">
        <Link href={`/session/${sessionId}/attendance`} className="text-[var(--color-field-text-3)]">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-field-text)]">
            Pilih drill · {teamName}
          </h1>
        </div>
      </header>

      <ul className="space-y-2">
        {drills.map((drill) => (
          <li key={drill.id}>
            <Link
              href={`/session/${sessionId}/drill/${drill.id}`}
              className={cn(
                'flex items-center gap-3 px-4 py-4 rounded-[var(--radius-panel)]',
                'border border-[var(--color-field-border)] bg-[var(--color-field-surface)]',
                'min-h-[var(--size-touch-min)] active:scale-[0.99]',
              )}
            >
              <Barbell size={22} className="text-[var(--color-leather)] shrink-0" />
              <div>
                <p className="font-[family-name:var(--font-ui)] font-semibold text-[var(--color-field-text)]">
                  {drill.name}
                </p>
                <p className="text-xs text-[var(--color-field-text-3)]">{drill.category}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
