import { TransactionInterface } from '@/core/database/interfaces';
import { ApplicationError } from '@/core/common/errors';
import { errorLogger } from '@/lib/monitoring/errorLogger';

export type FailureCategory = 'transient' | 'permanent';

export function classifyFailure(error: unknown): FailureCategory {
  if (error instanceof ApplicationError) {
    return error.httpStatus >= 500 ? 'transient' : 'permanent';
  }
  return 'transient';
}

export async function executeTransaction<R>(
  tx: TransactionInterface,
  steps: Array<(t: TransactionInterface) => Promise<R>>,
  logger: Pick<typeof errorLogger, 'debug' | 'error'> = errorLogger,
): Promise<R[]> {
  await tx.begin();
  logger.debug('transaction.begin');
  try {
    const results: R[] = [];
    for (const step of steps) {
      results.push(await step(tx));
    }
    await tx.commit();
    logger.debug('transaction.commit');
    return results;
  } catch (err) {
    await tx.rollback();
    logger.error('transaction.rollback', { failureType: classifyFailure(err) });
    throw err;
  }
}
