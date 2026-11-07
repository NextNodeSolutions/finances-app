import type { ReactNode } from 'react';

import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type PanelGroupProps = {
  children: ReactNode;
};

/** A group of panel rows, set off from the one above by a hairline. */
export function PanelGroup({ children }: PanelGroupProps) {
  return (
    <View
      style={{
        borderTop: `1px solid ${theme.hairline}`,
        paddingBlock: spacing.md,
      }}
    >
      {children}
    </View>
  );
}
