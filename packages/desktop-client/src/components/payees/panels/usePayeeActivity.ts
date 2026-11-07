import * as monthUtils from '@actual-app/core/shared/months';
import { q } from '@actual-app/core/shared/query';
import type {
  CategoryEntity,
  PayeeEntity,
} from '@actual-app/core/types/models';

import { useQuery } from '#hooks/useQuery';

// The current month and the eleven before it.
const ACTIVITY_MONTHS = 12;

type CategoryTotalRow = {
  category: CategoryEntity['id'] | null;
  total: number;
  count: number;
};

type LastUsedRow = { date: string };

export type PayeeCategoryShare = {
  categoryId: CategoryEntity['id'] | null;
  /** Signed cents. */
  total: number;
  count: number;
  /** Share of the money moved, 0–1, by absolute amount. */
  share: number;
};

export type PayeeActivity = {
  /** Largest share first. */
  categories: PayeeCategoryShare[];
  /** Signed cents over the period. */
  total: number;
  lastUsed: string | null;
  isLoading: boolean;
};

function toShares(rows: ReadonlyArray<CategoryTotalRow>): PayeeCategoryShare[] {
  const moved = rows.reduce((sum, row) => sum + Math.abs(row.total), 0);
  return rows
    .map(row => ({
      categoryId: row.category,
      total: row.total,
      count: row.count,
      share: moved === 0 ? 0 : Math.abs(row.total) / moved,
    }))
    .sort((a, b) => b.share - a.share);
}

/** Where a payee's money went over the last twelve months, and when. */
export function usePayeeActivity(payeeId: PayeeEntity['id']): PayeeActivity {
  const since = monthUtils.firstDayOfMonth(
    monthUtils.subMonths(monthUtils.currentMonth(), ACTIVITY_MONTHS - 1),
  );

  const breakdown = useQuery<CategoryTotalRow>(
    () =>
      q('transactions')
        .filter({ payee: payeeId, date: { $gte: since } })
        .groupBy('category')
        .select([
          'category',
          { total: { $sum: '$amount' } },
          { count: { $count: '$id' } },
        ]),
    [payeeId, since],
  );
  const lastUsed = useQuery<LastUsedRow>(
    () =>
      q('transactions')
        .filter({ payee: payeeId })
        .orderBy({ date: 'desc' })
        .limit(1)
        .select(['date']),
    [payeeId],
  );

  const categories = toShares(breakdown.data ?? []);

  return {
    categories,
    total: categories.reduce((sum, category) => sum + category.total, 0),
    lastUsed: lastUsed.data?.[0]?.date ?? null,
    isLoading: breakdown.isLoading || lastUsed.isLoading,
  };
}
