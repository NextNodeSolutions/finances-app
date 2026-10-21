import type { ReactNode } from 'react';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';

type StatusPillProps = {
  children: ReactNode;
};

/** Signal pill for a figure that needs attention (Overbudgeted). */
export function StatusPill({ children }: StatusPillProps) {
  return (
    <Text
      style={{
        alignSelf: 'flex-start',
        padding: '1px 8px',
        borderRadius: radius.sm,
        backgroundColor: theme.signalSubtle,
        color: theme.signalText,
        fontSize: 11.5,
        fontWeight: 600,
      }}
    >
      {children}
    </Text>
  );
}
