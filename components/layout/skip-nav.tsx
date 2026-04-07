export function SkipNav() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-[var(--radius-md)] focus:bg-[var(--color-accent)] focus:text-white focus:text-sm focus:font-medium focus:outline-none"
    >
      Skip to main content
    </a>
  );
}
