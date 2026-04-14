"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
  type DragEvent,
} from "react";
import type { UploadedFile } from "@/lib/coach-types";

const MAX_FILE_SIZE = 100 * 1024; // 100 KB
const MAX_FILES = 10;

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled: boolean;
  placeholder?: string;
  externalText?: string;
  files: UploadedFile[];
  onAddFiles: (files: UploadedFile[]) => void;
  onRemoveFile: (id: string) => void;
}

export function ChatInput({
  onSend,
  onStop,
  isStreaming,
  disabled,
  placeholder = "Describe your product challenge...",
  externalText,
  files,
  onAddFiles,
  onRemoveFile,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);

  // Populate text from external source (e.g. prompt chip templates)
  useEffect(() => {
    if (externalText === undefined) return;
    setText(externalText);
    // Focus and auto-select the [placeholder] so the user can type over it
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 80) + "px";
        el.focus();
        const bracketStart = externalText.indexOf("[");
        const bracketEnd = externalText.lastIndexOf("]") + 1;
        if (bracketStart !== -1 && bracketEnd > bracketStart) {
          el.setSelectionRange(bracketStart, bracketEnd);
        } else {
          el.setSelectionRange(externalText.length, externalText.length);
        }
      }
    });
  }, [externalText]);

  // Auto-clear error after 3s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(t);
  }, [error]);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 80) + "px";
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, disabled, isStreaming, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const processFiles = useCallback(
    (fileList: FileList) => {
      const remaining = MAX_FILES - files.length;
      if (remaining <= 0) {
        setError("Maximum 10 files per conversation");
        return;
      }

      const validFiles: UploadedFile[] = [];
      const errors: string[] = [];
      let processed = 0;
      const toProcess = Array.from(fileList).slice(0, remaining);

      if (fileList.length > remaining) {
        errors.push(`Only ${remaining} more file${remaining === 1 ? "" : "s"} allowed`);
      }

      for (const file of toProcess) {
        if (!file.name.endsWith(".md")) {
          errors.push("Only .md files are supported");
          processed++;
          if (processed === toProcess.length) {
            if (validFiles.length) onAddFiles(validFiles);
            if (errors.length) setError(errors[0]);
          }
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name} exceeds 100 KB limit`);
          processed++;
          if (processed === toProcess.length) {
            if (validFiles.length) onAddFiles(validFiles);
            if (errors.length) setError(errors[0]);
          }
          continue;
        }

        const reader = new FileReader();
        reader.onload = () => {
          validFiles.push({
            id: crypto.randomUUID(),
            name: file.name,
            content: reader.result as string,
            sizeBytes: file.size,
          });
          processed++;
          if (processed === toProcess.length) {
            if (validFiles.length) onAddFiles(validFiles);
            if (errors.length) setError(errors[0]);
          }
        };
        reader.onerror = () => {
          errors.push(`Failed to read ${file.name}`);
          processed++;
          if (processed === toProcess.length) {
            if (validFiles.length) onAddFiles(validFiles);
            if (errors.length) setError(errors[0]);
          }
        };
        reader.readAsText(file);
      }
    },
    [files.length, onAddFiles]
  );

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    dragCountRef.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    dragCountRef.current--;
    if (dragCountRef.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    dragCountRef.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files.length) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-3 py-1.5 transition-all duration-200 hover:border-[var(--color-border-strong)] ${
          isDragging
            ? "border-[var(--color-accent)] shadow-[0_0_0_3px_hsl(255_80%_72%/0.12)]"
            : "border-[var(--color-border)] focus-within:border-[var(--color-accent)]/50 focus-within:shadow-[0_0_0_3px_hsl(255_80%_72%/0.12)]"
        }`}
      >
        {/* Input row */}
        <div className="flex items-center gap-1.5">
          {/* Paperclip button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isStreaming}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-full)] text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] disabled:opacity-30 disabled:pointer-events-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-surface)]"
            aria-label="Attach markdown files"
            title="Upload .md files as context (max 100 KB each)"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".md"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                processFiles(e.target.files);
              }
              // Reset so same file can be re-selected
              e.target.value = "";
            }}
          />

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            aria-label="Type your message"
            className="flex-1 resize-none bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] outline-none font-[var(--font-body)] text-sm leading-normal"
            style={{ minHeight: "20px", maxHeight: "80px" }}
          />

          {isStreaming ? (
            <button
              onClick={onStop}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-accent-2)] text-white transition-all duration-150 hover:opacity-80 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
              aria-label="Stop generating"
            >
              <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor">
                <rect width="14" height="14" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!text.trim() || disabled}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-[var(--color-accent)] text-white transition-all duration-150 hover:bg-[var(--color-accent-hover)] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
              aria-label="Send message"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 14V2M8 2L3 7M8 2L13 7" />
              </svg>
            </button>
          )}
        </div>

        {/* File chips */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-[var(--color-border)]/50">
            {files.map((file) => (
              <span
                key={file.id}
                className="flex items-center gap-1 rounded-[var(--radius-full)] bg-[var(--color-surface-2)] px-2 py-0.5 text-[11px] text-[var(--color-text-muted)]"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="shrink-0 opacity-60"
                >
                  <path d="M4 1h5.586a1 1 0 0 1 .707.293l2.414 2.414a1 1 0 0 1 .293.707V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
                </svg>
                <span className="max-w-[120px] truncate">{file.name}</span>
                <span className="text-[var(--color-text-subtle)]">
                  {Math.ceil(file.sizeBytes / 1024)} KB
                </span>
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className="ml-0.5 text-[var(--color-text-subtle)] hover:text-[var(--color-text)] transition-colors outline-none"
                  aria-label={`Remove ${file.name}`}
                >
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-[11px] text-[var(--color-accent-2)] mt-1 px-1">
          {error}
        </p>
      )}
    </div>
  );
}
