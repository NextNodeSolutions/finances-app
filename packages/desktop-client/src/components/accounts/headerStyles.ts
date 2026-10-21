import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';

/** Icon-only header and toolbar actions: a square bare button. */
export const headerIconButtonStyle = {
  width: 30,
  height: 30,
  padding: 0,
  borderRadius: radius.md,
  color: theme.pageTextLight,
};

export const headerIconStyle = { width: 14, height: 14 };

/** A glyph before a button label. */
export const headerLabelIconStyle = { width: 12, height: 12, flexShrink: 0 };
