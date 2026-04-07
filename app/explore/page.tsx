import type { Metadata } from "next";
import { getAllFrameworks, getCategoriesWithCounts } from "@/lib/frameworks";
import { ExploreClient } from "./explore-client";

export const metadata: Metadata = {
  title: "Explore Frameworks",
  description: "Browse and search 100 product management frameworks by category, complexity, and stage.",
};

export default function ExplorePage() {
  const frameworks = getAllFrameworks();
  const categories = getCategoriesWithCounts();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <header className="mb-8">
        <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl text-[var(--color-text)] mb-2">
          Explore frameworks
        </h1>
        <p className="text-[var(--color-text-muted)]">
          {frameworks.length} frameworks across {categories.length} categories
        </p>
      </header>

      <ExploreClient frameworks={frameworks} categories={categories} />
    </div>
  );
}
