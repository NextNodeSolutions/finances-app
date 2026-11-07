import type { ReactNode } from 'react';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { Amount } from '#components/budget/Amount';

type FigureRowProps = {
  label: ReactNode;
  /** Cents, or `null` while unknown. */
  value: number | null;
  testId?: string;
};

/** One ruled line of a rail list: label left, figure right. */
export function FigureRow({ label, value, testId }: FigureRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing.lg,
        minHeight: 28,
        borderTop: `1px solid ${theme.hairlineSubtle}`,
      }}
    >
      <Text style={{ color: theme.pageTextLight }}>{label}</Text>
      <Amount
        testId={testId}
        value={value}
        style={{
          fontWeight: 500,
          color: value === 0 ? theme.tableTextSubdued : theme.pageText,
        }}
      />
    </View>
  );
}
