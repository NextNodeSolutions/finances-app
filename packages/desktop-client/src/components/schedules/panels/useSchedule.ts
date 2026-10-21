import { useMemo } from 'react';

import { q } from '@actual-app/core/shared/query';
import type { ScheduleStatusType } from '@actual-app/core/shared/schedules';
import type { ScheduleEntity } from '@actual-app/core/types/models';

import { useSchedules } from '#hooks/useSchedules';

type ScheduleResult =
  | { state: 'loading' }
  | { state: 'missing' }
  | {
      state: 'loaded';
      schedule: ScheduleEntity;
      status: ScheduleStatusType | undefined;
    };

/** One schedule and its status, live: it follows edits, posts and undo. */
export function useSchedule(id: ScheduleEntity['id']): ScheduleResult {
  // useSchedules re-subscribes whenever the query identity changes.
  const query = useMemo(() => q('schedules').filter({ id }).select('*'), [id]);
  const { isLoading, schedules, statuses } = useSchedules({ query });

  if (isLoading) {
    return { state: 'loading' };
  }
  const schedule = schedules[0];
  if (!schedule) {
    return { state: 'missing' };
  }
  return { state: 'loaded', schedule, status: statuses.get(schedule.id) };
}
