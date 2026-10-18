/**
 * DIMISI Technologies — Upload v2 Core Service
 *
 * Implements secure direct client-side uploads to Cloudinary via backend-signed signatures.
 * Aligns strictly with backend Upload v2 (/api/v1/upload/sign) and uploadRules.ts.
 *
 * Key Features:
 * - Zero hardcoded API secrets on the client side.
 * - Dynamic signature acquisition via backend JWT authentication.
 * - Accurate progress tracking via XMLHttpRequest.
 * - Built-in cleaner functions to cancel in-flight uploads and revoke blob URLs.
 * - Automatic tracking of Cloudinary publicId for database entity persistence and cleanup.
 */

import { apiRequest } from "./apiClient";

export type UploadModel = "blog" | "casestudy" | "profile" | "task" | "event";

export type UploadTarget =
  | { model: "blog"; field: "coverImage" }
  | { model: "casestudy"; field: "coverImage" }
  | { model: "casestudy"; field: "galleryImages" }
  | { model: "profile"; field: "avatar" }
  | { model: "task"; field: "proof" }
  | { model: "event"; field: "coverImage" }
  | { model: "event"; field: "images" };

export interface UploadRuleConstraint {
  maxSize: number;
  allowedFormats: string[];
}

export const UPLOAD_CONSTRAINTS: Record<string, UploadRuleConstraint> = {
  "blog.coverImage": {
    maxSize: 5 * 1024 * 1024,
    allowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
  },
  "casestudy.coverImage": {
    maxSize: 5 * 1024 * 1024,
    allowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
  },
  "casestudy.galleryImages": {
    maxSize: 3 * 1024 * 1024,
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
  },
  "profile.avatar": {
    maxSize: 2 * 1024 * 1024,
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
  },
  "task.proof": {
    maxSize: 10 * 1024 * 1024,
    allowedFormats: ["jpg", "jpeg", "png", "webp", "pdf", "zip", "doc", "docx"],
  },
  "event.coverImage": {
    maxSize: 5 * 1024 * 1024,
    allowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
  },
  "event.images": {
    maxSize: 3 * 1024 * 1024,
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
  },
};

export interface SignUploadPayload {
  model: string;
  field: string;
  filename: string;
  size: number;
  mime: string;
  entityId?: string;
}

export interface BackendSignResponse {
  status: "success";
  message: string;
  data: {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
    publicId: string;
    resourceType: "image" | "video" | "raw" | "auto";
    uploadUrl: string;
    maxFileSize: number;
    allowedFormats: string[];
    transformation?: string;
    notificationUrl?: string;
    expiresAt: string;
  };
}

export interface CloudinaryDirectResponse {
  secure_url: string;
  public_id: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  error?: {
    message?: string;
  };
}

