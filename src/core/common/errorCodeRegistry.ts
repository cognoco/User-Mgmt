export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorCodeInfo {
  code: string;
  description: string;
  severity: ErrorSeverity;
}

/**
 * Simple registry to keep track of all error codes used by the core layer.
 * Ensures each code is registered only once.
 */
export class ErrorCodeRegistry {
  private static codes = new Map<string, ErrorCodeInfo>();

  /**
   * Register a new error code with description and severity.
   * Throws if the code is already registered.
   */
  static register(code: string, description: string, severity: ErrorSeverity) {
    if (this.codes.has(code)) {
      throw new Error(`Error code '${code}' is already registered`);
    }
    this.codes.set(code, { code, description, severity });
  }

  /** Get information for a specific code. */
  static get(code: string): ErrorCodeInfo | undefined {
    return this.codes.get(code);
  }

  /** Check if a code is registered. */
  static has(code: string): boolean {
    return this.codes.has(code);
  }

  /** List all registered codes. */
  static list(): ErrorCodeInfo[] {
    return Array.from(this.codes.values());
  }

  /**
   * Clear all registered codes. Intended for testing.
   */
  /* istanbul ignore next */
  static clear() {
    this.codes.clear();
  }
}
