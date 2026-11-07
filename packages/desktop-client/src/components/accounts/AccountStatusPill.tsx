import type { ReactNode } from 'react';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { fontFamily, radius } from '@actual-app/components/tokens';

type AccountStatusPillProps = {
  children: ReactNode;
  testId?: string;
};

/** A neutral status pill beside the account title (`Off budget`, `Closed`). */
export function AccountStatusPill({
  children,
  testId,
}: AccountStatusPillProps) {
  return (
    <Text
      data-testid={testId}
      style={{
        fontFamily: fontFamily.ui,
        fontSize: 11.5,
        fontWeight: 500,
        lineHeight: '16px',
        letterSpacing: 'normal',
        padding: '2px 8px',
        borderRadius: radius.sm,
        backgroundColor: theme.pillBackground,
        color: theme.pillText,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {children}
    </Text>
  );
}
