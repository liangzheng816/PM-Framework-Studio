import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import Anthropic from "@anthropic-ai/sdk";
import { loadSkill, loadDomainSkills } from "../lib/skills";

const INTEGRATION_CONTEXT = `
## Context: PM Studio Integration
When you mention a framework, use its exact canonical title as listed in
your toolkit table. The web interface will auto-link these to deep-dive pages.
`;

const EXPERT_ANALYSIS_PROMPT = `
## Debate Mode — Expert Analysis

You are participating in a multi-expert PM framework debate. Analyze the
user's problem through your specific domain lens.

Produce a focused analysis in this format:

**Position**: Your one-sentence stance on this problem
**Key Diagnosis**: What you see as the root issue
**Recommended Frameworks**: 2–3 from your toolkit, with a one-line rationale for each
**Core Argument**: Your reasoning in 2–3 sentences
**Risks If Ignored**: What happens if this perspective is not considered
**Handoff**: When another domain expert should take over

Be specific and concise. Ground everything in your frameworks. Do not hedge.
`;

const DEBATE_SYNTHESIS_PROMPT = `You are a PM Framework synthesis expert. You received structured analyses from multiple domain experts on a product management problem. Your job is to synthesize their perspectives into actionable guidance.

When you mention a framework, use its exact canonical title. The web interface will auto-link these to deep-dive pages.

Format your response EXACTLY as follows:

## Consensus
Points where multiple experts agree. Name the specific domains that converge.

## Tensions & Disagreements
Where experts genuinely disagree. Explain what drives each side.

## Recommended Sequence
A prioritized action plan combining the best of all perspectives. Number each step. Name the framework and why.

## Blind Spots
What no expert covered that the user should still consider.

## The One Thing
If the user can only do one thing this week, what should it be and why?

Be specific and actionable. Reference frameworks by name.`;

const VERSUS_SYNTHESIS_PROMPT = `You are a PM Framework synthesis expert. You received analyses from exactly 2 domain experts in an adversarial head-to-head debate. Synthesize the clash.

When you mention a framework, use its exact canonical title. The web interface will auto-link these to deep-dive pages.

Format your response EXACTLY as follows (replace {domain-a} and {domain-b} with the actual expert names):

## {domain-a}'s Case
Summarize their position, diagnosis, and recommended frameworks.

## {domain-b}'s Case
Summarize their position, diagnosis, and recommended frameworks.

## Where They Agree
Surprising alignment points.

## The Core Tension
The fundamental disagreement and what drives it.

## Verdict
Which lens serves the user's specific situation better, and why. Be decisive.

Be specific and actionable. Reference frameworks by name.`;

/**
 * Parse --skills or --versus modifiers from the last user message.
 * Returns the requested skill IDs and whether versus mode is active.
 */
function parseDebateModifiers(
  messages: { role: string; content: string }[]
): { skills: string[]; isVersus: boolean } {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMsg) return { skills: [], isVersus: false };

  const text = lastUserMsg.content;
  const versusMatch = text.match(/^--versus\s+([\w,-]+)/);
  if (versusMatch)
    return {
      skills: versusMatch[1].split(",").filter(Boolean),
      isVersus: true,
    };

  const skillsMatch = text.match(/^--skills\s+([\w,-]+)/);
  if (skillsMatch)
    return {
      skills: skillsMatch[1].split(",").filter(Boolean),
      isVersus: false,
    };

  return { skills: [], isVersus: false };
}

/** Strip --skills or --versus prefix from user text for API calls. */
function stripModifiers(text: string): string {
  return text.replace(/^--(versus|skills)\s+[\w,-]+\s*/, "").trim();
}

/** Helper: emit an SSE token event */
function tokenEvent(encoder: TextEncoder, text: string): Uint8Array {
  return encoder.encode(
    `data: ${JSON.stringify({ type: "token", text })}\n\n`
  );
}

