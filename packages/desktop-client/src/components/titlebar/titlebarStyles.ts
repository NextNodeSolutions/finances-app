import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { motion, radius } from '@actual-app/components/tokens';

export const TITLEBAR_ICON_BUTTON_SIZE = 30;

// The titlebar's controls change shape with the window: labels show from
// 1280 px, the palette trigger narrows between 1024 and 1279 px, and below
// 1024 px only icons remain.
export const TITLEBAR_WIDE_QUERY = '@media (min-width: 1280px)';
export const TITLEBAR_MEDIUM_QUERY =
  '@media (min-width: 1024px) and (max-width: 1279px)';
export const TITLEBAR_COMPACT_QUERY = '@media (max-width: 1023px)';

// Bare 30x30 icon buttons for the right cluster; the bare variant supplies
// the hover fill.
export const titlebarIconButtonStyle = {
  minWidth: TITLEBAR_ICON_BUTTON_SIZE,
  height: TITLEBAR_ICON_BUTTON_SIZE,
  padding: '0 7px',
  borderRadius: radius.md,
  color: theme.pageTextLight,
  transition: `background-color ${motion.base} ${motion.ease}, color ${motion.base} ${motion.ease}`,
} satisfies CSSProperties;
