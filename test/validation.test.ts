import { describe, it, expect } from 'vitest';
import { Validators, ValidationError } from '../src/validation';

describe('Input Validation', () => {
  describe('taskTitle', () => {
    it('should accept valid titles', () => {
      expect(Validators.taskTitle('Buy groceries')).toBe('Buy groceries');
      expect(Validators.taskTitle('Call mom')).toBe('Call mom');
      expect(Validators.taskTitle('Finish project report')).toBe('Finish project report');
    });

    it('should trim whitespace', () => {
      expect(Validators.taskTitle('  Task with spaces  ')).toBe('Task with spaces');
    });

    it('should reject empty titles', () => {
      expect(() => Validators.taskTitle('')).toThrow(ValidationError);
      expect(() => Validators.taskTitle('   ')).toThrow(ValidationError);
    });

    it('should strip HTML tags for XSS prevention', () => {
      expect(Validators.taskTitle('<script>alert("xss")</script>Task')).toBe('Task');
      expect(Validators.taskTitle('<b>Bold task</b>')).toBe('Bold task');
      expect(Validators.taskTitle('Task <img src=x onerror=alert(1)>')).toBe('Task ');
    });

    it('should reject titles over 500 characters', () => {
      const longTitle = 'a'.repeat(501);
      expect(() => Validators.taskTitle(longTitle)).toThrow(ValidationError);
      expect(() => Validators.taskTitle(longTitle)).toThrow('too long');
    });

    it('should reject non-string inputs', () => {
      expect(() => Validators.taskTitle(null as any)).toThrow(ValidationError);
      expect(() => Validators.taskTitle(undefined as any)).toThrow(ValidationError);
      expect(() => Validators.taskTitle(123 as any)).toThrow(ValidationError);
      expect(() => Validators.taskTitle({} as any)).toThrow(ValidationError);
    });
  });

  describe('duration', () => {
    it('should accept valid durations', () => {
      expect(Validators.duration(1)).toBe(1);
      expect(Validators.duration(30)).toBe(30);
      expect(Validators.duration(60)).toBe(60);
      expect(Validators.duration(1440)).toBe(1440);
    });

    it('should return undefined for null/undefined', () => {
      expect(Validators.duration(undefined)).toBeUndefined();
      expect(Validators.duration(null)).toBeUndefined();
    });

    it('should reject durations outside valid range', () => {
      expect(() => Validators.duration(0)).toThrow(ValidationError);
      expect(() => Validators.duration(-1)).toThrow(ValidationError);
      expect(() => Validators.duration(1441)).toThrow(ValidationError);
      expect(() => Validators.duration(9999)).toThrow(ValidationError);
    });

    it('should reject non-integer durations', () => {
      expect(() => Validators.duration(30.5)).toThrow(ValidationError);
      expect(() => Validators.duration(15.999)).toThrow(ValidationError);
    });

    it('should reject non-number inputs', () => {
      expect(() => Validators.duration('30' as any)).toThrow(ValidationError);
      expect(() => Validators.duration({} as any)).toThrow(ValidationError);
      expect(() => Validators.duration(NaN)).toThrow(ValidationError);
      expect(() => Validators.duration(Infinity)).toThrow(ValidationError);
    });
  });

  describe('taskId', () => {
    it('should accept valid alphanumeric IDs', () => {
      expect(Validators.taskId('abc123')).toBe('abc123');
      expect(Validators.taskId('task-123')).toBe('task-123');
      expect(Validators.taskId('TASK_456')).toBe('TASK_456');
      expect(Validators.taskId('1234567890')).toBe('1234567890');
    });

    it('should trim whitespace', () => {
      expect(Validators.taskId('  task123  ')).toBe('task123');
    });

    it('should reject empty IDs', () => {
      expect(() => Validators.taskId('')).toThrow(ValidationError);
      expect(() => Validators.taskId('   ')).toThrow(ValidationError);
    });

    it('should reject invalid characters (injection prevention)', () => {
      expect(() => Validators.taskId('<script>')).toThrow(ValidationError);
      expect(() => Validators.taskId('task;DROP TABLE')).toThrow(ValidationError);
      expect(() => Validators.taskId('task@123')).toThrow(ValidationError);
      expect(() => Validators.taskId('task#123')).toThrow(ValidationError);
      expect(() => Validators.taskId('task$123')).toThrow(ValidationError);
    });

    it('should reject non-string inputs', () => {
      expect(() => Validators.taskId(123 as any)).toThrow(ValidationError);
      expect(() => Validators.taskId(null as any)).toThrow(ValidationError);
      expect(() => Validators.taskId(undefined as any)).toThrow(ValidationError);
    });
  });

  describe('timeRemaining', () => {
    it('should accept valid time values', () => {
      expect(Validators.timeRemaining(0)).toBe(0);
      expect(Validators.timeRemaining(60)).toBe(60);
      expect(Validators.timeRemaining(3600)).toBe(3600);
    });

    it('should return undefined for null/undefined', () => {
      expect(Validators.timeRemaining(undefined)).toBeUndefined();
      expect(Validators.timeRemaining(null)).toBeUndefined();
    });

    it('should floor fractional seconds', () => {
      expect(Validators.timeRemaining(30.7)).toBe(30);
      expect(Validators.timeRemaining(59.999)).toBe(59);
    });

    it('should reject negative values', () => {
      expect(() => Validators.timeRemaining(-1)).toThrow(ValidationError);
      expect(() => Validators.timeRemaining(-100)).toThrow(ValidationError);
    });

    it('should reject values exceeding max', () => {
      const maxSeconds = 86400; // 24 hours in seconds
      expect(() => Validators.timeRemaining(maxSeconds + 1)).toThrow(ValidationError);
    });

    it('should reject non-number inputs', () => {
      expect(() => Validators.timeRemaining('60' as any)).toThrow(ValidationError);
      expect(() => Validators.timeRemaining(NaN)).toThrow(ValidationError);
      expect(() => Validators.timeRemaining(Infinity)).toThrow(ValidationError);
    });
  });

  describe('sanitizeHtml', () => {
    it('should escape HTML entities', () => {
      const sanitized = Validators.sanitizeHtml('<script>alert("xss")</script>');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;');
      expect(sanitized).toContain('&gt;');
    });

    it('should handle special characters', () => {
      const sanitized = Validators.sanitizeHtml('Tom & Jerry');
      expect(sanitized).toContain('&amp;');
    });

    it('should return empty string for non-strings', () => {
      expect(Validators.sanitizeHtml(null as any)).toBe('');
      expect(Validators.sanitizeHtml(undefined as any)).toBe('');
      expect(Validators.sanitizeHtml(123 as any)).toBe('');
    });
  });

  describe('Edge cases and security', () => {
    it('should prevent extremely long inputs (DoS)', () => {
      const veryLongString = 'a'.repeat(10000);
      expect(() => Validators.taskTitle(veryLongString)).toThrow(ValidationError);
    });

    it('should prevent SQL injection patterns in IDs', () => {
      expect(() => Validators.taskId("1' OR '1'='1")).toThrow(ValidationError);
      expect(() => Validators.taskId('1; DROP TABLE tasks;--')).toThrow(ValidationError);
    });

    it('should prevent XSS in task titles', () => {
      const xssAttempts = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        'javascript:alert(1)',
      ];

      xssAttempts.forEach((xss) => {
        const sanitized = Validators.taskTitle(xss);
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('script');
        expect(sanitized).not.toContain('onerror');
      });
    });

    it('should handle Unicode and emoji correctly', () => {
      expect(Validators.taskTitle('Buy 🍕 for dinner')).toBe('Buy 🍕 for dinner');
      expect(Validators.taskTitle('学习中文')).toBe('学习中文');
      expect(Validators.taskTitle('Café ☕')).toBe('Café ☕');
    });
  });
});
