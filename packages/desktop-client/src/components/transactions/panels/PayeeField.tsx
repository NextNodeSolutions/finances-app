import { useId } from 'react';
import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';

import type { PayeeEntity } from '@actual-app/core/types/models';

import { PayeeAutocomplete } from '#components/autocomplete/PayeeAutocomplete';

import { PanelField } from './PanelField';

type PayeeFieldProps = {
  payeeId: PayeeEntity['id'] | null | undefined;
  /** A payee typed as new is created on selection, as in the register. */
  onChange: (payeeId: PayeeEntity['id'] | null) => void;
  inputRef?: Ref<HTMLInputElement>;
  autoFocus?: boolean;
  isDisabled?: boolean;
};

export function PayeeField({
  payeeId,
  onChange,
  inputRef,
  autoFocus,
  isDisabled,
}: PayeeFieldProps) {
  const { t } = useTranslation();
  const id = useId();

  return (
    <PanelField label={t('Payee')} htmlFor={id}>
      <PayeeAutocomplete
        value={payeeId ?? null}
        onSelect={selected => onChange(selected || null)}
        inputProps={{ id, ref: inputRef, autoFocus, disabled: isDisabled }}
      />
    </PanelField>
  );
}
