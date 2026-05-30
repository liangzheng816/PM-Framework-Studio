interface EyebrowProps {
  children: React.ReactNode;
  tone?: "accent" | "muted";
  className?: string;
}

/** Small uppercase mono kicker. Pairs above a display heading. */
export function Eyebrow({ children, tone = "accent", className = "" }: EyebrowProps) {
  const color =
    tone === "accent" ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]";
  return (
    <p
      className={`font-[var(--font-mono)] text-xs font-semibold uppercase tracking-[0.22em] ${color} ${className}`}
    >
      {children}
    </p>
  );
}
