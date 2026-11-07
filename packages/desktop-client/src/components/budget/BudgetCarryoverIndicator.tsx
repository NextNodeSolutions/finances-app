import React from 'react';

import { SvgArrowThinRight } from '@actual-app/components/icons/v1';
import { View } from '@actual-app/components/view';

import type { CarryoverIndicatorProps } from './BalanceWithCarryover';

// Desktop carryover mark: a small arrow set before the balance, in the
// balance colour, so it never collides with the figures or their chip.
export function BudgetCarryoverIndicator({ style }: CarryoverIndicatorProps) {
  return (
    <View
      aria-hidden
      style={{
        order: -1,
        flexShrink: 0,
        alignSelf: 'center',
        marginRight: 5,
        color: style?.color,
        opacity: 0.8,
      }}
    >
      <SvgArrowThinRight width={8} height={8} />
    </View>
  );
}
