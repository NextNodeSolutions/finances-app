import type { AccountEntity } from '@actual-app/core/types/models';

import { useAccountBalances } from '#hooks/useAccountBalances';
import type { NetWorthPoint } from '#hooks/useNetWorthHistory';
import { useSheetValue } from '#hooks/useSheetValue';
import * as bindings from '#spreadsheet/bindings';

import { getMonthEndStatement, getTodayStatement } from './statement';
import type { Statement } from './statement';

type StatementInputs = {
  asOfMonth: string | null;
  /** Every month-end of the loaded history, oldest first. */
  points: readonly NetWorthPoint[];
  accounts: readonly AccountEntity[];
};

/**
 * Today's statement comes from the live spreadsheet (open accounts, the same
 * bindings as the sidebar); a rewound one is read from the history, closed
 * accounts included, so it adds up to the month-end net worth.
 */
export function useStatement({
  asOfMonth,
  points,
  accounts,
}: StatementInputs): Statement {
  const openAccountIds = accounts
    .filter(account => !account.closed)
    .map(account => account.id);
  const liveBalances = useAccountBalances(openAccountIds);
  const liveNetWorth = useSheetValue<'account', 'accounts-balance'>(
    bindings.allAccountBalance(),
  );

  if (asOfMonth !== null) {
    return getMonthEndStatement({
      asOfMonth,
      points,
      accountIds: accounts.map(account => account.id),
    });
  }

  return getTodayStatement({
    netWorth: liveNetWorth,
    balances: Object.fromEntries(
      openAccountIds.map(id => [id, liveBalances[id] ?? null]),
    ),
    points,
  });
}
