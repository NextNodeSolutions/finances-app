import { useState } from 'react';
import type { FormEvent } from 'react';
import { Form } from 'react-aria-components';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import type { IntegerAmount } from '@actual-app/core/shared/util';

import { useFormat } from '#hooks/useFormat';

import { reconcileFormStyle } from './reconcileStripStyles';

type ValuationFormProps = {
  /** The account's balance today; the new value is recorded against it. */
  balance: IntegerAmount | null;
  /** Called with the change in value; never with 0. */
  onRecord: (difference: IntegerAmount) => void;
  onCancel: () => void;
};

/** The strip's valuation mode for off-budget accounts: no locking step. */
export function ValuationForm({
  balance,
  onRecord,
  onCancel,
}: ValuationFormProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const [typedValue, setTypedValue] = useState<string | null>(null);
  const prefill = balance != null ? format(balance, 'financial') : '';

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (balance == null || !typedValue) {
      onCancel();
      return;
    }
    const value = format.fromEdit(typedValue, balance) ?? balance;
    if (value === balance) {
      onCancel();
      return;
    }
    onRecord(value - balance);
  }

  return (
    <Form onSubmit={onSubmit} style={reconcileFormStyle}>
      <Text style={{ fontWeight: 500, color: theme.pageText }}>
        <Trans>Current value</Trans>
      </Text>
      <InitialFocus>
        <Input
          aria-label={t('Current value')}
          value={typedValue ?? prefill}
          onChangeValue={setTypedValue}
          onEscape={onCancel}
          style={{ ...styles.tnum, width: 140, textAlign: 'right' }}
        />
      </InitialFocus>
      <Button type="submit" variant="primary">
        <Trans>Record</Trans>
      </Button>
      <Button onPress={onCancel}>
        <Trans>Cancel</Trans>
      </Button>
    </Form>
  );
}
