import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const AskSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
  origin: z.string().url().max(200).optional(),
});

export type ChatMessage = z.infer<typeof MessageSchema>;

/** Ask the DIMISI Technologies robot guide a question about the company. */
export const askDimisi = createServerFn({ method: "POST" })
  .validator((input: unknown) => AskSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI is not configured right now.");

    const { buildSystemPrompt, crawlSite } = await import("./dimisi-knowledge.server");

    // Auto-update: DIMISI walks the live site and reads the latest content.
    let live = "";
    if (data.origin) {
      try {
        live = await crawlSite(data.origin);
      } catch {
        live = "";
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [{ role: "system", content: buildSystemPrompt(live) }, ...data.messages],
      }),
    });

    if (response.status === 429) {
      throw new Error("I am getting a lot of questions right now — try again in a moment.");
    }
    if (response.status === 402) {
      throw new Error("My AI credits ran out. Please reach the team on the Contact page.");
    }
    if (!response.ok) {
      throw new Error("I could not reach my brain just now. Please try again.");
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = json.choices?.[0]?.message?.content?.trim();
    return { reply: reply || "I did not catch that — could you rephrase?" };
  });
