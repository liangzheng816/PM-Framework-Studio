"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "@/lib/coach-types";

interface MessageBubbleProps {
  message: Message;
  isStreaming: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`${
          isUser
            ? "max-w-[80%] rounded-[var(--radius-lg)] bg-[var(--color-accent)]/10 px-4 py-3"
            : "max-w-[90%] rounded-[var(--radius-lg)] bg-[var(--color-surface)] px-5 py-4"
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
          <div className="prose-coach text-[var(--color-text)] text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-[var(--color-accent)] animate-pulse ml-0.5 align-text-bottom" />
            )}
          </div>
        )}
        {!isStreaming && (
          <time className="mt-2 block text-xs text-[var(--color-text-subtle)]">
            {formatTime(message.timestamp)}
          </time>
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
