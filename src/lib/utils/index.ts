import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export * from '@/lib/utils/error'
export * from '@/lib/utils/typedEventEmitter'
export * from '@/lib/utils/errorFactory'
export * from '@/lib/utils/errorTranslator'
export * from '@/lib/utils/circuitBreaker'
export * from '@/lib/utils/retry'
