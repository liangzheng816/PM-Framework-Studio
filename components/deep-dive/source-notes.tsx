"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ConfidenceLevel } from "@/lib/types";

interface SourceNotesProps {
  canonicalStatus: string;
  confidence: ConfidenceLevel;
  referencesHtml: string;
  lineageHtml: string;
}

export function SourceNotes({
  canonicalStatus,
  confidence,
  referencesHtml,
  lineageHtml,
}: SourceNotesProps) {
  const [open, setOpen] = useState(false);

  const isCanonical = confidence === "high";

  return (
    <section
      id="source-notes-and-lineage"
      className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          {/* Shield icon */}
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              isCanonical
                ? "bg-[var(--color-confidence-high-soft)] text-[var(--color-confidence-high)]"
                : "bg-[var(--color-confidence-moderate-soft)] text-[var(--color-confidence-moderate)]"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <div className="text-left">
            <h2 className="font-[var(--font-heading)] text-lg text-[var(--color-text)]">
              Source & Lineage
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {canonicalStatus}
            </p>
          </div>
        </div>

        <svg
          className={`w-5 h-5 text-[var(--color-text-subtle)] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-[var(--color-border)] pt-4">
              {/* Confidence badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider">
                  Confidence
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-[var(--radius-sm)] font-medium border ${
                    isCanonical
                      ? "bg-[var(--color-confidence-high-soft)] text-[var(--color-confidence-high)] border-[var(--color-confidence-high)]/25"
                      : "bg-[var(--color-confidence-moderate-soft)] text-[var(--color-confidence-moderate)] border-[var(--color-confidence-moderate)]/25"
                  }`}
                >
                  {isCanonical ? "High — Canonical" : "Moderate — Adapted/Synthesized"}
                </span>
              </div>

              {/* Lineage */}
              {lineageHtml && (
                <div>
                  <h3 className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                    Origin & Lineage
                  </h3>
                  <div
                    className="text-sm text-[var(--color-text-muted)] leading-relaxed [&_strong]:text-[var(--color-text)] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1"
                    dangerouslySetInnerHTML={{ __html: lineageHtml }}
                  />
                </div>
              )}

              {/* References */}
              {referencesHtml && (
                <div>
                  <h3 className="text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-2">
                    Authority Trail
                  </h3>
                  <div
                    className="text-sm text-[var(--color-text-muted)] leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1"
                    dangerouslySetInnerHTML={{ __html: referencesHtml }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
