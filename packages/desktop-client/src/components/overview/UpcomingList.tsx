import { Trans } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { DisplayPayeeProvider } from '#hooks/useDisplayPayee';
import { usePreviewTransactions } from '#hooks/usePreviewTransactions';

import { Amount } from './Amount';
import { HealthRow } from './HealthRow';
import { CARD_GUTTER } from './OverviewCard';
import { Skeleton } from './Skeleton';
import { UpcomingRow } from './UpcomingRow';

const MAX_ROWS = 5;

/** The next scheduled transactions, oldest first, and what goes out. */
export function UpcomingList() {
  const { previewTransactions, isLoading } = usePreviewTransactions();
  const today = monthUtils.currentDay();
  // Previews come newest first and include missed ones (Attention lists
  // those) and the children of split schedules.
  const upcoming = previewTransactions
    .filter(transaction => !transaction.is_child && transaction.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const shown = upcoming.slice(0, MAX_ROWS);
  const moreCount = upcoming.length - shown.length;
  const totalOut = upcoming
    .filter(transaction => transaction.amount < 0)
    .reduce((total, transaction) => total + transaction.amount, 0);

  if (isLoading) {
    return (
      <View style={{ gap: spacing.sm, padding: `4px ${CARD_GUTTER}px 20px` }}>
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} height={20} />
        ))}
      </View>
    );
  }

  if (upcoming.length === 0) {
    return (
      <Text
        style={{
          padding: `4px ${CARD_GUTTER}px ${CARD_GUTTER}px`,
          fontSize: 13,
          color: theme.pageTextSubdued,
        }}
      >
        <Trans>Nothing scheduled in this window.</Trans>
      </Text>
    );
  }

  return (
    <DisplayPayeeProvider transactions={shown}>
      <View role="list">
        {shown.map(transaction => (
          <UpcomingRow key={transaction.id} transaction={transaction} />
        ))}
      </View>
      <View
        style={{
          gap: spacing.sm,
          padding: `${spacing.md}px ${CARD_GUTTER}px ${spacing.lg}px`,
          borderTop: `1px solid ${theme.tableBorder}`,
        }}
      >
        {moreCount > 0 && (
          <Text style={{ fontSize: 12.5, color: theme.pageTextSubdued }}>
            <Trans count={moreCount}>and {{ count: moreCount }} more</Trans>
          </Text>
        )}
        <HealthRow label={<Trans>Out</Trans>} testId="overview-upcoming-out">
          <Amount value={totalOut} tone="balance" />
        </HealthRow>
      </View>
    </DisplayPayeeProvider>
  );
}
