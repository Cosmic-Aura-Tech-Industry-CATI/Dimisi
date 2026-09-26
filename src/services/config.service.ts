/**
 * DIMISI Admin — Application Configuration Express API Service
 * Handles fetching and updating section-level & full app configuration
 * against the Express backend API (/api/v1/config/* or /api/v1/admin-panel/config/*).
 */
import { apiRequest, clearApiCache } from "./apiClient";

export interface BackendAppConfigResponse {
  status: string;
  data: Record<string, any>;
  message?: string;
}

/**
 * 1. GET FULL APP CONFIG
 * Endpoint: GET /api/v1/config
 */
export async function getFullAppConfigApi(): Promise<Record<string, any>> {
  try {
    const res = await apiRequest<BackendAppConfigResponse>(
      "/api/v1/config",
      { method: "GET", cacheTtlMs: 60000 },
    );
    return res?.data || {};
  } catch (err) {
    console.warn("Failed to fetch full app config from API:", err);
    return {};
  }
}

/**
 * 2. GET SECTION APP CONFIG
 * Endpoint: GET /api/v1/config/:section
 */
export async function getSectionConfigApi<T = any>(section: string): Promise<T | null> {
  if (!section) return null;
  try {
    const res = await apiRequest<BackendAppConfigResponse>(
      `/api/v1/config/${encodeURIComponent(section)}`,
      { method: "GET", cacheTtlMs: 60000 },
    );
    return (res?.data as T) || null;
  } catch (err) {
    console.warn(`Failed to fetch section config (${section}) from API:`, err);
    return null;
  }
}

/**
 * 3. UPDATE FULL APP CONFIG
 * Endpoint: PATCH /api/v1/admin-panel/config
 */
export async function updateAppConfigApi(payload: Record<string, any>): Promise<Record<string, any>> {
  const res = await apiRequest<BackendAppConfigResponse>(
    "/api/v1/admin-panel/config",
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  clearApiCache("/api/v1/config");
  clearApiCache("/api/v1/admin-panel/config");

  return res?.data || payload;
}

/**
 * 4. UPDATE SECTION APP CONFIG
 * Endpoint: PATCH /api/v1/admin-panel/config/:section
 */
export async function updateSectionConfigApi<T = any>(section: string, payload: Partial<T>): Promise<T> {
  if (!section) throw new Error("Section key is required.");

  const res = await apiRequest<BackendAppConfigResponse>(
    `/api/v1/admin-panel/config/${encodeURIComponent(section)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  clearApiCache("/api/v1/config");
  clearApiCache("/api/v1/admin-panel/config");

  return (res?.data as T) || (payload as T);
}
