import React from 'react';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';

const SWATCH_SIZE = 8;

export type CashFlowEntry = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type CashFlowLegendRowProps = {
  entry: CashFlowEntry;
  swatchOpacity: number;
};

// One row of the Cash Flow card's figure column: swatch and label, then the
// amount in mono.
export function CashFlowLegendRow({
  entry,
  swatchOpacity,
}: CashFlowLegendRowProps) {
  const format = useFormat();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          minWidth: 0,
          fontSize: 12,
          lineHeight: '16px',
          color: theme.pageTextLight,
        }}
      >
        <View
          aria-hidden="true"
          style={{
            width: SWATCH_SIZE,
            height: SWATCH_SIZE,
            flexShrink: 0,
            borderRadius: 2,
            backgroundColor: entry.color,
            opacity: swatchOpacity,
          }}
        />
        {entry.label}
      </View>
      <PrivacyFilter>
        <FinancialText
          style={{
            fontSize: 13,
            lineHeight: '18px',
            fontWeight: 500,
            color: theme.pageText,
            whiteSpace: 'nowrap',
          }}
        >
          {format(entry.value, 'financial')}
        </FinancialText>
      </PrivacyFilter>
    </View>
  );
}
