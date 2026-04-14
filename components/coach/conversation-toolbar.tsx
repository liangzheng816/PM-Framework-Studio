"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Message } from "@/lib/coach-types";
import {
  copyConversationToClipboard,
  downloadConversationMarkdown,
} from "@/lib/export-conversation";

interface ConversationToolbarProps {
  messages: Message[];
  isStreaming: boolean;
}

export function ConversationToolbar({
  messages,
  isStreaming,
}: ConversationToolbarProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click-outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const handleCopy = useCallback(() => {
    copyConversationToClipboard(messages).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setOpen(false);
    });
  }, [messages]);

  const handleDownload = useCallback(() => {
    downloadConversationMarkdown(messages);
    setOpen(false);
  }, [messages]);

  const msgCount = messages.length;

  return (
    <div className="flex items-center justify-between shrink-0 py-2">
      <span className="text-xs text-[var(--color-text-subtle)]">
        {msgCount} message{msgCount !== 1 ? "s" : ""}
      </span>

      <div ref={menuRef} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={isStreaming}
          aria-haspopup="menu"
          aria-expanded={open}
          title="Export conversation"
          className="flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-md)] text-xs text-[var(--color-text-muted)] transition-colors duration-150 hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] disabled:opacity-30 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12.5H12" />
            <path d="M8 2.5V9.5" />
            <path d="M5 6.5L8 9.5L11 6.5" />
          </svg>
          Export
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-1 min-w-[180px] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)] z-20 overflow-hidden"
          >
            <button
              role="menuitem"
              onClick={handleCopy}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors outline-none focus-visible:bg-[var(--color-surface-2)]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="5" width="8" height="8" rx="1.5" />
                <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5" />
              </svg>
              {copied ? "Copied!" : "Copy to clipboard"}
            </button>
            <button
              role="menuitem"
              onClick={handleDownload}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors outline-none focus-visible:bg-[var(--color-surface-2)]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.5 10.5V12.5A1 1 0 003.5 13.5H12.5A1 1 0 0013.5 12.5V10.5" />
                <path d="M8 2.5V10" />
                <path d="M5 7.5L8 10.5L11 7.5" />
              </svg>
              Download .md
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