export interface UploadResult {
  url: string;
  publicId: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

export interface UploadOptions {
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
  entityId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLEANER FUNCTIONS: Manage in-flight requests & revoke blob memory
// ─────────────────────────────────────────────────────────────────────────────

const activeUploadControllers = new Set<AbortController>();

/**
 * Registers an active upload AbortController.
 * Returns an unregister cleanup function.
 */
export function registerUploadController(controller: AbortController): () => void {
  activeUploadControllers.add(controller);
  return () => {
    activeUploadControllers.delete(controller);
  };
}

/**
 * Cleaner function: Cancels all currently in-flight uploads across the application.
 * Call on route change, logout, or modal unmount to prevent leaks and orphaned uploads.
 */
export function cancelAllActiveUploads(): void {
  for (const controller of activeUploadControllers) {
    try {
      controller.abort();
    } catch {
      // Ignore abort errors
    }
  }
  activeUploadControllers.clear();
}

/**
 * Cleaner function: Safely revokes temporary object URLs created with URL.createObjectURL.
 * Prevents browser memory leaks from un-freed image blobs.
 */
export function revokeBlobUrl(url?: string | null): void {
  if (url && typeof url === "string" && url.startsWith("blob:") && typeof window !== "undefined") {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore revoke errors
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE UPLOAD IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────

function extractExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length < 2) return "";
  return parts.pop()?.toLowerCase().trim() || "";
}

/**
 * Validates file size and format against backend upload rules before calling the server.
 */
export function validateUploadFile(
  file: File | Blob,
  target: UploadTarget,
): { valid: boolean; error?: string } {
  const ruleKey = `${target.model}.${target.field}`;
  const rule = UPLOAD_CONSTRAINTS[ruleKey];
  if (!rule) {
    return { valid: true };
  }

  if (file.size > rule.maxSize) {
    const limitMb = (rule.maxSize / (1024 * 1024)).toFixed(1);
    const actualMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${actualMb} MB) exceeds maximum allowed limit of ${limitMb} MB.`,
    };
  }

  const filename = file instanceof File ? file.name : "blob.png";
  const ext = extractExtension(filename);
  if (ext && !rule.allowedFormats.includes(ext)) {
    return {
      valid: false,
      error: `Format .${ext} is not allowed. Allowed formats: ${rule.allowedFormats.join(", ")}.`,
    };
  }

  return { valid: true };
}

/**
 * Requests an upload signature from the Express backend API (/api/v1/upload/sign).
 */
export async function getUploadSignature(
  file: File | Blob,
  target: UploadTarget,
  options?: UploadOptions,
): Promise<BackendSignResponse["data"]> {
  const validation = validateUploadFile(file, target);
  if (!validation.valid) {
    throw new Error(validation.error || "File validation failed.");
  }

  const filename = file instanceof File && file.name ? file.name : `file_${Date.now()}.png`;
  const mime = file.type || "image/png";

  const payload: SignUploadPayload = {
    model: target.model,
    field: target.field,
    filename,
    size: file.size,
    mime,
    entityId: options?.entityId,
  };

  const response = await apiRequest<BackendSignResponse>("/api/v1/upload/sign", {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options?.signal,
  });

  if (!response?.data?.signature || !response.data.uploadUrl) {
    throw new Error(response?.message || "Failed to generate upload signature.");
  }

  return response.data;
}

/**
 * Uploads a local file directly to Cloudinary using backend-signed parameters.
 * Uses XMLHttpRequest for granular upload progress reporting and abortability.
 */
export async function uploadFileToCloudinary(
  file: File | Blob,
  signData: BackendSignResponse["data"],
  options?: UploadOptions,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signData.apiKey);
    formData.append("timestamp", String(signData.timestamp));
    formData.append("signature", signData.signature);
    formData.append("folder", signData.folder);
    formData.append("public_id", signData.publicId);

    if (Array.isArray(signData.allowedFormats) && signData.allowedFormats.length > 0) {
      formData.append("allowed_formats", signData.allowedFormats.join(","));
    }

    if (signData.transformation) {
      formData.append("transformation", signData.transformation);
    }

    if (signData.notificationUrl) {
      formData.append("notification_url", signData.notificationUrl);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", signData.uploadUrl);

    // Track upload progress
    if (options?.onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
          options.onProgress?.(percent);
        }
      };
    }

    // Handle abort signal
    if (options?.signal) {
      if (options.signal.aborted) {
        xhr.abort();
        reject(new DOMException("Upload was aborted by user.", "AbortError"));
        return;
      }
      options.signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new DOMException("Upload was aborted by user.", "AbortError"));
      });
    }

    xhr.onload = () => {
      let result: CloudinaryDirectResponse = {} as any;
      try {
        result = JSON.parse(xhr.responseText || "{}");
      } catch {
        // Fallback for non-JSON responses
      }

      if (xhr.status >= 200 && xhr.status < 300 && result.secure_url) {
        resolve({
          url: result.secure_url,
          publicId: result.public_id || `${signData.folder}/${signData.publicId}`,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        });
      } else {
        const errorMsg =
          result.error?.message ||
          `Cloudinary upload failed with status ${xhr.status} ${xhr.statusText}`;
        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error occurred during direct Cloudinary upload."));
    };

    xhr.send(formData);
  });
}

/**
 * Unified high-level upload function:
 * 1. Obtains signed upload configuration from Express backend.
 * 2. Uploads directly to Cloudinary CDN with progress and abort support.
 * 3. Returns permanent secure URL and publicId.
 */
export async function uploadFileViaSignature(
  file: File | Blob,
  target: UploadTarget,
  options?: UploadOptions,
): Promise<UploadResult> {
  const localController = new AbortController();
  const unregister = registerUploadController(localController);

  // Link external signal to local controller if provided
  if (options?.signal) {
    if (options.signal.aborted) {
      localController.abort();
    } else {
      options.signal.addEventListener("abort", () => localController.abort(), { once: true });
    }
  }

  const mergedOptions: UploadOptions = {
    ...options,
    signal: localController.signal,
  };

  try {
    const signData = await getUploadSignature(file, target, mergedOptions);
    const result = await uploadFileToCloudinary(file, signData, mergedOptions);
    return result;
  } finally {
    unregister();
  }
}
