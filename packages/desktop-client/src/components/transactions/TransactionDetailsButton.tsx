import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgInformationOutline } from '@actual-app/components/icons/v1';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import {
  isPreviewId,
  isTemporaryId,
} from '@actual-app/core/shared/transactions';
import type { TransactionEntity } from '@actual-app/core/types/models';

type TransactionDetailsButtonProps = {
  transaction: TransactionEntity;
  onOpenDetails: (id: TransactionEntity['id']) => void;
};

/** The row's hover icon that opens the transaction detail panel. */
export function TransactionDetailsButton({
  transaction,
  onOpenDetails,
}: TransactionDetailsButtonProps) {
  const { t } = useTranslation();

  if (!hasTransactionDetails(transaction)) {
    return null;
  }

  return (
    <Button
      variant="bare"
      aria-label={t('Transaction details')}
      className="hover-visible"
      onPress={() => onOpenDetails(getDetailTransactionId(transaction))}
      style={{
        width: 22,
        height: 22,
        padding: 0,
        borderRadius: radius.sm,
        color: theme.pageTextSubdued,
      }}
    >
      <SvgInformationOutline style={{ width: 13, height: 13 }} />
    </Button>
  );
}

/** Upcoming and unsaved rows have no stored transaction to show. */
export function hasTransactionDetails(transaction: TransactionEntity): boolean {
  return !isPreviewId(transaction.id) && !isTemporaryId(transaction.id);
}

/** A split line opens its parent: the panel edits the whole split. */
export function getDetailTransactionId(
  transaction: TransactionEntity,
): TransactionEntity['id'] {
  return transaction.is_child && transaction.parent_id
    ? transaction.parent_id
    : transaction.id;
}
