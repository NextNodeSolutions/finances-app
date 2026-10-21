import { useSheetValue } from '#hooks/useSheetValue';
import { trackingBudget } from '#spreadsheet/bindings';

import { StatementFigure } from './StatementFigure';

/**
 * Income, spent, saved and planned saving of a tracking month. Read from
 * the month's sheet, so it must sit inside its SheetNameProvider.
 */
export function TrackingStatementFigures() {
  const income = useSheetValue<'tracking-budget', 'total-income'>(
    trackingBudget.totalIncome,
  );
  // Spending is stored as a negative total.
  const spent = useSheetValue<'tracking-budget', 'total-spent'>(
    trackingBudget.totalSpent,
  );
  const saved = useSheetValue<'tracking-budget', 'real-saved'>(
    trackingBudget.totalSaved,
  );
  const plannedSaving = useSheetValue<'tracking-budget', 'total-saved'>(
    trackingBudget.totalBudgetedSaved,
  );

  return (
    <>
      <StatementFigure value={income} />
      <StatementFigure value={spent} />
      <StatementFigure value={saved} tone="balance" />
      <StatementFigure value={plannedSaving} />
    </>
  );
}
