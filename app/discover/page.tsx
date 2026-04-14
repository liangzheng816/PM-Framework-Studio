import type { Metadata } from "next";
import { Hero } from "@/components/hero/hero";
import { DiscoverClient } from "@/components/discover/discover-client";
import {
  getAllFrameworks,
  getCategoriesWithCounts,
  getFeaturedFrameworks,
} from "@/lib/frameworks";

export const metadata: Metadata = {
  title: "Discover Frameworks",
  description:
    "Browse and search 100 product management frameworks by category, complexity, and stage.",
};

export default function DiscoverPage() {
  const frameworks = getAllFrameworks();
  const categories = getCategoriesWithCounts();
  const featured = getFeaturedFrameworks(6);

  return (
    <>
      <Hero compact />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <DiscoverClient
          frameworks={frameworks}
          categories={categories}
          featured={featured}
        />

        {/* Trust Section */}
        <section className="py-16 mt-12 border-t border-[var(--color-border)]">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-[var(--font-heading)] text-3xl text-[var(--color-text)] mb-4">
              Trustworthy by design
            </h2>
            <p className="text-[var(--color-text-muted)] leading-relaxed mb-8">
              Every framework is sourced from its canonical origin, labeled with
              a confidence level, and written with practical product work in mind
              — not theory for its own sake.
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
      </div>
    </>
  );
}
