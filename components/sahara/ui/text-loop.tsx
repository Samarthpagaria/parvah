'use client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, Transition, Variants } from 'framer-motion';
import { useState, useEffect, Children } from 'react';

type TextLoopProps = {
  children: React.ReactNode[];
  className?: string;
  interval?: number;
  index?: number;
  transition?: Transition;
  variants?: Variants;
  onIndexChange?: (index: number) => void;
};

export function TextLoop({
  children,
  className,
  interval = 2,
  index: externalIndex,
  transition = { duration: 0.3 },
  variants,
  onIndexChange,
}: TextLoopProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const items = Children.toArray(children);
  const currentIndex = externalIndex !== undefined ? externalIndex : internalIndex;

  useEffect(() => {
    if (externalIndex !== undefined) return;

    const intervalMs = interval * 1000;
    const timer = setInterval(() => {
      setInternalIndex((current) => {
        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, externalIndex]);

  const motionVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <AnimatePresence mode='popLayout' initial={false}>
        <motion.div
          key={currentIndex}
          initial='initial'
          animate='animate'
          exit='exit'
          transition={transition}
          variants={variants || motionVariants}
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
