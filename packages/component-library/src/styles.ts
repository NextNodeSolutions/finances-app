import { keyframes } from '@emotion/css';

import { theme } from './theme';
import { elevation, fontFamily, radius, tokens } from './tokens';

// oxlint-disable-next-line typescript/no-explicit-any
export type CSSProperties = Record<string, any>;

const MOBILE_MIN_HEIGHT = 40;

const shadowLarge = {
  boxShadow: elevation.popover,
};

const shadowSheet = {
  boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
};

export const styles: CSSProperties = {
  incomeHeaderHeight: 70,
  cardShadow: elevation.card,
  monthRightPadding: 5,
  menuBorderRadius: radius.md + 2,
  mobileMinHeight: MOBILE_MIN_HEIGHT,
  mobileMenuItem: {
    fontSize: 17,
    fontWeight: 400,
    paddingTop: 8,
    paddingBottom: 8,
    height: MOBILE_MIN_HEIGHT,
    minHeight: MOBILE_MIN_HEIGHT,
  },
  mobileEditingPadding: 12,
  altMenuMaxHeight: 250,
  altMenuText: {
    fontSize: 13,
  },
  altMenuHeaderText: {
    fontSize: 13,
    fontWeight: 600,
  },
  veryLargeText: {
    fontSize: 30,
    fontWeight: 600,
  },
  largeText: {
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  mediumText: {
    fontSize: 15,
    fontWeight: 500,
  },
  smallText: {
    fontSize: 13,
  },
  verySmallText: {
    fontSize: 12,
  },
  tinyText: {
    fontSize: 10,
  },
  page: {
    flex: 1,
    '@media (max-height: 550px)': {
      minHeight: 700, // ensure we can scroll on small screens
    },
    paddingTop: 8, // height of the titlebar
    [`@media (min-width: ${tokens.breakpoint_small})`]: {
      paddingTop: 36,
    },
  },
  pageContent: {
    paddingLeft: 2,
    paddingRight: 2,
    [`@media (min-width: ${tokens.breakpoint_small})`]: {
      paddingLeft: 20,
      paddingRight: 20,
    },
  },
  settingsPageContent: {
    padding: 20,
    [`@media (min-width: ${tokens.breakpoint_small})`]: {
      padding: 'inherit',
    },
  },
  staticText: {
    cursor: 'default',
    userSelect: 'none',
  },
  shadow: {
    boxShadow: elevation.raised,
  },
  shadowLarge,
  shadowSheet,
  // Keyboard focus indicator shared by every control: a sky ring held
  // off the edge so it never merges with the control's own border.
  focusRing: {
    outline: `2px solid ${theme.focusRing}`,
    outlineOffset: 2,
  },
  // Money and measurements: set in the mono face with tabular figures so
  // every amount reads like an instrument readout and columns align.
  tnum: {
    fontFamily: fontFamily.mono,
    fontFeatureSettings: '"tnum"',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.01em',
  },
  notFixed: { fontFeatureSettings: '', fontFamily: 'inherit' },
  // Display serif for page titles and headline balances only.
  display: {
    fontFamily: fontFamily.display,
    fontWeight: 400,
    letterSpacing: '-0.01em',
    fontVariantNumeric: 'lining-nums tabular-nums',
  },
  // Small uppercase mono labels naming columns and groups of figures.
  monoLabel: {
    fontFamily: fontFamily.mono,
    fontSize: 10.5,
    fontWeight: 500,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
  },
  text: {
    fontSize: 16,
    // lineHeight: 22.4 // TODO: This seems like trouble, but what's the right value?
  },
  delayedFadeIn: {
    animationName: keyframes({
      '0%': { opacity: 0 },
      '100%': { opacity: 1 },
    }),
    animationDuration: '1s',
    animationFillMode: 'both',
    animationDelay: '0.5s',
  },
  underlinedText: {
    borderBottom: `2px solid`,
  },
  noTapHighlight: {
    WebkitTapHighlightColor: 'transparent',
    ':focus': {
      outline: 'none',
    },
  },
  lineClamp: (lines: number) => {
    return {
      display: '-webkit-box',
      WebkitLineClamp: lines,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      wordBreak: 'break-word',
    };
  },
  ellipsisText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
  tooltip: {
    padding: '8px 10px',
    ...shadowLarge,
    borderWidth: 1,
    borderRadius: radius.md + 2,
    borderStyle: 'solid',
    borderColor: theme.tooltipBorder,
    backgroundColor: theme.tooltipBackground,
    color: theme.tooltipText,
    overflow: 'auto',
  },
  popover: {
    border: '1px solid ' + theme.menuBorder,
    borderRadius: radius.md + 2,
    boxShadow: elevation.popover,
    backgroundColor: theme.menuBackground,
    color: theme.menuItemText,
  },
  // Dynamically set
  horizontalScrollbar: null as CSSProperties | null,
  lightScrollbar: null as CSSProperties | null,
  darkScrollbar: null as CSSProperties | null,
  scrollbarWidth: null as number | null,
  editorPill: {
    color: theme.pillText,
    backgroundColor: theme.pillBackground,
    borderRadius: radius.sm,
    padding: '2px 7px',
  },
  mobileListItem: {
    borderBottom: `1px solid ${theme.tableBorder}`,
    backgroundColor: theme.tableBackground,
    padding: 16,
    cursor: 'pointer',
  },
  tableContainer: {
    flex: 1,
    border: '1px solid ' + theme.hairline,
    borderRadius: radius.lg,
    backgroundColor: theme.tableBackground,
    boxShadow: elevation.card,
    overflow: 'hidden',
  },
};
