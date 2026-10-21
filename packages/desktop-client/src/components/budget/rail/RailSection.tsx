import type { ReactNode } from 'react';

import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type RailSectionProps = {
  children: ReactNode;
  testId?: string;
};

/** A hairline-separated part of the rail; sections never nest cards. */
export function RailSection({ children, testId }: RailSectionProps) {
  return (
    <View
      data-testid={testId}
      style={{
        gap: spacing.sm,
        paddingTop: spacing.lg,
        borderTop: `1px solid ${theme.hairline}`,
      }}
    >
      {children}
    </View>
  );
}
