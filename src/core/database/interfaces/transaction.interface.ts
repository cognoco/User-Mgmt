/**
 * Transaction management interface used by {@link BaseDatabaseInterface}.
 *
 * Supports explicit control over commit/rollback and isolation levels.
 */
import type { TransactionOptions } from '@/src/core/database/interfaces/index'163;

export interface TransactionInterface {
  /** Begin a new transaction */
  begin(options?: TransactionOptions): Promise<void>;

  /** Commit the current transaction */
  commit(): Promise<void>;

  /** Rollback the current transaction */
  rollback(): Promise<void>;
}
