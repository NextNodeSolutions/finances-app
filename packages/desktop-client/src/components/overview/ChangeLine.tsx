import { useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useLocale } from '#hooks/useLocale';

import { Amount } from './Amount';
import type { Statement } from './statement';

type ChangeLineProps = {
  statement: Statement;
};

/** "+1,284.10 · +2.7% since 30 Sep 2026", beside the headline. */
export function ChangeLine({ statement }: ChangeLineProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { change, netWorth, sinceMonth } = statement;
  const percent = getChangePercent(change, netWorth);
  const sinceDate = monthUtils.format(
    monthUtils.lastDayOfMonth(sinceMonth),
    'd MMM yyyy',
    locale,
  );

  return (
    <View
      data-testid="overview-net-worth-change"
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
        fontSize: 13,
        color: theme.pageTextSubdued,
      }}
    >
      <Amount value={change} tone="change" />
      {percent !== null && (
        <>
          <Text aria-hidden>·</Text>
          <PrivacyFilter>
            <FinancialText style={{ color: getChangeColor(percent) }}>
              {formatPercent(percent)}
            </FinancialText>
          </PrivacyFilter>
        </>
      )}
      <Text>{t('since {{date}}', { date: sinceDate })}</Text>
    </View>
  );
}

// Relative to the previous month-end; undefined from a zero net worth.
function getChangePercent(
  change: number | null,
  netWorth: number | null,
): number | null {
  if (change === null || netWorth === null) {
    return null;
  }
  const previous = netWorth - change;
  return previous === 0 ? null : (change / Math.abs(previous)) * 100;
}

function formatPercent(percent: number): string {
  const rounded = Math.round(percent * 10) / 10;
  const sign = rounded > 0 ? '+' : rounded < 0 ? '-' : '';
  return `${sign}${Math.abs(rounded).toFixed(1)}%`;
}

function getChangeColor(percent: number): string {
  if (percent > 0) {
    return theme.numberPositive;
  }
  return percent < 0 ? theme.numberNegative : theme.tableTextSubdued;
}
