import type { CSSProperties } from 'react';

import { spacing } from '@actual-app/components/tokens';

/** One wrapping row of readings and buttons inside the reconcile strip. */
export const reconcileFormStyle = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: spacing.md,
  rowGap: spacing.sm,
  flex: 1,
  minWidth: 0,
} satisfies CSSProperties;
