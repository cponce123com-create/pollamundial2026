/**
 * Shared upload utilities: multer middleware factory + Cloudinary upload helper.
 * Reduces boilerplate across routes/pool.ts, routes/payments.ts, and routes/profile.ts.
 */
import multer from "multer";
import sharp from "sharp";
import cloudinary from "./cloudinary";
import logger from "./logger";

/** Maximum file size for uploads (5MB) */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Creates a pre-configured multer instance with memory storage.
 * @param allowedMimeTypes - Optional array of allowed MIME type prefixes (default: ["image/"])
 */
export function createUpload(allowedMimeTypes: string[] = ["image/"]) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
      const ok = allowedMimeTypes.some((prefix) => file.mimetype.startsWith(prefix));
      if (ok) return cb(null, true);
      cb(new Error(`Formato no permitido: ${file.mimetype}. Usa imágenes (JPG, PNG, GIF, WEBP).`));
    },
  });
}

/** Default image upload instance */
export const imageUpload = createUpload();

/** Video upload instance (for hero background videos) */
export const videoUpload = createUpload(["video/"]);

/**
 * Compress an image buffer using sharp before uploading.
 * Converts to JPEG with quality 80% and max 1200px width for photos,
 * or keeps PNG for screenshots/graphics. Falls back gracefully if sharp fails.
 */
export async function compressImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
  try {
    const img = sharp(buffer);
    const metadata = await img.metadata();
    // Only compress if larger than 200KB
    if ((metadata.size ?? 0) < 200 * 1024) return buffer;

    if (mimeType === "image/png" || mimeType === "image/gif") {
      // PNG/GIF: try to reduce palette/optimize
      return await img.png({ palette: true, compressionLevel: 9 }).toBuffer();
    }
    // JPEG/WEBP other: resize to max 1200px width, quality 80%
    return await img
      .resize(Math.min(metadata.width ?? 1200, 1200), undefined, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
  } catch {
    // If sharp fails (e.g. unsupported format), return original buffer
    return buffer;
  }
}

/**
 * Uploads a buffer to Cloudinary, with optional compression.
 * @returns The secure URL of the uploaded file.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    allowedFormats?: string[];
    transformation?: Record<string, unknown>[];
    compress?: boolean;
  }
): Promise<{ secure_url: string }> {
  const finalBuffer = options.compress !== false ? await compressImage(buffer, "image/jpeg") : buffer;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        allowed_formats: options.allowedFormats || ["jpg", "jpeg", "png", "gif", "webp"],
        max_file_size: MAX_FILE_SIZE,
        transformation: options.transformation,
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result as { secure_url: string });
      }
    );
    stream.end(finalBuffer);
  });
}

/**
 * Express middleware that handles multer errors and passes them as JSON.
 * Use as the final middleware in a multer chain.
 */
export function handleMulterError(err: unknown, defaultMessage: string): { status: number; error: string } | null {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return { status: 400, error: "El archivo no debe superar los 5MB." };
    }
    return { status: 400, error: `Error al subir: ${err.message}` };
  }
  if (err instanceof Error) {
    return { status: 400, error: err.message };
  }
  return null;
}

/**
 * Checks if a Cloudinary error is due to misconfiguration (invalid API keys).
 */
export function isCloudinaryConfigError(err: unknown): boolean {
  if (err && typeof err === "object") {
    const obj = err as Record<string, unknown>;
    return obj?.http_code === 401 || (typeof obj?.message === "string" && (obj.message as string).includes("Invalid"));
  }
  return false;
}

/**
 * Log and handle a Cloudinary upload error. Returns a structured error response object.
 */
export function cloudinaryErrorResponse(err: unknown, loggerLabel: string): { status: number; error: string } {
  logger.error(err, `${loggerLabel} error:`);
  if (isCloudinaryConfigError(err)) {
    return { status: 500, error: "Error de configuración de Cloudinary. Contacta al administrador." };
  }
  return { status: 500, error: "Error al subir archivo. Verifica que sea una imagen válida." };
}
