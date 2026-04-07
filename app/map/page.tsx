import type { Metadata } from "next";
import Link from "next/link";
import { getAllFrameworks, getCategoriesWithCounts } from "@/lib/frameworks";
import { InteractiveMap } from "@/components/framework-map/interactive-map";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import mapPositions from "@/data/map-positions.json";

export const metadata: Metadata = {
  title: "Framework Map",
  description:
    "Explore 100 product management frameworks visually by category and stage.",
};

export default function MapPage() {
  const frameworks = getAllFrameworks();
  const categories = getCategoriesWithCounts();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <header className="mb-8">
        <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl text-[var(--color-text)] mb-2">
          Framework Map
        </h1>
        <p className="text-[var(--color-text-muted)]">
          Explore all {frameworks.length} frameworks — hover to preview, click
          to open. X-axis shows product stage, Y-axis shows qualitative vs
          quantitative orientation.
        </p>
      </header>

      {/* Interactive map (desktop) */}
      <div className="hidden sm:block">
        <InteractiveMap frameworks={frameworks} positions={mapPositions} />
      </div>

      {/* Mobile fallback: grouped list */}
      <div className="sm:hidden space-y-8">
        {categories
          .filter((c) => c.slug !== "appendix")
          .map((cat) => {
            const catFrameworks = frameworks.filter(
              (f) => f.category === cat.slug
            );
            const colors = CATEGORY_COLORS[cat.slug];
            return (
              <section key={cat.slug}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <h2 className="font-medium text-[var(--color-text)] text-sm">
                    {cat.label}
                  </h2>
                  <span className="text-xs text-[var(--color-text-subtle)]">
                    {cat.frameworkCount}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {catFrameworks.map((fw) => (
                    <Link
                      key={fw.slug}
                      href={`/framework/${fw.slug}`}
                      className={`text-xs px-2.5 py-1.5 rounded-[var(--radius-md)] border ${colors.border} ${colors.bg} ${colors.text} hover:opacity-80 transition-opacity`}
                    >
                      {fw.title}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
      </div>
    </div>
  );
}
