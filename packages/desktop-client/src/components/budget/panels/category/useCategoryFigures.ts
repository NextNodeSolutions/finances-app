import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { useSheetValues } from '#components/budget/useSheetValues';

export type CategoryFigures = {
  /** Cents; `null` until the cell reports. */
  budgeted: number | null;
  spent: number | null;
  balance: number | null;
};

/** The category's budgeted, spent and balance cells for one month. */
export function useCategoryFigures(
  categoryId: CategoryEntity['id'],
  month: string,
): CategoryFigures {
  const sheetName = monthUtils.sheetForMonth(month);
  const values = useSheetValues([
    { key: 'budgeted', sheetName, name: `budget-${categoryId}` },
    { key: 'spent', sheetName, name: `sum-amount-${categoryId}` },
    { key: 'balance', sheetName, name: `leftover-${categoryId}` },
  ]);

  return {
    budgeted: values.budgeted ?? null,
    spent: values.spent ?? null,
    balance: values.balance ?? null,
  };
}
