import React from 'react';
import type { ReactNode } from 'react';

import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { elevation, motion, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type SummaryCardProps = {
  month: string;
  isCurrentMonth: boolean;
  isCollapsed: boolean;
  children: ReactNode;
};

// The paper card holding one month's summary above its budget column.
export function SummaryCard({
  month,
  isCurrentMonth,
  isCollapsed,
  children,
}: SummaryCardProps) {
  return (
    <View
      data-testid="budget-summary"
      data-month={month}
      style={{
        flex: 1,
        marginTop: 6,
        marginBottom: 12,
        padding: isCollapsed ? '12px 20px 14px' : '16px 20px 20px',
        backgroundColor: isCurrentMonth
          ? theme.budgetCurrentMonth
          : theme.budgetOtherMonth,
        border: '1px solid ' + theme.hairline,
        borderRadius: radius.lg,
        boxShadow: elevation.card,
        cursor: 'default',
        overflow: 'hidden',
        containerType: 'inline-size',
        containerName: 'month-summary',
        '& .hover-visible': {
          opacity: 0,
          transition: `opacity ${motion.base} ${motion.ease}`,
        },
        '&:hover .hover-visible, &:focus-within .hover-visible': {
          opacity: 1,
        },
      }}
    >
      {children}
    </View>
  );
}

// Shared layout of the month summary card (envelope and tracking).

// A card wide enough (one month spanning the whole table) sets the
// statement in two columns: the ruled lines on the left, the headline
// figure on the right.
const wideCard = '@container month-summary (min-width: 560px)';

// The card's body below the title: stat lines, then the headline figure.
export const summaryBodyStyle: CSSProperties = {
  marginTop: 14,
  [wideCard]: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    columnGap: 32,
  },
};

// The stat lines, ruled by a hairline between each.
export const summaryLedgerStyle: CSSProperties = {
  '& > :not(:first-child)': {
    borderTop: '1px solid ' + theme.hairlineSubtle,
  },
  [wideCard]: {
    flex: '0 1 340px',
  },
};

const headlineLabelStyle: CSSProperties = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  columnGap: 12,
  fontSize: 13,
  fontWeight: 500,
  color: theme.pageTextLight,
};

// Statement total under a firmer rule: label on the left, the headline
// figure on the right; in a wide card, stacked at the bottom right.
export const summaryHeadlineRowStyle: CSSProperties = {
  ...headlineLabelStyle,
  marginTop: 12,
  paddingTop: 14,
  borderTop: '1px solid ' + theme.hairline,
  [wideCard]: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: 0,
    paddingTop: 0,
    borderTop: 0,
  },
};

export const summaryCollapsedRowStyle: CSSProperties = {
  ...headlineLabelStyle,
  marginTop: 6,
  [wideCard]: {
    justifyContent: 'flex-end',
    columnGap: 16,
  },
};

export const summaryHeadlineAmountStyle: CSSProperties = {
  fontSize: 34,
  lineHeight: '40px',
  fontWeight: 300,
};

export const summaryCollapsedAmountStyle: CSSProperties = {
  fontSize: 22,
  lineHeight: '28px',
  fontWeight: 300,
};

export const summaryIconButtonStyle: CSSProperties = {
  width: 28,
  height: 28,
  padding: 0,
  borderRadius: radius.md,
  color: theme.pageTextLight,
};
