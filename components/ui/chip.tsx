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

// ConfidenceBadge moved to components/ui/confidence-badge.tsx
export { ConfidenceBadge } from "./confidence-badge";
