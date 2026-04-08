import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import Anthropic from "@anthropic-ai/sdk";
import { loadSkill } from "../lib/skills";

const INTEGRATION_CONTEXT = `
## Context: Framework Studio Integration
When you mention a framework, use its exact canonical title as listed in
your toolkit table. The web interface will auto-link these to deep-dive pages.
`;

app.http("chat", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "chat",
  handler: async (
    req: HttpRequest,
    _context: InvocationContext
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

      // Append integration context
      systemPrompt += "\n\n" + INTEGRATION_CONTEXT;

      // Append uploaded file contents if any
      if (files && files.length > 0) {
        systemPrompt += "\n\n## Uploaded Documents\n";
        for (const file of files) {
          systemPrompt += `\n### ${file.name}\n\`\`\`\n${file.content}\n\`\`\`\n`;
        }
      }

      const anthropic = new Anthropic();
      const model = process.env.COACH_MODEL || "claude-sonnet-4-20250514";
      const maxTokens = parseInt(process.env.COACH_MAX_TOKENS || "4096", 10);

      const stream = await anthropic.messages.stream({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      // Build SSE response body
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          // Send skill info event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "skill", skillId, skillLabel: skillId })}\n\n`
            )
          );

          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "token", text: event.delta.text })}\n\n`
                )
              );
            }
          }

          // Send done event
          const finalMessage = await stream.finalMessage();
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                usage: finalMessage.usage,
              })}\n\n`
            )
          );
          controller.close();
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
      return { status: 500, body: message };
    }
  },
});
