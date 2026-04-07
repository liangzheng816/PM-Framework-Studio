import type { CategorySlug } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/category-colors";

interface ChipProps {
  label: string;
  category?: CategorySlug;
  size?: "sm" | "md";
  className?: string;
}

export function Chip({ label, category, size = "sm", className = "" }: ChipProps) {
  const colors = category ? CATEGORY_COLORS[category] : null;

  const base =
    size === "sm"
      ? "px-2.5 py-0.5 text-xs"
      : "px-3 py-1 text-sm";

  if (colors) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-[var(--radius-full)] font-medium ${base} ${colors.bg} ${colors.text} ${colors.border} border ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        {label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-full)] font-medium ${base} bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)] ${className}`}
    >
      {label}
    </span>
  );
}

interface ConfidenceBadgeProps {
  confidence: "high" | "moderate";
  className?: string;
}

export function ConfidenceBadge({ confidence, className = "" }: ConfidenceBadgeProps) {
  const isHigh = confidence === "high";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-[var(--radius-sm)] font-medium ${
        isHigh
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
      } ${className}`}
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
      {isHigh ? "Canonical" : "Adapted"}
    </span>
  );
}
