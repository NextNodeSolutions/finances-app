import { useId } from 'react';
import type { ReactNode } from 'react';

import { styles } from '@actual-app/components/styles';
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type OverviewCardProps = {
  title: ReactNode;
  /** A link-like button aligned right of the title. */
  action?: ReactNode;
  testId?: string;
  style?: CSSProperties;
  /** Rendered flush under the title row; children own their padding. */
  children: ReactNode;
};

/** Gutter shared by every card's title row and body. */
export const CARD_GUTTER = 20;

/** A white paper section of the statement with its title row. */
export function OverviewCard({
  title,
  action,
  testId,
  style,
  children,
}: OverviewCardProps) {
  const titleId = useId();

  return (
    <View
      role="region"
      aria-labelledby={titleId}
      data-testid={testId}
      style={{ ...styles.tableContainer, flex: 'none', ...style }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          minHeight: 48,
          padding: `${spacing.sm}px ${spacing.sm}px ${spacing.sm}px ${CARD_GUTTER}px`,
        }}
      >
        <h2
          id={titleId}
          style={{
            margin: 0,
            flex: 1,
            minWidth: 0,
            fontSize: 15,
            lineHeight: '20px',
            fontWeight: 600,
            letterSpacing: '-0.005em',
            color: theme.pageTextDark,
          }}
        >
          {title}
        </h2>
        {action}
      </View>
      {children}
    </View>
  );
}
