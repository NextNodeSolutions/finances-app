import React from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { View } from '@actual-app/components/view';
import type {
  AppendNoteRuleActionEntity,
  DeleteTransactionRuleActionEntity,
  LinkScheduleRuleActionEntity,
  PrependNoteRuleActionEntity,
  RuleActionEntity,
  SetRuleActionEntity,
  SetSplitAmountRuleActionEntity,
} from '@actual-app/core/types/models';

import { friendlyOp, getAllocationMethods, mapField } from '#util/rule';

import {
  expressionChipStyle,
  expressionFieldStyle,
  expressionValueStyle,
} from './expressionStyles';
import { ScheduleValue } from './ScheduleValue';
import { Value } from './Value';

type ActionExpressionProps = RuleActionEntity & {
  style?: CSSProperties;
};

export function ActionExpression({ style, ...props }: ActionExpressionProps) {
  return (
    <View
      style={{
        ...expressionChipStyle,
        ...style,
      }}
    >
      {props.op === 'set' ? (
        <SetActionExpression {...props} />
      ) : props.op === 'set-split-amount' ? (
        <SetSplitAmountActionExpression {...props} />
      ) : props.op === 'link-schedule' ? (
        <LinkScheduleActionExpression {...props} />
      ) : props.op === 'prepend-notes' ? (
        <PrependNoteActionExpression {...props} />
      ) : props.op === 'append-notes' ? (
        <AppendNoteActionExpression {...props} />
      ) : props.op === 'delete-transaction' ? (
        <DeleteTransactionActionExpression {...props} />
      ) : null}
    </View>
  );
}

function SetActionExpression({
  op,
  field,
  value,
  options,
}: SetRuleActionEntity) {
  const { t } = useTranslation();
  return (
    <>
      <Text>{friendlyOp(op)}</Text>{' '}
      <Text style={expressionFieldStyle}>{mapField(field, options)}</Text>{' '}
      <Text>{t('to ')}</Text>
      {options?.formula ? (
        <>
          <Text>{t('formula ')}</Text>
          <Text style={expressionValueStyle}>{options.formula}</Text>
        </>
      ) : options?.template ? (
        <>
          <Text>{t('template ')}</Text>
          <Text style={expressionValueStyle}>{options.template}</Text>
        </>
      ) : (
        <Value style={expressionValueStyle} value={value} field={field} />
      )}
    </>
  );
}

function SetSplitAmountActionExpression({
  op,
  value,
  options,
}: SetSplitAmountRuleActionEntity) {
  const { t } = useTranslation();
  const method = options?.method;
  if (!method) {
    return null;
  }

  return (
    <>
      <Text>{friendlyOp(op)}</Text>{' '}
      <Text style={expressionValueStyle}>{getAllocationMethods()[method]}</Text>
      {method !== 'remainder' && ': '}
      {options?.method === 'formula' ? (
        <>
          <Text>{t('formula ')}</Text>
          <Text style={expressionValueStyle}>{options.formula}</Text>
        </>
      ) : method === 'fixed-amount' ? (
        <Value style={expressionValueStyle} value={value} field="amount" />
      ) : method === 'fixed-percent' ? (
        <Text style={expressionValueStyle}>{value}%</Text>
      ) : null}
    </>
  );
}

function LinkScheduleActionExpression({
  op,
  value,
}: LinkScheduleRuleActionEntity) {
  return (
    <>
      <Text>{friendlyOp(op)}</Text> <ScheduleValue value={value} />
    </>
  );
}

function PrependNoteActionExpression({
  op,
  value,
}: PrependNoteRuleActionEntity) {
  return (
    <>
      <Text>{friendlyOp(op)}</Text>{' '}
      <Value style={expressionValueStyle} value={value} field="notes" />
    </>
  );
}

function AppendNoteActionExpression({ op, value }: AppendNoteRuleActionEntity) {
  return (
    <>
      <Text>{friendlyOp(op)}</Text>{' '}
      <Value style={expressionValueStyle} value={value} field="notes" />
    </>
  );
}

function DeleteTransactionActionExpression({
  op,
}: DeleteTransactionRuleActionEntity) {
  return <Text>{friendlyOp(op)}</Text>;
}
