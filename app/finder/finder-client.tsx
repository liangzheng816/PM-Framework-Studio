"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Framework, CategorySlug } from "@/lib/types";
import { FrameworkCard } from "@/components/framework-card/framework-card";
import { Button } from "@/components/ui/button";

interface FinderClientProps {
  frameworks: Framework[];
}

interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: { label: string; value: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "goal",
    title: "What are you trying to do?",
    subtitle: "Pick the activity that best describes your current need.",
    options: [
      { label: "Understand users & their needs", value: "user-insights" },
      { label: "Define or frame a problem", value: "problem-framing" },
      { label: "Generate ideas or directions", value: "ideation" },
      { label: "Test or validate an idea", value: "validation" },
      { label: "Prioritize or ship work", value: "execution" },
      { label: "Grow users or revenue", value: "growth" },
      { label: "Think about strategy or systems", value: "systems-thinking" },
    ],
  },
  {
    id: "time",
    title: "How much time do you have?",
    subtitle: "This helps filter by complexity.",
    options: [
      { label: "Under 30 minutes", value: "low" },
      { label: "A few hours", value: "medium" },
      { label: "A day or more", value: "high" },
    ],
  },
  {
    id: "evidence",
    title: "How much evidence do you have?",
    subtitle: "Some frameworks need data, others work from intuition.",
    options: [
      { label: "Very little — mostly instinct", value: "low" },
      { label: "Some research or data", value: "medium" },
      { label: "Rich data and prior research", value: "high" },
    ],
  },
  {
    id: "team",
    title: "Working solo or with a team?",
    subtitle: "Some frameworks shine in group settings.",
    options: [
      { label: "Solo", value: "solo" },
      { label: "Small team (2–5)", value: "small" },
      { label: "Large group (6+)", value: "large" },
    ],
  },
];

type Answers = Record<string, string>;

export function FinderClient({ frameworks }: FinderClientProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = QUESTIONS[step];

  function selectOption(value: string) {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setShowResults(true);
    }
  }

  function reset() {
    setStep(0);
    setAnswers({});
    setShowResults(false);
  }

  const recommendations = useMemo(() => {
    if (!showResults) return [];

    let results = [...frameworks];

    // Filter by category (strongest signal)
    const goalCategory = answers.goal as CategorySlug | undefined;
    if (goalCategory) {
      results = results.filter((f) => f.category === goalCategory);
    }

    // Score by complexity match
    const timeComplexity = answers.time;
    if (timeComplexity) {
      results.sort((a, b) => {
        const scoreA = a.complexity === timeComplexity ? 2 : 1;
        const scoreB = b.complexity === timeComplexity ? 2 : 1;
        return scoreB - scoreA;
      });
    }

    // Prefer high confidence
    results.sort((a, b) => {
      if (a.confidence === "high" && b.confidence !== "high") return -1;
      if (b.confidence === "high" && a.confidence !== "high") return 1;
      return 0;
    });

    return results.slice(0, 5);
  }, [showResults, answers, frameworks]);

  if (showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="font-[var(--font-heading)] text-3xl text-[var(--color-text)] mb-2">
          Your recommended frameworks
        </h1>
        <p className="text-[var(--color-text-muted)] mb-8">
          Based on your answers, here are the best matches.
        </p>

        <div className="space-y-4 mb-8">
          {recommendations.map((fw, i) => (
            <motion.div
              key={fw.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <FrameworkCard framework={fw} variant="compact" />
            </motion.div>
          ))}
        </div>

        <Button variant="secondary" onClick={reset}>
          Start over
        </Button>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex gap-1.5 mb-10">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= step
                ? "bg-[var(--color-accent)]"
                : "bg-[var(--color-surface-3)]"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-sm text-[var(--color-text-subtle)] mb-2">
            Question {step + 1} of {QUESTIONS.length}
          </p>
          <h1 className="font-[var(--font-heading)] text-3xl text-[var(--color-text)] mb-2">
            {currentQuestion.title}
          </h1>
          <p className="text-[var(--color-text-muted)] mb-8">
            {currentQuestion.subtitle}
          </p>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => selectOption(option.value)}
                className="w-full text-left px-5 py-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-accent)]/5 transition-all duration-[var(--motion-default)] cursor-pointer"
              >
                {option.label}
              </button>
            ))}
          </div>

          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="mt-6 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
            >
              ← Back
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
