import { q } from '@actual-app/core/shared/query';
import { ungroupTransactions } from '@actual-app/core/shared/transactions';
import type { TransactionEntity } from '@actual-app/core/types/models';

import { useQuery } from '#hooks/useQuery';

import { toDraft } from './transactionDraft';
import type { DraftTransactions } from './transactionDraft';

type LiveTransaction =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'loaded'; transactions: DraftTransactions };

/**
 * One transaction with its split lines, kept current as it changes. A
 * split line's id resolves to its parent, since the grouped query returns
 * the whole split.
 */
export function useLiveTransaction(
  id: TransactionEntity['id'],
): LiveTransaction {
  const { data, isLoading, error } = useQuery<TransactionEntity>(
    () =>
      q('transactions')
        .filter({ id })
        .select('*')
        .options({ splits: 'grouped' }),
    [id],
  );

  if (error) {
    return { status: 'missing' };
  }
  if (isLoading || data === null) {
    return { status: 'loading' };
  }

  // Deleted transactions (undo, sync) drop out of the query.
  const [grouped] = data;
  if (!grouped) {
    return { status: 'missing' };
  }
  return {
    status: 'loaded',
    transactions: toDraft(ungroupTransactions([grouped])),
  };
}
