/**
 * Core database interface exports and common types.
 */

import type { DataProviderError } from '../../common/errors';
export { isDataProviderError as isDatabaseError } from '../../common/errors';

/** Connection configuration options */
export interface ConnectionOptions {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
}

/** Isolation levels for transactions */
export type IsolationLevel =
  | 'read_uncommitted'
  | 'read_committed'
  | 'repeatable_read'
  | 'serializable';

/** Options for starting a transaction */
export interface TransactionOptions {
  isolationLevel?: IsolationLevel;
}

/** Filtering condition */
export interface FilterCondition {
  field: string;
  operator:
    | '='
    | '!='
    | '<'
    | '>'
    | '<='
    | '>='
    | 'like'
    | 'ilike'
    | 'in';
  value: unknown;
}

/** Sort order option */
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

/** Pagination parameters */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/** Options for query operations */
export interface QueryOptions {
  filters?: FilterCondition[];
  sort?: SortOption[];
  pagination?: PaginationParams;
  relations?: string[];
}

/** Generic query result */
export interface QueryResult<T> {
  items: T[];
  count: number;
}

export type DatabaseError = DataProviderError;

/** Type guard for {@link QueryResult} */
export function isQueryResult<T>(value: unknown): value is QueryResult<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as any).items) &&
    typeof (value as any).count === 'number'
  );
}

/** Type guard for {@link FilterCondition} */
export function isFilterCondition(value: unknown): value is FilterCondition {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as any).field === 'string' &&
    typeof (value as any).operator === 'string' &&
    'value' in (value as any)
  );
}

export * from './base.interface';
export * from './query.interface';
export * from './transaction.interface';
export * from './user.interface';
export * from './team.interface';
export * from './organization.interface';
export * from './permission.interface';
