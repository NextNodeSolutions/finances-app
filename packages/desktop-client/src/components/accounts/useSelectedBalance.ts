import { q } from '@actual-app/core/shared/query';
import { getScheduledAmount } from '@actual-app/core/shared/schedules';
import { isPreviewId } from '@actual-app/core/shared/transactions';
import type { IntegerAmount } from '@actual-app/core/shared/util';
import type {
  AccountEntity,
  ScheduleEntity,
} from '@actual-app/core/types/models';

import { useCachedSchedules } from '#hooks/useCachedSchedules';
import { useSheetValue } from '#hooks/useSheetValue';

export type SelectedBalance = {
  amount: IntegerAmount;
  /** False when a selected schedule has an approximate ("between") amount. */
  isExact: boolean;
};

type SelectedRowsName = `selected-transactions-${string}`;
type SelectedSumName = `selected-balance-${string}`;

/**
 * The sum of the selected register rows. Split children are not counted
 * twice when their parent is selected, and selected upcoming (preview) rows
 * count their schedule's amount as seen from `account`.
 */
export function useSelectedBalance(
  selectedItems: ReadonlySet<string>,
  account?: AccountEntity,
): SelectedBalance | null {
  const selectedIds = [...selectedItems];
  const name: SelectedSumName = `selected-balance-${selectedIds.join('-')}`;

  const rows = useSheetValue<'balance', SelectedRowsName>({
    name: `selected-transactions-${name}`,
    query: q('transactions')
      .filter({
        id: { $oneof: selectedIds },
        parent_id: { $oneof: selectedIds },
      })
      .select('id'),
  });
  const childIds = new Set(
    (Array.isArray(rows) ? rows : []).map((row: { id: string }) => row.id),
  );

  const balance = useSheetValue<'balance', SelectedSumName>({
    name: `${name}-sum`,
    query: q('transactions')
      .filter({ id: { $oneof: selectedIds.filter(id => !childIds.has(id)) } })
      .options({ splits: 'all' })
      .calculate({ $sum: '$amount' }),
  });

  const { isLoading, schedules = [] } = useCachedSchedules();
  if (isLoading) {
    return null;
  }

  const scheduled = sumSelectedSchedules(selectedIds, schedules, account);
  if (typeof balance !== 'number' && scheduled.amount === 0) {
    return null;
  }

  return {
    amount: (typeof balance === 'number' ? balance : 0) + scheduled.amount,
    isExact: scheduled.isExact,
  };
}

function sumSelectedSchedules(
  selectedIds: readonly string[],
  schedules: readonly ScheduleEntity[],
  account: AccountEntity | undefined,
): SelectedBalance {
  // Preview ids read `preview/<schedule id>/<date>`; every selected
  // occurrence counts on its own.
  return selectedIds.filter(isPreviewId).reduce<SelectedBalance>(
    (total, id) => {
      const scheduleId = id.slice('preview/'.length).split('/')[0];
      const schedule = schedules.find(s => s.id === scheduleId);
      if (!schedule) {
        return total;
      }
      const amount = getScheduledAmount(schedule._amount);
      const isIncoming = !account || account.id === schedule._account;
      return {
        amount: total.amount + (isIncoming ? amount : -amount),
        isExact: total.isExact && schedule._amountOp !== 'isbetween',
      };
    },
    { amount: 0, isExact: true },
  );
}
