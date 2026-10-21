import type { ReactNode } from 'react';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type HealthRowProps = {
  label: ReactNode;
  testId?: string;
  /** The figures, right-aligned in the card's figure column. */
  children: ReactNode;
};

/** One line of the month card: a mono label and its figures. */
export function HealthRow({ label, testId, children }: HealthRowProps) {
  return (
    <View
      data-testid={testId}
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: spacing.md,
        minHeight: 20,
      }}
    >
      <Text style={{ ...styles.monoLabel, color: theme.tableHeaderText }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 6,
          fontSize: 13,
          color: theme.pageTextDark,
        }}
      >
        {children}
      </View>
    </View>
  );
}
