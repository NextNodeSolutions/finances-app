import * as monthUtils from '@actual-app/core/shared/months';
import type { Locale } from 'date-fns';

import type { MonthBounds } from './MonthsContext';

/** Width of the category column for the user's expanded-state pref. */
export function getCategoryColumnWidth(categoryExpandedState: number): number {
  return 200 + 100 * categoryExpandedState;
}

// The first month column needs 500px; each further one 250px more.
const FIRST_MONTHS_WIDTH = 500;
const MONTH_COLUMN_STEP = 250;
const MAX_MONTHS = 6;

/** How many month columns fit beside the category column. */
export function getNumPossibleMonths(
  width: number,
  categoryWidth: number,
): number {
  const tableWidth = width - categoryWidth;
  const fitting =
    Math.floor((tableWidth - FIRST_MONTHS_WIDTH) / MONTH_COLUMN_STEP) + 2;
  return Math.min(Math.max(fitting, 1), MAX_MONTHS);
}

/** Keeps the first shown month inside the budget's bounds. */
export function clampStartMonth(
  month: string,
  bounds: MonthBounds,
  numMonths: number,
): string {
  const end = monthUtils.subMonths(bounds.end, numMonths - 1);
  if (month < bounds.start) {
    return bounds.start;
  }
  if (month > end) {
    return end;
  }
  return month;
}

/**
 * The first month to show so the current month lands where the `0` key
 * puts it: centred for envelope, second to last for tracking.
 */
export function getCurrentMonthStart(
  budgetType: string,
  numMonths: number,
): string {
  const offset =
    budgetType === 'envelope'
      ? Math.floor((numMonths - 1) / 2)
      : numMonths === 2
        ? 1
        : Math.max(numMonths - 2, 0);
  return monthUtils.subMonths(monthUtils.currentMonth(), offset);
}

/** The months shown, from the first one. */
export function getVisibleMonths(
  startMonth: string,
  numMonths: number,
): string[] {
  return monthUtils.rangeInclusive(
    startMonth,
    monthUtils.addMonths(startMonth, numMonths - 1),
  );
}

/** The focused month when it is still shown, else the first shown month. */
export function resolveFocusedMonth(
  requested: string | null,
  visibleMonths: readonly string[],
): string {
  const [firstMonth = monthUtils.currentMonth()] = visibleMonths;
  return requested !== null && visibleMonths.includes(requested)
    ? requested
    : firstMonth;
}

/** `October 2026`, or `October – December 2026` across several months. */
export function formatMonthRangeTitle(
  startMonth: string,
  numMonths: number,
  locale?: Locale,
): string {
  const endMonth = monthUtils.addMonths(startMonth, numMonths - 1);
  const end = monthUtils.format(endMonth, 'MMMM yyyy', locale);
  if (numMonths <= 1) {
    return end;
  }
  const isSameYear =
    monthUtils.getYear(startMonth) === monthUtils.getYear(endMonth);
  const start = monthUtils.format(
    startMonth,
    isSameYear ? 'MMMM' : 'MMMM yyyy',
    locale,
  );
  return `${start} – ${end}`;
}
