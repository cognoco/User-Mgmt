import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Checks if a string is a valid URL (http, https, etc.)
 */
export function isValidUrl(value: string): boolean {
  if (!value) return false;
  try {
    // Only allow http(s) URLs for security
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
} 