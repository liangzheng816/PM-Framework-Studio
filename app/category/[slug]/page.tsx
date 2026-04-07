import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getFrameworksByCategory, getCategoriesWithCounts } from "@/lib/frameworks";
import { CATEGORY_META, CATEGORY_ORDER } from "@/data/categories";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { FrameworkCard } from "@/components/framework-card/framework-card";
import type { CategorySlug } from "@/lib/types";

export async function generateStaticParams() {
  return CATEGORY_ORDER.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = CATEGORY_META[slug as CategorySlug];
  if (!meta) return {};
  return {
    title: meta.label,
    description: meta.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catSlug = slug as CategorySlug;
  const meta = CATEGORY_META[catSlug];
  if (!meta) notFound();

  const frameworks = getFrameworksByCategory(catSlug);
  const colors = CATEGORY_COLORS[catSlug];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-6">
        <Link href="/" className="hover:text-[var(--color-text)] transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/explore" className="hover:text-[var(--color-text)] transition-colors">
          Explore
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text)]">{meta.label}</span>
      </nav>

      {/* Category header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className={`w-3 h-3 rounded-full ${colors.dot}`} />
          <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl text-[var(--color-text)]">
            {meta.label}
          </h1>
          <span className="text-sm text-[var(--color-text-subtle)]">
            {frameworks.length} frameworks
          </span>
        </div>
        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
          {meta.description}
        </p>
      </header>

      {/* Framework grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {frameworks.map((fw) => (
          <FrameworkCard key={fw.slug} framework={fw} />
        ))}
      </div>
    </div>
  );
}
