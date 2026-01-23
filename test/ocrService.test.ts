import { describe, it, expect } from 'vitest';
import { parseTasksFromText } from '../src/ocrService';

describe('OCR Service - Task Parsing', () => {
  describe('Plain text parsing', () => {
    it('should parse simple task list', () => {
      const text = `
Buy groceries
Call mom
Finish report
      `.trim();

      const tasks = parseTasksFromText(text);
      expect(tasks).toHaveLength(3);
      expect(tasks[0].title).toBe('Buy groceries');
      expect(tasks[1].title).toBe('Call mom');
      expect(tasks[2].title).toBe('Finish report');
    });

    it('should skip empty lines', () => {
      const text = `
Task 1

Task 2


Task 3
      `.trim();

      const tasks = parseTasksFromText(text);
      expect(tasks).toHaveLength(3);
    });

    it('should skip very short lines (likely noise)', () => {
      const text = `
Buy groceries
a
Call mom
x
      `.trim();

      const tasks = parseTasksFromText(text);
      expect(tasks).toHaveLength(2);
      expect(tasks.map((t) => t.title)).not.toContain('a');
      expect(tasks.map((t) => t.title)).not.toContain('x');
    });
  });

  describe('Bullet point parsing', () => {
    it('should parse tasks with dash bullets', () => {
      const text = `
- Buy groceries
- Call mom
- Finish report
      `.trim();

      const tasks = parseTasksFromText(text);
      expect(tasks).toHaveLength(3);
      expect(tasks[0].title).toBe('Buy groceries');
    });

    it('should parse tasks with various bullet symbols', () => {
      const text = `
• Task with bullet
* Task with asterisk
‣ Task with arrow
▪ Task with square
      `.trim();

      const tasks = parseTasksFromText(text);
      expect(tasks).toHaveLength(4);
      tasks.forEach((task) => {
        expect(task.title).not.toMatch(/^[•*‣▪]/);
      });
    });
  });

  describe('Numbered list parsing', () => {
    it('should parse numbered lists with periods', () => {
      const text = `
1. First task
2. Second task
3. Third task
      `.trim();

      const tasks = parseTasksFromText(text);
      expect(tasks).toHaveLength(3);
      expect(tasks[0].title).toBe('First task');
      expect(tasks[1].title).toBe('Second task');
    });

    it('should parse numbered lists with parentheses', () => {
      const text = `
1) First task
2) Second task
3) Third task
      `.trim();

      const tasks = parseTasksFromText(text);
      expect(tasks).toHaveLength(3);
    });
  });

  describe('Checkbox parsing', () => {
    it('should parse unchecked checkboxes', () => {
      const text = `
[ ] Unchecked task 1
[] Unchecked task 2
☐ Unchecked task 3
      `.trim();

      const tasks = parseTasksFromText(text);
      expect(tasks).toHaveLength(3);
      tasks.forEach((task) => {
        expect(task.title).not.toMatch(/[\[\]☐]/);
      });
    });

    it('should parse checked checkboxes', () => {
      const text = `
[x] Checked task 1
[X] Checked task 2
☑ Checked task 3
      `.trim();

      const tasks = parseTasksFromText(text);
      expect(tasks).toHaveLength(3);
    });
  });

  describe('Duration extraction', () => {
    it('should extract duration in minutes', () => {
      const text = `
Buy groceries 30min
Call mom 15 min
      `.trim();

      const tasks = parseTasksFromText(text);
      expect(tasks[0].title).toBe('Buy groceries');
      expect(tasks[0].duration).toBe(30);
      expect(tasks[1].title).toBe('Call mom');
      expect(tasks[1].duration).toBe(15);
    });

    it('should extract duration in hours', () => {
      const text = `
Write report 2h
Meeting 1.5 hour
Study session 1 hr
      `.trim();

      const tasks = parseTasksFromText(text);
      expect(tasks[0].duration).toBe(120);
      expect(tasks[1].duration).toBe(90);
      expect(tasks[2].duration).toBe(60);
    });

    it('should handle tasks without duration', () => {
      const text = `
Task without duration
Task with 30min duration
      `.trim();

      const tasks = parseTasksFromText(text);
      expect(tasks[0].duration).toBeUndefined();
      expect(tasks[1].duration).toBe(30);
    });
  });

  describe('Mixed format parsing', () => {
    it('should parse mixed format list', () => {
      const text = `
TODO LIST

1. Buy groceries 30min
- Call mom
[ ] Finish report 2h
• Exercise
Plain task

Done:
[x] Completed task
      `.trim();

      const tasks = parseTasksFromText(text);

      // Should skip "TODO LIST" (all caps header) and "Done:" (short/header)
      expect(tasks.length).toBeGreaterThan(4);

      const titles = tasks.map((t) => t.title);
      expect(titles).toContain('Buy groceries');
      expect(titles).toContain('Call mom');
      expect(titles).toContain('Finish report');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty text', () => {
      const tasks = parseTasksFromText('');
      expect(tasks).toHaveLength(0);
    });

    it('should handle text with only whitespace', () => {
      const tasks = parseTasksFromText('   \n\n   \n   ');
      expect(tasks).toHaveLength(0);
    });

    it('should skip all-caps headers', () => {
      const text = `
MY TODO LIST
Buy groceries
NEXT WEEK
Call mom
      `.trim();

      const tasks = parseTasksFromText(text);
      const titles = tasks.map((t) => t.title);
      expect(titles).not.toContain('MY TODO LIST');
      expect(titles).not.toContain('NEXT WEEK');
      expect(titles).toContain('Buy groceries');
      expect(titles).toContain('Call mom');
    });

    it('should handle very long task titles', () => {
      const longTask = 'A'.repeat(200);
      const text = `${longTask}\nNormal task`;

      const tasks = parseTasksFromText(text);
      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toHaveLength(200);
    });

    it('should preserve special characters in titles', () => {
      const text = `
Buy milk & eggs ($10)
Send email (urgent!)
Fix bug #123
      `.trim();

      const tasks = parseTasksFromText(text);
      expect(tasks[0].title).toBe('Buy milk & eggs ($10)');
      expect(tasks[1].title).toBe('Send email (urgent!)');
      expect(tasks[2].title).toBe('Fix bug #123');
    });
  });

  describe('Real-world OCR scenarios', () => {
    it('should handle slightly messy OCR output', () => {
      // Simulating OCR misreads
      const text = `
1. Buy gr0ceries  (OCR misread o as 0)
2. Call m0m
3. Finish rep0rt
      `.trim();

      const tasks = parseTasksFromText(text);
      expect(tasks).toHaveLength(3);
      // OCR corrections would be a future enhancement
    });

    it('should handle tasks with timestamps', () => {
      const text = `
9:00 AM - Team meeting 1h
10:30 AM - Code review 30min
2:00 PM - Client call
      `.trim();

      const tasks = parseTasksFromText(text);
      expect(tasks.length).toBeGreaterThanOrEqual(3);
    });
  });
});
