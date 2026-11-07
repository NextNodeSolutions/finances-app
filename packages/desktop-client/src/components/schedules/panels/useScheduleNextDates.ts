import { useEffect, useState } from 'react';

import { sendCatch } from '@actual-app/core/platform/client/connection';
import * as monthUtils from '@actual-app/core/shared/months';
import type { ScheduleEntity } from '@actual-app/core/types/models';

const NEXT_DATES_COUNT = 5;

type NextDates = {
  /** `YYYY-MM-DD` dates from today on; empty when nothing is left. */
  dates: readonly string[];
  isLoading: boolean;
};

/**
 * The schedule's next occurrences from today, from the recurrence rule
 * (`schedule/get-upcoming-dates`). A one-off schedule has at most its own
 * date.
 */
export function useScheduleNextDates(
  date: ScheduleEntity['_date'] | undefined,
): NextDates {
  const [result, setResult] = useState<{
    date: ScheduleEntity['_date'] | undefined;
    dates: readonly string[];
  } | null>(null);

  useEffect(() => {
    if (date == null || typeof date === 'string') {
      return;
    }

    let isCurrent = true;
    void sendCatch('schedule/get-upcoming-dates', {
      config: date,
      count: NEXT_DATES_COUNT,
    }).then(({ data }) => {
      if (isCurrent) {
        setResult({ date, dates: data ?? [] });
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [date]);

  if (date == null) {
    return { dates: [], isLoading: true };
  }
  if (typeof date === 'string') {
    return { dates: getOneOffDates(date), isLoading: false };
  }
  if (result === null || result.date !== date) {
    return { dates: [], isLoading: true };
  }
  return { dates: result.dates, isLoading: false };
}

function getOneOffDates(date: string): string[] {
  const today = monthUtils.currentDay();
  return date === today || monthUtils.isAfter(date, today) ? [date] : [];
}
