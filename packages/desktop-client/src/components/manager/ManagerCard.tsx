import type { ReactNode } from 'react';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { SvgLogo } from '@actual-app/components/icons/logo';
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { elevation, radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

const WIDE_PADDING = 32;
const NARROW_PADDING = 20;
const MARK_SIZE = 32;
const MARK_GLYPH_SIZE = 16;

type ManagerCardProps = {
  children: ReactNode;
  // Screens with their own edge-to-edge rows (the file list) opt out of the
  // default inner padding.
  padding?: number;
  style?: CSSProperties;
};

// The single white sheet each file-manager screen sits on, centered on the
// porcelain canvas under the ink mark of the app.
export function ManagerCard({ children, padding, style }: ManagerCardProps) {
  const { isNarrowWidth } = useResponsive();

  return (
    <View
      style={{
        width: '100%',
        maxHeight: '100%',
        flexShrink: 1,
        alignItems: 'center',
        gap: spacing.xl,
      }}
    >
      <View
        aria-hidden
        style={{
          flexShrink: 0,
          width: MARK_SIZE,
          height: MARK_SIZE,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.buttonPrimaryBackground,
          color: theme.buttonPrimaryText,
        }}
      >
        <SvgLogo width={MARK_GLYPH_SIZE} height={MARK_GLYPH_SIZE} />
      </View>
      <View
        style={{
          width: '100%',
          flexShrink: 1,
          overflowY: 'auto',
          padding: padding ?? (isNarrowWidth ? NARROW_PADDING : WIDE_PADDING),
          color: theme.pageText,
          backgroundColor: theme.cardBackground,
          border: `1px solid ${theme.hairline}`,
          borderRadius: radius.lg,
          boxShadow: elevation.card,
          ...style,
        }}
      >
        {children}
      </View>
    </View>
  );
}
