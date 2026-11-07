import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { prewarmMonth } from '#components/budget/util';
import { useLocale } from '#hooks/useLocale';
import { useLocalPref } from '#hooks/useLocalPref';
import { useNavigate } from '#hooks/useNavigate';
import { SheetNameProvider } from '#hooks/useSheetName';
import { useSpreadsheet } from '#hooks/useSpreadsheet';
import { useSyncedPref } from '#hooks/useSyncedPref';

import { CardAction } from './CardAction';
import { EnvelopeMonthHealth } from './EnvelopeMonthHealth';
import { CARD_GUTTER, OverviewCard } from './OverviewCard';
import { TrackingMonthHealth } from './TrackingMonthHealth';

type MonthHealthCardProps = {
  /** `YYYY-MM`: the current month, or the pinned month when rewound. */
  month: string;
  /** Rewound: the card reads as that month's closed statement. */
  isStatement: boolean;
  hasOnBudgetAccounts: boolean;
};

/**
 * Whether the month is on track, in the budget's own method (envelope or
 * tracking). Rewound, it becomes "{{Month}} statement".
 */
export function MonthHealthCard({
  month,
  isStatement,
  hasOnBudgetAccounts,
}: MonthHealthCardProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const spreadsheet = useSpreadsheet();
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  const [, setBudgetStartMonth] = useLocalPref('budget.startMonth');

  useEffect(() => {
    prewarmMonth(budgetType, spreadsheet, month).catch(() => {
      // Only warms the sheet cache so the figures arrive in one paint; the
      // bindings below load the same values on their own.
    });
  }, [budgetType, spreadsheet, month]);

  const isSameYear =
    monthUtils.getYear(month) === monthUtils.getYear(monthUtils.currentMonth());
  const monthName = monthUtils.format(
    month,
    isSameYear ? 'MMMM' : 'MMMM yyyy',
    locale,
  );
  const title = isStatement
    ? t('{{month}} statement', { month: monthName })
    : monthName;

  const openBudget = () => {
    setBudgetStartMonth(month);
    void navigate('/budget', { state: { month } });
  };

  return (
    <OverviewCard
      title={title}
      testId="overview-month-health"
      action={
        <CardAction onPress={openBudget}>
          <Trans>Open budget</Trans>
        </CardAction>
      }
    >
      <View style={{ padding: `4px ${CARD_GUTTER}px ${CARD_GUTTER}px` }}>
        {hasOnBudgetAccounts ? (
          <SheetNameProvider name={monthUtils.sheetForMonth(month)}>
            {/* Keyed by month so the settle rule only reacts to edits. */}
            {budgetType === 'tracking' ? (
              <TrackingMonthHealth key={month} month={month} />
            ) : (
              <EnvelopeMonthHealth
                key={month}
                month={month}
                isStatement={isStatement}
              />
            )}
          </SheetNameProvider>
        ) : (
          <Text style={{ fontSize: 13, color: theme.pageTextSubdued }}>
            <Trans>
              No on-budget accounts. Budgeting starts when an account is on
              budget.
            </Trans>
          </Text>
        )}
      </View>
    </OverviewCard>
  );
}
