import Link from "next/link";
import { Hero } from "@/components/hero/hero";
import { CategoryRibbon } from "@/components/hero/category-ribbon";
import { FrameworkCard } from "@/components/framework-card/framework-card";
import {
  getCategoriesWithCounts,
  getFeaturedFrameworks,
  getFrameworksByCategory,
} from "@/lib/frameworks";

export default function HomePage() {
  const categories = getCategoriesWithCounts();
  const featured = getFeaturedFrameworks(6);

  return (
    <>
      {/* Hero */}
      <Hero />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Category Ribbons */}
        <section className="py-12">
          <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-text)] mb-8">
            Browse by category
          </h2>
          <div className="space-y-8">
            {categories
              .filter((c) => c.slug !== "appendix")
              .map((cat) => (
                <CategoryRibbon
                  key={cat.slug}
                  category={cat}
                  frameworks={getFrameworksByCategory(cat.slug)}
                />
              ))}
          </div>
        </section>

        {/* Featured Frameworks */}
        <section className="py-12 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-text)]">
              Featured frameworks
            </h2>
            <Link
              href="/explore"
              className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((fw) => (
              <FrameworkCard key={fw.slug} framework={fw} variant="featured" />
            ))}
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 border-t border-[var(--color-border)]">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-[var(--font-heading)] text-3xl text-[var(--color-text)] mb-4">
              Trustworthy by design
            </h2>
            <p className="text-[var(--color-text-muted)] leading-relaxed mb-8">
              Every framework is sourced from its canonical origin, labeled with a confidence level, and written with practical product work in mind — not theory for its own sake.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  title: "Source-verified",
                  desc: "Each framework traces back to its canonical creator or recognized origin.",
                },
                {
                  title: "Confidence-labeled",
                  desc: "Frameworks are marked as canonical, adapted, or synthesized — no pretending.",
                },
                {
                  title: "Practically grounded",
                  desc: "Every page helps you actually apply the framework, with real examples and common mistakes.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
                >
                  <h3 className="font-medium text-[var(--color-text)] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 border-t border-[var(--color-border)] text-center">
          <h2 className="font-[var(--font-heading)] text-2xl text-[var(--color-text)] mb-4">
            Ready to find your framework?
          </h2>
          <p className="text-[var(--color-text-muted)] mb-8">
            Explore all 100 frameworks across 7 categories.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 bg-[var(--color-accent)] text-white px-6 py-3 rounded-[var(--radius-md)] font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Explore all frameworks
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </section>
      </div>
    </>
  );
}
