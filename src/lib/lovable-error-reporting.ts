import { reportAppError } from "./app-error-reporting";

/** Legacy error reporter bridge */
export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  reportAppError(error, context);
}
