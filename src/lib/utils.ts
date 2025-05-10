import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidUrl(url: string): boolean {
  if (!url) {
    return false; // Or true if empty/null strings are considered valid in your context
  }
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
} 