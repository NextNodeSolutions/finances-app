import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { q } from '@actual-app/core/shared/query';
import { css } from '@emotion/css';

import { DisplayPayeeProvider } from '#hooks/useDisplayPayee';
import { useNavigate } from '#hooks/useNavigate';
import { useTransactions } from '#hooks/useTransactions';

import { CardAction } from './CardAction';
import { CARD_GUTTER, OverviewCard } from './OverviewCard';
import { RecentActivityRow } from './RecentActivityRow';
import { Skeleton } from './Skeleton';

const ROW_COUNT = 8;

const tableClassName = css({
  width: '100%',
  tableLayout: 'fixed',
  borderCollapse: 'collapse',
  fontSize: 13,
  color: theme.tableText,
  '& th, & td': {
    height: 32,
    padding: `0 ${CARD_GUTTER / 2}px`,
    textAlign: 'left',
    fontWeight: 'inherit',
    borderBottom: `1px solid ${theme.tableBorder}`,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  '& th:first-child, & td:first-child': { paddingLeft: CARD_GUTTER },
  '& th:last-child, & td:last-child': {
    paddingRight: CARD_GUTTER,
    textAlign: 'right',
  },
  '& tbody tr:last-child > *': { borderBottom: 'none' },
  '& thead th': {
    ...styles.monoLabel,
    height: 36,
    color: theme.tableHeaderText,
    backgroundColor: theme.tableHeaderBackground,
  },
});

/**
 * The latest transactions on on-budget accounts, read-only; a row opens
 * the transaction's details.
 */
export function RecentActivity() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // The query is subscribed to, so it keeps one identity for the mount.
  const [query] = useState(() =>
    q('transactions')
      .filter({ 'account.offbudget': false, is_parent: false })
      .orderBy({ date: 'desc' })
      .select('*')
      .options({ splits: 'inline' }),
  );
  const { transactions, isPending } = useTransactions({
    query,
    options: { pageSize: ROW_COUNT },
  });
  const recent = transactions.slice(0, ROW_COUNT);

  return (
    <OverviewCard
      title={<Trans>Recent activity</Trans>}
      testId="overview-recent-activity"
      action={
        <CardAction onPress={() => navigate('/accounts')}>
          <Trans>All accounts</Trans>
        </CardAction>
      }
    >
      {!isPending && recent.length === 0 ? (
        <Text
          style={{
            padding: `4px ${CARD_GUTTER}px ${CARD_GUTTER}px`,
            fontSize: 13,
            color: theme.pageTextSubdued,
          }}
        >
          <Trans>No transactions on budget accounts yet.</Trans>
        </Text>
      ) : (
        <DisplayPayeeProvider transactions={recent}>
          <table className={tableClassName}>
            <caption style={styles.visuallyHidden}>
              {t('The {{count}} latest transactions', { count: ROW_COUNT })}
            </caption>
            <colgroup>
              <col style={{ width: 64 + CARD_GUTTER }} />
              <col />
              <col style={{ width: '22%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: 120 + CARD_GUTTER }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">
                  <Trans>Date</Trans>
                </th>
                <th scope="col">
                  <Trans>Payee</Trans>
                </th>
                <th scope="col">
                  <Trans>Category</Trans>
                </th>
                <th scope="col">
                  <Trans>Account</Trans>
                </th>
                <th scope="col">
                  <Trans>Amount</Trans>
                </th>
              </tr>
            </thead>
            <tbody>
              {isPending
                ? Array.from({ length: ROW_COUNT }, (_, index) => (
                    <tr key={index}>
                      <td colSpan={5}>
                        <Skeleton height={16} />
                      </td>
                    </tr>
                  ))
                : recent.map(transaction => (
                    <RecentActivityRow
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
            </tbody>
          </table>
        </DisplayPayeeProvider>
      )}
    </OverviewCard>
  );
}
