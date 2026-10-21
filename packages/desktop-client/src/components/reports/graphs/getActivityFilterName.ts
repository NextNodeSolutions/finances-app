import { getLocale } from '@actual-app/core/shared/locale';
import * as monthUtils from '@actual-app/core/shared/months';
import i18next, { t } from 'i18next';

/** How a single interval bucket reads, keyed by the report's interval. */
const BUCKET_FORMATS: Record<string, string> = {
  Daily: 'MMMM d, yyyy',
  Monthly: 'MMMM yyyy',
  Yearly: 'yyyy',
};
const SEPARATOR = ' · ';

type ActivityFilterNameParams = {
  /** The drilled-into item, e.g. a category or payee name. */
  name?: string;
  startDate: string;
  endDate?: string;
  interval: string;
  /** True when the drill-down covers `startDate`..`endDate` rather than one bucket. */
  isRange: boolean;
};

/**
 * Names a report drill-down for the register header, for example
 * "Food · October 2026".
 */
export function getActivityFilterName({
  name,
  startDate,
  endDate,
  interval,
  isRange,
}: ActivityFilterNameParams): string {
  const period = getPeriodLabel({ startDate, endDate, interval, isRange });
  return [name, period].filter(Boolean).join(SEPARATOR);
}

function getPeriodLabel({
  startDate,
  endDate,
  interval,
  isRange,
}: Omit<ActivityFilterNameParams, 'name'>): string {
  if (!startDate) {
    return '';
  }
  const locale = getLocale(i18next.language);
  if (!isRange) {
    const bucketFormat = BUCKET_FORMATS[interval] ?? BUCKET_FORMATS.Daily;
    return monthUtils.format(startDate, bucketFormat, locale);
  }
  if (interval === 'Weekly') {
    return t('Week of {{date}}', {
      date: monthUtils.format(startDate, 'MMM d, yyyy', locale),
    });
  }
  const end = endDate || startDate;
  if (monthUtils.getMonth(startDate) === monthUtils.getMonth(end)) {
    return monthUtils.format(startDate, 'MMMM yyyy', locale);
  }
  return `${monthUtils.format(startDate, 'MMM yyyy', locale)} – ${monthUtils.format(end, 'MMM yyyy', locale)}`;
}
