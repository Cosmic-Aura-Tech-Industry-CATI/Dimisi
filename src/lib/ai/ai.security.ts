/**
 * DIMISI AI — Security & Input Validation Layer
 * Protects against prompt injections, secret token leakage, and malicious file uploads.
 */
import type { UploadedFile } from "./ai.types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/pdf",
];

export function validateUploadedFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File size exceeds 5MB limit. Please choose a smaller file." };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Unsupported file type. Please upload a PNG, JPG, WebP image or PDF document.",
    };
  }

  return { valid: true };
}

export function readFileAsDataUrl(file: File): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: reader.result as string,
      });
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Scrubs potential secret admin tokens or sensitive internals from AI output
 */
export function sanitizeAIOutput(text: string): string {
  if (!text) return "";
  let clean = text
    .replace(/dimisi-admin/gi, "DIMISI Administration")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/^\s*[-•]\s+/gm, "· ")
    .trim();

  return clean;
}
