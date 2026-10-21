import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryEntity } from '@actual-app/core/types/models';

import {
  getBalanceCellName,
  TO_BUDGET_ID,
} from '#components/budget/panels/balanceCell';
import { useSheetValues } from '#components/budget/useSheetValues';
import type { SheetCellRequest } from '#components/budget/useSheetValues';

export type EnvelopeBalances = {
  /** Balance by category id, with To budget under `TO_BUDGET_ID`. */
  balanceById: Readonly<Record<string, number>>;
  /** Categories that roll their overspending over instead of covering it. */
  rolloverIds: ReadonlySet<CategoryEntity['id']>;
  /** Every cell has reported once. */
  isLoaded: boolean;
};

const ROLLOVER_PREFIX = 'rollover:';

/**
 * The month's envelope balances for the given expense categories and To
 * budget, bound only while the caller is mounted.
 */
export function useEnvelopeBalances(
  month: string,
  categoryIds: readonly CategoryEntity['id'][],
): EnvelopeBalances {
  const sheetName = monthUtils.sheetForMonth(month);
  const requests: SheetCellRequest[] = [TO_BUDGET_ID, ...categoryIds].map(
    id => ({ key: id, sheetName, name: getBalanceCellName(id) }),
  );
  const rolloverRequests: SheetCellRequest[] = categoryIds.map(id => ({
    key: `${ROLLOVER_PREFIX}${id}`,
    sheetName,
    name: `carryover-${id}`,
  }));
  const values = useSheetValues([...requests, ...rolloverRequests]);

  return {
    balanceById: values,
    rolloverIds: new Set(
      categoryIds.filter(id => values[`${ROLLOVER_PREFIX}${id}`] === 1),
    ),
    isLoaded: [...requests, ...rolloverRequests].every(
      request => request.key in values,
    ),
  };
}
