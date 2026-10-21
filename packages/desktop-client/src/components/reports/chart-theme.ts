import { useMemo } from 'react';

import { styles } from '@actual-app/components/styles';
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import {
  elevation,
  fontFamily,
  motion,
  radius,
} from '@actual-app/components/tokens';

import { useReducedMotion } from '#hooks/useReducedMotion';

export function getColorScale(name: string): string[] {
  // Fixed categorical order: series keep their hue whatever the count.
  const scales: Record<string, string[]> = {
    qualitative: [
      'var(--color-chartQual1)',
      'var(--color-chartQual2)',
      'var(--color-chartQual3)',
      'var(--color-chartQual4)',
      'var(--color-chartQual5)',
      'var(--color-chartQual6)',
      'var(--color-chartQual7)',
      'var(--color-chartQual8)',
      'var(--color-chartQual9)',
    ],
  };
  return name ? scales[name] : scales.qualitative;
}

// Recessive chart chrome shared by every report graph: horizontal hairline
// gridlines, small mono figures on the axes, no tick marks.
export const chartGrid = {
  stroke: theme.hairline,
  strokeDasharray: '3 3',
  vertical: false,
} as const;

export const chartAxisTick = {
  fill: theme.pageTextSubdued,
  fontFamily: fontFamily.mono,
  fontSize: 10.5,
} as const;

export const chartXAxis = {
  tick: chartAxisTick,
  tickLine: false,
  axisLine: { stroke: theme.hairlineStrong },
  tickMargin: 8,
} as const;

export const chartYAxis = {
  tick: chartAxisTick,
  tickLine: false,
  axisLine: false,
  tickMargin: 6,
} as const;

// Zero line and other reference rules: one step above the gridlines.
export const chartBaselineColor = theme.hairlineStrong;

export const chartLineWidth = 1.75;

// Room at the end of a full-size chart so the last x-axis label, centred on
// the plot edge, is never cut. Compact dashboard charts keep 0.
export const chartEndMargin = 24;

// Rounds the data end of vertical bars. Recharts draws negative bars upside
// down, so the same radius lands on their data end too.
export const chartBarRadius: [number, number, number, number] = [3, 3, 0, 0];

export const chartLineCursor = {
  stroke: theme.hairlineStrong,
  strokeWidth: 1,
  strokeDasharray: '3 3',
} as const;

export const chartBarCursor = {
  fill: theme.hairlineSubtle,
  fillOpacity: 0.6,
} as const;

// Hover dot ringed in the card surface so it lifts off the line.
export const chartActiveDot = {
  r: 4,
  stroke: theme.cardBackground,
  strokeWidth: 2,
} as const;

// Chart tooltips follow the popover surface.
export const chartTooltipSurface: CSSProperties = {
  zIndex: 1000,
  pointerEvents: 'none',
  backgroundColor: theme.menuBackground,
  color: theme.menuItemText,
  border: `1px solid ${theme.menuBorder}`,
  borderRadius: radius.md + 2,
  boxShadow: elevation.popover,
  padding: '8px 10px',
  fontSize: 12,
  lineHeight: '18px',
  '& strong': { fontWeight: 600 },
};

export function useRechartsAnimation(defaults?: {
  animationDuration?: number;
  isAnimationActive?: boolean;
}) {
  const reducedMotion = useReducedMotion();

  const isAnimationActive = reducedMotion
    ? false
    : (defaults?.isAnimationActive ?? true);
  const animationDuration = reducedMotion ? 0 : defaults?.animationDuration;

  // The returned object must be referentially stable: recharts re-runs chart
  // animations (hiding labels while animating) whenever element identity
  // changes, and this file is outside the React Compiler's *.tsx include, so
  // it isn't auto-memoized.
  return useMemo(
    () => ({ isAnimationActive, animationDuration }),
    [isAnimationActive, animationDuration],
  );
}

// Report surfaces and type shared by the dashboard cards and report pages.

// White paper surface for one section of a report page.
export const reportSectionStyle: CSSProperties = {
  backgroundColor: theme.cardBackground,
  border: `1px solid ${theme.hairline}`,
  borderRadius: radius.lg,
  boxShadow: elevation.card,
};

// Side gutter of a report page. It must equal the Page gutter (PAGE_GUTTER
// in components/Page.tsx) so the dashboard grid lines up with the title.
export const reportPageGutter = 20;

// Panel holding a report page's chart and tables on the canvas.
export const reportPanelStyle: CSSProperties = {
  ...reportSectionStyle,
  margin: '0 20px 20px',
};

// The one headline figure of a report page, set in the display serif. It
// stays in ink: the sign carries the direction, and good or bad is shown by
// the small delta line under it.
export const reportHeadlineStyle: CSSProperties = {
  ...styles.display,
  fontSize: 34,
  lineHeight: '40px',
  fontWeight: 300,
  letterSpacing: '-0.015em',
  color: theme.pageText,
};

// Header row of a dashboard card: title and supporting line on the left,
// the card's headline figure on the right.
export const cardHeaderStyle: CSSProperties = {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 12,
  padding: '18px 20px 12px',
};

// The headline figure of a dashboard card, in ink like the page headline.
export const cardHeadlineStyle: CSSProperties = {
  ...styles.display,
  fontSize: 26,
  lineHeight: '30px',
  fontWeight: 300,
  letterSpacing: '-0.015em',
  color: theme.pageText,
  whiteSpace: 'nowrap',
};

// Small mono line under a headline figure: the only place where the good or
// bad colour of a figure is shown.
export const deltaLineStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 11.5,
  lineHeight: '16px',
  fontWeight: 500,
};

// Small supporting text under a card title or figure.
export const cardSupportingStyle: CSSProperties = {
  fontSize: 12,
  lineHeight: '16px',
  color: theme.pageTextSubdued,
};

// Charts sit inside the card's padding instead of bleeding to its edges.
export const cardChartInset: CSSProperties = {
  marginLeft: 20,
  marginRight: 20,
  marginBottom: 16,
};

export const colorTransition = `color ${motion.base} ${motion.ease}, background-color ${motion.base} ${motion.ease}, border-color ${motion.base} ${motion.ease}, box-shadow ${motion.base} ${motion.ease}`;

// "How is this calculated?" notes under a report: quiet prose, readable measure.
export const explainerStyle: CSSProperties = {
  marginTop: 32,
  paddingTop: 20,
  borderTop: `1px solid ${theme.hairlineSubtle}`,
  maxWidth: '72ch',
  fontSize: 13,
  lineHeight: '20px',
  color: theme.pageTextLight,
  userSelect: 'none',
  '& strong': { fontWeight: 600, color: theme.pageText },
};

// Icon segment of the custom-report toolbar. It mirrors ModeButton (white
// pill lifted off the tray when on) for buttons that also need a tooltip,
// an accessible name and a disabled state.
export function getSegmentStyle(isSelected: boolean): CSSProperties {
  const stateStyle: CSSProperties = isSelected
    ? {
        color: theme.pageText,
        backgroundColor: theme.buttonNormalBackground,
        borderColor: theme.hairline,
        boxShadow: elevation.xs,
        '&[data-hovered], &[data-pressed]': {
          color: theme.pageText,
          backgroundColor: theme.buttonNormalBackground,
        },
      }
    : {
        color: theme.pageTextLight,
        backgroundColor: 'transparent',
        '&[data-hovered]': { color: theme.pageText },
      };
  return {
    borderRadius: radius.sm,
    border: '1px solid transparent',
    transition: colorTransition,
    ...stateStyle,
    '&[data-disabled]': { color: theme.buttonBareDisabledText },
  };
}
