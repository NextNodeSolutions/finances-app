import type { CSSProperties } from 'react';

import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';

// The import reads top to bottom as a series of steps, each set off from the
// previous one by a hairline. More air sits above a heading than below it.
export const sectionStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  margin: 0,
  paddingTop: spacing.md,
  paddingBottom: spacing.md,
  borderTop: `1px solid ${theme.hairline}`,
};

export const sectionHeadingStyle: CSSProperties = {
  margin: `0 0 ${spacing.sm}px`,
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 600,
  letterSpacing: '-0.005em',
  color: theme.pageTextDark,
};

export const sectionBodyStyle: CSSProperties = {
  gap: spacing.md,
};

// Checkbox options sit in two even columns so long labels stay on one line.
export const optionGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  columnGap: spacing.xl,
};

// Labelled inputs flow on one line and wrap when the modal is narrow.
export const fieldRowStyle: CSSProperties = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: spacing.xl,
  rowGap: spacing.sm,
};
