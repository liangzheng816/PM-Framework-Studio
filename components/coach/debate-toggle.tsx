"use client";

interface DebateToggleProps {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function DebateToggle({ active, onToggle, disabled }: DebateToggleProps) {
  return (
    <button
      aria-pressed={active}
      onClick={onToggle}
      disabled={disabled}
      className={`flex shrink-0 items-center gap-1.5 rounded-[var(--radius-full)] border px-3 py-1 text-xs font-medium transition-all duration-150 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-accent-2)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg)] disabled:opacity-50 disabled:pointer-events-none ${
        active
          ? "border-[var(--color-accent-2)]/30 text-[var(--color-accent-2)]"
          : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
      }`}
      style={
        active
          ? { backgroundColor: "color-mix(in srgb, var(--color-accent-2) 12%, transparent)" }
          : undefined
      }
    >
      {/* Two speech bubbles icon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3.5C2 2.67 2.67 2 3.5 2h5C9.33 2 10 2.67 10 3.5v3c0 .83-.67 1.5-1.5 1.5H5.5L3.5 10V8H3.5C2.67 8 2 7.33 2 6.5v-3z" />
        <path d="M6 10v.5c0 .83.67 1.5 1.5 1.5h2.5l2 2v-2h.5c.83 0 1.5-.67 1.5-1.5v-3c0-.83-.67-1.5-1.5-1.5H10" />
      </svg>
      Debate
      {active && (
        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
        </svg>
      )}
    </button>
  );
}
