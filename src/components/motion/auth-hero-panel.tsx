'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { formPanel, heroLine, heroPanel } from '@/lib/motion/presets';

export function AuthHeroPanel({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div variants={heroPanel} initial="initial" animate="animate">
      {children}
    </motion.div>
  );
}

export function AuthHeroTitle({ title }: { title: string }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(3.5rem,14vw,7.5rem)] font-black uppercase leading-none tracking-[-0.06em] text-[var(--color-phosphor)]">
        {title}
      </h1>
    );
  }

  return (
    <motion.h1
      className="mt-4 font-[family-name:var(--font-display)] text-[clamp(3.5rem,14vw,7.5rem)] font-black uppercase leading-none tracking-[-0.06em] text-[var(--color-phosphor)]"
      variants={heroLine}
      initial="initial"
      animate="animate"
    >
      {title}
    </motion.h1>
  );
}

export function AuthHeroQuote({
  quote,
  attribution,
}: {
  quote: string;
  attribution: string;
}) {
  return (
    <blockquote className="mt-6 max-w-[36ch] border-l-2 border-[var(--color-hazard)] pl-4">
      <p className="font-[family-name:var(--font-ui)] text-sm italic leading-relaxed text-[var(--color-field-text-2)]">
        &ldquo;{quote}&rdquo;
      </p>
      <footer className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-field-text-3)]">
        — {attribution}
      </footer>
    </blockquote>
  );
}

export function AuthFormPanel({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div variants={formPanel} initial="initial" animate="animate">
      {children}
    </motion.div>
  );
}
