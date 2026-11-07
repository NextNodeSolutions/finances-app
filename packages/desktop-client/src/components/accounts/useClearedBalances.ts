import type { Query } from '@actual-app/core/shared/query';
import type { IntegerAmount } from '@actual-app/core/shared/util';

import { useSheetValue } from '#hooks/useSheetValue';

/** The register's balance binding (`AccountInternal.getBalanceQuery`). */
export type BalanceQuery = {
  name: `balance-query-${string}`;
  query: Query;
};

/**
 * Cleared and uncleared totals of a register, null until the sheet answers.
 * The instrument strip and the reconcile strip share these bindings.
 */
export function useClearedBalances(balanceQuery: BalanceQuery): {
  cleared: IntegerAmount | null;
  uncleared: IntegerAmount | null;
} {
  const cleared = useSheetValue<'balance', `balance-query-${string}-cleared`>({
    name: `${balanceQuery.name}-cleared`,
    query: balanceQuery.query.filter({ cleared: true }),
  });
  const uncleared = useSheetValue<
    'balance',
    `balance-query-${string}-uncleared`
  >({
    name: `${balanceQuery.name}-uncleared`,
    query: balanceQuery.query.filter({ cleared: false }),
  });

  return { cleared: cleared ?? null, uncleared: uncleared ?? null };
}
