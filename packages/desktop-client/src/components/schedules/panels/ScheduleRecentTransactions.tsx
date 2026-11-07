import { useMemo } from 'react';
import { Trans } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { q } from '@actual-app/core/shared/query';
import type { ScheduleEntity } from '@actual-app/core/types/models';

import { useTransactionPanels } from '#components/transactions/panels/useTransactionPanels';
import { useTransactions } from '#hooks/useTransactions';

import { SchedulePanelSection } from './SchedulePanelSection';
import { ScheduleRecentRow } from './ScheduleRecentRow';

const RECENT_COUNT = 5;

type ScheduleRecentTransactionsProps = {
  scheduleId: ScheduleEntity['id'];
};

/** The last five transactions linked to the schedule. */
export function ScheduleRecentTransactions({
  scheduleId,
}: ScheduleRecentTransactionsProps) {
  const transactionPanels = useTransactionPanels();
  // useTransactions refetches whenever the query identity changes.
  const query = useMemo(
    () =>
      q('transactions')
        .filter({ schedule: scheduleId })
        .orderBy({ date: 'desc' })
        .select('*')
        .options({ splits: 'none' }),
    [scheduleId],
  );
  const { transactions, isPending } = useTransactions({
    query,
    options: { pageSize: RECENT_COUNT },
  });
  const recent = transactions.slice(0, RECENT_COUNT);

  return (
    <SchedulePanelSection label={<Trans>Recent</Trans>}>
      {isPending ? (
        <View
          aria-hidden
          style={{
            height: 18,
            width: '80%',
            borderRadius: 4,
            backgroundColor: theme.tableRowBackgroundHover,
          }}
        />
      ) : recent.length === 0 ? (
        <Text style={{ color: theme.pageTextSubdued }}>
          <Trans>No transactions are linked to this schedule yet.</Trans>
        </Text>
      ) : (
        <View>
          {recent.map(transaction => (
            <ScheduleRecentRow
              key={transaction.id}
              transaction={transaction}
              onOpen={() => transactionPanels.openDetail(transaction.id)}
            />
          ))}
        </View>
      )}
    </SchedulePanelSection>
  );
}
