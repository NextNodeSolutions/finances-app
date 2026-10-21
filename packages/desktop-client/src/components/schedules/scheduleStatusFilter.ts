import type { ScheduleStatuses } from '@actual-app/core/shared/schedules';
import type { ScheduleEntity } from '@actual-app/core/types/models';

export const SCHEDULE_STATUS_FILTERS = [
  'all',
  'upcoming',
  'missed',
  'completed',
] as const;

export type ScheduleStatusFilter = (typeof SCHEDULE_STATUS_FILTERS)[number];

/**
 * The schedules a status segment shows. `all` leaves out completed
 * schedules, as the page always has; `upcoming` is what is still to come.
 */
export function filterSchedulesByStatus(
  schedules: readonly ScheduleEntity[],
  statuses: ScheduleStatuses,
  filter: ScheduleStatusFilter,
): readonly ScheduleEntity[] {
  return schedules.filter(schedule => {
    const status = statuses.get(schedule.id);
    switch (filter) {
      case 'all':
        return !schedule.completed;
      case 'upcoming':
        return (
          !schedule.completed &&
          (status === 'due' || status === 'upcoming' || status === 'scheduled')
        );
      case 'missed':
        return !schedule.completed && status === 'missed';
      case 'completed':
        return schedule.completed;
      default:
        throw new Error(`Unknown schedule filter: ${String(filter)}`);
    }
  });
}
