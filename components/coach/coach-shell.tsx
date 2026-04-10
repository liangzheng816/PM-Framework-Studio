"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Message, SelectableSkillId, UploadedFile } from "@/lib/coach-types";
import { SKILL_META, resolveSkillForApi, buildDebateMessage } from "@/lib/coach-types";
import { ChatInput } from "./chat-input";
import { MessageBubble } from "./message-bubble";
import { SkillSelector } from "./skill-selector";

export function CoachShell() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SelectableSkillId>("auto");
  const [isDebateMode, setIsDebateMode] = useState(false);
  const [selectedDebateSkills, setSelectedDebateSkills] = useState<SelectableSkillId[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAddFiles = useCallback((newFiles: UploadedFile[]) => {
    setUploadedFiles((prev) => [...prev, ...newFiles].slice(0, 10));
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleToggleDebateSkill = useCallback(
    (skill: SelectableSkillId) => {
      setSelectedDebateSkills((prev) =>
        prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
      );
    },
    []
  );

  const handleSend = useCallback(
    async (text: string) => {
      const apiSkill = isDebateMode
        ? "pm-debate"
        : resolveSkillForApi(selectedSkill);
      const apiText = isDebateMode
        ? buildDebateMessage(text, selectedDebateSkills)
        : text;

      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: "",
        skill: apiSkill as Message["skill"],
        isDebate: isDebateMode,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Build messages array for API (exclude the empty assistant message)
        const apiMessages = [...messages, userMessage].map((m, i, arr) => ({
          role: m.role,
          // Only transform the last user message with debate prefix
          content:
            isDebateMode && i === arr.length - 1 && m.role === "user"
              ? apiText
              : m.content,
        }));

        const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
        const res = await fetch(`${apiBase}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            skill: apiSkill,
            files: uploadedFiles.map((f) => ({ name: f.name, content: f.content })),
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          let detail = `API error: ${res.status}`;
          try {
            const text = await res.text();
            if (text) {
              try {
                const json = JSON.parse(text);
                if (json.error) detail = json.error;
              } catch {
                // Not JSON — show raw response (e.g. SWA proxy error)
                detail = text.slice(0, 300);
              }
            }
          } catch {
            // couldn't read body at all
          }
          throw new Error(detail);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (!json) continue;

            try {
              const event = JSON.parse(json);
              if (event.type === "token") {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + event.text,
                    };
                  }
                  return updated;
                });
              } else if (event.type === "skill") {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      skill: event.skillId,
                    };
                  }
                  return updated;
                });
              } else if (event.type === "error") {
                throw new Error(event.message || "API stream error");
              }
            } catch (parseErr) {
              // Re-throw explicit errors from the API
              if (parseErr instanceof Error && parseErr.message !== "Unexpected end of JSON input") {
                throw parseErr;
              }
              // skip malformed events
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // User stopped streaming
        } else {
          const errorText =
            err instanceof Error ? err.message : "Something went wrong";
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant" && !last.content) {
              updated[updated.length - 1] = {
                ...last,
                content: `Error: ${errorText}`,
              };
            }
            return updated;
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, selectedSkill, isDebateMode, selectedDebateSkills, uploadedFiles]
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-3xl flex-col px-4 sm:px-6">
      {messages.length === 0 ? (
        /* Empty state — hero + input + pills all centered as a group */
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center text-center mb-10">
            <h1 className="font-[var(--font-heading)] text-3xl text-[var(--color-text)] mb-4">
              What product challenge are you working on?
            </h1>
            <p className="text-[var(--color-text-muted)] max-w-md">
              7 expert AI coaches to sharpen your strategy,
              pressure-test your plans, and ship with confidence.
            </p>
          </div>
          <div className="w-full space-y-4">
            <ChatInput
              onSend={handleSend}
              onStop={handleStop}
              isStreaming={isStreaming}
              disabled={false}
              placeholder={
                isDebateMode
                  ? "Describe the challenge for the expert panel..."
                  : SKILL_META[selectedSkill].placeholder
              }
              files={uploadedFiles}
              onAddFiles={handleAddFiles}
              onRemoveFile={handleRemoveFile}
            />
            <SkillSelector
              mode={isDebateMode ? "multi" : "single"}
              selectedSkill={selectedSkill}
              onSelect={setSelectedSkill}
              selectedSkills={selectedDebateSkills}
              onToggleSkill={handleToggleDebateSkill}
              disabled={isStreaming}
              debateActive={isDebateMode}
              onDebateToggle={() => setIsDebateMode((prev) => !prev)}
            />
          </div>
        </div>
      ) : (
        /* Conversation — scrollable message list + input pinned to bottom */
        <>
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto py-6 space-y-4"
          >
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={
                  isStreaming && i === messages.length - 1 && msg.role === "assistant"
                }
              />
            ))}
          </div>
          <div className="shrink-0 pb-4 pt-2 space-y-2">
            <ChatInput
              onSend={handleSend}
              onStop={handleStop}
              isStreaming={isStreaming}
              disabled={false}
              placeholder={
                isDebateMode
                  ? "Describe the challenge for the expert panel..."
                  : SKILL_META[selectedSkill].placeholder
              }
              files={uploadedFiles}
              onAddFiles={handleAddFiles}
              onRemoveFile={handleRemoveFile}
            />
            <SkillSelector
              mode={isDebateMode ? "multi" : "single"}
              selectedSkill={selectedSkill}
              onSelect={setSelectedSkill}
              selectedSkills={selectedDebateSkills}
              onToggleSkill={handleToggleDebateSkill}
              disabled={isStreaming}
              debateActive={isDebateMode}
              onDebateToggle={() => setIsDebateMode((prev) => !prev)}
            />
          </div>
        </>
      )}
    </div>
  );
}
