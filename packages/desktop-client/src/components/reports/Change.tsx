import React from 'react';
import type { CSSProperties } from 'react';

import { theme } from '@actual-app/components/theme';

import { useFormat } from '#hooks/useFormat';

import { DeltaLine } from './DeltaLine';

export function Change({
  amount,
  style,
}: {
  amount: number;
  style?: CSSProperties;
}) {
  const format = useFormat();

  return (
    <DeltaLine
      direction={amount === 0 ? 'flat' : amount < 0 ? 'down' : 'up'}
      color={
        amount === 0
          ? theme.reportsNumberNeutral
          : amount < 0
            ? theme.reportsNumberNegative
            : theme.reportsNumberPositive
      }
      style={style}
    >
      {amount >= 0 ? '+' : ''}
      {format(amount, 'financial')}
    </DeltaLine>
  );
}
