import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { prewarmMonth } from '#components/budget/util';
import { MonthPace } from '#components/mobile/budget/MonthPace';
import { CardAction } from '#components/overview/CardAction';
import { CARD_GUTTER, OverviewCard } from '#components/overview/OverviewCard';
import { useLocale } from '#hooks/useLocale';
import { useLocalPref } from '#hooks/useLocalPref';
import { useNavigate } from '#hooks/useNavigate';
import { SheetNameProvider } from '#hooks/useSheetName';
import { useSpreadsheet } from '#hooks/useSpreadsheet';
import { useSyncedPref } from '#hooks/useSyncedPref';

import { MobileEnvelopeMonthFigures } from './MobileEnvelopeMonthFigures';
import { MobileTrackingMonthFigures } from './MobileTrackingMonthFigures';

type MobileMonthCardProps = {
  /** `YYYY-MM`: the current month, or the rewound one. */
  month: string;
  /** Rewound: the card reads as that month's closed statement. */
  isStatement: boolean;
  hasOnBudgetAccounts: boolean;
};

/**
 * Whether the month is on track, in the budget's own method: its headline
 * figure and the pace of spending. Rewound, it becomes "{{Month}} statement".
 */
export function MobileMonthCard({
  month,
  isStatement,
  hasOnBudgetAccounts,
}: MobileMonthCardProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const navigate = useNavigate();
  const spreadsheet = useSpreadsheet();
  const [budgetTypePref] = useSyncedPref('budgetType');
  const budgetType = budgetTypePref === 'tracking' ? 'tracking' : 'envelope';
  const [, setBudgetStartMonth] = useLocalPref('budget.startMonth');

  useEffect(() => {
    prewarmMonth(budgetType, spreadsheet, month).catch(() => {
      // Only warms the sheet cache so the figures arrive in one paint; the
      // bindings below load the same values on their own.
    });
  }, [budgetType, spreadsheet, month]);

  const title = isStatement
    ? t('{{month}} statement', {
        month: monthUtils.format(month, 'MMMM yyyy', locale),
      })
    : t('This month');

  const openBudget = () => {
    setBudgetStartMonth(month);
    void navigate('/budget');
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
      <View
        style={{
          gap: spacing.md,
          padding: `0 ${CARD_GUTTER}px ${CARD_GUTTER}px`,
        }}
      >
        {hasOnBudgetAccounts ? (
          <SheetNameProvider name={monthUtils.sheetForMonth(month)}>
            {/* Keyed by month so the settle rule only reacts to edits. */}
            {budgetType === 'tracking' ? (
              <MobileTrackingMonthFigures key={month} month={month} />
            ) : (
              <MobileEnvelopeMonthFigures key={month} />
            )}
            <MonthPace month={month} budgetType={budgetType} />
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
