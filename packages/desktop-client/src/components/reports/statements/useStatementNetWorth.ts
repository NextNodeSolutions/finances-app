import { useNetWorthHistory } from '#hooks/useNetWorthHistory';

import { STATEMENT_PAGE_SIZE } from './statementLayout';

type StatementNetWorth = {
  isLoading: boolean;
  /** Month-end net worth in cents, keyed by `YYYY-MM`. */
  netWorthByMonth: Map<string, number>;
};

/**
 * Month-end net worth for the listed months. The first page fits in one
 * year of history; longer lists read the whole history.
 */
export function useStatementNetWorth(monthCount: number): StatementNetWorth {
  const { data, isLoading } = useNetWorthHistory({
    range: monthCount > STATEMENT_PAGE_SIZE ? 'All' : '1Y',
  });

  return {
    isLoading,
    netWorthByMonth: new Map(
      (data?.points ?? []).map(point => [point.month, point.netWorth]),
    ),
  };
}
