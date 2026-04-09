import type { Root, Text, Link, PhrasingContent } from "mdast";
import type { Node } from "unist";
import { visitParents } from "unist-util-visit-parents";
import searchIndex from "@/data/search-index.json";

// ── Build lookup structures at module load (once) ──────────────────────

interface IndexEntry {
  slug: string;
  title: string;
  aliases: string[];
}

const entries = searchIndex as IndexEntry[];

/** Map from title (exact case) → slug */
const titleToSlug = new Map<string, string>();
for (const fw of entries) {
  titleToSlug.set(fw.title, fw.slug);
  for (const alias of fw.aliases) {
    if (alias) titleToSlug.set(alias, fw.slug);
  }
}

/** Escape special regex characters */
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
}

// Sort titles longest-first so "JTBD Growth Matrix" matches before "JTBD"
const titles = Array.from(titleToSlug.keys()).sort(
  (a, b) => b.length - a.length
);

// Build a single combined regex: \b(title1|title2|...)\b with global flag
const pattern = new RegExp(
  `(?<=\\b|(?<=^))(${titles.map(escapeRe).join("|")})(?=\\b|$)`,
  "g"
);

// ── Node type guards ───────────────────────────────────────────────────

const SKIP_ANCESTORS = new Set(["link", "linkReference", "code", "inlineCode"]);

function shouldSkip(ancestors: Node[]): boolean {
  return ancestors.some((a) => SKIP_ANCESTORS.has(a.type));
}

// ── The remark plugin ──────────────────────────────────────────────────

export function remarkFrameworkLinks() {
  return (tree: Root) => {
    visitParents(tree, "text", (node: Text, ancestors: Node[]) => {
      if (shouldSkip(ancestors)) return;

      const parent = ancestors[ancestors.length - 1] as Node & {
        children: PhrasingContent[];
      };
      if (!parent || !("children" in parent)) return;

      const value = node.value;
      pattern.lastIndex = 0;

      const parts: PhrasingContent[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(value)) !== null) {
        const matchedTitle = match[0];
        const slug = titleToSlug.get(matchedTitle);
        if (!slug) continue;

        // Text before the match
        if (match.index > lastIndex) {
          parts.push({ type: "text", value: value.slice(lastIndex, match.index) });
        }

        // The link node
        const linkNode: Link = {
          type: "link",
          url: `/framework/${slug}`,
          children: [{ type: "text", value: matchedTitle }],
        };
        parts.push(linkNode);

        lastIndex = match.index + matchedTitle.length;
      }

      // No matches — leave the node untouched
      if (parts.length === 0) return;

      // Remaining text after last match
      if (lastIndex < value.length) {
        parts.push({ type: "text", value: value.slice(lastIndex) });
      }

      // Replace this text node with the split parts in the parent's children
      const idx = parent.children.indexOf(node as PhrasingContent);
      if (idx !== -1) {
        parent.children.splice(idx, 1, ...parts);
      }
    });
  };
}
