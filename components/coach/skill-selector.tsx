"use client";

import { useRef, useCallback, type KeyboardEvent } from "react";
import {
  SELECTABLE_SKILLS,
  DOMAIN_SKILLS,
  SKILL_META,
  type SelectableSkillId,
} from "@/lib/coach-types";

interface SkillSelectorProps {
  mode: "single" | "multi";
  // Single-select (mode="single")
  selectedSkill: SelectableSkillId;
  onSelect: (skill: SelectableSkillId) => void;
  // Multi-select (mode="multi")
  selectedSkills: SelectableSkillId[];
  onToggleSkill: (skill: SelectableSkillId) => void;
  // Debate toggle (inline)
  debateActive: boolean;
  onDebateToggle: () => void;
  disabled?: boolean;
}

export function SkillSelector({
  mode,
  selectedSkill,
  onSelect,
  selectedSkills,
  onToggleSkill,
  debateActive,
  onDebateToggle,
  disabled,
}: SkillSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const skills = mode === "single" ? SELECTABLE_SKILLS : DOMAIN_SKILLS;

  // Keyboard navigation for single-select (roving tabindex)
  const handleSingleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      const idx = SELECTABLE_SKILLS.indexOf(selectedSkill);
      let next = idx;

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        next = (idx + 1) % SELECTABLE_SKILLS.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        next =
          (idx - 1 + SELECTABLE_SKILLS.length) % SELECTABLE_SKILLS.length;
      } else {
        return;
      }

      onSelect(SELECTABLE_SKILLS[next]);
      const buttons =
        containerRef.current?.querySelectorAll<HTMLButtonElement>(
          '[role="radio"]'
        );
      buttons?.[next]?.focus();
    },
    [selectedSkill, onSelect]
  );

  // Status hint for multi-select
  const debateHint = (() => {
    const n = selectedSkills.length;
    if (n === 0) return "All 7 domain experts will debate";
    if (n === 1) return "Select at least 2, or none for all experts";
    if (n === 2) return "Head-to-head debate";
    return `${n} experts selected`;
  })();

  const pillBase =
    "flex items-center gap-1 rounded-[var(--radius-full)] border px-2 py-1 text-[11px] font-medium transition-all duration-150 outline-none";
  const focusRing =
    "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg)]";

  return (
    <div>
      <div
        ref={containerRef}
        role={mode === "single" ? "radiogroup" : "group"}
        aria-label={
          mode === "single"
            ? "Select PM expert skill"
            : "Select experts for debate"
        }
        className={`flex flex-wrap gap-1 py-1 ${
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {skills.map((skillId) => {
          const meta = SKILL_META[skillId];

          if (mode === "single") {
            const isSelected = skillId === selectedSkill;
            return (
              <button
                key={skillId}
                role="radio"
                aria-checked={isSelected}
                aria-label={meta.description}
                title={meta.description}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => onSelect(skillId)}
                onKeyDown={handleSingleKeyDown}
                className={`${pillBase} ${focusRing} focus-visible:ring-[var(--color-accent)]`}
                style={{
                  borderColor: isSelected
                    ? meta.color
                    : "var(--color-border)",
                  backgroundColor: isSelected
                    ? `color-mix(in srgb, ${meta.color} 12%, transparent)`
                    : "var(--color-surface-2, var(--color-surface))",
                  color: isSelected
                    ? meta.color
                    : "var(--color-text-muted)",
                }}
              >
                <span
                  className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: meta.color }}
                  aria-hidden="true"
                />
                {meta.label}
              </button>
            );
          }

          // Multi-select mode
          const isSelected = selectedSkills.includes(skillId);
          return (
            <button
              key={skillId}
              aria-pressed={isSelected}
              aria-label={meta.description}
              title={meta.description}
              onClick={() => onToggleSkill(skillId)}
              className={`${pillBase} ${focusRing} focus-visible:ring-[var(--color-accent-2)]`}
              style={{
                borderColor: isSelected
                  ? meta.color
                  : "var(--color-border)",
                backgroundColor: isSelected
                  ? `color-mix(in srgb, ${meta.color} 12%, transparent)`
                  : "var(--color-surface-2, var(--color-surface))",
                color: isSelected
                  ? meta.color
                  : "var(--color-text-muted)",
              }}
            >
              <span
                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: meta.color }}
                aria-hidden="true"
              />
              {meta.label}
            </button>
          );
        })}

        {/* Divider + Debate toggle, inline with pills */}
        <span
          className="w-px h-5 self-center bg-[var(--color-border)]"
          aria-hidden="true"
        />
        <button
          aria-pressed={debateActive}
          onClick={onDebateToggle}
          title="Toggle debate mode — multiple experts analyze your challenge"
          className={`${pillBase} ${focusRing} focus-visible:ring-[var(--color-accent-2)] cursor-pointer`}
          style={{
            borderColor: debateActive
              ? "var(--color-accent-2)"
              : "var(--color-border)",
            backgroundColor: debateActive
              ? "color-mix(in srgb, var(--color-accent-2) 12%, transparent)"
              : "var(--color-surface-2, var(--color-surface))",
            color: debateActive
              ? "var(--color-accent-2)"
              : "var(--color-text-muted)",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
            aria-hidden="true"
          >
            <path d="M2 3.5C2 2.67 2.67 2 3.5 2h5C9.33 2 10 2.67 10 3.5v3c0 .83-.67 1.5-1.5 1.5H5.5L3.5 10V8H3.5C2.67 8 2 7.33 2 6.5v-3z" />
            <path d="M6 10v.5c0 .83.67 1.5 1.5 1.5h2.5l2 2v-2h.5c.83 0 1.5-.67 1.5-1.5v-3c0-.83-.67-1.5-1.5-1.5H10" />
          </svg>
          Debate
        </button>
      </div>

      {/* Debate status hint */}
      {debateActive && (
        <p className="mt-1.5 text-[10px] text-[var(--color-text-subtle)]">
          {debateHint}
        </p>
      )}
    </div>
  );
}
