import { q } from '@actual-app/core/shared/query';
import type { PayeeEntity } from '@actual-app/core/types/models';

import { useQuery } from '#hooks/useQuery';

type PayeeUsageRow = {
  payee: PayeeEntity['id'] | null;
  count: number;
};

type PayeeUsage = {
  /** Transactions per payee; a payee with none is absent. */
  counts: ReadonlyMap<PayeeEntity['id'], number>;
  isLoading: boolean;
};

const EMPTY_COUNTS: ReadonlyMap<PayeeEntity['id'], number> = new Map();

function toCounts(
  rows: ReadonlyArray<PayeeUsageRow>,
): ReadonlyMap<PayeeEntity['id'], number> {
  return new Map(
    rows.flatMap(row => (row.payee == null ? [] : [[row.payee, row.count]])),
  );
}

/**
 * How many transactions use each payee, from one grouped live query. Only
 * the payees page asks for it, so the count is never paid for elsewhere.
 */
export function usePayeeUsage(): PayeeUsage {
  const { data, isLoading } = useQuery<PayeeUsageRow>(
    () =>
      // A split counts as its parent plus its parts, as the register lists
      // them; the default (inline) mode would drop the parent rows.
      q('transactions')
        .filter({ tombstone: false })
        .options({ splits: 'all' })
        .groupBy('payee')
        .select(['payee', { count: { $count: '$id' } }]),
    [],
  );

  return {
    counts: data == null ? EMPTY_COUNTS : toCounts(data),
    isLoading,
  };
}
