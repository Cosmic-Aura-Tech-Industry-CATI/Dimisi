/**
 * DIMISI AI — Wake Word & Activation Phrase Detector
 * Detects natural language wake invocations across text & voice.
 */

export interface WakeDetectionResult {
  activated: boolean;
  isWakeOnly: boolean;
  phrase?: string;
  remainingQuery?: string;
}

// Regex matching common wake invocations with flexible prefixes and punctuation
// e.g., "Hey Dimisi", "Dimisi wake up", "Wake up Dimisi", "Hi DIMISI AI", "OK Dimisi", "Dimisi"
const WAKE_PATTERNS = [
  /^(?:hey|hi|hello|ok|okay)\s*,?\s*dimisi(?:\s*ai)?(?:\s*,?\s*(?:wake\s*up|please\s*wake\s*up|are\s*you\s*there|listen|sunno))?/i,
  /^(?:wake\s*up|please\s*wake\s*up)\s*,?\s*dimisi(?:\s*ai)?/i,
  /^dimisi(?:\s*ai)?\s*,?\s*(?:wake\s*up|please\s*wake\s*up)/i,
  /^dimisi\s*ai\b/i,
  /^dimisi\b/i,
];

/**
 * Detects if the input text contains a DIMISI AI wake phrase.
 * If found, extracts the wake phrase and strips it from the remaining user query.
 */
export function detectDimisiWakePhrase(input: string): WakeDetectionResult {
  if (!input || typeof input !== "string") {
    return { activated: false, isWakeOnly: false };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { activated: false, isWakeOnly: false };
  }

  // 1. Safeguard against URLs, email addresses or compound tech tokens
  // e.g. "dimisi.com", "dimisitech", "hello@dimisi.in", "dimisi-admin"
  if (
    /https?:\/\/\S*dimisi\S*/i.test(trimmed) ||
    /@dimisi\./i.test(trimmed) ||
    /\bdimisi\.(?:com|in|io|org|tech|dev)\b/i.test(trimmed) ||
    /\bdimisi(?:tech|technologies|corp|ltd)\b/i.test(trimmed) ||
    /\bdimisi-admin\b/i.test(trimmed)
  ) {
    return { activated: false, isWakeOnly: false };
  }

  for (const pattern of WAKE_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match && match.index === 0) {
      const matchedPhrase = match[0];
      // Strip matched wake prefix and leading punctuation/whitespace
      let remainder = trimmed.slice(matchedPhrase.length).trim();
      remainder = remainder.replace(/^[,:\-–—!?\s]+/, "").trim();

      const isWakeOnly = remainder.length === 0;

      return {
        activated: true,
        isWakeOnly,
        phrase: matchedPhrase,
        remainingQuery: isWakeOnly ? undefined : remainder,
      };
    }
  }

  return { activated: false, isWakeOnly: false };
}
