interface LeadProps {
  children: React.ReactNode;
  className?: string;
}

/** 21px lead paragraph — sits below a display heading. Muted color, max ~60ch. */
export function Lead({ children, className = "" }: LeadProps) {
  return (
    <p
      className={`text-[21px] leading-[1.5] text-[var(--color-text-muted)] max-w-[60ch] ${className}`}
    >
      {children}
    </p>
  );
}
