import { Trans } from 'react-i18next';

import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { PaceGauge } from '#components/common/PaceGauge';
import { useOverspentCategories } from '#hooks/useOverspentCategories';
import { useSheetValue } from '#hooks/useSheetValue';
import { trackingBudget } from '#spreadsheet/bindings';

import { Amount } from './Amount';
import { HealthRow } from './HealthRow';
import { OfAmount } from './OfAmount';
import { OverspentFigure } from './OverspentFigure';

type TrackingMonthHealthProps = {
  month: string;
};

/**
 * A tracking month in a few lines: the savings headline (projected for the
 * current and future months, actual for past ones), income and spending
 * against the plan, and the categories over budget. Must sit inside the
 * month's SheetNameProvider.
 */
export function TrackingMonthHealth({ month }: TrackingMonthHealthProps) {
  const budgetedExpense = useSheetValue<'tracking-budget', 'total-budgeted'>(
    trackingBudget.totalBudgetedExpense,
  );
  const budgetedIncome = useSheetValue<
    'tracking-budget',
    'total-budget-income'
  >(trackingBudget.totalBudgetedIncome);
  const plannedSaving = useSheetValue<'tracking-budget', 'total-saved'>(
    trackingBudget.totalBudgetedSaved,
  );
  const totalIncome = useSheetValue<'tracking-budget', 'total-income'>(
    trackingBudget.totalIncome,
  );
  const totalSpent = useSheetValue<'tracking-budget', 'total-spent'>(
    trackingBudget.totalSpent,
  );
  const totalSaved = useSheetValue<'tracking-budget', 'real-saved'>(
    trackingBudget.totalSaved,
  );
  const { amountsByCategory, totalAmount } = useOverspentCategories({ month });

  const currentMonth = monthUtils.currentMonth();
  const isPast = month < currentMonth;
  // Spending is stored as a negative total.
  const spent = totalSpent === null ? null : -totalSpent;

  return (
    <View style={{ gap: spacing.md }}>
      {isPast ? (
        <HealthRow
          label={
            totalSaved !== null && totalSaved < 0 ? (
              <Trans>Overspent</Trans>
            ) : (
              <Trans>Saved</Trans>
            )
          }
          testId="overview-savings"
        >
          <Amount value={totalSaved} tone="balance" />
        </HealthRow>
      ) : (
        <HealthRow
          label={<Trans>Projected savings</Trans>}
          testId="overview-savings"
        >
          <Amount value={plannedSaving} tone="balance" />
        </HealthRow>
      )}
      <HealthRow label={<Trans>Received</Trans>}>
        <OfAmount value={totalIncome} of={budgetedIncome} />
      </HealthRow>
      <View style={{ gap: spacing.sm }}>
        <HealthRow label={<Trans>Spent</Trans>}>
          <OfAmount value={spent} of={budgetedExpense} />
        </HealthRow>
        <PaceGauge
          spent={Math.max(0, spent ?? 0)}
          budgeted={Math.max(0, budgetedExpense ?? 0)}
          month={month}
        />
      </View>
      {month === currentMonth && (
        <HealthRow label={<Trans>Saved so far</Trans>}>
          <Amount value={totalSaved} tone="balance" />
        </HealthRow>
      )}
      {amountsByCategory.size > 0 && (
        <HealthRow label={<Trans>Over budget</Trans>}>
          <OverspentFigure
            count={amountsByCategory.size}
            amount={totalAmount}
          />
        </HealthRow>
      )}
    </View>
  );
}
