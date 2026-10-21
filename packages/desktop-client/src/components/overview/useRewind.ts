import { useSearchParams } from 'react-router';

import * as monthUtils from '@actual-app/core/shared/months';

/** Search param that pins the Overview to a month-end (`?asof=2026-08`). */
export const AS_OF_PARAM = 'asof';

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export type Rewind = {
  /** The pinned month (`YYYY-MM`), or null for today. */
  asOfMonth: string | null;
  setAsOf: (month: string | null) => void;
  stepBack: () => void;
  stepForward: () => void;
  canStepBack: boolean;
  canStepForward: boolean;
};

type RewindBounds = {
  /** Oldest month-end the history can show; null until it has loaded. */
  earliestMonth: string | null;
};

/**
 * A valid past month from the `asof` param, or null for today. The current
 * month is today, so it never counts as a pin.
 */
export function parseAsOfMonth(value: string | null): string | null {
  if (value === null || !MONTH_PATTERN.test(value)) {
    return null;
  }
  return value < monthUtils.currentMonth() ? value : null;
}

/**
 * The Overview's as-of month, kept in the URL so Back/Forward and reload
 * keep it. Bounded by the earliest month of the history and the previous
 * month; stepping forward from the previous month returns to today.
 */
export function useRewind({ earliestMonth }: RewindBounds): Rewind {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedMonth = parseAsOfMonth(searchParams.get(AS_OF_PARAM));
  const asOfMonth =
    requestedMonth !== null &&
    earliestMonth !== null &&
    requestedMonth < earliestMonth
      ? earliestMonth
      : requestedMonth;

  const setAsOf = (month: string | null) => {
    const nextMonth = month === null ? null : parseAsOfMonth(month);
    if (nextMonth === asOfMonth) {
      return;
    }
    setSearchParams(
      current => {
        const params = new URLSearchParams(current);
        if (nextMonth === null) {
          params.delete(AS_OF_PARAM);
        } else {
          params.set(AS_OF_PARAM, nextMonth);
        }
        return params;
      },
      // Entering or leaving a rewind is a history step (Back returns to
      // today); moving between past months replaces it.
      { replace: asOfMonth !== null && nextMonth !== null },
    );
  };

  const previousMonth = monthUtils.prevMonth(
    asOfMonth ?? monthUtils.currentMonth(),
  );
  const canStepBack = earliestMonth !== null && previousMonth >= earliestMonth;
  const canStepForward = asOfMonth !== null;

  return {
    asOfMonth,
    setAsOf,
    stepBack: () => {
      if (canStepBack) {
        setAsOf(previousMonth);
      }
    },
    stepForward: () => {
      if (asOfMonth !== null) {
        setAsOf(monthUtils.nextMonth(asOfMonth));
      }
    },
    canStepBack,
    canStepForward,
  };
}
