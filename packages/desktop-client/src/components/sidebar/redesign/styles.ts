import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { motion, radius } from '@actual-app/components/tokens';

// Shared geometry of the account tree: chevrons and sync dots sit in one
// column, labels and account names start in the next, figures end flush
// right.
export const TREE_LEAD_COLUMN = 20;
export const TREE_ROW_PADDING_LEFT = 4;
export const TREE_ROW_PADDING_RIGHT = 10;
export const TREE_COLUMN_GAP = 6;
export const TREE_NESTED_INDENT = 14;

export const rowTransition = `background-color ${motion.base} ${motion.ease}, color ${motion.base} ${motion.ease}`;

export const sectionLabelStyle = {
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: '-0.005em',
} satisfies CSSProperties;

export const groupLabelStyle = {
  fontSize: 12.5,
  fontWeight: 500,
  color: theme.sidebarTextSubdued,
} satisfies CSSProperties;

export const dropZoneStyle = {
  backgroundColor: theme.sidebarItemBackgroundHover,
  boxShadow: `inset 0 0 0 1px ${theme.focusRing}`,
  borderRadius: radius.md,
} satisfies CSSProperties;

export const treeFocusRing = {
  outline: `2px solid ${theme.focusRing}`,
  outlineOffset: -2,
} satisfies CSSProperties;
