import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { loadSkill, loadDomainSkills } from "../lib/skills";

const router = Router();

const INTEGRATION_CONTEXT = `
## Context: PM Studio Integration
When you mention a framework, use its exact canonical title as listed in
your toolkit table. The web interface will auto-link these to deep-dive pages.
`;

const WEB_DEBATE_OVERRIDE = `

## Web Integration — Phase 2 Adaptation

In this environment you do NOT have the Read tool or Agent tool.
The domain expert skill files are embedded directly below in this system prompt.

**Replace Phase 2 with this internal process:**
1. Identify which experts participate (from scope modifiers, or all embedded experts if none specified).
2. For each participating expert, adopt their perspective using their embedded knowledge below. Each expert's full toolkit, frameworks, and domain guidance are provided.
3. Internally produce each expert's structured Debate Mode Response (Domain, Position, Key Diagnosis, Recommended Frameworks, Evidence & Reasoning, Risks If Ignored, Points of Likely Disagreement, Handoff Conditions).
4. Proceed directly to Phase 3 — output ONLY the final synthesis report.

All other instructions (Phase 1 intake, Phase 3 synthesis format, --versus adversarial format, quality guidelines) apply exactly as written above.

## Embedded Domain Expert Knowledge
`;

/**
 * Parse --skills or --versus modifiers from the last user message
 * to determine which domain experts should participate in the debate.
 */
function parseDebateSkills(
  messages: { role: string; content: string }[]
): string[] {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMsg) return [];

  const text = lastUserMsg.content;
  const versusMatch = text.match(/^--versus\s+([\w,-]+)/);
  if (versusMatch) return versusMatch[1].split(",").filter(Boolean);

  const skillsMatch = text.match(/^--skills\s+([\w,-]+)/);
  if (skillsMatch) return skillsMatch[1].split(",").filter(Boolean);

  return []; // empty = all 7 experts
}

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages, skill, files } = req.body as {
      messages: { role: "user" | "assistant"; content: string }[];
      skill: string;
      files?: { name: string; content: string }[];
    };

    if (!messages || !messages.length) {
      res.status(400).json({ error: "messages is required" });
      return;
    }

    const skillId = skill || "advise-frameworks";
    let systemPrompt: string;
    try {
      systemPrompt = loadSkill(skillId);
    } catch {
      res.status(400).json({ error: `Unknown skill: ${skillId}` });
      return;
    }

    // For debate mode: inject all domain expert knowledge into the prompt
    // so Claude can role-play each expert with full framework context.
    // No expert cap — Container Apps has no SWA-style timeout.
    const isDebate = skillId === "pm-debate";
    if (isDebate) {
      const requestedSkills = parseDebateSkills(messages);
      const domainSkills = loadDomainSkills(
        requestedSkills.length > 0 ? requestedSkills : undefined
      );

      systemPrompt += WEB_DEBATE_OVERRIDE;
      for (const [id, content] of Object.entries(domainSkills)) {
        systemPrompt += `\n---\n### Domain Expert: \`${id}\`\n\n${content}\n`;
      }
    }

    // Append integration context
    systemPrompt += "\n\n" + INTEGRATION_CONTEXT;

    // Strip lone surrogates from file content
    const sanitize = (s: string) =>
      s.replace(/[\uD800-\uDFFF]/g, "\uFFFD");

    // Inject uploaded file contents into the last user message
    const enrichedMessages = messages.map((m, i) => {
      if (
        files &&
        files.length > 0 &&
        m.role === "user" &&
        i === messages.length - 1
      ) {
        let docBlock =
          "\n\n---\n**Uploaded context documents — ground your analysis in these:**\n";
        for (const file of files) {
          docBlock += `\n### ${file.name}\n\`\`\`markdown\n${sanitize(file.content)}\n\`\`\`\n`;
        }
        return { role: m.role, content: m.content + docBlock };
      }
      return { role: m.role, content: m.content };
    });

    console.log(
      `Chat request: skill=${skillId}, messages=${messages.length}, files=${files?.length ?? 0}, debate=${isDebate}`
    );

    const anthropic = new Anthropic();
    const model = process.env.COACH_MODEL || "claude-sonnet-4-6";
    const defaultMaxTokens = parseInt(
      process.env.COACH_MAX_TOKENS || "4096",
      10
    );
    // Debate synthesis needs more output space than single-skill responses
    const maxTokens = isDebate
      ? Math.max(defaultMaxTokens, 16384)
      : defaultMaxTokens;

    const stream = anthropic.messages.stream({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: enrichedMessages,
    });
    stream.on("error", () => {});

    // SSE headers — start streaming immediately
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // Keepalive every 10s
    const keepalive = setInterval(() => {
      res.write(": keepalive\n\n");
    }, 10_000);

    try {
      // Skill info event
      res.write(
        `data: ${JSON.stringify({ type: "skill", skillId, skillLabel: skillId })}\n\n`
      );

      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          res.write(
            `data: ${JSON.stringify({ type: "token", text: event.delta.text })}\n\n`
          );
        }
      }

      // Done event
      const finalMessage = await stream.finalMessage();
      console.log(
        `Chat response: skill=${skillId}, model=${model}, ` +
          `inputTokens=${finalMessage.usage.input_tokens}, outputTokens=${finalMessage.usage.output_tokens}`
      );
      res.write(
        `data: ${JSON.stringify({ type: "done", usage: finalMessage.usage })}\n\n`
      );
    } catch (streamErr: unknown) {
      const msg =
        streamErr instanceof Error ? streamErr.message : "Stream error";
      console.error(`Chat stream error: skill=${skillId}, error=${msg}`);
      res.write(
        `data: ${JSON.stringify({ type: "error", message: msg })}\n\n`
      );
    } finally {
      clearInterval(keepalive);
      res.end();
    }
  } catch (err: unknown) {
    // If headers haven't been sent yet, return JSON error
    if (!res.headersSent) {
      const message = err instanceof Error ? err.message : "Internal error";
      console.error(`Chat handler error: ${message}`);
      res.status(500).json({ error: message });
    }
  }
});

export default router;
