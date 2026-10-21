import { Trans } from 'react-i18next';

import type { AccountEntity } from '@actual-app/core/types/models';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';

import { useSelectedBalance } from './useSelectedBalance';

type SelectedTransactionsSummaryProps = {
  selectedItems: ReadonlySet<string>;
  account?: AccountEntity;
};

/** The selection bar's summary: `3 selected · −232.85`. */
export function SelectedTransactionsSummary({
  selectedItems,
  account,
}: SelectedTransactionsSummaryProps) {
  const format = useFormat();
  const selectedBalance = useSelectedBalance(selectedItems, account);
  const count = selectedItems.size;

  return (
    <>
      <Trans count={count}>{{ count }} selected</Trans>
      {selectedBalance && (
        <>
          {' · '}
          <PrivacyFilter>
            <FinancialText>
              {!selectedBalance.isExact && '~ '}
              {format(selectedBalance.amount, 'financial')}
            </FinancialText>
          </PrivacyFilter>
        </>
      )}
    </>
  );
}
