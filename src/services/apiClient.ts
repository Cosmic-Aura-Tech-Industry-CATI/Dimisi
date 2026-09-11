/**
 * Centralized API Client for HTTP requests to the DIMISI Express Backend.
 *
 * Configured via VITE_API_BASE_URL (defaults to http://localhost:5000).
 */

export const API_BASE_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "http://localhost:5000";

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
}

/**
 * Execute an HTTP request against the configured Express backend.
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { timeoutMs = 15000, token, headers = {}, ...rest } = options;

  // Normalize full URL
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

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

  try {
    const response = await fetch(url, {
      ...rest,
      headers: {
        ...defaultHeaders,
        ...(headers as Record<string, string>),
      },
      signal: controller.signal,
      credentials: "include",
    });

    clearTimeout(timeoutId);

    let data: any = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      let errorMessage =
        (data && typeof data === "object" && (data.message || data.error?.message || data.error)) || null;

      if (!errorMessage) {
        if (response.status === 401) {
          errorMessage = "Unauthorized access. Please check your credentials.";
        } else if (response.status === 403) {
          errorMessage = "You do not have permission to perform this action.";
        } else if (response.status === 404) {
          errorMessage = "The requested API endpoint was not found.";
        } else if (response.status >= 500) {
          errorMessage = "Backend server is temporarily unavailable or returned an internal error.";
        } else {
          errorMessage = `Request failed with status ${response.status}`;
        }
      }

      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof ApiError) {
      throw err;
    }

    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", 408);
    }

    // Network error (backend down, connection refused, CORS failure)
    throw new ApiError(
      `Unable to reach the backend service (${API_BASE_URL}). Please ensure the backend server is running.`,
      0,
    );
  }
}
