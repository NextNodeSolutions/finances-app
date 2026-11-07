import type { ReactNode } from 'react';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { Amount } from './Amount';

type LabelledFigureProps = {
  label: ReactNode;
  value: number | null;
};

/** A mono label and its figure, side by side on an instrument line. */
export function LabelledFigure({ label, value }: LabelledFigureProps) {
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}
    >
      <Text style={{ ...styles.monoLabel, color: theme.tableHeaderText }}>
        {label}
      </Text>
      <Amount value={value} tone="balance" style={{ fontSize: 13 }} />
    </View>
  );
}
