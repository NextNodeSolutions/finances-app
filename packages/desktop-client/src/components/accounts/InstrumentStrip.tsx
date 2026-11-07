import { useTranslation } from 'react-i18next';

import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import {
  DEFAULT_UPCOMING_SCHEDULE_DAYS,
  getUpcomingDays,
} from '@actual-app/core/shared/schedules';
import type {
  AccountEntity,
  TransactionEntity,
} from '@actual-app/core/types/models';

import { useSelectedItems } from '#hooks/useSelected';
import { useSyncedPref } from '#hooks/useSyncedPref';

import { SelectedReading } from './SelectedReading';
import { StripReading } from './StripReading';
import { useClearedBalances } from './useClearedBalances';
import type { BalanceQuery } from './useClearedBalances';

type InstrumentStripProps = {
  balanceQuery: BalanceQuery;
  account?: AccountEntity;
  /** The upcoming (preview) transactions the register already loaded. */
  upcomingTransactions: readonly TransactionEntity[];
  isFiltered: boolean;
  filteredAmount?: number | null;
};

/**
 * The always-visible mono readings under the headline balance: cleared,
 * uncleared and upcoming, plus the selection and filter sums when they apply.
 */
export function InstrumentStrip({
  balanceQuery,
  account,
  upcomingTransactions,
  isFiltered,
  filteredAmount,
}: InstrumentStripProps) {
  const { t } = useTranslation();
  const selectedItems = useSelectedItems();
  const { cleared, uncleared } = useClearedBalances(balanceQuery);
  const [upcomingLength = DEFAULT_UPCOMING_SCHEDULE_DAYS] = useSyncedPref(
    'upcomingScheduledTransactionLength',
  );
  const upcomingDays = getUpcomingDays(upcomingLength);
  // Split children repeat their parent's amount; count each preview once.
  const upcomingAmount = upcomingTransactions
    .filter(transaction => !transaction.is_child)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <View
      role="group"
      aria-label={t('Balances')}
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        columnGap: spacing.xl,
        rowGap: spacing.xs,
      }}
    >
      <StripReading
        label={t('Cleared')}
        amount={cleared ?? 0}
        testId="account-balance-cleared"
      />
      <StripReading
        label={t('Uncleared')}
        amount={uncleared ?? 0}
        testId="account-balance-uncleared"
      />
      <StripReading
        label={t('Upcoming · {{count}} days', { count: upcomingDays })}
        amount={upcomingAmount}
        testId="account-balance-upcoming"
      />
      {selectedItems.size > 0 && (
        <SelectedReading selectedItems={selectedItems} account={account} />
      )}
      {isFiltered && (
        <StripReading
          label={t('Filtered')}
          amount={filteredAmount ?? 0}
          testId="account-balance-filtered"
        />
      )}
    </View>
  );
}
