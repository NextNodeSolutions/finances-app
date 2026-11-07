import { useId } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { AccountEntity } from '@actual-app/core/types/models';

import { AccountAutocomplete } from '#components/autocomplete/AccountAutocomplete';

import { PanelField } from './PanelField';

type AccountFieldProps = {
  accountId: AccountEntity['id'];
  onChange: (accountId: AccountEntity['id']) => void;
  /** A new transaction only goes to an open account. */
  includeClosedAccounts: boolean;
  isDisabled?: boolean;
  error?: ReactNode;
};

export function AccountField({
  accountId,
  onChange,
  includeClosedAccounts,
  isDisabled,
  error,
}: AccountFieldProps) {
  const { t } = useTranslation();
  const id = useId();

  return (
    <PanelField label={t('Account')} htmlFor={id} error={error}>
      <AccountAutocomplete
        value={accountId === '' ? null : accountId}
        includeClosedAccounts={includeClosedAccounts}
        onSelect={selected => {
          if (selected) {
            onChange(selected);
          }
        }}
        inputProps={{ id, disabled: isDisabled }}
      />
    </PanelField>
  );
}
