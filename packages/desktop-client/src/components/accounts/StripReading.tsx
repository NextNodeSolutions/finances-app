import type { ReactNode } from 'react';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { IntegerAmount } from '@actual-app/core/shared/util';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';

type StripReadingProps = {
  /** Sentence case in source; the strip sets it in mono capitals. */
  label: ReactNode;
  amount: IntegerAmount;
  /** False prefixes the figure with `~` (an estimated amount). */
  isExact?: boolean;
  /** Overrides the balance colouring, e.g. the accent for a selection. */
  color?: string;
  /** True prefixes a positive figure with `+`, as for a difference. */
  isSigned?: boolean;
  testId?: string;
};

/**
 * One reading of an instrument strip: a mono capital label, then its figure.
 * A balance is a stock, not a gain: it reads in ink unless it is owed.
 */
export function StripReading({
  label,
  amount,
  isExact = true,
  color,
  isSigned = false,
  testId,
}: StripReadingProps) {
  const format = useFormat();

  return (
    <View
      data-testid={testId}
      style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}
    >
      <Text style={{ ...styles.monoLabel, color: theme.tableHeaderText }}>
        {label}
      </Text>
      <PrivacyFilter>
        <FinancialText
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: color ?? getBalanceColor(amount),
          }}
        >
          {!isExact && '~ '}
          {isSigned && amount > 0 && '+'}
          {format(amount, 'financial')}
        </FinancialText>
      </PrivacyFilter>
    </View>
  );
}

export function getBalanceColor(amount: IntegerAmount): string {
  if (amount < 0) {
    return theme.numberNegative;
  }
  return amount === 0 ? theme.pageTextSubdued : theme.pageText;
}
