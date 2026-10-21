import type { CSSProperties, PropsWithChildren } from 'react';

import { theme } from '@actual-app/components/theme';
import { elevation, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

const EDGE_INSET = 12;

type FloatingActionBarProps = PropsWithChildren & {
  style: CSSProperties;
};

export function FloatingActionBar({ style, children }: FloatingActionBarProps) {
  return (
    <View
      style={{
        backgroundColor: theme.floatingActionBarBackground,
        color: theme.floatingActionBarText,
        position: 'fixed',
        bottom: `calc(${EDGE_INSET}px + env(safe-area-inset-bottom))`,
        left: EDGE_INSET,
        right: EDGE_INSET,
        height: 56,
        zIndex: 100,
        borderRadius: radius.xl,
        border: `1px solid ${theme.floatingActionBarBorder}`,
        boxShadow: elevation.popover,
        ...style,
      }}
    >
      {children}
    </View>
  );
}
