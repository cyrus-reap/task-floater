import { SECURITY_LIMITS } from './constants';

/**
 * Custom error class for validation failures
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Input validation utilities
 * All user inputs must pass through these validators to prevent injection attacks,
 * XSS, path traversal, and resource exhaustion.
 */
export const Validators = {
  /**
   * Validate task title
   * - Prevents XSS by stripping HTML tags
   * - Prevents DoS by limiting length
   * - Ensures non-empty titles
   */
  taskTitle(title: unknown): string {
    if (typeof title !== 'string') {
      throw new ValidationError('Task title must be a string');
    }

    const trimmed = title.trim();

    if (trimmed.length === 0) {
      throw new ValidationError('Task title cannot be empty');
    }

    if (trimmed.length > SECURITY_LIMITS.MAX_TITLE_LENGTH) {
      throw new ValidationError(
        `Task title too long (max ${SECURITY_LIMITS.MAX_TITLE_LENGTH} characters)`
      );
    }

    // Remove any potential HTML/script tags to prevent XSS
    return trimmed.replace(/<[^>]*>/g, '');
  },

  /**
   * Validate duration in minutes
   * - Prevents resource exhaustion from extreme values
   * - Ensures valid range (1-24 hours)
   */
  duration(duration: unknown): number | undefined {
    if (duration === undefined || duration === null) {
      return undefined;
    }

    if (typeof duration !== 'number') {
      throw new ValidationError('Duration must be a number');
    }

    if (Number.isNaN(duration) || !Number.isFinite(duration)) {
      throw new ValidationError('Duration must be a valid number');
    }

    if (duration < 1 || duration > SECURITY_LIMITS.MAX_DURATION_MINUTES) {
      throw new ValidationError(
        `Duration must be between 1 and ${SECURITY_LIMITS.MAX_DURATION_MINUTES} minutes`
      );
    }

    if (!Number.isInteger(duration)) {
      throw new ValidationError('Duration must be a whole number');
    }

    return duration;
  },

  /**
   * Validate task ID
   * - Prevents injection attacks via IDs
   * - Ensures alphanumeric format
   */
  taskId(id: unknown): string {
    if (typeof id !== 'string') {
      throw new ValidationError('Task ID must be a string');
    }

    const trimmed = id.trim();

    if (trimmed.length === 0) {
      throw new ValidationError('Task ID cannot be empty');
    }

    // IDs should be alphanumeric with dashes/underscores only (prevents injection)
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      throw new ValidationError('Invalid task ID format');
    }

    return trimmed;
  },

  /**
   * Validate time remaining in seconds
   * - Prevents resource exhaustion
   * - Ensures valid range
   */
  timeRemaining(seconds: unknown): number | undefined {
    if (seconds === undefined || seconds === null) {
      return undefined;
    }

    if (typeof seconds !== 'number') {
      throw new ValidationError('Time remaining must be a number');
    }

    if (Number.isNaN(seconds) || !Number.isFinite(seconds)) {
      throw new ValidationError('Time remaining must be a valid number');
    }

    if (seconds < 0 || seconds > SECURITY_LIMITS.MAX_TIME_SECONDS) {
      throw new ValidationError(
        `Time remaining must be between 0 and ${SECURITY_LIMITS.MAX_TIME_SECONDS} seconds`
      );
    }

    return Math.floor(seconds);
  },

  /**
   * Sanitize HTML to prevent XSS
   * Uses browser's built-in text content escaping
   */
  sanitizeHtml(html: string): string {
    if (typeof html !== 'string') {
      return '';
    }
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  },
};
