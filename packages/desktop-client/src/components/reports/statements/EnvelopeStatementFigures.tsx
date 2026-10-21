import { useSheetValue } from '#hooks/useSheetValue';
import { envelopeBudget } from '#spreadsheet/bindings';

import { StatementFigure } from './StatementFigure';
import { StatementSettledMark } from './StatementSettledMark';

/**
 * Income, spent, saved and to budget of an envelope month. Read from the
 * month's sheet, so it must sit inside its SheetNameProvider.
 */
export function EnvelopeStatementFigures() {
  const income = useSheetValue<'envelope-budget', 'total-income'>(
    envelopeBudget.totalIncome,
  );
  // Spending is stored as a negative total.
  const spent = useSheetValue<'envelope-budget', 'total-spent'>(
    envelopeBudget.totalSpent,
  );
  const toBudget = useSheetValue<'envelope-budget', 'to-budget'>(
    envelopeBudget.toBudget,
  );
  const saved = income === null || spent === null ? null : income + spent;

  return (
    <>
      <StatementFigure value={income} />
      <StatementFigure value={spent} />
      <StatementFigure value={saved} tone="balance" />
      <StatementFigure value={toBudget} tone="balance">
        {toBudget === 0 && <StatementSettledMark />}
      </StatementFigure>
    </>
  );
}
