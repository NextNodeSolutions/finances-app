import { Trans, useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import * as monthUtils from '@actual-app/core/shared/months';
import { css } from '@emotion/css';

import type { SidebarAccountTree } from '#components/sidebar/redesign/useSidebarAccountTree';
import { useLocale } from '#hooks/useLocale';

import { Amount } from './Amount';
import { buildBalanceSheetRows } from './balanceSheetRows';
import { HoldingsRow } from './HoldingsRow';
import { CARD_GUTTER, OverviewCard } from './OverviewCard';
import type { Statement } from './statement';
import { SubtotalRow } from './SubtotalRow';

type BalanceSheetProps = {
  tree: SidebarAccountTree;
  statement: Statement;
};

const ROW_HEIGHT = 32;
const BALANCE_WIDTH = 132;
const CHANGE_WIDTH = 120;

const tableClassName = css({
  width: '100%',
  tableLayout: 'fixed',
  borderCollapse: 'collapse',
  fontSize: 13,
  color: theme.tableText,
  '& th, & td': {
    height: ROW_HEIGHT,
    padding: 0,
    textAlign: 'left',
    fontWeight: 'inherit',
    borderBottom: `1px solid ${theme.tableBorder}`,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  '& th:not(:first-child), & td:not(:first-child)': {
    textAlign: 'right',
  },
  '& th:last-child, & td:last-child': {
    paddingRight: CARD_GUTTER,
  },
  '& tbody tr:last-child > *': { borderBottom: 'none' },
  '& thead th': {
    ...styles.monoLabel,
    height: 36,
    color: theme.tableHeaderText,
    backgroundColor: theme.tableHeaderBackground,
  },
  '& tfoot th, & tfoot td': {
    height: 40,
    borderTop: `1px solid ${theme.hairlineStrong}`,
    borderBottom: 'none',
  },
});

/**
 * Every account at the statement date, grouped as in the sidebar, with its
 * change since the previous month-end and the net worth total.
 */
export function BalanceSheet({ tree, statement }: BalanceSheetProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const rows = buildBalanceSheetRows(tree, statement, {
    onBudget: t('On budget'),
    offBudget: t('Off budget'),
    closed: t('Closed'),
  });
  const sinceDate = monthUtils.format(
    monthUtils.lastDayOfMonth(statement.sinceMonth),
    'd MMM',
    locale,
  );

  return (
    <OverviewCard
      title={<Trans>Balance sheet</Trans>}
      testId="overview-balance-sheet"
    >
      <table className={tableClassName}>
        <caption style={styles.visuallyHidden}>
          {t('Account balances and change since {{date}}', {
            date: sinceDate,
          })}
        </caption>
        <colgroup>
          <col />
          <col style={{ width: BALANCE_WIDTH }} />
          <col style={{ width: CHANGE_WIDTH + CARD_GUTTER }} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" style={{ paddingLeft: CARD_GUTTER }}>
              <Trans>Account</Trans>
            </th>
            <th scope="col">
              <Trans>Balance</Trans>
            </th>
            <th scope="col">{t('Since {{date}}', { date: sinceDate })}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row =>
            row.kind === 'subtotal' ? (
              <SubtotalRow key={row.key} row={row} />
            ) : (
              <HoldingsRow key={row.key} row={row} />
            ),
          )}
        </tbody>
        <tfoot>
          <tr>
            <th
              scope="row"
              style={{
                ...styles.monoLabel,
                paddingLeft: CARD_GUTTER,
                color: theme.pageTextDark,
              }}
            >
              <Trans>Net worth</Trans>
            </th>
            <td>
              <Amount
                value={statement.netWorth}
                tone="balance"
                style={{ fontWeight: 600 }}
              />
            </td>
            <td>
              <Amount
                value={statement.change === 0 ? null : statement.change}
                tone="change"
                style={{ fontWeight: 600 }}
              />
            </td>
          </tr>
        </tfoot>
      </table>
    </OverviewCard>
  );
}
