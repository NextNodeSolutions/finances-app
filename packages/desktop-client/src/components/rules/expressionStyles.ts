import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';

// A rule reads as a sentence on a soft chip: connective words stay quiet,
// the field is set in the pill ink and the value in full ink.
export const expressionChipStyle = {
  display: 'block',
  maxWidth: '100%',
  color: theme.pageTextLight,
  backgroundColor: theme.pillBackgroundLight,
  border: `1px solid ${theme.hairlineSubtle}`,
  borderRadius: radius.sm,
  padding: '3px 8px',
  lineHeight: '18px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

export const expressionFieldStyle = {
  color: theme.pillText,
  fontWeight: 500,
};

export const expressionValueStyle = {
  color: theme.pageText,
  fontWeight: 500,
};
