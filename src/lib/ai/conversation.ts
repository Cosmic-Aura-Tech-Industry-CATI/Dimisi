/**
 * DIMISI AI — Conversation & Identity Manager
 * Handles assistant lifecycle states, identity resolution, and dynamic greetings.
 */
import {
  WAKE_GREETINGS_EN,
  WAKE_GREETINGS_HI,
  IDENTITY_ANSWERS,
} from "./ai.constants";
import type { ActionChip } from "./ai.types";

export type AssistantState =
  | "IDLE"
  | "WAKE_DETECTED"
  | "WAKING"
  | "LISTENING"
  | "PROCESSING"
  | "RESPONDING"
  | "ACTIVE_CONVERSATION";

let lastGreetingIndex = -1;

/**
 * Returns a natural deterministic wake greeting without repetitive loops
 */
export function getRandomWakeGreeting(preferHindi = false): string {
  const pool = preferHindi ? WAKE_GREETINGS_HI : WAKE_GREETINGS_EN;
  let nextIdx = Math.floor(Math.random() * pool.length);
  if (nextIdx === lastGreetingIndex && pool.length > 1) {
    nextIdx = (nextIdx + 1) % pool.length;
  }
  lastGreetingIndex = nextIdx;
  return pool[nextIdx] || pool[0];
}

/**
 * Checks if user question is asking directly about DIMISI AI's identity
 */
export function resolveIdentityQuestion(query: string): {
  isIdentity: boolean;
  reply?: string;
  actions?: ActionChip[];
} {
  const q = query.trim().toLowerCase();

  const isIdentityEn =
    /^(?:what(?:'s|\s+is)\s+your\s+name|who\s+are\s+you|what\s+should\s+i\s+call\s+you|are\s+you\s+(?:an?\s+)?ai|who\s+created\s+you|what\s+do\s+you\s+do|are\s+you\s+dimisi(?:\s*ai)?|who\s+is\s+dimisi(?:\s*ai)?|are\s+you\s+gemini|is\s+your\s+name\s+dimisi)\b/i.test(
      q,
    ) ||
    /^(?:tell\s+me\s+about\s+yourself|introduce\s+yourself)\b/i.test(q);

  const isIdentityHi =
    /(?:tumhara|aapka)\s*naam\s*kya\s*hai|tum\s*kaun\s*ho|aap\s*kaun\s*hain|dimisi\s*ai\s*kaun\s*hai|kya\s*tum\s*ai\s*ho|tumhe\s*kisne\s*banaya|kya\s*tum\s*gemini\s*ho/i.test(
      q,
    );

  if (isIdentityHi) {
    return {
      isIdentity: true,
      reply: IDENTITY_ANSWERS.hinglish,
      actions: [
        { id: "services", label: "⚡ Explore Services", action: "navigate", target: "/services" },
        { id: "estimator", label: "📊 Project Estimator", action: "estimator" },
      ],
    };
  }

  if (isIdentityEn) {
    return {
      isIdentity: true,
      reply: IDENTITY_ANSWERS.en,
      actions: [
        { id: "services", label: "⚡ Explore Services", action: "navigate", target: "/services" },
        { id: "estimator", label: "📊 Project Estimator", action: "estimator" },
        { id: "contact", label: "💬 Contact Team", action: "navigate", target: "/contact" },
      ],
    };
  }

  return { isIdentity: false };
}
