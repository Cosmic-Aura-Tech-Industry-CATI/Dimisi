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

  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  return "https://api.dimisi.tech";
})();

if (typeof window !== "undefined" && import.meta.env?.DEV) {
  console.info("[API CONFIG]", API_BASE_URL);
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

export interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: HeadersInit | undefined;
  timeoutMs?: number | undefined;
  token?: string | undefined;
  /** In-memory cache TTL in ms for GET requests. Default: 30000ms. Set 0 to disable. */
  cacheTtlMs?: number | undefined;
  /** Internal flag for automatic retry after token refresh */
  _isRetry?: boolean | undefined;
}

// In-memory cache & in-flight promise deduplication map
interface CacheEntry {
  timestamp: number;
  data: any;
}
const apiGetCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<any>>();
let cacheGeneration = 0;

// Mutex lock & subscriber queue for silent 401 token refresh:
// Prevents duplicate parallel /refresh-token calls when multiple requests fail simultaneously with 401.
let isRefreshing = false;
let refreshSubscribers: ((success: boolean) => void)[] = [];

function subscribeTokenRefresh(cb: (success: boolean) => void) {
  refreshSubscribers.push(cb);
}

function notifyTokenRefreshed(success: boolean) {
  refreshSubscribers.forEach((cb) => cb(success));
  refreshSubscribers = [];
}

/**
 * Cleaner function: Flushes and rejects any pending queued requests waiting for a refresh token.
 * Prevents hung promises and memory leaks when the user logs out or session is terminated.
 */
export function clearRefreshQueue(): void {
  isRefreshing = false;
  refreshSubscribers.forEach((cb) => cb(false));
  refreshSubscribers = [];
}

/** Clears all or matching cached GET responses. */
export function clearApiCache(endpointPrefix?: string): void {
  cacheGeneration++;
  if (!endpointPrefix) {
    apiGetCache.clear();
    inFlightRequests.clear();
    clearRefreshQueue(); // Clean up pending refresh queue
    return;
  }
  const norm = endpointPrefix.startsWith("/") ? endpointPrefix : `/${endpointPrefix}`;
  for (const key of apiGetCache.keys()) {
    if (key.includes(norm)) {
      apiGetCache.delete(key);
    }
  }
  for (const key of inFlightRequests.keys()) {
    if (key.includes(norm)) {
      inFlightRequests.delete(key);
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
  const { timeoutMs = 30000, token, cacheTtlMs = 30000, headers = {}, ...rest } = options;

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

  const requestGeneration = cacheGeneration;

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
          if (parsed?.token && typeof parsed.token === "string" && !parsed.token.includes("cookie")) {
            authToken = parsed.token;
          } else if (parsed?.accessToken && typeof parsed.accessToken === "string" && !parsed.accessToken.includes("cookie")) {
            authToken = parsed.accessToken;
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

        // Check for 401 Unauthorized on panel/activity routes to attempt silent token refresh
        const isAuthRoute =
          normalizedEndpoint.includes("/auth/login") ||
          normalizedEndpoint.includes("/auth/logout") ||
          normalizedEndpoint.includes("/auth/refresh-token");

        const isPanelRoute =
          normalizedEndpoint.startsWith("/api/v1/admin-panel/") ||
          normalizedEndpoint.startsWith("/api/v1/activity/");
        const isVisitorRoute =
          normalizedEndpoint.includes("/visitors/") ||
          normalizedEndpoint.endsWith("/active") ||
          normalizedEndpoint.includes("/public");

        if (
          response.status === 401 &&
          isPanelRoute &&
          !isAuthRoute &&
          !isVisitorRoute &&
          !options._isRetry &&
          typeof window !== "undefined"
        ) {
          // 1. Agar koi refresh call pehle se in-flight hai, to is request ko queue me wait karwayein (Mutex)
          if (isRefreshing) {
            return new Promise<T>((resolve, reject) => {
              subscribeTokenRefresh((success) => {
                if (success) {
                  // Token refresh ho chuka hai, original request ko fresh cookie ke sath retry karein
                  resolve(apiRequest<T>(endpoint, { ...options, _isRetry: true }));
                } else {
                  reject(new ApiError(errorMessage || "Session expired. Please sign in again.", 401, data));
                }
              });
            });
          }

          // 2. Primary lock holder bankar background me refresh-token call karein
          isRefreshing = true;
          try {
            // Dynamic import circular dependency ko break karta hai
            const { refreshAdminSession } = await import("./adminAuth.service");
            const refreshed = await refreshAdminSession();
            isRefreshing = false;
            notifyTokenRefreshed(refreshed);

            if (refreshed) {
              // Failed request ko fresh access token ke sath seamlessly retry karein!
              return await apiRequest<T>(endpoint, { ...options, _isRetry: true });
            }
          } catch {
            isRefreshing = false;
            notifyTokenRefreshed(false);
          }

          // 3. Agar refresh token bhi expire (30 days) ya revoke ho chuka hai, tabhi session clear karein
          try {
            const { clearAdminSession } = await import("./adminAuth.service");
            clearAdminSession("Your session has expired. Please sign in again.");
          } catch {}

          throw new ApiError("Your session has expired. Please sign in again.", 401, data);
        }

        if (import.meta.env?.DEV && method === "DELETE") {
          console.error(`[DELETE FAILED] ${normalizedEndpoint} — ${errorMessage} (status: ${response.status})`);
        }

        throw new ApiError(errorMessage, response.status, data);
      }

      // Successful mutation: invalidate GET cache so subsequent fetches pull fresh data from backend
      if (method !== "GET") {
        clearApiCache();
      } else if (cacheTtlMs > 0 && typeof window !== "undefined" && requestGeneration === cacheGeneration) {
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
