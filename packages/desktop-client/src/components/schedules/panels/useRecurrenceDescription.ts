import { useTranslation } from 'react-i18next';

import * as monthUtils from '@actual-app/core/shared/months';
import type { ScheduleEntity } from '@actual-app/core/types/models';

import { useDateFormat } from '#hooks/useDateFormat';
import { useLocale } from '#hooks/useLocale';
import { getRecurringDescription } from '#util/schedule';

/** The schedule's recurrence in words, e.g. "Every month on the 27th". */
export function useRecurrenceDescription(
  date: ScheduleEntity['_date'] | null | undefined,
): string | null {
  const { t } = useTranslation();
  const locale = useLocale();
  const dateFormat = useDateFormat() || 'MM/dd/yyyy';

  if (typeof date === 'string') {
    return t('Once, on {{date}}', {
      date: monthUtils.format(date, dateFormat),
    });
  }
  if (date == null || !date.frequency) {
    return null;
  }
  return getRecurringDescription(date, dateFormat, locale);
}
