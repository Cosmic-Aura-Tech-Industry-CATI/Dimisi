/**
 * Centralized API Client for HTTP requests to the DIMISI Express Backend.
 *
 * Configured via VITE_API_BASE_URL (defaults to https://api.dimisi.tech).
 */

export const API_BASE_URL = (() => {
  const envUrl =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      typeof import.meta.env.VITE_API_BASE_URL === "string" &&
      import.meta.env.VITE_API_BASE_URL.trim()) ||
    (typeof process !== "undefined" &&
      process.env &&
      typeof process.env.VITE_API_BASE_URL === "string" &&
      process.env.VITE_API_BASE_URL.trim()) ||
    "";

  // In local browser development (localhost/127.0.0.1 or DEV mode):
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.port === "8080" ||
      import.meta.env?.DEV)
  ) {
    // If the developer explicitly specified a local server URL (e.g. http://localhost:5000), use that directly
    if (envUrl && (envUrl.includes("localhost:") || envUrl.includes("127.0.0.1:"))) {
      return envUrl;
    }
    // For remote backends (https://api.dimisi.tech), ALWAYS return "" (relative path)
    // so Vite dev server proxies /api requests server-to-server, eliminating CORS preflight errors.
    return "";
  }

  // In production or SSR environments:
  if (envUrl) {
    return envUrl;
  }

  return "https://api.dimisi.tech";
})();

if (typeof window !== "undefined" && import.meta.env?.DEV) {
  console.info(
    "[API CONFIG]",
    API_BASE_URL ? API_BASE_URL : "(Vite Dev Proxy -> https://api.dimisi.tech)"
  );
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  token?: string;
  /** In-memory cache TTL in ms for GET requests. Default: 30000ms. Set 0 to disable. */
  cacheTtlMs?: number;
}

// In-memory cache & in-flight promise deduplication map
interface CacheEntry {
  timestamp: number;
  data: any;
}
const apiGetCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<any>>();

/** Clears all or matching cached GET responses. */
export function clearApiCache(endpointPrefix?: string): void {
  if (!endpointPrefix) {
    apiGetCache.clear();
    return;
  }
  const norm = endpointPrefix.startsWith("/") ? endpointPrefix : `/${endpointPrefix}`;
  for (const key of apiGetCache.keys()) {
    if (key.includes(norm)) {
      apiGetCache.delete(key);
    }
  }
}

