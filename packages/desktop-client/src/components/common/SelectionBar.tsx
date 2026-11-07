import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { CSSProperties } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { elevation, radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type SelectionBarProps = {
  /** What is selected, e.g. `3 selected · −232.85`. */
  summary: ReactNode;
  /** The actions that apply to the selection. */
  children: ReactNode;
  /** Accessible name of the toolbar; defaults to "Selection". */
  ariaLabel?: string;
  /** Placement overrides; by default the bar floats centred at the bottom. */
  style?: CSSProperties;
  testId?: string;
};

/**
 * Floating bar that holds bulk actions while items are selected. Owners
 * render it only while a selection exists and decide where it floats.
 */
export function SelectionBar({
  summary,
  children,
  ariaLabel,
  style,
  testId,
}: SelectionBarProps) {
  const { t } = useTranslation();

  return (
    <View
      role="toolbar"
      aria-label={ariaLabel ?? t('Selection')}
      data-testid={testId}
      style={{
        position: 'absolute',
        bottom: spacing.lg,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        maxWidth: `calc(100% - ${spacing.xl * 2}px)`,
        padding: `${spacing.xs}px ${spacing.xs}px ${spacing.xs}px ${spacing.md}px`,
        backgroundColor: theme.menuBackground,
        border: `1px solid ${theme.menuBorder}`,
        borderRadius: radius.lg,
        boxShadow: elevation.popover,
        color: theme.menuItemText,
        ...style,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {summary}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          minWidth: 0,
        }}
      >
        {children}
      </View>
    </View>
  );
}
