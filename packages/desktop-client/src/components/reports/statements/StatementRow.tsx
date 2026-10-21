import { useEffect } from 'react';

import { theme } from '@actual-app/components/theme';
import * as monthUtils from '@actual-app/core/shared/months';
import type { SyncedPrefs } from '@actual-app/core/types/prefs';
import { css } from '@emotion/css';

import { prewarmMonth } from '#components/budget/util';
import { useLocalPref } from '#hooks/useLocalPref';
import { useNavigate } from '#hooks/useNavigate';
import { SheetNameProvider } from '#hooks/useSheetName';
import { useSpreadsheet } from '#hooks/useSpreadsheet';

import { EnvelopeStatementFigures } from './EnvelopeStatementFigures';
import { statementNoteCellClass } from './statementCellStyles';
import { StatementFigure } from './StatementFigure';
import { StatementMonthCell } from './StatementMonthCell';
import { StatementRowMenu } from './StatementRowMenu';
import { TrackingStatementFigures } from './TrackingStatementFigures';

const rowClass = css({
  cursor: 'pointer',
  '&:hover': { backgroundColor: theme.tableRowBackgroundHover },
});

type StatementRowProps = {
  month: string;
  budgetType: SyncedPrefs['budgetType'];
  netWorth: number | undefined;
  note: string | undefined;
};

/** One month of the statement archive, read from that month's sheet. */
export function StatementRow({
  month,
  budgetType,
  netWorth,
  note,
}: StatementRowProps) {
  const spreadsheet = useSpreadsheet();
  const navigate = useNavigate();
  const [, setBudgetStartMonth] = useLocalPref('budget.startMonth');

  useEffect(() => {
    // Only warms the sheet cache so the row's figures arrive in one paint;
    // the bindings load the same values on their own if this fails.
    prewarmMonth(budgetType, spreadsheet, month).catch(() => null);
  }, [budgetType, spreadsheet, month]);

  const openBudget = () => {
    setBudgetStartMonth(month);
    void navigate('/budget', { state: { month } });
  };

  return (
    <SheetNameProvider name={monthUtils.sheetForMonth(month)}>
      <tr
        className={rowClass}
        data-testid={`statement-row-${month}`}
        onClick={openBudget}
      >
        <StatementMonthCell month={month} onOpen={openBudget} />
        {budgetType === 'tracking' ? (
          <TrackingStatementFigures />
        ) : (
          <EnvelopeStatementFigures />
        )}
        <StatementFigure value={netWorth} />
        <td className={statementNoteCellClass} title={note}>
          {note ?? '—'}
        </td>
        <StatementRowMenu month={month} />
      </tr>
    </SheetNameProvider>
  );
}
