"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import type { Framework, Category, CategorySlug } from "@/lib/types";
import { FrameworkCard } from "@/components/framework-card/framework-card";

interface DiscoverClientProps {
  frameworks: Framework[];
  categories: Category[];
  featured: Framework[];
}

export function DiscoverClient({
  frameworks,
  categories,
  featured,
}: DiscoverClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategorySlug | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fuse = useMemo(
    () =>
      new Fuse(frameworks, {
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
    [frameworks]
  );

  const filtered = useMemo(() => {
    let result = frameworks;

    if (search.trim()) {
      result = fuse.search(search).map((r) => r.item);
    }

    if (selectedCategory !== "all") {
      result = result.filter((f) => f.category === selectedCategory);
    }

    return result;
  }, [search, selectedCategory, frameworks, fuse]);

  const isDefaultView = !search.trim() && selectedCategory === "all";

  return (
    <div>
      {/* Search + category filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-subtle)]"
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
            type="text"
            placeholder="Search frameworks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-10 pr-4 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`text-sm px-3 py-1.5 rounded-[var(--radius-full)] border transition-colors cursor-pointer ${
              selectedCategory === "all"
                ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30"
                : "text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)]"
            }`}
          >
            All ({frameworks.length})
          </button>
          {categories
            .filter((c) => c.slug !== "appendix")
            .map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`text-sm px-3 py-1.5 rounded-[var(--radius-full)] border transition-colors cursor-pointer ${
                  selectedCategory === cat.slug
                    ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/30"
                    : "text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)]"
                }`}
              >
                {cat.label} ({cat.frameworkCount})
              </button>
            ))}
        </div>
      </div>

      {/* Featured — only in default unfiltered state */}
      {isDefaultView && featured.length > 0 && (
        <section className="mb-10">
          <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-text)] mb-6">
            Featured frameworks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((fw) => (
              <FrameworkCard key={fw.slug} framework={fw} variant="featured" />
            ))}
          </div>
        </section>
      )}

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[var(--color-text-muted)]">
          {isDefaultView ? "All frameworks" : `${filtered.length} framework${filtered.length !== 1 ? "s" : ""}`}
          {search && ` matching "${search}"`}
        </p>

        {/* View mode toggle */}
        <div className="flex gap-1 p-1 rounded-[var(--radius-md)] bg-[var(--color-surface-2)]">
          <button
            onClick={() => setViewMode("grid")}
            className={`text-sm px-3 py-1 rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`text-sm px-3 py-1 rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
              viewMode === "list"
                ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Framework grid/list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--color-text-muted)] mb-2">
            No frameworks found
          </p>
          <p className="text-sm text-[var(--color-text-subtle)]">
            Try a different search term or clear your filters
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((fw) => (
            <FrameworkCard key={fw.slug} framework={fw} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((fw) => (
            <FrameworkCard key={fw.slug} framework={fw} variant="compact" />
          ))}
        </div>
      )}
    </div>
  );
}
