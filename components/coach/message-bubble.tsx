"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "@/lib/coach-types";

interface MessageBubbleProps {
  message: Message;
  isStreaming: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const slug = message.skill || "coach";
    const ts = Math.floor(message.timestamp / 1000);
    const filename = `${slug}-${ts}.md`;

    const blob = new Blob([message.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} ${!isUser ? "group" : ""}`}>
      <div
        className={`${
          isUser
            ? "max-w-[80%] rounded-[var(--radius-lg)] bg-[var(--color-accent)]/10 px-4 py-3"
            : "max-w-full rounded-[var(--radius-lg)] bg-[var(--color-surface)] px-5 py-4"
        }`}
      >
        {!isUser && message.skill && (
          <span
            className={`mb-2 inline-block rounded-[var(--radius-full)] px-2.5 py-0.5 text-xs font-medium ${
              message.isDebate
                ? "bg-[var(--color-accent-2)]/15 text-[var(--color-accent-2)]"
                : "bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
            }`}
          >
            {message.isDebate ? "Debate" : message.skill}
          </span>
        )}
        {isUser ? (
          <p className="text-[var(--color-text)] font-[var(--font-body)] text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <div className="prose-coach text-[var(--color-text)] text-sm leading-relaxed overflow-x-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-[var(--color-accent)] animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
        )}
        {!isStreaming && (
          <div className={`mt-2 flex items-center ${!isUser ? "justify-between" : ""}`}>
            <time className="text-xs text-[var(--color-text-subtle)]">
              {formatTime(message.timestamp)}
            </time>
            {!isUser && (
              <div className="flex items-center gap-1 ml-4">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-all duration-[var(--motion-fast)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                  aria-label={copied ? "Copied to clipboard" : "Copy markdown to clipboard"}
                  title="Copy markdown"
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-all duration-[var(--motion-fast)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                  aria-label="Download as markdown file"
                  title="Download .md"
                >
                  <DownloadIcon />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
