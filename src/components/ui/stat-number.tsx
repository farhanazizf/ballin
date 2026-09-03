'use client';

import { useRef, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatNumberProps {
  value: number;
  label?: string;
  suffix?: string;
  size?: 'giant' | 'large' | 'card' | 'compact';
  theme?: 'field' | 'report';
  animate?: boolean;
  className?: string;
}

const sizeMap = {
  giant: 'text-[56px] leading-[1.1] font-bold',
  large: 'text-[40px] leading-[1.1] font-bold',
  card: 'text-[28px] leading-[1.2] font-semibold',
  compact: 'text-xl leading-[1.2] font-semibold',
};

export function StatNumber({
  value,
  label,
  suffix,
  size = 'card',
  theme = 'field',
  animate = true,
  className,
}: StatNumberProps) {
  const spring = useSpring(0, { stiffness: 120, damping: 25 });
  const display = useTransform(spring, (v) => Math.round(v).toString());
  const prevValue = useRef(value);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (animate && !prefersReducedMotion.current) {
      spring.set(value);
    } else {
      spring.jump(value);
    }
    prevValue.current = value;
  }, [value, animate, spring]);

  const textColor = theme === 'field' ? 'text-[var(--color-field-text)]' : 'text-[var(--color-report-text)]';
  const labelColor = theme === 'field' ? 'text-[var(--color-field-text-3)]' : 'text-[var(--color-report-text-3)]';

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-baseline gap-1">
        <motion.span
          className={cn(
            'font-[family-name:var(--font-display)] tabular-nums',
            sizeMap[size],
            textColor
          )}
        >
          {display}
        </motion.span>
        {suffix && (
          <span className={cn(
            'font-[family-name:var(--font-ui)] text-sm font-medium',
            labelColor
          )}>
            {suffix}
          </span>
        )}
      </div>
      {label && (
        <span className={cn(
          'font-[family-name:var(--font-ui)] text-sm font-medium mt-0.5',
          labelColor
        )}>
          {label}
        </span>
      )}
    </div>
  );
}