app.http("chat", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "chat",
  handler: async (
    req: HttpRequest,
    context: InvocationContext
  ): Promise<HttpResponseInit> => {
    try {
      const body = (await req.json()) as {
        messages: { role: "user" | "assistant"; content: string }[];
        skill: string;
        files?: { name: string; content: string }[];
      };

      const { messages, skill, files } = body;

      if (!messages || !messages.length) {
        return { status: 400, body: "messages is required" };
      }

      const skillId = skill || "advise-frameworks";
      let systemPrompt: string;
      try {
        systemPrompt = loadSkill(skillId);
      } catch {
        return { status: 400, body: `Unknown skill: ${skillId}` };
      }

      const isDebate = skillId === "pm-debate";

      // For non-debate: append integration context to skill prompt
      if (!isDebate) {
        systemPrompt += "\n\n" + INTEGRATION_CONTEXT;
      }

      // Strip lone surrogates from uploaded file content
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

      // Pre-load domain skills outside the stream for debate mode
      // so file I/O doesn't delay the first SSE byte.
      let domainSkills: Record<string, string> | undefined;
      let debateIsVersus = false;
      if (isDebate) {
        const { skills: requestedSkills, isVersus } =
          parseDebateModifiers(messages);
        debateIsVersus = isVersus;
        domainSkills = loadDomainSkills(
          requestedSkills.length > 0 ? requestedSkills : undefined
        );
      }

      context.log(
        `Chat request: skill=${skillId}, messages=${messages.length}, files=${files?.length ?? 0}, debate=${isDebate}`
      );

      const anthropic = new Anthropic();
      const model = process.env.COACH_MODEL || "claude-sonnet-4-6";
      const defaultMaxTokens = parseInt(
        process.env.COACH_MAX_TOKENS || "4096",
        10
      );

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            // Send skill info event
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "skill", skillId, skillLabel: skillId })}\n\n`
              )
            );

            if (isDebate) {
              // ── Multi-call debate flow ──────────────────────────────
              // Each expert gets its own API call (fast model, small
              // prompt). Tokens stream continuously, avoiding the Azure
              // SWA 45s timeout. A final synthesis call combines all
              // expert analyses.

              const fastModel = "claude-haiku-4-5-20251001";
              const isVersus = debateIsVersus;

              const expertIds = Object.keys(domainSkills!);
              const expertCount = expertIds.length;
              const totalUsage = {
                input_tokens: 0,
                output_tokens: 0,
              };

              // Strip modifiers from user message for expert calls
              const cleanedMessages = enrichedMessages.map((m, i) => {
                if (m.role === "user" && i === enrichedMessages.length - 1) {
                  return { role: m.role, content: stripModifiers(m.content) };
                }
                return m;
              });

              // ── Phase 1: Individual expert consultations ───────────
              const header = isVersus
                ? `> **Head-to-head: ${expertIds.map((id) => id.replace(/-/g, " ")).join(" vs ")}**\n\n`
                : `> **Consulting ${expertCount} domain experts...**\n\n`;
              controller.enqueue(tokenEvent(encoder, header));

              const expertResponses: Record<string, string> = {};

              for (const [id, skillContent] of Object.entries(domainSkills!)) {
                const label = id
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());

                controller.enqueue(
                  tokenEvent(encoder, `### ${label}\n\n`)
                );

                const expertSystem =
                  skillContent +
                  "\n\n" +
                  EXPERT_ANALYSIS_PROMPT +
                  "\n\n" +
                  INTEGRATION_CONTEXT;

                let response = "";
                const expertStream = anthropic.messages.stream({
                  model: fastModel,
                  max_tokens: 1536,
                  system: expertSystem,
                  messages: cleanedMessages,
                });

                for await (const event of expertStream) {
                  if (
                    event.type === "content_block_delta" &&
                    event.delta.type === "text_delta"
                  ) {
                    response += event.delta.text;
                    controller.enqueue(
                      tokenEvent(encoder, event.delta.text)
                    );
                  }
                }

                expertResponses[id] = response;

                const expertMsg = await expertStream.finalMessage();
                totalUsage.input_tokens += expertMsg.usage.input_tokens;
                totalUsage.output_tokens += expertMsg.usage.output_tokens;

                context.log(
                  `Debate expert: ${id}, model=${fastModel}, in=${expertMsg.usage.input_tokens}, out=${expertMsg.usage.output_tokens}`
                );

                controller.enqueue(tokenEvent(encoder, "\n\n---\n\n"));
              }

              // ── Phase 2: Synthesis ─────────────────────────────────
              controller.enqueue(
                tokenEvent(encoder, "## Synthesis\n\n")
              );

              // Build context with all expert analyses
              let synthesisContext =
                "# Expert Analyses\n\nBelow are the structured analyses from each domain expert.\n\n";
              for (const [id, resp] of Object.entries(expertResponses)) {
                const label = id
                  .replace(/-/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase());
                synthesisContext += `## ${label}\n${resp}\n\n`;
              }

              // Use the last user message (stripped of modifiers) + expert analyses
              const lastUserContent = stripModifiers(
                enrichedMessages[enrichedMessages.length - 1].content
              );
              const synthesisMessages = [
                {
                  role: "user" as const,
                  content:
                    lastUserContent +
                    "\n\n---\n\n" +
                    synthesisContext,
                },
              ];

              const synthesisPrompt = isVersus
                ? VERSUS_SYNTHESIS_PROMPT
                : DEBATE_SYNTHESIS_PROMPT;

              const maxSynthTokens = Math.max(defaultMaxTokens, 8192);

              const synthesisStream = anthropic.messages.stream({
                model,
                max_tokens: maxSynthTokens,
                system: synthesisPrompt,
                messages: synthesisMessages,
              });

              for await (const event of synthesisStream) {
                if (
                  event.type === "content_block_delta" &&
                  event.delta.type === "text_delta"
                ) {
                  controller.enqueue(
                    tokenEvent(encoder, event.delta.text)
                  );
                }
              }

              const synthMsg = await synthesisStream.finalMessage();
              totalUsage.input_tokens += synthMsg.usage.input_tokens;
              totalUsage.output_tokens += synthMsg.usage.output_tokens;

              context.log(
                `Debate synthesis: model=${model}, in=${synthMsg.usage.input_tokens}, out=${synthMsg.usage.output_tokens}`
              );
              context.log(
                `Debate total: experts=${expertCount}, totalIn=${totalUsage.input_tokens}, totalOut=${totalUsage.output_tokens}`
              );

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "done", usage: totalUsage })}\n\n`
                )
              );
            } else {
              // ── Single-skill flow (unchanged) ──────────────────────
              const stream = anthropic.messages.stream({
                model,
                max_tokens: defaultMaxTokens,
                system: systemPrompt,
                messages: enrichedMessages,
              });

              for await (const event of stream) {
                if (
                  event.type === "content_block_delta" &&
                  event.delta.type === "text_delta"
                ) {
                  controller.enqueue(
                    tokenEvent(encoder, event.delta.text)
                  );
                }
              }

              const finalMessage = await stream.finalMessage();
              context.log(
                `Chat response: skill=${skillId}, model=${model}, inputTokens=${finalMessage.usage.input_tokens}, outputTokens=${finalMessage.usage.output_tokens}`
              );
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "done", usage: finalMessage.usage })}\n\n`
                )
              );
            }
          } catch (streamErr: unknown) {
            const msg =
              streamErr instanceof Error ? streamErr.message : "Stream error";
            context.error(
              `Chat stream error: skill=${skillId}, error=${msg}`
            );
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "error", message: msg })}\n\n`
              )
            );
          } finally {
            controller.close();
          }
        },
      });

      return {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
        body: readable,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Internal error";
      context.error(`Chat handler error: ${message}`);
      return { status: 500, body: message };
    }
  },
});
