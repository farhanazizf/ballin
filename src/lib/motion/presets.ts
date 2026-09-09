import type { Transition, Variants } from 'framer-motion';

export const tapTransition: Transition = { duration: 0.1, ease: 'easeOut' };

export const enterTransition: Transition = {
  duration: 0.32,
  ease: [0.25, 0.46, 0.45, 0.94],
};

export const pageEnter: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: enterTransition,
  },
};

export const fadeUpItem: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: enterTransition,
  },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

export const heroLine: Variants = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

export const heroPanel: Variants = {
  initial: { opacity: 0, x: -12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export const formPanel: Variants = {
  initial: { opacity: 0, x: 12 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.06 },
  },
};

export const listRow: Variants = {
  initial: { opacity: 0, y: 16, x: -6 },
  animate: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

export const listStagger: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};
