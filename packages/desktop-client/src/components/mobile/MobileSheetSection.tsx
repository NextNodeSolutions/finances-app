import { useId } from 'react';
import type { ReactNode } from 'react';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type MobileSheetSectionProps = {
  title?: ReactNode;
  children: ReactNode;
};

export function MobileSheetSection({
  title,
  children,
}: MobileSheetSectionProps) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      style={{
        paddingTop: title ? 0 : spacing.sm,
        paddingBottom: spacing.sm,
      }}
    >
      {title && (
        <View
          style={{
            padding: `${spacing.md}px ${spacing.lg + 4}px ${spacing.sm}px`,
          }}
        >
          <Text
            id={titleId}
            style={{
              fontSize: 12,
              lineHeight: '16px',
              fontWeight: 500,
              color: theme.menuItemTextHeader,
            }}
          >
            {title}
          </Text>
        </View>
      )}
      {children}
    </section>
  );
}
