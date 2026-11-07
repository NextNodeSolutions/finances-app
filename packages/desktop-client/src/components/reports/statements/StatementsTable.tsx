import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { useSyncedPref } from '#hooks/useSyncedPref';

import { STATEMENT_TABLE_MIN_WIDTH } from './statementLayout';
import { StatementRow } from './StatementRow';
import { StatementSkeletonRows } from './StatementSkeletonRows';
import { StatementsTableHead } from './StatementsTableHead';
import { useStatementMonths } from './useStatementMonths';
import { useStatementNetWorth } from './useStatementNetWorth';
import { useStatementNotes } from './useStatementNotes';

const tableClass = css({
  width: '100%',
  minWidth: STATEMENT_TABLE_MIN_WIDTH,
  borderCollapse: 'collapse',
  tableLayout: 'fixed',
});

/** The month-by-month statement archive, newest first. Read only. */
export function StatementsTable() {
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  const { isLoading, months, hasMore, showMore } = useStatementMonths();
  const notes = useStatementNotes(months);
  const { netWorthByMonth } = useStatementNetWorth(months.length);
  const isEmpty = !isLoading && months.length === 0;

  return (
    <View
      data-testid="statements-table"
      style={{ ...styles.tableContainer, flex: '0 1 auto', overflowX: 'auto' }}
    >
      <table className={tableClass}>
        <StatementsTableHead budgetType={budgetType} />
        <tbody>
          {isLoading ? (
            <StatementSkeletonRows />
          ) : (
            months.map(month => (
              <StatementRow
                key={month}
                month={month}
                budgetType={budgetType}
                netWorth={netWorthByMonth.get(month)}
                note={notes.get(month)}
              />
            ))
          )}
        </tbody>
      </table>
      {isEmpty && (
        <Text
          style={{
            padding: spacing.xl,
            fontSize: 13,
            color: theme.pageTextSubdued,
          }}
        >
          <Trans>
            No statements yet. A month is listed once it has transactions.
          </Trans>
        </Text>
      )}
      {hasMore && (
        <View
          style={{
            alignItems: 'flex-end',
            padding: spacing.sm,
            borderTop: `1px solid ${theme.hairlineSubtle}`,
          }}
        >
          <Button variant="bare" onPress={showMore}>
            <Trans>Show 12 more</Trans>
          </Button>
        </View>
      )}
    </View>
  );
}
