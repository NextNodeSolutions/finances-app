import React from 'react';
import type { CSSProperties } from 'react';

import { Text } from '@actual-app/components/text';
import { View } from '@actual-app/components/view';

import { friendlyOp, mapField } from '#util/rule';

import {
  expressionChipStyle,
  expressionFieldStyle,
  expressionValueStyle,
} from './expressionStyles';
import { Value } from './Value';

type ConditionExpressionProps = {
  field: unknown;
  op: unknown;
  value: unknown;
  options: unknown;
  prefix?: string;
  style?: CSSProperties;
  inline?: boolean;
};

export function ConditionExpression({
  field,
  op,
  value,
  options,
  prefix,
  style,
  inline,
}: ConditionExpressionProps) {
  return (
    <View
      style={{
        ...expressionChipStyle,
        ...style,
      }}
    >
      {prefix && <Text>{prefix} </Text>}
      <Text style={expressionFieldStyle}>{mapField(field, options)}</Text>{' '}
      <Text>{friendlyOp(op)}</Text>{' '}
      {!['onbudget', 'offbudget'].includes(
        (op as string)?.toLocaleLowerCase(),
      ) && (
        <Value
          style={expressionValueStyle}
          value={value}
          field={field}
          inline={inline}
        />
      )}
    </View>
  );
}
