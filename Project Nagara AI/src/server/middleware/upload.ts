/**
 * Server Middleware: File Upload Handling
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Handling multipart/form-data uploads
 * - File type validation (GeoJSON, CSV, JSON)
 * - File size limits & defensive sanitization
 * - Storage management for spatial municipal datasets
 */

import { AppError } from '../errors/AppError';

export interface UploadedFileMetadata {
  fieldName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer;
  encoding: string;
}

export class FileUploadHandler {
  private static readonly MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_MIME_TYPES = [
    'application/json',
    'application/geo+json',
    'text/csv',
    'application/vnd.ms-excel',
  ];

  /**
   * Processes and validates an uploaded file.
   */
  public static processUploadedDataset(file: UploadedFileMetadata): {
    success: boolean;
    recordCount: number;
    filename: string;
  } {
    // 1. File existence check
    if (!file || !file.buffer) {
      throw new AppError('No file provided for upload', 400);
    }

    // 2. Size limitation check
    if (file.sizeBytes > this.MAX_FILE_SIZE_BYTES) {
      throw new AppError(
        `File size exceeds limit of ${this.MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
        400
      );
    }

    // 3. MIME type inspection
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimeType)) {
      throw new AppError(
        `Invalid file format: '${file.mimeType}'. Allowed formats: GeoJSON, JSON, CSV`,
        400
      );
    }

    // 4. Content parsing & record estimation
    let recordCount = 0;
    try {
      if (file.mimeType.includes('json')) {
        const parsed = JSON.parse(file.buffer.toString('utf-8'));
        if (parsed.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
          recordCount = parsed.features.length;
        } else if (Array.isArray(parsed)) {
          recordCount = parsed.length;
        } else {
          recordCount = 1;
        }
      } else if (file.mimeType.includes('csv')) {
        const lines = file.buffer.toString('utf-8').trim().split('\n');
        recordCount = Math.max(0, lines.length - 1); // Exclude CSV header line
      }
    } catch {
      throw new AppError('File content is corrupt or cannot be parsed as valid JSON/CSV', 400);
    }

    return {
      success: true,
      recordCount,
      filename: file.originalName,
    };
  }
}
