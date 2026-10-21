import React, { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Form } from 'react-aria-components';
import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgCheckCircle1 } from '@actual-app/components/icons/v2';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { elevation, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { Query } from '@actual-app/core/shared/query';
import { tsToRelativeTime } from '@actual-app/core/shared/util';
import type { AccountEntity } from '@actual-app/core/types/models';
import type { TransObjectLiteral } from '@actual-app/core/types/util';
import { format as formatDate } from 'date-fns';
import { t } from 'i18next';

import { useDateFormat } from '#hooks/useDateFormat';
import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';
import { useSheetValue } from '#hooks/useSheetValue';
import * as bindings from '#spreadsheet/bindings';

type ReconcilingMessageProps = {
  balanceQuery: { name: `balance-query-${string}`; query: Query };
  targetBalance: number;
  onDone: () => void;
  onCreateTransaction: (targetDiff: number) => void;
};

export function ReconcilingMessage({
  balanceQuery,
  targetBalance,
  onDone,
  onCreateTransaction,
}: ReconcilingMessageProps) {
  const cleared =
    useSheetValue<'balance', `balance-query-${string}-cleared`>({
      name: (balanceQuery.name +
        '-cleared') as `balance-query-${string}-cleared`,
      value: 0,
      query: balanceQuery.query.filter({ cleared: true }),
    }) ?? 0;
  const format = useFormat();
  const targetDiff = targetBalance - cleared;

  const clearedBalance = format(cleared, 'financial');
  const bankBalance = format(targetBalance, 'financial');
  const difference =
    (targetDiff > 0 ? '+' : '') + format(targetDiff, 'financial');

  return (
    <View style={{ ...styles.pageContent, flexShrink: 0, paddingBottom: 12 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          backgroundColor: theme.tableBackground,
          border: '1px solid ' + theme.hairline,
          borderRadius: radius.lg,
          boxShadow: elevation.card,
          padding: '10px 10px 10px 16px',
        }}
      >
        {targetDiff === 0 ? (
          <View
            style={{
              color: theme.noticeText,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              fontWeight: 500,
            }}
          >
            <SvgCheckCircle1
              style={{
                width: 14,
                height: 14,
                color: theme.noticeTextLight,
                flexShrink: 0,
              }}
            />
            <Trans>All reconciled!</Trans>
          </View>
        ) : (
          <View
            style={{
              color: theme.tableText,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: radius.pill,
                backgroundColor: theme.signal,
                flexShrink: 0,
              }}
            />
            <Text
              style={{
                lineHeight: '19px',
                '& strong': {
                  ...styles.tnum,
                  fontWeight: 500,
                  color: theme.pageText,
                },
              }}
            >
              <Trans>
                Your cleared balance{' '}
                <strong>{{ clearedBalance } as TransObjectLiteral}</strong>{' '}
                needs <strong>{{ difference } as TransObjectLiteral}</strong> to
                match
                <br /> your bank&apos;s balance of{' '}
                <Text
                  style={{
                    ...styles.tnum,
                    fontWeight: 500,
                    color: theme.pageText,
                  }}
                >
                  {{ bankBalance } as TransObjectLiteral}
                </Text>
              </Trans>
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        {targetDiff !== 0 && (
          <Button onPress={() => onCreateTransaction(targetDiff)}>
            <Trans>Create reconciliation transaction</Trans>
          </Button>
        )}
        <Button variant="primary" onPress={onDone}>
          {targetDiff === 0 ? t('Lock transactions') : t('Exit reconciliation')}
        </Button>
      </View>
    </View>
  );
}

type ReconcileMenuProps = {
  account: AccountEntity;
  onReconcile: (amount: number | null) => void;
  onClose: () => void;
};

export function ReconcileMenu({
  account,
  onReconcile,
  onClose,
}: ReconcileMenuProps) {
  const balanceQuery = bindings.accountBalance(account.id);
  const clearedBalance = useSheetValue<'account', `balance-${string}-cleared`>({
    name: (balanceQuery.name + '-cleared') as `balance-${string}-cleared`,
    value: null,
    query: balanceQuery.query.filter({ cleared: true }),
  });
  const lastSyncedBalance = account.balance_current;
  const format = useFormat();
  const dateFormat = useDateFormat() || 'MM/dd/yyyy';
  const locale = useLocale();

  const [inputValue, setInputValue] = useState<string | null>();
  // useEffect is needed here. clearedBalance does not work as a default value for inputValue and
  // to use a button to update inputValue we can't use defaultValue in the input form below
  useEffect(() => {
    if (clearedBalance != null) {
      setInputValue(format(clearedBalance, 'financial'));
    }
  }, [clearedBalance, format]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (inputValue === '') {
      return;
    }

    const amount =
      inputValue != null
        ? format.fromEdit(inputValue, clearedBalance)
        : clearedBalance;

    onReconcile(amount);
    onClose();
  }

  return (
    <Form onSubmit={onSubmit}>
      <View style={{ gap: 10 }}>
        <Text style={{ lineHeight: '18px', color: theme.menuItemText }}>
          <Trans>
            Enter the current balance of your bank account that you want to
            reconcile with:
          </Trans>
        </Text>
        {inputValue != null && (
          <InitialFocus>
            <Input
              value={inputValue}
              onChangeValue={setInputValue}
              style={{ ...styles.tnum, textAlign: 'right' }}
            />
          </InitialFocus>
        )}
        {lastSyncedBalance != null && (
          <View style={{ gap: 8 }}>
            <Text
              style={{
                textAlign: 'right',
                color: theme.pageTextLight,
                fontSize: 12,
              }}
            >
              <Trans>Last Balance from Bank: </Trans>
              <Text style={{ ...styles.tnum, color: theme.pageText }}>
                {format(lastSyncedBalance, 'financial')}
              </Text>
            </Text>
            <Button
              onPress={() =>
                setInputValue(format(lastSyncedBalance, 'financial'))
              }
            >
              <Trans>Use last synced total</Trans>
            </Button>
          </View>
        )}
        <Button type="submit" variant="primary">
          <Trans>Reconcile</Trans>
        </Button>
        <Text
          style={{
            color: theme.pageTextLight,
            fontSize: 12,
            textAlign: 'center',
          }}
        >
          {account?.last_reconciled
            ? t('Reconciled {{ relativeTimeAgo }} ({{ absoluteDate }})', {
                relativeTimeAgo: tsToRelativeTime(
                  account.last_reconciled,
                  locale,
                ),
                absoluteDate: formatDate(
                  new Date(parseInt(account.last_reconciled ?? '0', 10)),
                  dateFormat,
                  { locale },
                ),
              })
            : t('Not yet reconciled')}
        </Text>
      </View>
    </Form>
  );
}
