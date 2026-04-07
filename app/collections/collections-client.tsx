"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Framework, Collection } from "@/lib/types";
import { getCollections } from "@/lib/collections";
import { FrameworkCard } from "@/components/framework-card/framework-card";
import { SaveButton } from "@/components/ui/save-button";

interface CollectionsClientProps {
  frameworks: Framework[];
}

export function CollectionsClient({ frameworks }: CollectionsClientProps) {
  const [collections, setCollections] = useState<Collection[]>([]);

  const refresh = useCallback(() => {
    setCollections(getCollections());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("fs:collection-change", refresh);
    return () => window.removeEventListener("fs:collection-change", refresh);
  }, [refresh]);

  const defaultCol = collections.find((c) => c.id === "saved");
  const savedSlugs = defaultCol?.frameworkSlugs || [];
  const savedFrameworks = savedSlugs
    .map((slug) => frameworks.find((f) => f.slug === slug))
    .filter((f): f is Framework => f !== undefined);

  return (
    <div>
      {savedFrameworks.length === 0 ? (
        <div className="text-center py-16 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]">
          <svg
            className="w-12 h-12 mx-auto text-[var(--color-text-subtle)] mb-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <p className="text-[var(--color-text-muted)] mb-2">
            No saved frameworks yet
          </p>
          <p className="text-sm text-[var(--color-text-subtle)] mb-6">
            Click the heart icon on any framework to save it here
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
          >
            Explore frameworks
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            {savedFrameworks.length} framework{savedFrameworks.length !== 1 ? "s" : ""} saved
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedFrameworks.map((fw) => (
              <div key={fw.slug} className="relative">
                <FrameworkCard framework={fw} />
                <div className="absolute top-3 right-3">
                  <SaveButton slug={fw.slug} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
