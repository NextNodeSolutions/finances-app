import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import * as monthUtils from '@actual-app/core/shared/months';

import { useTrackingSheetValue } from '#components/budget/tracking/TrackingBudgetComponents';
import { PaceGauge } from '#components/common/PaceGauge';
import { useLocale } from '#hooks/useLocale';
import type { useOverspentCategories } from '#hooks/useOverspentCategories';
import { trackingBudget } from '#spreadsheet/bindings';

import { DueThisMonth } from './DueThisMonth';
import { OverBudgetCard } from './OverBudgetCard';
import { PlanActualLists } from './PlanActualLists';
import { RailSection } from './RailSection';
import { SavingsHeadline } from './SavingsHeadline';

type TrackingRailContentProps = {
  month: string;
  overspent: ReturnType<typeof useOverspentCategories>;
};

/**
 * Savings headline, PLAN and ACTUAL, pace, over-budget categories and what
 * is still due. Needs the month's SheetNameProvider and a SchedulesProvider.
 */
export function TrackingRailContent({
  month,
  overspent,
}: TrackingRailContentProps) {
  const locale = useLocale();
  const budgetedExpenses = useTrackingSheetValue(
    trackingBudget.totalBudgetedExpense,
  );
  const spent = useTrackingSheetValue(trackingBudget.totalSpent);

  return (
    <>
      <Text
        style={{ fontSize: 15, fontWeight: 600, color: theme.pageTextDark }}
      >
        {monthUtils.format(month, 'MMMM', locale)}
      </Text>
      <SavingsHeadline month={month} />
      <PlanActualLists month={month} />
      <RailSection>
        <PaceGauge
          spent={-(spent ?? 0)}
          budgeted={budgetedExpenses ?? 0}
          month={month}
        />
      </RailSection>
      <OverBudgetCard month={month} overspent={overspent} />
      <DueThisMonth month={month} />
    </>
  );
}
