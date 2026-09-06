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

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
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
      const errorMessage =
        (data && typeof data === "object" && (data.message || data.error?.message || data.error)) ||
        (response.status === 401 ? "Invalid email or password." : `Request failed with status ${response.status}`);

      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof ApiError) {
      throw err;
    }

    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError("Request timed out. Please check your network or server status.", 408);
    }

    // Network error (backend down, connection refused, CORS failure)
    throw new ApiError(
      "Unable to connect to the backend server. Please verify the server is running on " + API_BASE_URL,
      0,
    );
  }
}
