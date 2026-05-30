import type { ConfidenceLevel } from "@/lib/types";

interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
  /** Full descriptive label ("High — Canonical"), else short label ("Canonical"/"Adapted") */
  variant?: "short" | "full";
  className?: string;
}

/** Confidence badge — drives off `--color-confidence-*` tokens. */
export function ConfidenceBadge({
  confidence,
  variant = "short",
  className = "",
}: ConfidenceBadgeProps) {
  const isHigh = confidence === "high";
  const label = variant === "full"
    ? (isHigh ? "High — Canonical" : "Moderate — Adapted/Synthesized")
    : (isHigh ? "Canonical" : "Adapted");
  const colorClasses = isHigh
    ? "bg-[var(--color-confidence-high-soft)] text-[var(--color-confidence-high)] border-[var(--color-confidence-high)]/25"
    : "bg-[var(--color-confidence-moderate-soft)] text-[var(--color-confidence-moderate)] border-[var(--color-confidence-moderate)]/25";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-[var(--radius-sm)] font-medium border ${colorClasses} ${className}`}
    >
      <svg
        className="w-3 h-3"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        {isHigh ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        )}
      </svg>
      {label}
    </span>
  );
}
