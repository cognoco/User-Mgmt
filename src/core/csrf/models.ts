export interface CsrfToken {
  token: string;
  expiresAt?: Date;
}

/** Parameters for querying stored CSRF tokens */
export interface CsrfTokenQuery {
  /** Filter tokens belonging to a specific user */
  userId?: string;
  /** Filter by validity */
  valid?: boolean;
  /** Pagination: page number (1-based) */
  page?: number;
  /** Pagination: items per page */
  limit?: number;
  /** Sort field */
  sortBy?: "token" | "expiresAt";
  /** Sort direction */
  sortOrder?: "asc" | "desc";
}

/** Type guard for CsrfToken objects */
export function isCsrfToken(value: unknown): value is CsrfToken {
  return (
    typeof value === "object" &&
    value !== null &&
    "token" in value &&
    typeof (value as any).token === "string"
  );
}
