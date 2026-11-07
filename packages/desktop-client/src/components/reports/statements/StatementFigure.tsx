import type { ReactNode } from 'react';

import { theme } from '@actual-app/components/theme';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';

import { statementFigureCellClass } from './statementCellStyles';

type StatementFigureProps = {
  /** Cents; null while the month's sheet has not answered yet. */
  value: number | null | undefined;
  /** `balance` marks a figure below zero. */
  tone?: 'plain' | 'balance';
  /** Hung under the figure, e.g. the settle rule. */
  children?: ReactNode;
};

/** One figure cell of a statement row: mono, tabular, private when asked. */
export function StatementFigure({
  value,
  tone = 'plain',
  children,
}: StatementFigureProps) {
  const format = useFormat();
  const isKnown = value !== null && value !== undefined;
  const isNegative = isKnown && tone === 'balance' && value < 0;

  return (
    <td className={statementFigureCellClass}>
      <span style={{ position: 'relative', display: 'inline-block' }}>
        {isKnown ? (
          <PrivacyFilter>
            <FinancialText
              style={{ color: isNegative ? theme.numberNegative : undefined }}
            >
              {format(value, 'financial')}
            </FinancialText>
          </PrivacyFilter>
        ) : (
          <span style={{ color: theme.tableTextSubdued }}>—</span>
        )}
        {children}
      </span>
    </td>
  );
}
