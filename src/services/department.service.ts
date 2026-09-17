/**
 * DIMISI Admin — Department Express API Service
 * Handles Department listing and retrieval against the Express backend API (/api/v1/departments/*).
 */
import { apiRequest, ApiError } from "./apiClient";

export interface BackendDepartmentDoc {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendDepartmentListResponse {
  status: string;
  results: number;
  data: {
    departments: BackendDepartmentDoc[];
  };
}

export interface BackendDepartmentSingleResponse {
  status: string;
  data: {
    department: BackendDepartmentDoc;
  };
}

export interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Normalizes backend IDepartment document into a clean frontend DepartmentItem model.
 */
export function normalizeBackendDepartment(
  doc: BackendDepartmentDoc | null | undefined,
): DepartmentItem {
  if (!doc) {
    return {
      id: "dept-" + Date.now().toString(36),
      name: "General",
      code: "GEN",
      description: "",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return {
    id: String(doc._id),
    name: doc.name || "General",
    code: doc.code || "",
    description: doc.description || "",
    is_active: doc.isActive !== false,
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString(),
  };
}

export const DEFAULT_DEPARTMENTS: DepartmentItem[] = [
  {
    id: "65f1a2b3c4d5e6f7a8b9c001",
    name: "Engineering",
    code: "ENG",
    description: "Software engineering, cloud infrastructure, and platform development.",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "65f1a2b3c4d5e6f7a8b9c002",
    name: "Design & Creative",
    code: "DES",
    description: "UI/UX, visual branding, motion design, and product aesthetics.",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "65f1a2b3c4d5e6f7a8b9c003",
    name: "Content & Editorial",
    code: "CNT",
    description: "Technical writing, brand narratives, and developer publications.",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "65f1a2b3c4d5e6f7a8b9c004",
    name: "Product & AI",
    code: "PRD",
    description: "Product strategy, AI agents, and intelligence architecture.",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "65f1a2b3c4d5e6f7a8b9c005",
    name: "Operations & HR",
    code: "OPS",
    description: "People operations, recruitment, culture, and business management.",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "65f1a2b3c4d5e6f7a8b9c006",
    name: "Sales & Marketing",
    code: "MKT",
    description: "Growth, client relations, and market expansion.",
    is_active: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  },
];

/**
 * 1. GET ALL ACTIVE DEPARTMENTS
 * Endpoint: GET /api/v1/departments
 */
export async function getAllActiveDepartmentsApi(): Promise<DepartmentItem[]> {
  try {
    const res = await apiRequest<BackendDepartmentListResponse>(
      "/api/v1/departments",
      {
        method: "GET",
      },
    );

    if (Array.isArray(res?.data?.departments) && res.data.departments.length > 0) {
      return res.data.departments
        .filter((d) => d && d.isActive !== false)
        .map(normalizeBackendDepartment);
    }
  } catch (err: unknown) {
    if (import.meta.env?.DEV) {
      console.warn("Live departments API unavailable, using standard departments fallback:", err);
    }
  }

  return DEFAULT_DEPARTMENTS;
}

/**
 * 2. GET DEPARTMENT BY ID
 * Endpoint: GET /api/v1/departments/:id
 */
export async function getDepartmentByIdApi(id: string): Promise<DepartmentItem | null> {
  if (!id) return null;
  try {
    const res = await apiRequest<BackendDepartmentSingleResponse>(
      `/api/v1/departments/${encodeURIComponent(id)}`,
      {
        method: "GET",
      },
    );

    if (res?.data?.department) {
      return normalizeBackendDepartment(res.data.department);
    }
    return null;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      console.warn(`Failed to fetch department ${id} from backend API:`, err.message);
    }
    throw err;
  }
}
