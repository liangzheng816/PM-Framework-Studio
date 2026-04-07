import type { Metadata } from "next";
import { getAllFrameworks } from "@/lib/frameworks";
import { CollectionsClient } from "./collections-client";

export const metadata: Metadata = {
  title: "My Collections",
  description: "Your saved product management frameworks.",
};

export default function CollectionsPage() {
  const frameworks = getAllFrameworks();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <header className="mb-8">
        <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl text-[var(--color-text)] mb-2">
          My Collections
        </h1>
        <p className="text-[var(--color-text-muted)]">
          Your saved frameworks, stored locally in your browser.
        </p>
      </header>

      <CollectionsClient frameworks={frameworks} />
    </div>
  );
}
