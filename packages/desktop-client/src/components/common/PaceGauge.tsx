import { useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import { getDaysInMonth, parseISO } from 'date-fns';

type PaceGaugeProps = {
  /** Amount spent so far, as a positive number of cents. */
  spent: number;
  /** Amount budgeted for the month, as a positive number of cents. */
  budgeted: number;
  /** `YYYY-MM`. Past months count as fully elapsed. */
  month: string;
};

const BAR_HEIGHT = 6;
const TICK_HEIGHT = 14;

/**
 * Spent against budgeted for one month, with a tick at the share of the
 * month already gone, and the same comparison in words.
 */
export function PaceGauge({ spent, budgeted, month }: PaceGaugeProps) {
  const { t } = useTranslation();
  const elapsedShare = getElapsedShare(month);
  const spentShare = budgeted > 0 ? spent / budgeted : null;
  const isOverBudget = spentShare !== null && spentShare > 1;
  const elapsedPercent = Math.round(elapsedShare * 100);

  const sentence =
    spentShare === null
      ? t('Nothing budgeted · {{elapsed}}% of the month gone', {
          elapsed: elapsedPercent,
        })
      : t('{{spent}}% spent · {{elapsed}}% of the month gone', {
          spent: Math.round(spentShare * 100),
          elapsed: elapsedPercent,
        });

  return (
    <View style={{ gap: spacing.sm }}>
      <View
        aria-hidden
        style={{ height: TICK_HEIGHT, justifyContent: 'center' }}
      >
        <View
          style={{
            height: BAR_HEIGHT,
            borderRadius: radius.pill,
            backgroundColor: theme.tableRowBackgroundHover,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: toPercent(Math.min(spentShare ?? 0, 1)),
              height: '100%',
              borderRadius: radius.pill,
              backgroundColor: isOverBudget
                ? theme.numberNegative
                : theme.pageTextDark,
            }}
          />
        </View>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: toPercent(elapsedShare),
            width: 2,
            height: TICK_HEIGHT,
            marginLeft: -1,
            borderRadius: 1,
            backgroundColor: theme.pageTextSubdued,
          }}
        />
      </View>
      <Text
        style={{
          ...styles.tnum,
          fontSize: 12,
          color: isOverBudget ? theme.numberNegative : theme.pageTextSubdued,
        }}
      >
        {sentence}
      </Text>
    </View>
  );
}

function getElapsedShare(month: string): number {
  const currentMonth = monthUtils.currentMonth();
  if (monthUtils.isBefore(month, currentMonth)) {
    return 1;
  }
  if (monthUtils.isAfter(month, currentMonth)) {
    return 0;
  }
  const today = monthUtils.currentDay();
  return monthUtils.getDay(today) / getDaysInMonth(parseISO(`${month}-01`));
}

function toPercent(share: number): string {
  return `${share * 100}%`;
}
