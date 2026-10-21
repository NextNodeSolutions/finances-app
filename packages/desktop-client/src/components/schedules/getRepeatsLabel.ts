import type { ScheduleEntity } from '@actual-app/core/types/models';
import type { TFunction } from 'i18next';

/**
 * Short recurrence for the schedules table: "Monthly", "Every 2 weeks",
 * "Once". Null when the schedule's rule has no date condition.
 */
export function getRepeatsLabel(
  date: ScheduleEntity['_date'] | null | undefined,
  t: TFunction,
): string | null {
  if (typeof date === 'string') {
    return t('Once');
  }
  if (date == null || !date.frequency) {
    return null;
  }

  const interval = date.interval ?? 1;
  switch (date.frequency) {
    case 'daily':
      return interval === 1
        ? t('Daily')
        : t('Every {{interval}} days', { interval });
    case 'weekly':
      return interval === 1
        ? t('Weekly')
        : t('Every {{interval}} weeks', { interval });
    case 'monthly':
      return interval === 1
        ? t('Monthly')
        : t('Every {{interval}} months', { interval });
    case 'yearly':
      return interval === 1
        ? t('Yearly')
        : t('Every {{interval}} years', { interval });
    default:
      return null;
  }
}
