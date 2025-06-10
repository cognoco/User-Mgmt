/**
 * Interface describing a fluent query builder.
 *
 * Allows consumers to build database agnostic queries with filtering,
 * sorting, pagination and relationship handling.
 *
 * Implementations should return a new builder instance on each method
 * to maintain immutability.
 */
import type {
  FilterCondition,
  SortOption,
  PaginationParams,
  QueryResult
} from '@/core/database/interfaces/index';

export interface QueryBuilder<T> {
  /** Apply a filter condition */
  filter(condition: FilterCondition): QueryBuilder<T>;

  /** Sort results by the given field */
  sort(option: SortOption): QueryBuilder<T>;

  /** Limit results using pagination */
  paginate(params: PaginationParams): QueryBuilder<T>;

  /** Load related entities */
  with(relations: string[]): QueryBuilder<T>;

  /** Execute the built query */
  execute(): Promise<QueryResult<T>>;
}
