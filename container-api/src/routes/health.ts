import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

router.get("/health", async (req: Request, res: Response) => {
  const info: Record<string, unknown> = {
    status: "ok",
    node: process.version,
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    model: process.env.COACH_MODEL || "claude-sonnet-4-6 (default)",
  };

  // ?delay=30000 → sleep N ms to test proxy timeout
  const delayMs = parseInt((req.query.delay as string) || "0", 10);
  if (delayMs > 0) {
    await new Promise((r) => setTimeout(r, delayMs));
    info.delayMs = delayMs;
  }

  // ?deep=1 → make a minimal Anthropic API call to test connectivity
  if (req.query.deep === "1") {
    try {
      const anthropic = new Anthropic();
      const result = await anthropic.messages.create({
        model: process.env.COACH_MODEL || "claude-sonnet-4-6",
        max_tokens: 16,
        messages: [{ role: "user", content: "Say OK" }],
      });
      info.anthropic = "ok";
      info.responseId = result.id;
    } catch (err: unknown) {
      info.anthropic = "error";
      info.anthropicError =
        err instanceof Error ? err.message.slice(0, 300) : String(err);
    }
  }

  res.json(info);
});

export default router;
