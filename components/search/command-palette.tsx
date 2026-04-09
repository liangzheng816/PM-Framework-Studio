"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import type { SearchableFramework } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import type { CategorySlug } from "@/lib/types";

interface CommandPaletteProps {
  searchIndex: SearchableFramework[];
}

export function CommandPalette({ searchIndex }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fuse = useMemo(
    () =>
      new Fuse(searchIndex, {
        keys: [
          { name: "title", weight: 2 },
          { name: "aliases", weight: 1.5 },
          { name: "best_for", weight: 1.2 },
          { name: "summary", weight: 1 },
          { name: "categoryLabel", weight: 0.8 },
        ],
        threshold: 0.3,
        minMatchCharLength: 2,
      }),
    [searchIndex]
  );

  const results = useMemo(() => {
    if (!query.trim()) return searchIndex.slice(0, 8);
    return fuse.search(query).map((r) => r.item).slice(0, 12);
  }, [query, searchIndex, fuse]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const navigate = useCallback(
    (slug: string) => {
      close();
      router.push(`/framework/${slug}`);
    },
    [close, router]
  );

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Open: Cmd+K or /
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && !isInputElement(e.target))
      ) {
        e.preventDefault();
        setOpen(true);
      }

      // Close: Escape
      if (e.key === "Escape" && open) {
        e.preventDefault();
        close();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    // Listen for programmatic open (e.g. navbar search button)
    function handleOpen() {
      setOpen(true);
    }
    window.addEventListener("fs:open-search", handleOpen);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("fs:open-search", handleOpen);
    };
  }, [open, close]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Reset active index when results change
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: reset derived state on dependency change
  useEffect(() => { setActiveIndex(0); }, [results]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      navigate(results[activeIndex].slug);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Search frameworks">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative mx-auto mt-[15vh] w-full max-w-xl px-4">
        <div className="rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b border-[var(--color-border)]">
            <svg
              className="w-5 h-5 text-[var(--color-text-subtle)] shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search frameworks..."
              role="combobox"
              aria-expanded={true}
              aria-controls="command-palette-results"
              aria-activedescendant={results[activeIndex] ? `cp-${results[activeIndex].slug}` : undefined}
              className="flex-1 bg-transparent py-4 text-base text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:outline-none"
            />
            <kbd className="rounded bg-[var(--color-surface-2)] px-1.5 py-0.5 text-xs font-mono text-[var(--color-text-subtle)]">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <ul id="command-palette-results" role="listbox" className="max-h-[50vh] overflow-y-auto py-2">
            {results.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
                No frameworks found
              </li>
            ) : (
              results.map((item, i) => {
                const colors = CATEGORY_COLORS[item.category as CategorySlug];
                return (
                  <li key={item.slug}>
                    <button
                      id={`cp-${item.slug}`}
                      role="option"
                      aria-selected={i === activeIndex}
                      onClick={() => navigate(item.slug)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer ${
                        i === activeIndex
                          ? "bg-[var(--color-accent)]/10"
                          : "hover:bg-[var(--color-surface-2)]"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-sm font-medium ${
                            i === activeIndex
                              ? "text-[var(--color-accent)]"
                              : "text-[var(--color-text)]"
                          }`}
                        >
                          {item.title}
                        </div>
                        <div className="text-xs text-[var(--color-text-subtle)] truncate mt-0.5">
                          {item.summary}
                        </div>
                      </div>
                      <span className="text-xs text-[var(--color-text-subtle)] shrink-0">
                        {item.categoryLabel}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer hints */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[var(--color-border)] text-xs text-[var(--color-text-subtle)]">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-[var(--color-surface-2)] px-1 py-0.5 font-mono">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-[var(--color-surface-2)] px-1 py-0.5 font-mono">↵</kbd>
              open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-[var(--color-surface-2)] px-1 py-0.5 font-mono">esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || target.isContentEditable;
}
