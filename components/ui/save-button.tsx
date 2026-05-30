"use client";

import { useState, useEffect } from "react";
import { isFrameworkSaved, toggleSaveFramework } from "@/lib/collections";

interface SaveButtonProps {
  slug: string;
  size?: "sm" | "md";
  className?: string;
}

export function SaveButton({ slug, size = "sm", className = "" }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isFrameworkSaved(slug));
  }, [slug]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = toggleSaveFramework(slug);
    setSaved(result);
    // Dispatch custom event so other components can react
    window.dispatchEvent(new CustomEvent("fs:collection-change"));
  }

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const padding = size === "sm" ? "p-1.5" : "p-2";

  return (
    <button
      onClick={handleClick}
      className={`${padding} rounded-[var(--radius-md)] transition-all duration-[var(--motion-fast)] cursor-pointer ${
        saved
          ? "text-[var(--color-saved)] hover:text-[var(--color-accent-hover)]"
          : "text-[var(--color-text-subtle)] hover:text-[var(--color-saved)]"
      } hover:bg-[var(--color-surface-2)] ${className}`}
      aria-label={saved ? "Remove from saved" : "Save framework"}
      title={saved ? "Remove from saved" : "Save framework"}
    >
      <svg
        className={iconSize}
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
