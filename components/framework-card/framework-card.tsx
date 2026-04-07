import Link from "next/link";
import type { Framework } from "@/lib/types";
import { Chip, ConfidenceBadge } from "@/components/ui/chip";

type Variant = "default" | "featured" | "compact" | "mini";

interface FrameworkCardProps {
  framework: Framework;
  variant?: Variant;
  className?: string;
}

export function FrameworkCard({
  framework,
  variant = "default",
  className = "",
}: FrameworkCardProps) {
  if (variant === "mini") return <MiniCard framework={framework} className={className} />;
  if (variant === "compact") return <CompactCard framework={framework} className={className} />;
  if (variant === "featured") return <FeaturedCard framework={framework} className={className} />;
  return <DefaultCard framework={framework} className={className} />;
}

function DefaultCard({ framework, className }: { framework: Framework; className: string }) {
  return (
    <Link
      href={`/framework/${framework.slug}`}
      className={`group block rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all duration-[var(--motion-default)] ease-[var(--motion-spring)] hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Chip label={framework.categoryLabel} category={framework.category} />
        <ConfidenceBadge confidence={framework.confidence} />
      </div>
      <h3 className="font-[var(--font-heading)] text-lg text-[var(--color-text)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">
        {framework.title}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
        {framework.summary}
      </p>
      {framework.best_for.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {framework.best_for.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs text-[var(--color-text-subtle)] bg-[var(--color-surface-2)] rounded-[var(--radius-sm)] px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

function FeaturedCard({ framework, className }: { framework: Framework; className: string }) {
  return (
    <Link
      href={`/framework/${framework.slug}`}
      className={`group relative block rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-all duration-[var(--motion-default)] ease-[var(--motion-spring)] hover:border-[var(--color-accent)]/30 hover:shadow-[var(--shadow-lg)] hover:-translate-y-1 ${className}`}
    >
      <Chip label={framework.categoryLabel} category={framework.category} size="md" />
      <h3 className="font-[var(--font-heading)] text-2xl text-[var(--color-text)] mt-4 mb-3 group-hover:text-[var(--color-accent)] transition-colors">
        {framework.title}
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] line-clamp-3 leading-relaxed mb-4">
        {framework.summary}
      </p>
      <div className="flex items-center gap-3">
        <ConfidenceBadge confidence={framework.confidence} />
        <span className="text-xs text-[var(--color-text-subtle)]">
          #{framework.order}
        </span>
      </div>
    </Link>
  );
}

function CompactCard({ framework, className }: { framework: Framework; className: string }) {
  return (
    <Link
      href={`/framework/${framework.slug}`}
      className={`group flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition-all duration-[var(--motion-default)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)] ${className}`}
    >
      <Chip label={framework.categoryLabel} category={framework.category} />
      <h3 className="font-medium text-sm text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors flex-1">
        {framework.title}
      </h3>
      <ConfidenceBadge confidence={framework.confidence} />
    </Link>
  );
}

function MiniCard({ framework, className }: { framework: Framework; className: string }) {
  return (
    <Link
      href={`/framework/${framework.slug}`}
      className={`group inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] px-3 py-2 text-sm transition-all duration-[var(--motion-fast)] hover:bg-[var(--color-surface-3)] ${className}`}
    >
      <span className="text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
        {framework.title}
      </span>
    </Link>
  );
}
