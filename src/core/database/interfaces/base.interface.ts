/**
 * Generic database interface defining basic CRUD operations,
 * connection management and transaction support.
 *
 * Implementations of this interface should remain database agnostic so that
 * the service layer can swap providers without code changes.
 *
 * Errors should be surfaced using {@link DatabaseError} objects.
 * Unexpected provider failures may reject the returned promises.
 *
 * @typeParam T - Entity type handled by the repository
 */
import type {
  ConnectionOptions,
  QueryOptions,
  QueryResult,
  TransactionInterface,
  DatabaseError
} from '@/core/database/interfaces/index';

export interface BaseDatabaseInterface<T> {
  /** Connect to the underlying database */
  connect(options?: ConnectionOptions): Promise<void>;

  /** Close the database connection */
  disconnect(): Promise<void>;

  /** Create a new entity */
  create(data: Omit<T, 'id'>): Promise<T | DatabaseError>;

  /** Find an entity by its identifier */
  findById(id: string): Promise<T | null | DatabaseError>;

  /** Update an existing entity */
  update(id: string, data: Partial<T>): Promise<T | DatabaseError>;

  /** Delete an entity */
  delete(id: string): Promise<{ success: boolean; error?: DatabaseError }>;

  /**
   * Query entities using filtering and pagination.
   *
   * Implementations may throw for unexpected database errors.
   */
  query?(options?: QueryOptions): Promise<QueryResult<T>>;

  /** Execute operations in a transaction */
  transaction?<R>(fn: (tx: TransactionInterface) => Promise<R>): Promise<R>;
}
