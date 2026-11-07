import type { ReactNode } from 'react';

import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type SchedulePanelSectionProps = {
  /** Names the figures below, set as a mono label. */
  label: ReactNode;
  children: ReactNode;
};

/** One labelled group of figures in the schedule panel. */
export function SchedulePanelSection({
  label,
  children,
}: SchedulePanelSectionProps) {
  return (
    <View
      style={{
        gap: spacing.sm,
        paddingTop: spacing.lg,
        borderTop: `1px solid ${theme.hairlineSubtle}`,
      }}
    >
      <View style={{ ...styles.monoLabel, color: theme.tableHeaderText }}>
        {label}
      </View>
      {children}
    </View>
  );
}
