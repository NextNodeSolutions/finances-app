import { useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type { TransactionEntity } from '@actual-app/core/types/models';

import { useCachedSchedules } from '#hooks/useCachedSchedules';
import { useDisplayPayee } from '#hooks/useDisplayPayee';
import { useLocale } from '#hooks/useLocale';

import { Amount } from './Amount';
import { CARD_GUTTER } from './OverviewCard';

type UpcomingRowProps = {
  transaction: TransactionEntity;
};

/** "23 Oct  Fast Internet  −75.00". */
export function UpcomingRow({ transaction }: UpcomingRowProps) {
  const locale = useLocale();
  const { t } = useTranslation();
  const payee = useDisplayPayee({ transaction });
  const { schedules } = useCachedSchedules();
  const scheduleName = schedules.find(
    schedule => schedule.id === transaction.schedule,
  )?.name;
  const label = payee || scheduleName || t('No payee');

  return (
    <View
      role="listitem"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        height: 32,
        padding: `0 ${CARD_GUTTER}px`,
        borderTop: `1px solid ${theme.tableBorder}`,
        fontSize: 13,
      }}
    >
      <Text
        style={{
          ...styles.tnum,
          width: 48,
          flexShrink: 0,
          fontSize: 12.5,
          color: theme.pageTextSubdued,
        }}
      >
        {monthUtils.format(transaction.date, 'd MMM', locale)}
      </Text>
      <Text
        style={{
          ...styles.ellipsisText,
          flex: 1,
          minWidth: 0,
          color:
            payee || scheduleName ? theme.tableText : theme.tableTextSubdued,
        }}
      >
        {label}
      </Text>
      <Amount value={transaction.amount} tone="balance" />
    </View>
  );
}
