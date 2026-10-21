import type { ReactNode } from 'react';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

const ROW_MIN_HEIGHT = 36;

type PanelStatRowProps = {
  label: string;
  children: ReactNode;
};

/** A labelled figure in the payee panel: mono label left, value right. */
export function PanelStatRow({ label, children }: PanelStatRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
        minHeight: ROW_MIN_HEIGHT,
        borderBottom: `1px solid ${theme.hairlineSubtle}`,
      }}
    >
      <Text style={{ ...styles.monoLabel, color: theme.tableHeaderText }}>
        {label}
      </Text>
      {children}
    </View>
  );
}
