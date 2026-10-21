import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';

import type { CategoryHistoryMonth } from './categoryHistory';

type HistoryBarsProps = {
  history: readonly CategoryHistoryMonth[];
  isIncome: boolean;
};

const CHART_HEIGHT = 56;
const TICK_HEIGHT = 2;

/** Bars for what was spent (or received), a tick for what was budgeted. */
export function HistoryBars({ history, isIncome }: HistoryBarsProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const locale = useLocale();
  const magnitudes = history.map(entry => ({
    ...entry,
    activity: Math.max(isIncome ? entry.spent : -entry.spent, 0),
    budget: Math.max(entry.budgeted, 0),
  }));
  const scale = Math.max(
    1,
    ...magnitudes.map(entry => Math.max(entry.activity, entry.budget)),
  );

  return (
    <View
      role="img"
      aria-label={t('Spending and budget over the last 12 months')}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: spacing.xs,
        height: CHART_HEIGHT,
      }}
    >
      {magnitudes.map(entry => (
        <View
          key={entry.month}
          title={t('{{month}}: {{activity}} of {{budget}}', {
            month: monthUtils.format(entry.month, 'MMMM yyyy', locale),
            activity: format(entry.activity, 'financial'),
            budget: format(entry.budget, 'financial'),
          })}
          style={{ flex: 1, height: '100%', position: 'relative' }}
        >
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: (entry.activity / scale) * CHART_HEIGHT,
              backgroundColor: theme.pageTextLight,
              borderRadius: '2px 2px 0 0',
              opacity: 0.55,
            }}
          />
          {entry.budget > 0 && (
            <View
              style={{
                position: 'absolute',
                left: -1,
                right: -1,
                bottom: (entry.budget / scale) * CHART_HEIGHT - TICK_HEIGHT / 2,
                height: TICK_HEIGHT,
                backgroundColor: theme.pageTextDark,
              }}
            />
          )}
        </View>
      ))}
    </View>
  );
}
