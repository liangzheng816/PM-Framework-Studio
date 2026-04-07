import type { Metadata } from "next";
import { getAllFrameworks } from "@/lib/frameworks";
import { CompareClient } from "./compare-client";

export const metadata: Metadata = {
  title: "Compare Frameworks",
  description: "Compare 2-4 product management frameworks side by side.",
};

export default function ComparePage() {
  const frameworks = getAllFrameworks();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <header className="mb-8">
        <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl text-[var(--color-text)] mb-2">
          Compare Frameworks
        </h1>
        <p className="text-[var(--color-text-muted)]">
          Select 2–4 frameworks to compare side by side.
        </p>
      </header>

      <CompareClient frameworks={frameworks} />
    </div>
  );
}
