import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import type { AccountEntity } from '@actual-app/core/types/models';

import { StripReading } from './StripReading';
import { useSelectedBalance } from './useSelectedBalance';

type SelectedReadingProps = {
  selectedItems: ReadonlySet<string>;
  account?: AccountEntity;
};

/** The instrument strip's `SELECTED` reading: the sum of the selection. */
export function SelectedReading({
  selectedItems,
  account,
}: SelectedReadingProps) {
  const { t } = useTranslation();
  const selectedBalance = useSelectedBalance(selectedItems, account);

  if (selectedBalance === null) {
    return null;
  }

  return (
    <StripReading
      label={t('Selected')}
      amount={selectedBalance.amount}
      isExact={selectedBalance.isExact}
      color={theme.accentText}
      testId="account-balance-selected"
    />
  );
}
