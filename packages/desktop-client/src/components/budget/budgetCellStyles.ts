import { styles } from '@actual-app/components/styles';
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { motion, radius } from '@actual-app/components/tokens';
import { css } from '@emotion/css';

// Shared look of the desktop budget grid cells, used by both the envelope
// and the tracking month columns. Re-exported through ./util, the module's
// public entry.

const colorTransition = `background-color ${motion.base} ${motion.ease}, box-shadow ${motion.base} ${motion.ease}, color ${motion.base} ${motion.ease}`;

// Hairline column rule between the category column and each month.
export const monthColumnRule = '1px solid ' + theme.hairline;

// Totals in group rows and the header band: mono, medium weight (600+
// reads heavy in the mono face).
export const groupFigureStyle: CSSProperties = {
  ...styles.tnum,
  fontWeight: 500,
};

// The budgeted amount at rest: a quiet field that shows its edge on hover.
export const budgetedValueStyle: CSSProperties = {
  cursor: 'default',
  margin: 1,
  padding: '0 5px',
  borderRadius: radius.sm,
  transition: colorTransition,
  ':hover': {
    boxShadow: 'inset 0 0 0 1px ' + theme.hairlineStrong,
    backgroundColor: theme.formInputBackground,
  },
};

// The budgeted amount while editing: white field, accent edge and ring.
const editingRing = {
  border: '1px solid ' + theme.formInputBorderSelected,
  boxShadow: '0 0 0 3px ' + theme.formInputShadowSelected,
};
export const budgetedInputClassName = css({
  ...styles.tnum,
  backgroundColor: theme.formInputBackground,
  color: theme.formInputText,
  borderRadius: radius.sm,
  padding: '5px 5px',
  ...editingRing,
  '&[data-focused]': editingRing,
});

// The spent amount links to the category's activity.
export const spentValueClassName = css({
  cursor: 'pointer',
  textUnderlineOffset: 3,
  textDecorationThickness: 1,
  ':hover': { textDecoration: 'underline' },
});

// A negative balance sits in the overspent pill (signal: it needs
// attention). The negative right margin keeps its figures on the same
// decimal column as the rows around it.
export const negativeBalanceChipClassName = css({
  display: 'inline-block',
  padding: '1px 6px',
  marginRight: -6,
  lineHeight: '18px',
  borderRadius: radius.sm,
  backgroundColor: theme.signalSubtle,
  color: theme.signalText,
});

type ScheduleStatus = 'missed' | 'due' | string;

// Status colours match the schedule status pills: missed reads as an
// error, due as a warning, anything else as upcoming.
export function getScheduleIndicatorColor(status: ScheduleStatus) {
  if (status === 'missed') {
    return theme.errorText;
  }
  if (status === 'due') {
    return theme.warningText;
  }
  return theme.upcomingText;
}

export const scheduleIndicatorButtonStyle: CSSProperties = {
  padding: 4,
  borderRadius: radius.sm,
};
