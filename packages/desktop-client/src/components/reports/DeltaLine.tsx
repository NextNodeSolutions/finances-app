import React from 'react';
import type { ReactNode } from 'react';

import { Block } from '@actual-app/components/block';
import {
  SvgArrowThickDown,
  SvgArrowThickUp,
} from '@actual-app/components/icons/v1';
import type { CSSProperties } from '@actual-app/components/styles';

import { FinancialText } from '#components/FinancialText';

import { deltaLineStyle } from './chart-theme';

const ARROW_SIZE = 9;

type DeltaLineProps = {
  // Which way the figure moved; the arrow follows the sign.
  direction: 'up' | 'down' | 'flat';
  // Good or bad, set by the caller: a rise is good for net worth but bad
  // for spending.
  color: string;
  style?: CSSProperties;
  children: ReactNode;
};

// The small mono line under a headline figure, with an arrow so the
// direction never rests on colour alone.
export function DeltaLine({
  direction,
  color,
  style,
  children,
}: DeltaLineProps) {
  const Arrow =
    direction === 'up'
      ? SvgArrowThickUp
      : direction === 'down'
        ? SvgArrowThickDown
        : null;

  return (
    <FinancialText as={Block} style={{ ...deltaLineStyle, color, ...style }}>
      {Arrow && (
        <Arrow
          aria-hidden="true"
          width={ARROW_SIZE}
          height={ARROW_SIZE}
          style={{ flexShrink: 0 }}
        />
      )}
      {children}
    </FinancialText>
  );
}