/**
 * Execute an HTTP request against the configured Express backend with
 * in-flight request deduplication and in-memory caching for GET queries.
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { timeoutMs = 15000, token, cacheTtlMs = 30000, headers = {}, ...rest } = options;

  // Normalize full URL
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  const method = (rest.method || "GET").toUpperCase();

  // Check GET in-memory cache
  const cacheKey = `${url}:${token || ""}`;
  if (method === "GET" && cacheTtlMs > 0 && typeof window !== "undefined") {
    const cached = apiGetCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTtlMs) {
      if (import.meta.env?.DEV) {
        console.debug(`[API CACHE HIT] ${normalizedEndpoint}`);
      }
      return cached.data as T;
    }
    // Deduplicate in-flight requests
    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      if (import.meta.env?.DEV) {
        console.debug(`[API DEDUP HIT] ${normalizedEndpoint}`);
      }
      return inFlight as Promise<T>;
    }
  }

  const execute = async (): Promise<T> => {
    const startTime = typeof performance !== "undefined" ? performance.now() : Date.now();
    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    let authToken = token;
    if (!authToken && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("dimisi_admin_session");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.token && !parsed.token.includes("cookie")) {
            authToken = parsed.token;
          }
        }
      } catch {}
    }

    if (authToken && !authToken.includes("cookie")) {
      defaultHeaders["Authorization"] = `Bearer ${authToken}`;
    }

    if (typeof FormData !== "undefined" && rest.body instanceof FormData) {
      delete defaultHeaders["Content-Type"];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const onExternalAbort = () => controller.abort();
    if (rest.signal) {
      if (rest.signal.aborted) {
        controller.abort();
      } else {
        rest.signal.addEventListener("abort", onExternalAbort, { once: true });
      }
    }

    if (import.meta.env?.DEV && method === "DELETE") {
      console.debug(`[DELETE START] ${normalizedEndpoint}`);
    }

    try {
      const response = await fetch(url, {
        ...rest,
        method,
        headers: {
          ...defaultHeaders,
          ...(headers as Record<string, string>),
        },
        signal: controller.signal,
        credentials: "include",
      });

      clearTimeout(timeoutId);
      if (rest.signal) {
        rest.signal.removeEventListener("abort", onExternalAbort);
      }

      let data: any = null;
      if (response.status !== 204) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            data = await response.json();
          } catch {
            data = null;
          }
        } else {
          try {
            data = await response.text();
          } catch {
            data = null;
          }
        }
      }

      const duration = (
        (typeof performance !== "undefined" ? performance.now() : Date.now()) - startTime
      ).toFixed(1);

      if (import.meta.env?.DEV) {
        if (method === "DELETE") {
          console.debug(`[DELETE SUCCESS] ${normalizedEndpoint} — ${duration}ms (status: ${response.status})`);
        } else {
          console.debug(`[API ${method}] ${normalizedEndpoint} — ${duration}ms (status: ${response.status})`);
        }
      }

      if (!response.ok) {
        let errorMessage =
          (data && typeof data === "object" && (data.message || data.error?.message || data.error)) || null;

        if (!errorMessage) {
          if (response.status === 401) {
            errorMessage = "Unauthorized access. Please check your admin credentials.";
          } else if (response.status === 403) {
            errorMessage = "You do not have permission to perform this action.";
          } else if (response.status === 404) {
            errorMessage = "The requested API endpoint was not found on the backend.";
          } else if (response.status >= 500) {
            errorMessage = "Backend server is temporarily unavailable or returned an internal error.";
          } else {
            errorMessage = `Request failed with status ${response.status}`;
          }
        }

        if (import.meta.env?.DEV && method === "DELETE") {
          console.error(`[DELETE FAILED] ${normalizedEndpoint} — ${errorMessage} (status: ${response.status})`);
        }

        throw new ApiError(errorMessage, response.status, data);
      }

      // Successful mutation: invalidate GET cache so subsequent fetches pull fresh data from backend
      if (method !== "GET") {
        clearApiCache();
      } else if (cacheTtlMs > 0 && typeof window !== "undefined") {
        apiGetCache.set(cacheKey, { timestamp: Date.now(), data });
      }

      return data as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (rest.signal) {
        rest.signal.removeEventListener("abort", onExternalAbort);
      }

      if (err instanceof ApiError) {
        throw err;
      }

      const duration = (
        (typeof performance !== "undefined" ? performance.now() : Date.now()) - startTime
      ).toFixed(1);

      if (err instanceof Error && err.name === "AbortError") {
        const timeoutErr = new ApiError("Request timed out or was cancelled. Please try again.", 408);
        if (import.meta.env?.DEV && method === "DELETE") {
          console.error(`[DELETE FAILED] ${normalizedEndpoint} — Request timed out after ${duration}ms`);
        }
        throw timeoutErr;
      }

      // Network error (ERR_CONNECTION_REFUSED, offline server, CORS rejection)
      const networkErrorMsg = `Unable to reach backend service (${API_BASE_URL}). Please check network connectivity or server availability.`;
      if (import.meta.env?.DEV && method === "DELETE") {
        console.error(`[DELETE FAILED] ${normalizedEndpoint} — Connection refused (${API_BASE_URL})`);
      }

      throw new ApiError(networkErrorMsg, 0);
    }
  };

  if (method === "GET" && typeof window !== "undefined") {
    const promise = execute().finally(() => {
      inFlightRequests.delete(cacheKey);
    });
    inFlightRequests.set(cacheKey, promise);
    return promise;
  }

  return execute();
}
