interface CardProps {
  children: React.ReactNode;
  /** CSS color value for the left accent stripe (e.g. "var(--color-accent)"). When set, renders a 5px left border. */
  stripe?: string;
  /** Adds lift-on-hover affordance. Defaults to true when `href` is provided. */
  hoverable?: boolean;
  /** When provided, renders the card as an anchor. */
  href?: string;
  className?: string;
}

/**
 * Editorial card primitive — warm surface, ruled border, optional left accent stripe.
 * Standardizes the card pattern used across AI Learning landing, discover trust section,
 * and framework deep-dive related-card rows.
 */
export function Card({
  children,
  stripe,
  hoverable,
  href,
  className = "",
}: CardProps) {
  const lift = hoverable ?? Boolean(href);
  const base =
    "block rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 transition-[transform,box-shadow,border-color] duration-[var(--motion-default)]";
  const interactive = lift
    ? "hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] hover:border-[var(--color-border-strong)]"
    : "";
  const style = stripe
    ? {
        borderLeftWidth: "5px",
        borderLeftColor: stripe,
      }
    : undefined;
  const classes = `${base} ${interactive} ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={`${classes} no-underline text-inherit`} style={style}>
        {children}
      </a>
    );
  }
  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}
