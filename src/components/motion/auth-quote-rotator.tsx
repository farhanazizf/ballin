'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { AthleteQuote } from '@/lib/constants/athlete-quotes';
import { pickRandomAthleteQuote } from '@/lib/constants/athlete-quotes';
import { AuthHeroQuote } from '@/components/motion/auth-hero-panel';

export function AuthQuoteRotator({ quotes }: { quotes: readonly AthleteQuote[] }) {
  const [selected, setSelected] = useState<AthleteQuote | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setSelected(pickRandomAthleteQuote(quotes));
  }, [quotes]);

  if (!selected) {
    return <div className="mt-6 min-h-[5.5rem]" aria-hidden />;
  }

  if (reduceMotion) {
    return <AuthHeroQuote quote={selected.quote} attribution={selected.quoteBy} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <AuthHeroQuote quote={selected.quote} attribution={selected.quoteBy} />
    </motion.div>
  );
}
