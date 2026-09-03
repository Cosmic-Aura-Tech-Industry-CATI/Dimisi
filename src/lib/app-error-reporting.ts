/**
 * DIMISI Technologies — Application Error Logging & Reporting
 */
export function reportAppError(error: unknown, context: Record<string, unknown> = {}) {
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);
  console.error("[DIMISI App Error]", message, context);
}
