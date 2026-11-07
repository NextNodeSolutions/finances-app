import { Trans } from 'react-i18next';

import { AlignedText } from '@actual-app/components/aligned-text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { chartTooltipSurface } from '#components/reports/chart-theme';
import { useLocale } from '#hooks/useLocale';

import { Amount } from './Amount';
import type { TrendPoint } from './statement';

type TrendTooltipProps = {
  isActive: boolean;
  /** The hovered month (`YYYY-MM`), as recharts reports it. */
  month: string | number | undefined;
  points: readonly TrendPoint[];
};

/** The month-end under the pointer: its date, net worth and change. */
export function TrendTooltip({ isActive, month, points }: TrendTooltipProps) {
  const locale = useLocale();
  const point = points.find(candidate => candidate.month === month);

  if (!isActive || point === undefined) {
    return null;
  }

  const isCurrentMonth = point.month === monthUtils.currentMonth();
  const day = isCurrentMonth
    ? monthUtils.currentDay()
    : monthUtils.lastDayOfMonth(point.month);

  return (
    <View style={{ ...chartTooltipSurface, minWidth: 180 }}>
      <View style={{ fontWeight: 600, marginBottom: 4, color: theme.pageText }}>
        {monthUtils.format(day, 'd MMM yyyy', locale)}
      </View>
      <AlignedText
        left={<Trans>Net worth</Trans>}
        right={<Amount value={point.netWorth} tone="balance" />}
      />
      <AlignedText
        left={<Trans>Change</Trans>}
        right={<Amount value={point.change} tone="change" />}
      />
    </View>
  );
}
