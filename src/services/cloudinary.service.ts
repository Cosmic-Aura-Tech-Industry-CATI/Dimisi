/**
 * Cloudinary Upload Service for DIMISI Technologies.
 *
 * Securely wraps the backend-signed Upload v2 Service.
 * Eliminates all client-side hardcoded API secrets and dead cryptographic code.
 */

import {
  uploadFileViaSignature,
  UploadTarget,
  UploadResult,
  UploadOptions,
  cancelAllActiveUploads,
  revokeBlobUrl,
} from "./upload.service";

export type {
  UploadTarget,
  UploadResult,
  UploadOptions,
};

export {
  cancelAllActiveUploads,
  revokeBlobUrl,
};

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
}

/**
 * Backward-compatible upload helper for legacy callers.
 * Securely delegates to backend-signed Upload v2.
 *
 * @param file The image file selected from the computer.
 * @param signal Optional AbortSignal to cleanly cancel in-flight uploads on modal unmount.
 * @param target Optional custom UploadTarget (defaults to casestudy.coverImage).
 * @returns Permanent HTTPS Cloudinary URL.
 */
export async function uploadImageDirectToCloudinary(
  file: File | Blob,
  signal?: AbortSignal,
  target: UploadTarget = { model: "casestudy", field: "coverImage" },
): Promise<string> {
  const result = await uploadFileViaSignature(file, target, { signal });
  return result.url;
}
