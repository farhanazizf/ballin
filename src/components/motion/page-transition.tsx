'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { pageEnter } from '@/lib/motion/presets';
import { cn } from '@/lib/utils';

export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      key={pathname}
      className={cn(className)}
      variants={pageEnter}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
}
