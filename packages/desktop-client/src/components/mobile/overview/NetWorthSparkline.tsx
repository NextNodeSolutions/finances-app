import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { Skeleton } from '#components/overview/Skeleton';
import type { TrendPoint } from '#components/overview/statement';
import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';
import type { NetWorthRange } from '#hooks/useNetWorthHistory';
import { usePrivacyMode } from '#hooks/usePrivacyMode';

import { SparklineRangeLabel } from './SparklineRangeLabel';

type NetWorthSparklineProps = {
  /** Month-ends to draw, oldest first. */
  points: readonly TrendPoint[];
  /** A tap switches between 6M and 1Y; a pin can widen it further. */
  range: NetWorthRange;
  isLoading: boolean;
  /** The rewound month-end, marked with an accent line. */
  pinnedMonth: string | null;
  onToggleRange: () => void;
};

const SPARKLINE_HEIGHT = 120;
// The drawing is laid out on a 100-unit-wide box stretched to the width.
const VIEW_WIDTH = 100;
// Keeps the stroke off the top and bottom edges.
const VERTICAL_INSET = 6;
const LINE_WIDTH = 1.5;
const FILL_OPACITY = 0.06;

/**
 * Month-end net worth as one ink line, no axes. Tapping it switches between
 * six months and a year.
 */
export function NetWorthSparkline({
  points,
  range,
  isLoading,
  pinnedMonth,
  onToggleRange,
}: NetWorthSparklineProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const locale = useLocale();
  const isPrivacyMode = usePrivacyMode();
  const summaryId = useId();

  const values = points.map(point => point.netWorth);
  const linePoints = getLinePoints(values);
  const pinnedIndex = points.findIndex(point => point.month === pinnedMonth);
  const pinnedPoint = pinnedIndex === -1 ? undefined : linePoints[pinnedIndex];
  const summary = getSummary(points, {
    t,
    isPrivacyMode,
    formatMonth: month => monthUtils.format(month, 'MMMM yyyy', locale),
    formatAmount: amount => format(amount, 'financial'),
  });

  return (
    <Button
      variant="bare"
      aria-label={
        range === '6M'
          ? t('Show the last 12 months')
          : t('Show the last 6 months')
      }
      aria-describedby={summaryId}
      onPress={onToggleRange}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: spacing.xs,
        width: '100%',
        padding: 0,
        borderRadius: radius.md,
      }}
    >
      {isLoading || linePoints.length === 0 ? (
        <Skeleton height={SPARKLINE_HEIGHT} />
      ) : (
        <svg
          aria-hidden
          width="100%"
          height={SPARKLINE_HEIGHT}
          viewBox={`0 0 ${VIEW_WIDTH} ${SPARKLINE_HEIGHT}`}
          preserveAspectRatio="none"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <path
            d={getAreaPath(linePoints)}
            style={{ fill: theme.pageTextDark, fillOpacity: FILL_OPACITY }}
          />
          <path
            d={getLinePath(linePoints)}
            vectorEffect="non-scaling-stroke"
            style={{
              fill: 'none',
              stroke: theme.pageTextDark,
              strokeWidth: LINE_WIDTH,
              strokeLinejoin: 'round',
            }}
          />
          {pinnedPoint && (
            <line
              x1={pinnedPoint.x}
              x2={pinnedPoint.x}
              y1={0}
              y2={SPARKLINE_HEIGHT}
              vectorEffect="non-scaling-stroke"
              style={{ stroke: theme.accent, strokeWidth: 1 }}
            />
          )}
        </svg>
      )}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: spacing.sm,
        }}
      >
        <SparklineRangeLabel label={t('6M')} isActive={range === '6M'} />
        <SparklineRangeLabel label={t('1Y')} isActive={range === '1Y'} />
      </View>
      <Text id={summaryId} style={styles.visuallyHidden}>
        {summary}
      </Text>
    </Button>
  );
}

type LinePoint = { x: number; y: number };

// A single month-end is drawn as a level line across the box.
function getLinePoints(values: readonly number[]): LinePoint[] {
  if (values.length === 0) {
    return [];
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  const drawable = SPARKLINE_HEIGHT - 2 * VERTICAL_INSET;
  const toY = (value: number) =>
    span === 0
      ? SPARKLINE_HEIGHT / 2
      : VERTICAL_INSET + (1 - (value - min) / span) * drawable;

  if (values.length === 1) {
    const y = toY(values[0]);
    return [
      { x: 0, y },
      { x: VIEW_WIDTH, y },
    ];
  }
  return values.map((value, index) => ({
    x: (index / (values.length - 1)) * VIEW_WIDTH,
    y: toY(value),
  }));
}

function getLinePath(linePoints: readonly LinePoint[]): string {
  return linePoints
    .map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`)
    .join(' ');
}

function getAreaPath(linePoints: readonly LinePoint[]): string {
  return `${getLinePath(linePoints)} L${VIEW_WIDTH} ${SPARKLINE_HEIGHT} L0 ${SPARKLINE_HEIGHT} Z`;
}

type SummaryFormatters = {
  t: ReturnType<typeof useTranslation>['t'];
  isPrivacyMode: boolean;
  formatMonth: (month: string) => string;
  formatAmount: (amount: number) => string;
};

// "Net worth, May 2026 to October 2026, from 45,902.11 to 48,210.33".
function getSummary(
  points: readonly TrendPoint[],
  { t, isPrivacyMode, formatMonth, formatAmount }: SummaryFormatters,
): string {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) {
    return t('Net worth');
  }
  const months = {
    start: formatMonth(first.month),
    end: formatMonth(last.month),
  };
  if (isPrivacyMode) {
    return t('Net worth, {{start}} to {{end}}', months);
  }
  return t('Net worth, {{start}} to {{end}}, from {{from}} to {{to}}', {
    ...months,
    from: formatAmount(first.netWorth),
    to: formatAmount(last.netWorth),
  });
}
