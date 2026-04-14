import type { Message, SkillId } from "./coach-types";
import { SKILL_META, type SelectableSkillId } from "./coach-types";

/** Resolve a SkillId to a human-readable label. */
function getSkillLabel(skill?: SkillId, isDebate?: boolean): string {
  if (isDebate) return "Debate";
  if (!skill) return "Auto";
  if (skill in SKILL_META) return SKILL_META[skill as SelectableSkillId].label;
  if (skill === "advise-frameworks") return "Auto";
  if (skill === "pm-debate") return "Debate";
  return skill;
}

/** Format a timestamp for export (absolute, not relative). */
function formatExportTime(ts: number): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ts));
}

/** Format a full date for the export header. */
function formatExportDate(ts: number): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ts));
}

/** Build a complete Markdown document from a conversation. */
export function formatConversationMarkdown(messages: Message[]): string {
  if (messages.length === 0) return "";

  const now = formatExportDate(Date.now());
  const msgCount = messages.length;

  // Collect unique coach labels used
  const coaches = new Set<string>();
  for (const m of messages) {
    if (m.role === "assistant") {
      coaches.add(getSkillLabel(m.skill, m.isDebate));
    }
  }
  const coachList = coaches.size > 0 ? [...coaches].join(", ") : "Auto";

  const lines: string[] = [
    "# PM Studio Conversation",
    "",
    `> Exported on ${now}`,
    `> ${msgCount} messages | Coaches: ${coachList}`,
    "",
  ];

  for (const msg of messages) {
    lines.push("---", "");

    if (msg.role === "user") {
      lines.push("## You");
    } else {
      const label = getSkillLabel(msg.skill, msg.isDebate);
      lines.push(`## Coach (${label})`);
    }

    lines.push(`*${formatExportTime(msg.timestamp)}*`, "");
    lines.push(msg.content.trimEnd(), "");
  }

  return lines.join("\n");
}

/** Copy the full conversation as Markdown to the clipboard. */
export function copyConversationToClipboard(messages: Message[]): Promise<void> {
  const md = formatConversationMarkdown(messages);
  return navigator.clipboard.writeText(md);
}

/** Download the full conversation as a .md file. */
export function downloadConversationMarkdown(messages: Message[]): void {
  const md = formatConversationMarkdown(messages);
  const ts = Math.floor(Date.now() / 1000);
  const filename = `pm-studio-conversation-${ts}.md`;

  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
