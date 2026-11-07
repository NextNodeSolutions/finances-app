import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { css } from '@emotion/css';

import {
  STATEMENT_FIGURE_WIDTH,
  STATEMENT_MENU_WIDTH,
  STATEMENT_MONTH_WIDTH,
  STATEMENT_ROW_HEIGHT,
} from './statementLayout';

const cellBase = {
  height: STATEMENT_ROW_HEIGHT,
  padding: `0 ${spacing.md}px`,
  borderTop: `1px solid ${theme.hairlineSubtle}`,
  verticalAlign: 'middle',
  fontSize: 13,
  color: theme.tableText,
} as const;

/** Column heads: mono labels on the table header band. */
export const statementHeadCellClass = css({
  ...styles.monoLabel,
  height: 34,
  padding: `0 ${spacing.md}px`,
  textAlign: 'left',
  color: theme.tableHeaderText,
  whiteSpace: 'nowrap',
});

export const statementHeadFigureCellClass = css({ textAlign: 'right' });

export const statementMonthCellClass = css({
  ...cellBase,
  width: STATEMENT_MONTH_WIDTH,
  textAlign: 'left',
  fontWeight: 400,
  whiteSpace: 'nowrap',
});

export const statementFigureCellClass = css({
  ...cellBase,
  ...styles.tnum,
  width: STATEMENT_FIGURE_WIDTH,
  textAlign: 'right',
  whiteSpace: 'nowrap',
});

export const statementNoteCellClass = css({
  ...cellBase,
  maxWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: theme.pageTextLight,
});

export const statementMenuCellClass = css({
  ...cellBase,
  width: STATEMENT_MENU_WIDTH,
  padding: `0 ${spacing.xs}px`,
  textAlign: 'right',
});
