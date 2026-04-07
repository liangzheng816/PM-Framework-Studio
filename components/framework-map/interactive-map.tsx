"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Framework, CategorySlug } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/category-colors";
import { CATEGORY_META } from "@/data/categories";

interface MapNode {
  framework: Framework;
  x: number;
  y: number;
}

interface InteractiveMapProps {
  frameworks: Framework[];
  positions: Record<string, { x: number; y: number }>;
}

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 600;
const PADDING = 60;

// Tailwind color classes → hex for SVG
const DOT_COLORS: Record<CategorySlug, string> = {
  "user-insights": "#38bdf8",
  "problem-framing": "#a78bfa",
  ideation: "#fbbf24",
  validation: "#34d399",
  execution: "#fb923c",
  growth: "#fb7185",
  "systems-thinking": "#2dd4bf",
  appendix: "#9ca3af",
};

export function InteractiveMap({ frameworks, positions }: InteractiveMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategorySlug | "all">("all");
  const router = useRouter();

  const nodes: MapNode[] = useMemo(() => {
    return frameworks
      .filter((fw) => positions[fw.slug])
      .map((fw) => ({
        framework: fw,
        x: PADDING + positions[fw.slug].x * (SVG_WIDTH - 2 * PADDING),
        y: PADDING + (1 - positions[fw.slug].y) * (SVG_HEIGHT - 2 * PADDING), // invert Y so quantitative is top
      }));
  }, [frameworks, positions]);

  const filteredNodes = useMemo(() => {
    if (activeCategory === "all") return nodes;
    return nodes.filter((n) => n.framework.category === activeCategory);
  }, [nodes, activeCategory]);

  const hoveredNode = hovered
    ? nodes.find((n) => n.framework.slug === hovered)
    : null;

  return (
    <div>
      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1.5 text-sm rounded-[var(--radius-full)] border transition-colors cursor-pointer ${
            activeCategory === "all"
              ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30"
              : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
          }`}
        >
          All
        </button>
        {(Object.keys(CATEGORY_META) as CategorySlug[])
          .filter((s) => s !== "appendix")
          .map((slug) => {
            const colors = CATEGORY_COLORS[slug];
            const isActive = activeCategory === slug;
            return (
              <button
                key={slug}
                onClick={() => setActiveCategory(slug)}
                className={`px-3 py-1.5 text-sm rounded-[var(--radius-full)] border transition-colors cursor-pointer ${
                  isActive
                    ? `${colors.bg} ${colors.text} ${colors.border}`
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                }`}
              >
                {CATEGORY_META[slug].label}
              </button>
            );
          })}
      </div>

      {/* SVG Map */}
      <div className="relative rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-auto"
          style={{ minHeight: 400 }}
        >
          {/* Axis labels */}
          <text
            x={SVG_WIDTH / 2}
            y={SVG_HEIGHT - 12}
            textAnchor="middle"
            className="fill-[var(--color-text-subtle)]"
            fontSize={12}
          >
            Early Stage → Late Stage
          </text>
          <text
            x={14}
            y={SVG_HEIGHT / 2}
            textAnchor="middle"
            transform={`rotate(-90, 14, ${SVG_HEIGHT / 2})`}
            className="fill-[var(--color-text-subtle)]"
            fontSize={12}
          >
            Qualitative → Quantitative
          </text>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((pct) => (
            <g key={pct} opacity={0.15}>
              <line
                x1={PADDING + pct * (SVG_WIDTH - 2 * PADDING)}
                y1={PADDING}
                x2={PADDING + pct * (SVG_WIDTH - 2 * PADDING)}
                y2={SVG_HEIGHT - PADDING}
                stroke="var(--color-border)"
                strokeDasharray="4 4"
              />
              <line
                x1={PADDING}
                y1={PADDING + pct * (SVG_HEIGHT - 2 * PADDING)}
                x2={SVG_WIDTH - PADDING}
                y2={PADDING + pct * (SVG_HEIGHT - 2 * PADDING)}
                stroke="var(--color-border)"
                strokeDasharray="4 4"
              />
            </g>
          ))}

          {/* Nodes */}
          {filteredNodes.map((node) => {
            const isHovered = hovered === node.framework.slug;
            const color = DOT_COLORS[node.framework.category];
            const dimmed =
              activeCategory !== "all" &&
              node.framework.category !== activeCategory;

            return (
              <g
                key={node.framework.slug}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(node.framework.slug)}
                onMouseLeave={() => setHovered(null)}
                onClick={() =>
                  router.push(`/framework/${node.framework.slug}`)
                }
              >
                {/* Glow on hover */}
                {isHovered && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={16}
                    fill={color}
                    opacity={0.2}
                  />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered ? 8 : 6}
                  fill={color}
                  opacity={dimmed ? 0.3 : 0.85}
                  style={{
                    transition: "r 150ms ease, opacity 150ms ease",
                  }}
                />
                {/* Label on hover */}
                {isHovered && (
                  <text
                    x={node.x}
                    y={node.y - 14}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    className="fill-[var(--color-text)]"
                  >
                    {node.framework.title}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip overlay */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-lg)] pointer-events-none"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      DOT_COLORS[hoveredNode.framework.category],
                  }}
                />
                <span className="text-xs text-[var(--color-text-muted)]">
                  {hoveredNode.framework.categoryLabel}
                </span>
              </div>
              <h3 className="font-[var(--font-heading)] text-lg text-[var(--color-text)] mb-1">
                {hoveredNode.framework.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                {hoveredNode.framework.summary}
              </p>
              <p className="text-xs text-[var(--color-accent)] mt-2">
                Click to open →
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
