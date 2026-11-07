import * as monthUtils from '@actual-app/core/shared/months';
import { computeSchedulePreviewTransactions } from '@actual-app/core/shared/schedules';
import type { ScheduleStatuses } from '@actual-app/core/shared/schedules';
import type { ScheduleEntity } from '@actual-app/core/types/models';

const COMMITMENT_WINDOW = '30-day';
const COMMITMENT_DAYS = 30;

type ScheduleCommitments = {
  /** Signed sum of every occurrence from today through the next 30 days. */
  committed: number;
  missedCount: number;
};

/**
 * What the schedules commit over the next 30 days, whatever each schedule's
 * own upcoming length, and how many were missed.
 */
export function getScheduleCommitments(
  schedules: readonly ScheduleEntity[],
  statuses: ScheduleStatuses,
): ScheduleCommitments {
  const today = monthUtils.currentDay();
  const windowEnd = monthUtils.addDays(today, COMMITMENT_DAYS);

  // Previews only cover schedules inside their upcoming window, so every
  // open schedule is treated as upcoming over the same 30 days.
  const windowed = schedules.map(schedule => ({
    ...schedule,
    custom_upcoming_length: COMMITMENT_WINDOW,
  }));
  const windowedStatuses: ScheduleStatuses = new Map(
    [...statuses].map(([id, status]) => [
      id,
      status === 'scheduled' ? 'upcoming' : status,
    ]),
  );

  const committed = computeSchedulePreviewTransactions(
    windowed,
    windowedStatuses,
    COMMITMENT_WINDOW,
  )
    .filter(preview => preview.date >= today && preview.date <= windowEnd)
    .reduce((total, preview) => total + preview.amount, 0);

  const missedCount = schedules.filter(
    schedule => !schedule.completed && statuses.get(schedule.id) === 'missed',
  ).length;

  return { committed, missedCount };
}
