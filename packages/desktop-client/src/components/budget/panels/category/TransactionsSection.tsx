import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import { q } from '@actual-app/core/shared/query';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { Amount } from '#components/budget/Amount';
import { useShowCategoryActivity } from '#components/budget/useShowCategoryActivity';
import { useAccounts } from '#hooks/useAccounts';
import { useCategoryPreviewTransactions } from '#hooks/useCategoryPreviewTransactions';
import { useLocale } from '#hooks/useLocale';
import { usePayeesById } from '#hooks/usePayees';
import { useTransactions } from '#hooks/useTransactions';

import { PanelSection } from './PanelSection';

type TransactionsSectionProps = {
  categoryId: CategoryEntity['id'];
  month: string;
};

const ROWS_SHOWN = 8;

/**
 * The month's transactions in the category, upcoming ones first. Needs a
 * SchedulesProvider above it.
 */
export function TransactionsSection({
  categoryId,
  month,
}: TransactionsSectionProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const showActivity = useShowCategoryActivity();
  const { data: payeesById = {} } = usePayeesById();
  const { data: accounts = [] } = useAccounts();
  const [query] = useState(() =>
    q('transactions')
      .options({ splits: 'inline' })
      .filter({
        category: categoryId,
        date: { $transform: '$month', $eq: month },
      })
      .select('*'),
  );
  const { transactions, hasNextPage, isPending } = useTransactions({
    query,
    options: { pageSize: ROWS_SHOWN },
  });
  const { previewTransactions } = useCategoryPreviewTransactions({
    categoryId,
    month,
  });
  const rows = [...previewTransactions, ...transactions].slice(0, ROWS_SHOWN);
  const hasMore =
    hasNextPage ||
    previewTransactions.length + transactions.length > ROWS_SHOWN;

  return (
    <PanelSection label={t('This month')}>
      {!isPending && rows.length === 0 && (
        <Text style={{ color: theme.pageTextSubdued }}>
          <Trans>No transactions this month.</Trans>
        </Text>
      )}
      {rows.map(transaction => (
        <View
          key={transaction.id}
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: spacing.sm,
            fontSize: 12.5,
            color: transaction.schedule
              ? theme.pageTextSubdued
              : theme.pageText,
          }}
        >
          <Text
            style={{ width: 44, flexShrink: 0, color: theme.pageTextSubdued }}
          >
            {monthUtils.format(transaction.date, 'd MMM', locale)}
          </Text>
          <Text
            style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {(transaction.payee && payeesById[transaction.payee]?.name) ?? ''}
            <Text style={{ color: theme.pageTextSubdued }}>
              {' '}
              {
                accounts.find(account => account.id === transaction.account)
                  ?.name
              }
            </Text>
          </Text>
          <Amount value={transaction.amount} />
        </View>
      ))}
      {(hasMore || rows.length > 0) && (
        <View style={{ alignItems: 'flex-start' }}>
          <Button
            variant="bare"
            onPress={() => showActivity(categoryId, month)}
            style={{ color: theme.pageTextLink, padding: 0 }}
          >
            <Trans>View all in register ›</Trans>
          </Button>
        </View>
      )}
    </PanelSection>
  );
}
