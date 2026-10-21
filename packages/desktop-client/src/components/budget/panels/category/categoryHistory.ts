import * as monthUtils from '@actual-app/core/shared/months';

export const HISTORY_LENGTH = 12;
export const AVERAGE_LENGTHS = [3, 6, 12] as const;
export type AverageLength = (typeof AVERAGE_LENGTHS)[number];

export type CategoryHistoryMonth = {
  month: string;
  /** Cents budgeted that month. */
  budgeted: number;
  /** Cents of activity: negative for spending, positive for income. */
  spent: number;
};

/**
 * The newest month an average looks at, as the server does: the month
 * before `month`, or the month before today when `month` is ahead.
 */
export function getAverageStartMonth(
  month: string,
  currentMonth: string = monthUtils.currentMonth(),
): string {
  const previous = monthUtils.prevMonth(month);
  return previous >= currentMonth
    ? monthUtils.prevMonth(currentMonth)
    : previous;
}

/** The 12 months an average can use, oldest first. */
export function getHistoryMonths(month: string): string[] {
  const newest = getAverageStartMonth(month);
  return monthUtils.rangeInclusive(
    monthUtils.subMonths(newest, HISTORY_LENGTH - 1),
    newest,
  );
}

/**
 * The budget `set-single-N-avg` would set, previewed from the history
 * (oldest first). Like the server, months before the category's first
 * activity in the window are left out and the mean is rounded to the cent.
 * Activity older than the window is not visible here, so a category idle
 * for a long stretch can preview a slightly higher average than it gets.
 */
export function getAverageBudget(
  history: readonly CategoryHistoryMonth[],
  length: AverageLength,
  isIncome: boolean,
): number {
  const firstActivity = history.findIndex(
    entry => entry.budgeted !== 0 || entry.spent !== 0,
  );
  const months = history.slice(Math.max(firstActivity, 0)).slice(-length);
  if (months.length === 0) {
    return 0;
  }
  const total = months.reduce((sum, entry) => sum + entry.spent, 0);
  const average = Math.round(total / months.length);
  if (average === 0) {
    return 0;
  }
  return isIncome ? average : -average;
}
