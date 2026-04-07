import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllSlugs,
  getFrameworkBySlug,
  getRelatedFrameworks,
} from "@/lib/frameworks";
import { Chip, ConfidenceBadge } from "@/components/ui/chip";
import { FrameworkCard } from "@/components/framework-card/framework-card";
import { SaveButton } from "@/components/ui/save-button";
import { SourceNotes } from "@/components/deep-dive/source-notes";
import { MobileActionBar } from "@/components/deep-dive/mobile-action-bar";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fw = getFrameworkBySlug(slug);
  if (!fw) return {};
  return {
    title: fw.title,
    description: fw.summary,
  };
}

export default async function FrameworkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fw = getFrameworkBySlug(slug);
  if (!fw) notFound();

  const related = getRelatedFrameworks(slug, 4);

  // Parse markdown content into sections
  const sections = parseSections(fw.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    name: fw.title,
    headline: fw.title,
    description: fw.summary,
    articleSection: fw.categoryLabel,
    educationalLevel: "Professional",
    learningResourceType: "Framework",
    url: `https://frameworkstudio.app/framework/${fw.slug}`,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">
        {/* Main content */}
        <article className="min-w-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-6">
            <Link href="/" className="hover:text-[var(--color-text)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              href={`/category/${fw.category}`}
              className="hover:text-[var(--color-text)] transition-colors"
            >
              {fw.categoryLabel}
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text)]">{fw.title}</span>
          </nav>

          {/* Title block */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Chip label={fw.categoryLabel} category={fw.category} size="md" />
              <ConfidenceBadge confidence={fw.confidence} />
              <span className="text-sm text-[var(--color-text-subtle)]">
                #{fw.order}
              </span>
            </div>
            <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl lg:text-5xl text-[var(--color-text)] mb-4">
              {fw.title}
            </h1>
            <p className="text-lg text-[var(--color-text-muted)] leading-relaxed max-w-2xl">
              {fw.summary}
            </p>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-3">
              <SaveButton slug={fw.slug} size="md" />
              <Link
                href={`/compare?add=${fw.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
                Compare
              </Link>
            </div>

            {/* Quick meta */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-[var(--color-text-muted)]">
              {fw.complexity && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--color-text-subtle)]">Complexity:</span>
                  <span className="capitalize">{fw.complexity}</span>
                </div>
              )}
              {fw.stage.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--color-text-subtle)]">Stage:</span>
                  <span className="capitalize">{fw.stage.join(", ")}</span>
                </div>
              )}
            </div>
          </header>

          {/* Content sections */}
          <div className="prose-custom space-y-10">
            {sections
              .filter((s) => !SOURCE_SECTION_IDS.has(s.id))
              .map((section, i) => (
              <section key={i} id={section.id}>
                <h2 className="font-[var(--font-heading)] text-xl sm:text-2xl text-[var(--color-text)] mb-4 pb-2 border-b border-[var(--color-border)]">
                  {section.title}
                </h2>
                <div
                  className="text-[var(--color-text-muted)] leading-relaxed space-y-3 [&_strong]:text-[var(--color-text)] [&_strong]:font-medium [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_h3]:text-[var(--color-text)] [&_h3]:font-medium [&_h3]:text-base [&_h3]:mt-4 [&_h3]:mb-2"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(section.content) }}
                />
              </section>
            ))}
          </div>

          {/* Source & Lineage (collapsible) */}
          <div className="mt-10">
            <SourceNotes
              canonicalStatus={fw.canonical_status}
              confidence={fw.confidence}
              lineageHtml={markdownToHtml(
                sections.find((s) => s.id === "canonical-origin-and-what-is-official-here")?.content || ""
              )}
              referencesHtml={markdownToHtml(
                sections.find((s) => s.id === "references-and-authority-trail")?.content || ""
              )}
            />
          </div>

          {/* Companion frameworks */}
          {fw.companion_frameworks.length > 0 && (
            <section className="mt-12 pt-8 border-t border-[var(--color-border)]">
              <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-text)] mb-4">
                Companion frameworks
              </h2>
              <div className="flex flex-wrap gap-2">
                {fw.companion_frameworks.map((slug) => (
                  <Link
                    key={slug}
                    href={`/framework/${slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-surface-3)] transition-colors"
                  >
                    {slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Sidebar — Related frameworks */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {/* Local nav */}
            <nav className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <h3 className="text-sm font-medium text-[var(--color-text)] mb-3">
                On this page
              </h3>
              <ul className="space-y-1.5">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors py-0.5"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Related */}
            {related.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text)] mb-3">
                  Related frameworks
                </h3>
                <div className="space-y-2">
                  {related.map((r) => (
                    <FrameworkCard key={r.slug} framework={r} variant="mini" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile related frameworks */}
      {related.length > 0 && (
        <section className="lg:hidden mt-12 pt-8 border-t border-[var(--color-border)] pb-20">
          <h2 className="font-[var(--font-heading)] text-xl text-[var(--color-text)] mb-4">
            Related frameworks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((r) => (
              <FrameworkCard key={r.slug} framework={r} variant="compact" />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky action bar */}
      <MobileActionBar slug={fw.slug} title={fw.title} />
    </div>
  );
}

// --- Constants ---

const SOURCE_SECTION_IDS = new Set([
  "canonical-origin-and-what-is-official-here",
  "references-and-authority-trail",
  "bottom-line",
]);

// --- Helpers ---

interface Section {
  id: string;
  title: string;
  content: string;
}

function parseSections(markdown: string): Section[] {
  const sections: Section[] = [];
  const lines = markdown.split("\n");
  let current: Section | null = null;
  const contentLines: string[] = [];

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/);
    if (h2Match) {
      if (current) {
        current.content = contentLines.join("\n").trim();
        if (current.content) sections.push(current);
        contentLines.length = 0;
      }
      const title = h2Match[1].trim();
      current = {
        id: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        title,
        content: "",
      };
    } else if (current) {
      contentLines.push(line);
    }
  }
  if (current) {
    current.content = contentLines.join("\n").trim();
    if (current.content) sections.push(current);
  }

  return sections;
}

function markdownToHtml(md: string): string {
  let html = md;

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");

  // H3
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");

  // Unordered lists
  html = html.replace(
    /(?:^[-*] .+\n?)+/gm,
    (match) => {
      const items = match
        .trim()
        .split("\n")
        .map((l) => `<li>${l.replace(/^[-*] /, "")}</li>`)
        .join("");
      return `<ul>${items}</ul>`;
    }
  );

  // Ordered lists
  html = html.replace(
    /(?:^\d+\. .+\n?)+/gm,
    (match) => {
      const items = match
        .trim()
        .split("\n")
        .map((l) => `<li>${l.replace(/^\d+\. /, "")}</li>`)
        .join("");
      return `<ol>${items}</ol>`;
    }
  );

  // Paragraphs: wrap non-tag lines
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<")) return trimmed;
      return `<p>${trimmed.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");

  return html;
}
