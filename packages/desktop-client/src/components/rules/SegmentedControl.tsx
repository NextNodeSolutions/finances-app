import type { ReactNode } from 'react';

import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

// A tray holding its options; the chosen one rises as a white pill. The
// tray corner follows the pill radius plus the tray padding.
const TRAY_PADDING = 3;

type SegmentedControlProps = {
  children: ReactNode;
};

export function SegmentedControl({ children }: SegmentedControlProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: spacing.xxs,
        padding: TRAY_PADDING,
        backgroundColor: theme.trayBackground,
        border: `1px solid ${theme.trayBorder}`,
        borderRadius: radius.md + TRAY_PADDING,
      }}
    >
      {children}
    </View>
  );
}
