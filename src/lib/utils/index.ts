import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export * from '@/src/lib/utils/error'
export * from '@/src/lib/utils/typedEventEmitter'
export * from '@/src/lib/utils/errorFactory'
export * from '@/src/lib/utils/errorTranslator'
export * from '@/src/lib/utils/circuitBreaker'
export * from '@/src/lib/utils/retry'
