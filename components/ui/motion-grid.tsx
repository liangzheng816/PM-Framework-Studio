"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface MotionGridProps {
  children: ReactNode;
  className?: string;
}

export function MotionGrid({ children, className = "" }: MotionGridProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.04 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function MotionGridItem({ children, className = "" }: MotionGridProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
