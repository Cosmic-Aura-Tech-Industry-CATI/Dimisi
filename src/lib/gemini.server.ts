/**
 * DIMISI Technologies — Server-Side Google Gemini AI Integration
 * Securely communicates with Google Gemini API using server-side environment credentials.
 * Grounded in DIMISI knowledge base with strict confidentiality and anti-injection guardrails.
 */
import { buildSystemPrompt, crawlSite } from "./dimisi-knowledge.server";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GeminiChatPayload {
  messages: ChatMessage[];
  currentRoute?: string;
  origin?: string;
}

export interface GeminiChatResponse {
  reply: string;
  actions?: Array<{ label: string; href: string }>;
}

/**
 * Executes a server-side inference request against the configured Google Gemini model.
 */
export async function generateGeminiGuideResponse(
  payload: GeminiChatPayload,
): Promise<GeminiChatResponse | null> {
  const apiKey =
    typeof process !== "undefined" && process.env
      ? process.env.GEMINI_API_KEY
      : undefined;
  const model =
    (typeof process !== "undefined" && process.env && process.env.GEMINI_MODEL) ||
    "gemini-2.5-flash";

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key") {
    // API key not configured on server; return null to trigger graceful local FAQ fallback
    return null;
  }

  const messages = payload.messages || [];
  if (messages.length === 0) return null;

  // Crawl live content if origin provided
  let liveContent = "";
  if (payload.origin) {
    try {
      liveContent = await crawlSite(payload.origin);
    } catch {
      // Non-fatal if site crawl fails
    }
  }

  const systemInstructionText = buildSystemPrompt(liveContent);

  // Format conversational history for Gemini API
  // Add route awareness to the latest message if currentRoute is present
  const contents = messages.slice(-10).map((m, idx, arr) => {
    let text = m.content;
    if (idx === arr.length - 1 && payload.currentRoute) {
      text = `[Current Page: ${payload.currentRoute}]\n${text}`;
    }
    return {
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text }],
    };
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const requestBody = {
    systemInstruction: {
      parts: [{ text: systemInstructionText }],
    },
    contents,
    generationConfig: {
      temperature: 0.65,
      maxOutputTokens: 350,
      topP: 0.95,
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Gemini API HTTP Error (${response.status}):`, errorText);
      return null;
    }

    const json = await response.json();
    const candidateText =
      json?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    if (!candidateText || typeof candidateText !== "string") {
      return null;
    }

    // Clean formatting for natural speech (no markdown bold, bullets converted to clean dots)
    let cleaned = candidateText
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/^\s*[-•]\s+/gm, "· ")
      .trim();

    // Security filter: Ensure no accidental leak of admin secret trigger
    if (/dimisi-admin/i.test(cleaned)) {
      cleaned = cleaned.replace(/dimisi-admin/gi, "DIMISI administration");
    }

    return {
      reply: cleaned,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    console.warn("Gemini API connection warning:", err instanceof Error ? err.message : err);
    return null;
  }
}

