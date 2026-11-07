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
import { spacing } from '@actual-app/components/tokens';
import type { IntegerAmount } from '@actual-app/core/shared/util';
import type { AccountEntity } from '@actual-app/core/types/models';

import { FinancialText } from '#components/FinancialText';
import { useFormat } from '#hooks/useFormat';
import { useOptionalFeature } from '#hooks/useOptionalFeature';

import { reconcileFormStyle } from './reconcileStripStyles';

type StatementBalanceFormProps = {
  account: AccountEntity;
  /** Prefills the statement balance; null until the sheet answers. */
  clearedBalance: IntegerAmount | null;
  onReconcile: (amount: IntegerAmount | null) => void;
  onCancel: () => void;
};

/** Reconcile step 1: the statement balance the cleared rows must match. */
export function StatementBalanceForm({
  account,
  clearedBalance,
  onReconcile,
  onCancel,
}: StatementBalanceFormProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const [isBankSyncOn] = useOptionalFeature('bankSync');
  // null until the user types: the field then shows the cleared balance.
  const [typedValue, setTypedValue] = useState<string | null>(null);
  const prefill =
    clearedBalance != null ? format(clearedBalance, 'financial') : '';
  const bankBalance =
    isBankSyncOn && account.account_id ? account.balance_current : null;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (typedValue === '') {
      return;
    }
    onReconcile(
      typedValue != null
        ? format.fromEdit(typedValue, clearedBalance)
        : clearedBalance,
    );
  }

  return (
    <Form onSubmit={onSubmit} style={reconcileFormStyle}>
      <Text style={{ fontWeight: 500, color: theme.pageText }}>
        <Trans>Reconcile</Trans>
      </Text>
      <Text style={{ color: theme.pageTextLight }}>
        <Trans>Statement balance</Trans>
      </Text>
      <InitialFocus>
        <Input
          aria-label={t('Statement balance')}
          value={typedValue ?? prefill}
          onChangeValue={setTypedValue}
          onEscape={onCancel}
          style={{ ...styles.tnum, width: 140, textAlign: 'right' }}
        />
      </InitialFocus>
      <Button type="submit" variant="primary">
        <Trans>Reconcile</Trans>
      </Button>
      <Button onPress={onCancel}>
        <Trans>Cancel</Trans>
      </Button>
      {bankBalance != null && (
        <Text style={{ color: theme.pageTextLight, fontSize: 12 }}>
          <Text>
            <Trans>Bank balance</Trans>
          </Text>{' '}
          <FinancialText style={{ color: theme.pageText }}>
            {format(bankBalance, 'financial')}
          </FinancialText>
          {' · '}
          <Button
            variant="bare"
            onPress={() => setTypedValue(format(bankBalance, 'financial'))}
            style={{
              display: 'inline-flex',
              padding: `0 ${spacing.xxs}px`,
              color: theme.pageTextLink,
            }}
          >
            <Trans>Use</Trans>
          </Button>
        </Text>
      )}
    </Form>
  );
}
