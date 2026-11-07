import type { ReactNode } from 'react';

import type { CSSProperties } from '#styles';
import { theme } from '#theme';
import { radius } from '#tokens';
import { View } from '#View';

type ModeButtonGroupProps = {
  children: ReactNode;
  style?: CSSProperties;
};

// The tray of a segmented control: a recessed rail whose radius is
// concentric with the 6px pills of the ModeButtons it holds.
export function ModeButtonGroup({ children, style }: ModeButtonGroupProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 2,
        padding: 2,
        borderRadius: radius.md,
        border: `1px solid ${theme.trayBorder}`,
        backgroundColor: theme.trayBackground,
        ...style,
      }}
    >
      {children}
    </View>
  );
}
