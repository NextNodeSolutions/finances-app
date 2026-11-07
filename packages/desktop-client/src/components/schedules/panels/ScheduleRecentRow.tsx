import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import * as monthUtils from '@actual-app/core/shared/months';
import type { TransactionEntity } from '@actual-app/core/types/models';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useAccount } from '#hooks/useAccount';
import { useDateFormat } from '#hooks/useDateFormat';
import { useFormat } from '#hooks/useFormat';

type ScheduleRecentRowProps = {
  transaction: TransactionEntity;
  onOpen: () => void;
};

/** One linked transaction: date, account and amount. Opens its details. */
export function ScheduleRecentRow({
  transaction,
  onOpen,
}: ScheduleRecentRowProps) {
  const format = useFormat();
  const dateFormat = useDateFormat() || 'MM/dd/yyyy';
  const account = useAccount(transaction.account);
  const date = monthUtils.format(transaction.date, dateFormat);

  return (
    <Button
      variant="bare"
      onPress={onOpen}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: spacing.md,
        minHeight: 32,
        padding: '0 6px',
        margin: '0 -6px',
        borderBottom: `1px solid ${theme.tableBorder}`,
        borderRadius: 0,
        textAlign: 'left',
      }}
    >
      <Text style={{ ...styles.tnum, fontSize: 12.5, flexShrink: 0 }}>
        {date}
      </Text>
      <Text
        style={{
          ...styles.ellipsisText,
          flex: 1,
          minWidth: 0,
          color: theme.pageTextSubdued,
        }}
      >
        {account?.name}
      </Text>
      <FinancialText
        style={{
          flexShrink: 0,
          color:
            transaction.amount > 0 ? theme.numberPositive : theme.tableText,
        }}
      >
        <PrivacyFilter>{format(transaction.amount, 'financial')}</PrivacyFilter>
      </FinancialText>
    </Button>
  );
}
