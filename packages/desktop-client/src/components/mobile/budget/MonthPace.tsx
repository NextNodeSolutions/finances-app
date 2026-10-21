import { PaceGauge } from '#components/common/PaceGauge';
import { useSheetValue } from '#hooks/useSheetValue';
import { envelopeBudget, trackingBudget } from '#spreadsheet/bindings';

type MonthPaceProps = {
  month: string;
  budgetType: 'envelope' | 'tracking';
};

/**
 * The month's spending against its plan, with the share of the month gone.
 * Reads the month's sheet, so it sits inside its SheetNameProvider.
 */
export function MonthPace({ month, budgetType }: MonthPaceProps) {
  const isTracking = budgetType === 'tracking';
  const totalSpent = useSheetValue<
    'envelope-budget' | 'tracking-budget',
    'total-spent'
  >(isTracking ? trackingBudget.totalSpent : envelopeBudget.totalSpent);
  const totalBudgeted = useSheetValue<
    'envelope-budget' | 'tracking-budget',
    'total-budgeted'
  >(
    isTracking
      ? trackingBudget.totalBudgetedExpense
      : envelopeBudget.totalBudgeted,
  );

  // Spending is stored negative; envelope stores its budgeted total negative
  // too, tracking its budgeted expenses positive.
  const spent = -(totalSpent ?? 0);
  const budgeted = isTracking ? (totalBudgeted ?? 0) : -(totalBudgeted ?? 0);

  return (
    <PaceGauge
      spent={Math.max(0, spent)}
      budgeted={Math.max(0, budgeted)}
      month={month}
    />
  );
}
