/**
 * DIMISI Technologies — Client-Side Image Optimization Utility
 * Validates, resizes, and compresses profile photos before upload to prevent 413 Payload Too Large.
 */

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const MAX_ORIGINAL_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB
export const TARGET_MAX_DIMENSION = 1200; // 1200px max width/height
export const DEFAULT_JPEG_QUALITY = 0.82; // 82% quality balance

export interface ImageOptimizationResult {
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
}

/**
 * Validates image type and maximum size before processing.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "Please select an image file." };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType)) {
    return {
      valid: false,
      error: "Unsupported image format. Please upload a JPG, PNG, or WebP photo.",
    };
  }

  if (file.size > MAX_ORIGINAL_SIZE_BYTES) {
    return {
      valid: false,
      error: "Photo size exceeds 3 MB. Please choose a smaller image.",
    };
  }

  return { valid: true };
}

/**
 * Loads an image File into an HTMLImageElement for canvas processing.
 */
function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to decode the selected image file."));
    };

    img.src = url;
  });
}

/**
 * Calculates scaled dimensions maintaining aspect ratio.
 */
export function calculateTargetDimensions(
  srcWidth: number,
  srcHeight: number,
  maxDimension: number = TARGET_MAX_DIMENSION,
): { width: number; height: number } {
  if (srcWidth <= maxDimension && srcHeight <= maxDimension) {
    return { width: srcWidth, height: srcHeight };
  }

  if (srcWidth > srcHeight) {
    const width = maxDimension;
    const height = Math.round((srcHeight * maxDimension) / srcWidth);
    return { width, height };
  } else {
    const height = maxDimension;
    const width = Math.round((srcWidth * maxDimension) / srcHeight);
    return { width, height };
  }
}

/**
 * Optimizes an image File using HTML Canvas:
 * - Resizes if dimensions exceed maxWidth/maxHeight (default 1200px).
 * - Compresses to JPEG at specified quality (default 0.82).
 * - Produces both a lightweight File object and a compressed data URL.
 */
export async function optimizeImageFile(
  file: File,
  options: {
    maxDimension?: number;
    quality?: number;
  } = {},
): Promise<ImageOptimizationResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid image file.");
  }

  const maxDim = options.maxDimension || TARGET_MAX_DIMENSION;
  const quality = options.quality ?? DEFAULT_JPEG_QUALITY;

  // In non-browser (SSR/test) environments:
  if (typeof document === "undefined" || typeof window === "undefined") {
    return {
      file,
      dataUrl: "",
      width: 100,
      height: 100,
      originalSize: file.size,
      optimizedSize: file.size,
    };
  }

  const img = await loadImageElement(file);
  const { width, height } = calculateTargetDimensions(img.naturalWidth || img.width, img.naturalHeight || img.height, maxDim);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context is not available for image optimization.");
  }

  // Draw smooth scaled image
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  // Export compressed JPEG
  const dataUrl = canvas.toDataURL("image/jpeg", quality);

  // Convert to Blob and File
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to export compressed image blob."));
      },
      "image/jpeg",
      quality,
    );
  });

  const cleanName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  const optimizedFile = new File([blob], cleanName, { type: "image/jpeg" });

  return {
    file: optimizedFile,
    dataUrl,
    width,
    height,
    originalSize: file.size,
    optimizedSize: optimizedFile.size,
  };
}
