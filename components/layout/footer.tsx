import Link from "next/link";

const FOOTER_LINKS = [
  {
    heading: "Discover",
    links: [
      { href: "/discover", label: "Discover All" },
      { href: "/map", label: "Framework Map" },
      { href: "/compare", label: "Compare" },
      { href: "/finder", label: "Framework Finder" },
      { href: "/collections", label: "My Saved" },
    ],
  },
  {
    heading: "Categories",
    links: [
      { href: "/category/user-insights", label: "User Insights" },
      { href: "/category/problem-framing", label: "Problem Framing" },
      { href: "/category/ideation", label: "Ideation" },
      { href: "/category/validation", label: "Validation" },
      { href: "/category/execution", label: "Execution" },
      { href: "/category/growth", label: "Growth" },
      { href: "/category/systems-thinking", label: "Systems Thinking" },
    ],
  },
  {
    heading: "About",
    links: [
      { href: "/about", label: "Methodology" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)]">
                <span className="text-sm font-bold text-white">PM</span>
              </div>
              <span className="font-[var(--font-heading)] text-lg text-[var(--color-text)]">
                PM Studio
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-xs">
              100 product management frameworks. Source-verified, confidence-labeled, beautifully presented.
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.heading}>
              <h3 className="text-sm font-medium text-[var(--color-text)] mb-3">
                {group.heading}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-subtle)]">
            PM Studio — Built with care for product people.
          </p>
        </div>
      </div>
    </footer>
  );
}
