import { useEffect } from 'react';

import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { useSheetValues } from '#components/budget/useSheetValues';
import { prewarmMonth } from '#components/budget/util';
import { useSpreadsheet } from '#hooks/useSpreadsheet';
import { useSyncedPref } from '#hooks/useSyncedPref';

import { getHistoryMonths } from './categoryHistory';
import type { CategoryHistoryMonth } from './categoryHistory';

type CategoryHistory = {
  /** Oldest first. */
  history: CategoryHistoryMonth[];
  isLoaded: boolean;
};

/**
 * Budgeted and spent for the 12 months before `month`. The months are
 * prewarmed when the panel opens and bound only while it stays open.
 */
export function useCategoryHistory(
  categoryId: CategoryEntity['id'],
  month: string,
): CategoryHistory {
  const spreadsheet = useSpreadsheet();
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  const months = getHistoryMonths(month);
  const monthList = months.join(',');

  useEffect(() => {
    for (const historyMonth of monthList.split(',')) {
      // A month outside the budget has nothing to prewarm.
      void prewarmMonth(budgetType, spreadsheet, historyMonth).catch(
        () => undefined,
      );
    }
  }, [budgetType, spreadsheet, monthList]);

  const values = useSheetValues(
    months.flatMap(historyMonth => {
      const sheetName = monthUtils.sheetForMonth(historyMonth);
      return [
        {
          key: `${historyMonth}:budgeted`,
          sheetName,
          name: `budget-${categoryId}`,
        },
        {
          key: `${historyMonth}:spent`,
          sheetName,
          name: `sum-amount-${categoryId}`,
        },
      ];
    }),
  );

  return {
    history: months.map(historyMonth => ({
      month: historyMonth,
      budgeted: values[`${historyMonth}:budgeted`] ?? 0,
      spent: values[`${historyMonth}:spent`] ?? 0,
    })),
    isLoaded: months.every(historyMonth => `${historyMonth}:spent` in values),
  };
}
