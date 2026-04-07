"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { Framework } from "@/lib/types";
import { Chip, ConfidenceBadge } from "@/components/ui/chip";
import { CATEGORY_COLORS } from "@/lib/category-colors";

interface CompareClientProps {
  frameworks: Framework[];
}

interface CompareRow {
  label: string;
  key: string;
  render: (fw: Framework) => React.ReactNode;
}

const COMPARE_ROWS: CompareRow[] = [
  {
    label: "Category",
    key: "category",
    render: (fw) => (
      <Chip label={fw.categoryLabel} category={fw.category} size="md" />
    ),
  },
  {
    label: "Summary",
    key: "summary",
    render: (fw) => <span className="text-sm leading-relaxed">{fw.summary}</span>,
  },
  {
    label: "Confidence",
    key: "confidence",
    render: (fw) => <ConfidenceBadge confidence={fw.confidence} />,
  },
  {
    label: "Complexity",
    key: "complexity",
    render: (fw) => <span className="capitalize">{fw.complexity}</span>,
  },
  {
    label: "Stage",
    key: "stage",
    render: (fw) => (
      <span className="capitalize">{fw.stage.join(", ") || "—"}</span>
    ),
  },
  {
    label: "Best for",
    key: "best_for",
    render: (fw) =>
      fw.best_for.length > 0 ? (
        <ul className="list-disc pl-4 text-sm space-y-1">
          {fw.best_for.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      ) : (
        <span className="text-[var(--color-text-subtle)]">—</span>
      ),
  },
  {
    label: "Inputs",
    key: "inputs",
    render: (fw) =>
      fw.inputs.length > 0 ? (
        <ul className="list-disc pl-4 text-sm space-y-1">
          {fw.inputs.map((inp, i) => (
            <li key={i}>{inp}</li>
          ))}
        </ul>
      ) : (
        <span className="text-[var(--color-text-subtle)]">—</span>
      ),
  },
  {
    label: "Outputs",
    key: "outputs",
    render: (fw) =>
      fw.outputs.length > 0 ? (
        <ul className="list-disc pl-4 text-sm space-y-1">
          {fw.outputs.map((out, i) => (
            <li key={i}>{out}</li>
          ))}
        </ul>
      ) : (
        <span className="text-[var(--color-text-subtle)]">—</span>
      ),
  },
  {
    label: "Companions",
    key: "companions",
    render: (fw) =>
      fw.companion_frameworks.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {fw.companion_frameworks.map((slug) => (
            <Link
              key={slug}
              href={`/framework/${slug}`}
              className="text-xs px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
            >
              {slug.replace(/-/g, " ")}
            </Link>
          ))}
        </div>
      ) : (
        <span className="text-[var(--color-text-subtle)]">—</span>
      ),
  },
];

export function CompareClient({ frameworks }: CompareClientProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [diffOnly, setDiffOnly] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(frameworks, {
        keys: [
          { name: "title", weight: 2 },
          { name: "aliases", weight: 1.5 },
          { name: "categoryLabel", weight: 1 },
        ],
        threshold: 0.3,
      }),
    [frameworks]
  );

  const searchResults = useMemo(() => {
    if (!search.trim()) return frameworks.slice(0, 10);
    return fuse.search(search).map((r) => r.item).slice(0, 10);
  }, [search, frameworks, fuse]);

  const selectedFrameworks = useMemo(
    () =>
      selected
        .map((slug) => frameworks.find((f) => f.slug === slug))
        .filter((f): f is Framework => f !== undefined),
    [selected, frameworks]
  );

  // Filter rows to show only differences
  const visibleRows = useMemo(() => {
    if (!diffOnly || selectedFrameworks.length < 2) return COMPARE_ROWS;
    return COMPARE_ROWS.filter((row) => {
      const values = selectedFrameworks.map((fw) => {
        const val = fw[row.key as keyof Framework];
        return JSON.stringify(val);
      });
      return new Set(values).size > 1;
    });
  }, [diffOnly, selectedFrameworks]);

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  function addFramework(slug: string) {
    if (selected.length >= 4 || selected.includes(slug)) return;
    setSelected([...selected, slug]);
    setSearch("");
    setShowSearch(false);
  }

  function removeFramework(slug: string) {
    setSelected(selected.filter((s) => s !== slug));
  }

  return (
    <div>
      {/* Selection area */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {selectedFrameworks.map((fw) => {
          const colors = CATEGORY_COLORS[fw.category];
          return (
            <div
              key={fw.slug}
              className={`flex items-center gap-2 rounded-[var(--radius-md)] border ${colors.border} ${colors.bg} px-3 py-2`}
            >
              <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
              <span className="text-sm font-medium text-[var(--color-text)]">
                {fw.title}
              </span>
              <button
                onClick={() => removeFramework(fw.slug)}
                className="ml-1 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                aria-label={`Remove ${fw.title}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}

        {selected.length < 4 && (
          <div className="relative">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add framework
            </button>

            {showSearch && (
              <div className="absolute top-full left-0 mt-2 w-72 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] z-50 overflow-hidden">
                <div className="p-2">
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search frameworks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
                <ul className="max-h-64 overflow-y-auto">
                  {searchResults
                    .filter((fw) => !selected.includes(fw.slug))
                    .map((fw) => (
                      <li key={fw.slug}>
                        <button
                          onClick={() => addFramework(fw.slug)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--color-surface-2)] transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-[var(--color-text)]">{fw.title}</span>
                          <span className="text-xs text-[var(--color-text-subtle)]">
                            {fw.categoryLabel}
                          </span>
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comparison table */}
      {selectedFrameworks.length >= 2 ? (
        <>
          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Comparing {selectedFrameworks.length} frameworks
            </p>
            <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={diffOnly}
                onChange={(e) => setDiffOnly(e.target.checked)}
                className="rounded accent-[var(--color-accent)]"
              />
              Differences only
            </label>
          </div>

          <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                  <th className="sticky left-0 z-10 bg-[var(--color-surface)] text-left px-4 py-3 font-medium text-[var(--color-text-subtle)] w-36 min-w-[144px]">
                    Attribute
                  </th>
                  {selectedFrameworks.map((fw) => (
                    <th
                      key={fw.slug}
                      className="text-left px-4 py-3 font-medium text-[var(--color-text)] min-w-[200px]"
                    >
                      <Link
                        href={`/framework/${fw.slug}`}
                        className="hover:text-[var(--color-accent)] transition-colors"
                      >
                        {fw.title}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, i) => (
                  <tr
                    key={row.key}
                    className={`border-b border-[var(--color-border)] ${
                      i % 2 === 0 ? "bg-[var(--color-bg)]" : "bg-[var(--color-surface)]"
                    }`}
                  >
                    <td className="sticky left-0 z-10 px-4 py-3 font-medium text-[var(--color-text-subtle)] bg-inherit">
                      {row.label}
                    </td>
                    {selectedFrameworks.map((fw) => (
                      <td
                        key={fw.slug}
                        className="px-4 py-3 text-[var(--color-text-muted)] align-top"
                      >
                        {row.render(fw)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : selectedFrameworks.length === 1 ? (
        <div className="text-center py-12 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]">
          <p className="text-[var(--color-text-muted)]">
            Add at least one more framework to compare
          </p>
        </div>
      ) : (
        <div className="text-center py-16 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]">
          <p className="text-[var(--color-text-muted)] mb-2">
            No frameworks selected
          </p>
          <p className="text-sm text-[var(--color-text-subtle)]">
            Click &quot;Add framework&quot; above to start comparing
          </p>
        </div>
      )}
    </div>
  );
}
