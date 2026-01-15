import Tesseract from 'tesseract.js';
import * as fs from 'fs';
import * as path from 'path';

export interface ParsedTask {
  title: string;
  duration?: number;
}

// Compiled regex patterns for better performance (compiled once, reused many times)
const CHECKBOX_CHECKED_REGEX = /^[\[\(]?\s*[x✓✗☑]\s*[\]\)]?\s*/i;
const CHECKBOX_EMPTY_REGEX = /^[\[\(]?\s*[\]\)]?\s*/;
const CHECKBOX_UNICODE_REGEX = /^[☐☑]\s*/;
const BULLET_REGEX = /^[-•*‣▪▸→]\s+/;
const NUMBERED_LIST_REGEX = /^\d+[\.)]\s+/;
const DURATION_REGEX = /\b(\d+)\s*(min|m|hour|h|hr)\b/i;

/**
 * Process image with OCR and extract text
 * Uses worker pattern for better memory management
 */
export async function processImageOCR(imagePath: string): Promise<string> {
  let worker: Tesseract.Worker | null = null;

  try {
    // Validate image exists
    if (!fs.existsSync(imagePath)) {
      throw new Error('Image file not found');
    }

    // Validate file extension
    const ext = path.extname(imagePath).toLowerCase();
    const validExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.tiff', '.gif'];
    if (!validExtensions.includes(ext)) {
      throw new Error('Invalid image format. Supported: PNG, JPG, JPEG, BMP, TIFF, GIF');
    }

    // Create worker for better performance and memory management
    worker = await Tesseract.createWorker('eng', 1);

    // Run OCR
    const result = await worker.recognize(imagePath);

    return result.data.text;
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error(
      `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    // Always terminate worker to free memory
    if (worker) {
      await worker.terminate();
    }
  }
}

/**
 * Parse OCR text into individual tasks
 * Handles various formats:
 * - Plain text (each line is a task)
 * - Bullet points (-, •, *, ‣)
 * - Numbered lists (1., 2., 1), 2))
 * - Checkboxes ([ ], [x], ☐, ☑)
 * Optimized with precompiled regex patterns
 */
export function parseTasksFromText(text: string): ParsedTask[] {
  const lines = text.split('\n');
  const tasks: ParsedTask[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty or very short lines (likely noise)
    if (line.length < 2) {
      continue;
    }

    // Skip lines that look like headers (ALL CAPS, short)
    if (line === line.toUpperCase() && line.length < 30) {
      continue;
    }

    // Remove common prefixes using precompiled patterns
    let taskText = line
      .replace(CHECKBOX_CHECKED_REGEX, '')
      .replace(CHECKBOX_EMPTY_REGEX, '')
      .replace(CHECKBOX_UNICODE_REGEX, '')
      .replace(BULLET_REGEX, '')
      .replace(NUMBERED_LIST_REGEX, '');

    // Extract duration if present (e.g., "30min", "1h", "45m")
    let duration: number | undefined;
    const durationMatch = taskText.match(DURATION_REGEX);
    if (durationMatch) {
      const value = parseInt(durationMatch[1], 10);
      const unit = durationMatch[2].toLowerCase();

      duration = unit === 'h' || unit === 'hour' || unit === 'hr' ? value * 60 : value;

      // Remove duration from task text
      taskText = taskText.replace(durationMatch[0], '').trim();
    } else {
      taskText = taskText.trim();
    }

    // Skip if task is too short after cleaning
    if (taskText.length < 2) {
      continue;
    }

    // Limit task title length (validation will happen on save)
    if (taskText.length > 500) {
      taskText = taskText.substring(0, 500);
    }

    tasks.push({
      title: taskText,
      duration,
    });
  }

  return tasks;
}

/**
 * Process clipboard image data (base64) with OCR
 */
export async function processClipboardImage(imageData: Buffer): Promise<string> {
  try {
    // Create temporary file
    const tempPath = path.join(require('os').tmpdir(), `clipboard-${Date.now()}.png`);
    fs.writeFileSync(tempPath, imageData);

    // Process OCR
    const text = await processImageOCR(tempPath);

    // Clean up temp file
    try {
      fs.unlinkSync(tempPath);
    } catch (error) {
      console.warn('Failed to delete temp file:', error);
    }

    return text;
  } catch (error) {
    console.error('Clipboard image processing error:', error);
    throw error;
  }
}
