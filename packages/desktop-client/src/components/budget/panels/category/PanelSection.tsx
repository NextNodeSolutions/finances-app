import type { ReactNode } from 'react';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type PanelSectionProps = {
  /** Mono label naming the figures below, e.g. LAST 12 MONTHS. */
  label: ReactNode;
  /** Right side of the label row (a count, a toggle). */
  aside?: ReactNode;
  children: ReactNode;
};

/** A hairline-separated section of the category inspector. */
export function PanelSection({ label, aside, children }: PanelSectionProps) {
  return (
    <View
      style={{
        gap: spacing.sm,
        paddingTop: spacing.lg,
        marginTop: spacing.lg,
        borderTop: `1px solid ${theme.hairline}`,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: spacing.sm,
        }}
      >
        <Text style={{ ...styles.monoLabel, color: theme.pageTextSubdued }}>
          {label}
        </Text>
        {aside}
      </View>
      {children}
    </View>
  );
}
