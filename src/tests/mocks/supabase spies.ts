import { vi } from 'vitest';
export const insertSpy = vi.fn().mockResolvedValue({ data: {}, error: null });
export const fromSpy = vi.fn(() => ({ insert: insertSpy })); 