import { useEffect, useState } from 'react';

import { send } from '@actual-app/core/platform/client/connection';
import * as monthUtils from '@actual-app/core/shared/months';

import { STATEMENT_PAGE_SIZE } from './statementLayout';

type StatementMonths = {
  isLoading: boolean;
  /** `YYYY-MM`, newest first. */
  months: string[];
  hasMore: boolean;
  showMore: () => void;
};

/**
 * The months that have a statement: from the current month back to the
 * first month with a transaction (and a budget sheet), newest first.
 */
export function useStatementMonths(): StatementMonths {
  const [firstMonth, setFirstMonth] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(STATEMENT_PAGE_SIZE);

  useEffect(() => {
    let isCurrent = true;
    void loadFirstMonth().then(month => {
      if (!isCurrent) {
        return;
      }
      setFirstMonth(month);
      setIsLoading(false);
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  const allMonths = firstMonth
    ? monthUtils.rangeInclusive(firstMonth, monthUtils.currentMonth()).reverse()
    : [];

  return {
    isLoading,
    months: allMonths.slice(0, visibleCount),
    hasMore: allMonths.length > visibleCount,
    showMore: () => setVisibleCount(count => count + STATEMENT_PAGE_SIZE),
  };
}

/** The first month that has both a transaction and a budget sheet. */
async function loadFirstMonth(): Promise<string | null> {
  try {
    const [earliest, bounds] = await Promise.all([
      send('get-earliest-transaction'),
      send('get-budget-bounds'),
    ]);
    if (!earliest) {
      return null;
    }
    const earliestMonth = monthUtils.getMonth(earliest.date);
    return earliestMonth > bounds.start ? earliestMonth : bounds.start;
  } catch {
    return null;
  }
}
