interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

/** Section divider label — uppercase mono, sits above a row of cards or a content block. */
export function SectionLabel({ children, className = "" }: SectionLabelProps) {
  return (
    <div
      className={`font-[var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)] ${className}`}
    >
      {children}
    </div>
  );
}
