"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1] as const;

interface HeroProps {
  compact?: boolean;
}

export function Hero({ compact }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--color-accent)]/8 blur-[120px]"
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--color-accent-2)]/6 blur-[100px]"
          animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-[var(--color-accent-soft)]/40 blur-[80px]" />
      </div>

      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${compact ? "pt-10 pb-4 sm:pt-14 sm:pb-6" : "pt-20 pb-16 sm:pt-28 sm:pb-24"}`}>
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="text-sm font-medium text-[var(--color-accent)] mb-4 tracking-wide uppercase"
          >
            100 proven frameworks, in one place
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="font-[var(--font-heading)] text-4xl sm:text-5xl lg:text-6xl text-[var(--color-text)] leading-[1.1] mb-6"
          >
            Explore 100 frameworks for clearer thinking and better decisions
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className={`text-lg sm:text-xl text-[var(--color-text-muted)] leading-relaxed max-w-2xl ${compact ? "mb-0" : "mb-10"}`}
          >
            From framing problems and testing ideas to comparing options, prioritizing tradeoffs, and planning next steps — discover structured methods for tackling complex questions with more clarity.
          </motion.p>

          {/* CTAs — hidden in compact mode */}
          {!compact && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/discover">
                <Button size="lg">
                  Explore all frameworks
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
              </Link>
              <Link href="/map">
                <Button variant="secondary" size="lg">
                  View framework map
                </Button>
              </Link>
            </motion.div>
          )}
        </div>

        {/* Stats — hidden in compact mode */}
        {!compact && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg"
          >
            {[
              { value: "100", label: "Frameworks" },
              { value: "7", label: "Categories" },
              { value: "100%", label: "Source-verified" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-[var(--font-heading)] text-3xl text-[var(--color-text)]">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--color-text-muted)] mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
