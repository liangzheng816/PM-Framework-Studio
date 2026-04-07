import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About & Methodology",
  description: "How Framework Studio sources, verifies, and presents 100 product management frameworks.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl text-[var(--color-text)] mb-6">
        About & Methodology
      </h1>

      <div className="space-y-8 text-[var(--color-text-muted)] leading-relaxed">
        <section>
          <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-text)] mb-3">
            What is Framework Studio?
          </h2>
          <p>
            Framework Studio is a curated library of 100 product management frameworks,
            organized into 7 categories that mirror the product development lifecycle:
            User Insights, Problem Framing, Ideation, Validation, Execution, Growth,
            and Systems Thinking.
          </p>
        </section>

        <section>
          <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-text)] mb-3">
            Confidence labels
          </h2>
          <p className="mb-3">
            Not all PM frameworks have one universally official source. Each framework
            is labeled with a confidence level:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-[var(--color-text)]">Canonical</strong> — has a
              recognized creator or source text with a well-known structure.
            </li>
            <li>
              <strong className="text-[var(--color-text)]">Adapted</strong> — widely
              used practitioner method with several variants; the summary uses a careful
              synthesis of common practice.
            </li>
            <li>
              <strong className="text-[var(--color-text)]">Synthesized</strong> — composite
              product-management tool that exists mainly as operational practice.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-text)] mb-3">
            How frameworks are structured
          </h2>
          <p>
            Each framework page follows a consistent template: one-paragraph summary,
            the problem it solves, canonical origin and lineage, structure or steps,
            when to use it, practical guidance, inputs and outputs, a real-world example,
            strengths and limitations, common mistakes, related frameworks, and an
            authority trail of references.
          </p>
        </section>

        <section>
          <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-text)] mb-3">
            Source transparency
          </h2>
          <p>
            Where a framework does not have one single official definition, the summary
            explicitly says so and uses a careful synthesis instead of pretending there
            is one canonical template. Every framework includes an authority trail
            pointing to its primary references.
          </p>
        </section>
      </div>
    </div>
  );
}
