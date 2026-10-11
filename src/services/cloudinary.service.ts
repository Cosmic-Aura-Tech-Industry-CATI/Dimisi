/**
 * Cloudinary Direct Client-Side Upload Service for DIMISI Technologies.
 *
 * Bypasses backend BullMQ/Redis worker bottlenecks by directly uploading
 * user-selected images to Cloudinary, returning a permanent HTTPS URL.
 * Backend receives this clean URL directly, ensuring instant MongoDB persistence!
 */

const CLOUDINARY_CLOUD_NAME = "dfejzqywl";
const CLOUDINARY_API_KEY = "299377227167859";
const CLOUDINARY_FOLDER = "dimisi-ops/services";

// Hash utility using browser Web Crypto API (SHA-1 for Cloudinary signatures)
async function sha1Hex(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
}

/**
 * Uploads a local File or Blob directly to Cloudinary from the browser.
 *
 * @param file The image file selected from the computer.
 * @param signal Optional AbortSignal to cleanly cancel in-flight uploads on modal unmount.
 * @returns Permanent HTTPS Cloudinary URL.
 */
export async function uploadImageDirectToCloudinary(
  file: File | Blob,
  signal?: AbortSignal,
): Promise<string> {
  // Cloudinary credentials for dimisi-ops
  const apiSecret = "6JCd7wFbQUNg4ti8wXNvhciDVAY";
  const timestamp = Math.round(Date.now() / 1000);

  // String to sign: params sorted alphabetically + api_secret
  const stringToSign = `folder=${CLOUDINARY_FOLDER}&timestamp=${timestamp}${apiSecret}`;
  const signature = await sha1Hex(stringToSign);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", CLOUDINARY_FOLDER);
  formData.append("signature", signature);

  const uploadEndpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  const response = await fetch(uploadEndpoint, {
    method: "POST",
    body: formData,
    ...(signal ? { signal } : {}),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Cloudinary upload failed with status ${response.status}`,
    );
  }

  const result = (await response.json()) as CloudinaryUploadResponse;
  if (!result.secure_url) {
    throw new Error("Cloudinary response did not contain a secure_url.");
  }

  return result.secure_url;
}
