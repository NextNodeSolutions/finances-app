import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { motion } from '@actual-app/components/tokens';
import * as monthUtils from '@actual-app/core/shared/months';
import type {
  CategoryEntity,
  TransactionEntity,
} from '@actual-app/core/types/models';
import { css } from '@emotion/css';

import { useTransactionPanels } from '#components/transactions/panels/useTransactionPanels';
import { useAccounts } from '#hooks/useAccounts';
import { useCategoriesById } from '#hooks/useCategories';
import { useDisplayPayee } from '#hooks/useDisplayPayee';
import { useLocale } from '#hooks/useLocale';

import { Amount } from './Amount';

type RecentActivityRowProps = {
  transaction: TransactionEntity;
};

const rowClassName = css({
  position: 'relative',
  transition: `background-color ${motion.fast} ${motion.ease}`,
  ':hover': { backgroundColor: theme.tableRowBackgroundHover },
});

// The button's box is stretched over the row, so the whole row opens the
// transaction while the cells stay a readable table.
const openButtonClassName = css({
  ...styles.ellipsisText,
  display: 'block',
  width: '100%',
  padding: 0,
  textAlign: 'left',
  fontWeight: 'inherit',
  color: theme.tableText,
  '&[data-hovered], &[data-pressed]': { backgroundColor: 'transparent' },
  '::after': { content: '""', position: 'absolute', inset: 0 },
  '&[data-focus-visible]': { boxShadow: 'none' },
  '&[data-focus-visible]::after': {
    outline: `2px solid ${theme.focusRing}`,
    outlineOffset: -2,
    borderRadius: 2,
  },
});

/** "20 Oct  Kroger  Food  Bank of America  −84.12". */
export function RecentActivityRow({ transaction }: RecentActivityRowProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { openDetail } = useTransactionPanels();
  const payee = useDisplayPayee({ transaction });
  const { data: accounts = [] } = useAccounts();
  const { data: categories } = useCategoriesById();
  const date = monthUtils.format(transaction.date, 'd MMM', locale);
  const accountName =
    accounts.find(account => account.id === transaction.account)?.name ?? '';
  const categoryName = getCategoryName(
    transaction,
    categories?.list ?? {},
    t('Transfer'),
  );

  return (
    <tr className={rowClassName}>
      <td>
        <Button
          variant="bare"
          className={openButtonClassName}
          aria-label={t('Open transaction: {{payee}}, {{date}}', {
            payee: payee || t('No payee'),
            date: monthUtils.format(transaction.date, 'd MMMM yyyy', locale),
          })}
          onPress={() => openDetail(transaction.id)}
        >
          <Text style={{ ...styles.tnum, color: theme.pageTextSubdued }}>
            {date}
          </Text>
        </Button>
      </td>
      <td style={payee ? undefined : { color: theme.tableTextSubdued }}>
        {payee || t('No payee')}
      </td>
      <td
        style={{
          color:
            categoryName === null ? theme.tableTextSubdued : theme.tableText,
        }}
      >
        {categoryName ?? t('Uncategorized')}
      </td>
      <td style={{ color: theme.pageTextSubdued }}>{accountName}</td>
      <td>
        <Amount value={transaction.amount} tone="balance" />
      </td>
    </tr>
  );
}

// The transfer label, the category's name, or null when uncategorized.
function getCategoryName(
  transaction: TransactionEntity,
  categoriesById: Record<CategoryEntity['id'], CategoryEntity>,
  transferLabel: string,
): string | null {
  if (transaction.transfer_id) {
    return transferLabel;
  }
  if (!transaction.category) {
    return null;
  }
  return categoriesById[transaction.category]?.name ?? '';
}
