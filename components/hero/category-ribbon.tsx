import Link from "next/link";
import type { Category, Framework } from "@/lib/types";
import { FrameworkCard } from "@/components/framework-card/framework-card";
import { CATEGORY_COLORS } from "@/lib/category-colors";

interface CategoryRibbonProps {
  category: Category;
  frameworks: Framework[];
}

export function CategoryRibbon({ category, frameworks }: CategoryRibbonProps) {
  const colors = CATEGORY_COLORS[category.slug];

  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/category/${category.slug}`}
          className="group flex items-center gap-2"
        >
          <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
          <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
            {category.label}
          </h2>
          <span className="text-sm text-[var(--color-text-subtle)]">
            {category.frameworkCount}
          </span>
          <svg
            className="w-4 h-4 text-[var(--color-text-subtle)] group-hover:text-[var(--color-accent)] transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scroll-pl-4 scrollbar-hide">
        {frameworks.slice(0, 6).map((fw) => (
          <div key={fw.slug} className="min-w-[280px] max-w-[320px] flex-shrink-0 snap-start">
            <FrameworkCard framework={fw} variant="default" />
          </div>
        ))}
      </div>
    </section>
  );
}
