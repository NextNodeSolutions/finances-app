import { Trans, useTranslation } from 'react-i18next';

import { SvgAdd } from '@actual-app/components/icons/v1';
import { Text } from '@actual-app/components/text';
import * as monthUtils from '@actual-app/core/shared/months';

import { FinancialText } from '#components/FinancialText';
import { useTransactionPanels } from '#components/transactions/panels/useTransactionPanels';
import { useFormat } from '#hooks/useFormat';
import { usePayees } from '#hooks/usePayees';

import type { PaletteSection } from './paletteTypes';
import { parseAmountQuery } from './parseAmountQuery';
import { useDefaultTransactionAccountId } from './useDefaultTransactionAccountId';

/**
 * Amount-first entry: a query like `42.18 Kroger` offers a new transaction
 * with that amount and payee, ready to review before saving. Null when the
 * query does not start with an amount.
 */
export function usePaletteNewTransaction(query: string): PaletteSection | null {
  const { t } = useTranslation();
  const format = useFormat();
  const transactionPanels = useTransactionPanels();
  const defaultAccountId = useDefaultTransactionAccountId();
  const { data: payees = [] } = usePayees();

  const entry = parseAmountQuery(query, format.currency.decimalPlaces);
  if (!entry) {
    return null;
  }

  const typedName = entry.payeeName.toLowerCase();
  const payee = payees.find(
    candidate =>
      !candidate.transfer_acct && candidate.name.toLowerCase() === typedName,
  );
  const payeeName = payee?.name ?? entry.payeeName;
  const amount = format(entry.amount, 'financial');

  return {
    key: 'new-transaction',
    items: [
      {
        id: 'new-transaction',
        name: `${t('New transaction')} · ${amount} · ${payeeName}`,
        content: (
          <Text>
            <Trans>New transaction</Trans> ·{' '}
            <FinancialText>{amount}</FinancialText> · {payeeName}
          </Text>
        ),
        Icon: SvgAdd,
      },
    ],
    onSelect: () =>
      transactionPanels.openNew({
        accountId: defaultAccountId,
        amount: entry.amount,
        payeeId: payee?.id,
        payeeName: payee ? undefined : entry.payeeName,
        date: monthUtils.currentDay(),
      }),
  };
}
