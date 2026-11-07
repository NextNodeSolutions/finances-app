import React, { useMemo } from 'react';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import { SvgDownAndRightArrow } from '@actual-app/components/icons/v2';
import { SpaceBetween } from '@actual-app/components/space-between';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { Tooltip } from '@actual-app/components/tooltip';
import { View } from '@actual-app/components/view';
import { amountToCurrency } from '@actual-app/core/shared/util';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { Checkbox } from '#components/forms';
import { Field, Row } from '#components/table';

import {
  ALREADY_IMPORTED_COLUMN_WIDTH,
  AlreadyImportedPill,
} from './AlreadyImportedPill';
import { ParsedDate } from './ParsedDate';
import { getRowCheckboxStyle } from './rowCheckboxStyle';
import { applyFieldMappings, formatDate, parseAmountFields } from './utils';
import type { FieldMapping, ImportTransaction } from './utils';

type TransactionProps = {
  transaction: ImportTransaction;
  fieldMappings: FieldMapping;
  showParsed: boolean;
  parseDateFormat: ComponentProps<typeof ParsedDate>['parseDateFormat'];
  dateFormat: ComponentProps<typeof ParsedDate>['dateFormat'];
  splitMode: boolean;
  inOutMode: boolean;
  outValue: string;
  flipAmount: boolean;
  multiplierAmount: string;
  categories: CategoryEntity[];
  onCheckTransaction: (transactionId: string) => void;
  reconcile: boolean;
  showStatus: boolean;
};

export function Transaction({
  transaction: rawTransaction,
  fieldMappings,
  showParsed,
  parseDateFormat,
  dateFormat,
  splitMode,
  inOutMode,
  outValue,
  flipAmount,
  multiplierAmount,
  categories,
  onCheckTransaction,
  reconcile,
  showStatus,
}: TransactionProps) {
  const { t } = useTranslation();

  const categoryList = categories.map(category => category.name);
  const transaction = useMemo(
    () =>
      fieldMappings && !rawTransaction.isMatchedTransaction
        ? applyFieldMappings(rawTransaction, fieldMappings)
        : rawTransaction,
    [rawTransaction, fieldMappings],
  );

  const { amount, outflow, inflow } = useMemo(() => {
    if (rawTransaction.isMatchedTransaction) {
      const amount = rawTransaction.amount;

      return {
        amount,
        outflow: splitMode ? (amount < 0 ? -amount : 0) : null,
        inflow: splitMode ? (amount > 0 ? amount : 0) : null,
      };
    }

    return parseAmountFields(
      transaction,
      splitMode,
      inOutMode,
      outValue,
      flipAmount,
      multiplierAmount,
    );
  }, [
    rawTransaction,
    transaction,
    splitMode,
    inOutMode,
    outValue,
    flipAmount,
    multiplierAmount,
  ]);

  return (
    <Row
      style={{
        backgroundColor: theme.tableBackground,
        textDecoration: transaction.tombstone ? 'line-through' : 'none',
        color:
          (transaction.isMatchedTransaction && !transaction.selected_merge) ||
          !transaction.selected ||
          transaction.tombstone
            ? theme.tableTextInactive
            : theme.tableText,
      }}
    >
      {reconcile && (
        <Field width={31}>
          {!transaction.isMatchedTransaction && (
            <Tooltip
              content={
                transaction.tombstone
                  ? t('This transaction will be deleted by Rules')
                  : !transaction.existing && !transaction.ignored
                    ? t('New transaction. You can import it, or skip it.')
                    : transaction.ignored
                      ? t(
                          'Already imported transaction. You can skip it, or import it again.',
                        )
                      : transaction.existing
                        ? t(
                            'Updated transaction. You can update it, import it again, or skip it.',
                          )
                        : ''
              }
              placement="right top"
            >
              <Checkbox
                checked={transaction.selected && !transaction.tombstone}
                onChange={() => onCheckTransaction(transaction.trx_id)}
                style={getRowCheckboxStyle(transaction)}
              />
            </Tooltip>
          )}
        </Field>
      )}
      <Field width={200} contentStyle={styles.tnum}>
        {transaction.isMatchedTransaction ? (
          <View>
            <SpaceBetween style={{ alignItems: 'flex-start' }}>
              <View>
                <SvgDownAndRightArrow width={16} height={16} />
              </View>
              <View>{formatDate(transaction.date ?? null, dateFormat)}</View>
            </SpaceBetween>
          </View>
        ) : showParsed ? (
          <ParsedDate
            parseDateFormat={parseDateFormat}
            dateFormat={dateFormat}
            date={transaction.date}
          />
        ) : (
          formatDate(transaction.date ?? null, dateFormat)
        )}
      </Field>
      <Field
        width="flex"
        title={transaction.imported_payee || transaction.payee_name}
      >
        {transaction.payee_name}
      </Field>
      <Field width="flex" title={transaction.notes}>
        {transaction.notes}
      </Field>
      <Field
        width="flex"
        title={
          transaction.category && categoryList.includes(transaction.category)
            ? transaction.category
            : undefined
        }
      >
        {transaction.category &&
          categoryList.includes(transaction.category) &&
          transaction.category}
      </Field>
      {showStatus && (
        <Field width={ALREADY_IMPORTED_COLUMN_WIDTH}>
          {transaction.ignored && <AlreadyImportedPill />}
        </Field>
      )}
      {inOutMode && (
        <Field
          width={90}
          contentStyle={{ textAlign: 'left', ...styles.tnum }}
          title={
            transaction.inOut === undefined
              ? undefined
              : String(transaction.inOut)
          }
        >
          {transaction.inOut}
        </Field>
      )}
      {splitMode ? (
        <>
          <Field
            width={90}
            contentStyle={{
              textAlign: 'right',
              ...styles.tnum,
              ...(inflow === null && outflow === null
                ? { color: theme.errorText }
                : {}),
            }}
            title={
              outflow === null
                ? t('Invalid: unable to parse the value')
                : amountToCurrency(outflow)
            }
          >
            {amountToCurrency(outflow || 0)}
          </Field>
          <Field
            width={90}
            contentStyle={{
              textAlign: 'right',
              ...styles.tnum,
              ...(inflow === null && outflow === null
                ? { color: theme.errorText }
                : {}),
            }}
            title={
              inflow === null
                ? t('Invalid: unable to parse the value')
                : amountToCurrency(inflow)
            }
          >
            {amountToCurrency(inflow || 0)}
          </Field>
        </>
      ) : (
        <Field
          width={90}
          contentStyle={{
            textAlign: 'right',
            ...styles.tnum,
            ...(amount === null ? { color: theme.errorText } : {}),
          }}
          title={
            amount === null
              ? t('Invalid: unable to parse the value ({{amount}})', {
                  amount: transaction.amount,
                })
              : amountToCurrency(amount)
          }
        >
          {amountToCurrency(amount || 0)}
        </Field>
      )}
    </Row>
  );
}
