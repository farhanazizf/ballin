'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { listRow, listStagger } from '@/lib/motion/presets';
import { cn } from '@/lib/utils';

export function StaggerList({
  children,
  className,
  as: Tag = 'ul',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'ul' | 'ol' | 'div';
}) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion.create(Tag);

  if (reduceMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={cn(className)}
      variants={listStagger}
      initial="initial"
      animate="animate"
    >
      {children}
    </MotionTag>
  );
}

export function StaggerRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <li className={className}>{children}</li>;
  }

  return (
    <motion.li className={cn(className)} variants={listRow}>
      {children}
    </motion.li>
  );
}
