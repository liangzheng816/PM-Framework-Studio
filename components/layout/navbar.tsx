"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Coach" },
  { href: "/discover", label: "Discover" },
  { href: "/map", label: "Map" },
  { href: "/compare", label: "Compare" },
  { href: "/collections", label: "Saved" },
  { href: "/ai-learning/", label: "AI Learning" },
  { href: "/ai-weekly/index.html", label: "AI Weekly" },
  { href: "/about", label: "About" },
];

export function NavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)]">
            <span className="text-sm font-bold text-white">PM</span>
          </div>
          <span className="font-[var(--font-heading)] text-lg text-[var(--color-text)]">
            PM Studio
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            const className = `px-3 py-2 text-sm rounded-[var(--radius-md)] transition-colors duration-[var(--motion-fast)] ${
              isActive
                ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
            }`;
            // Static HTML targets (e.g. /ai-weekly/index.html) bypass next/link to avoid prefetch + client routing on a non-route URL.
            if (link.href.endsWith(".html")) {
              return (
                <a key={link.href} href={link.href} className={className}>
                  {link.label}
                </a>
              );
            }
            return (
              <Link key={link.href} href={link.href} className={className}>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Search shortcut hint */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("fs:open-search"));
            }}
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Search...
            <kbd className="ml-2 rounded bg-[var(--color-surface-2)] px-1.5 py-0.5 text-xs font-mono text-[var(--color-text-subtle)]">
              /
            </kbd>
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] px-2.5 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition-colors cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 7.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
            )}
          </svg>
          <span>{mobileOpen ? "Close" : "Menu"}</span>
        </button>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            const className = `block px-3 py-2.5 text-sm rounded-[var(--radius-md)] ${
              isActive
                ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`;
            if (link.href.endsWith(".html")) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={className}
                >
                  {link.label}
                </a>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={className}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
