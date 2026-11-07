import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import { css } from '@emotion/css';
import type { Locale } from 'date-fns';
import type { TFunction } from 'i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  chartGrid,
  chartXAxis,
  chartYAxis,
} from '#components/reports/chart-theme';
import { useFormat } from '#hooks/useFormat';
import type { UseFormatResult } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';
import { usePrivacyMode } from '#hooks/usePrivacyMode';

import { MonthEndTable } from './MonthEndTable';
import type { TrendPoint } from './statement';
import { TrendTooltip } from './TrendTooltip';

type NetWorthTrendProps = {
  /** Month-ends to draw, oldest first. */
  points: readonly TrendPoint[];
  pinnedMonth: string | null;
  /** A month-end was clicked; null when it is the current month (today). */
  onPin: (month: string | null) => void;
};

export const TREND_HEIGHT = 220;
// Mono 10.5px figures are about this wide per character.
const TICK_CHAR_WIDTH = 6.4;
// Long ranges carry the year on their month ticks.
const MONTHS_WITHOUT_YEAR = 13;

// Recharts draws the area fill as an attribute; the theme decides how much
// ink it gets, a touch more on dark paper.
const fillOpacity = '& .recharts-area-area';
const trendClassName = css({
  [fillOpacity]: { fillOpacity: 0.06 },
  [`[data-theme="dark"] ${fillOpacity}, [data-theme="midnight"] ${fillOpacity}`]:
    { fillOpacity: 0.08 },
  '@media (prefers-color-scheme: dark)': {
    [`[data-theme="auto"] ${fillOpacity}`]: { fillOpacity: 0.08 },
  },
});

/**
 * Month-end net worth as one ink line over a whisper of fill. Hovering
 * previews a month-end; clicking pins it, which rewinds the statement.
 */
export function NetWorthTrend({
  points,
  pinnedMonth,
  onPin,
}: NetWorthTrendProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const locale = useLocale();
  const isPrivacyMode = usePrivacyMode();

  const pinned = points.find(point => point.month === pinnedMonth);
  const values = points.map(point => point.netWorth);
  const hasNegative = values.some(value => value < 0);
  const isSinglePoint = points.length === 1;
  const tickFormat = points.length > MONTHS_WITHOUT_YEAR ? 'MMM yy' : 'MMM';
  const formatTick = (value: number) =>
    format(Math.round(value), 'financial-no-decimals');
  const yAxisWidth =
    Math.max(...values.map(value => formatTick(value).length), 1) *
      TICK_CHAR_WIDTH +
    12;

  const onClick = (activeLabel: unknown) => {
    if (typeof activeLabel !== 'string') {
      return;
    }
    onPin(activeLabel < monthUtils.currentMonth() ? activeLabel : null);
  };

  return (
    <>
      <View
        role="img"
        aria-label={getSummary({ t, points, format, locale, isPrivacyMode })}
        className={trendClassName}
        style={{ flex: 'none', height: TREND_HEIGHT, cursor: 'pointer' }}
      >
        <AreaChart
          responsive
          width="100%"
          height={TREND_HEIGHT}
          data={[...points]}
          accessibilityLayer={false}
          margin={{ top: 12, right: 0, bottom: 0, left: 0 }}
          onClick={state => onClick(state.activeLabel)}
        >
          <CartesianGrid {...chartGrid} />
          <XAxis
            {...chartXAxis}
            dataKey="month"
            interval="preserveStartEnd"
            minTickGap={24}
            padding={{ left: 12, right: 12 }}
            tickFormatter={(month: string) =>
              monthUtils.format(month, tickFormat, locale)
            }
          />
          <YAxis
            {...chartYAxis}
            orientation="right"
            width={isPrivacyMode ? 8 : yAxisWidth}
            tick={isPrivacyMode ? false : chartYAxis.tick}
            tickCount={4}
            domain={
              hasNegative
                ? ['auto', (max: number) => Math.max(max, 0)]
                : ['auto', 'auto']
            }
            tickFormatter={formatTick}
          />
          {hasNegative && (
            <ReferenceLine
              y={0}
              stroke={theme.hairlineStrong}
              strokeWidth={1}
            />
          )}
          <Tooltip
            isAnimationActive={false}
            cursor={{
              stroke: theme.accent,
              strokeWidth: 1,
              strokeDasharray: '3 3',
            }}
            content={props => (
              <TrendTooltip
                isActive={props.active}
                month={props.label}
                points={points}
              />
            )}
          />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke={theme.pageTextDark}
            strokeWidth={1.5}
            fill={theme.pageTextDark}
            fillOpacity={0.06}
            isAnimationActive={false}
            dot={isSinglePoint ? { r: 3, fill: theme.pageTextDark } : false}
            activeDot={{
              r: 3,
              fill: theme.pageTextDark,
              stroke: theme.cardBackground,
              strokeWidth: 2,
            }}
          />
          {pinned && (
            <ReferenceLine
              x={pinned.month}
              stroke={theme.accent}
              strokeWidth={1}
            />
          )}
          {pinned && (
            <ReferenceDot
              x={pinned.month}
              y={pinned.netWorth}
              r={3}
              fill={theme.accent}
              stroke={theme.cardBackground}
              strokeWidth={1}
            />
          )}
        </AreaChart>
      </View>
      <MonthEndTable points={points} />
    </>
  );
}

type SummaryInputs = {
  t: TFunction;
  points: readonly TrendPoint[];
  format: UseFormatResult;
  locale: Locale;
  isPrivacyMode: boolean;
};

// "Net worth, May to October 2026, from 45,902.11 to 48,210.33". Amounts
// stay out of the label in privacy mode.
function getSummary({
  t,
  points,
  format,
  locale,
  isPrivacyMode,
}: SummaryInputs): string {
  const first = points[0];
  const last = points[points.length - 1];
  if (first === undefined || last === undefined) {
    return t('Net worth');
  }
  const isSameYear = first.month.slice(0, 4) === last.month.slice(0, 4);
  const period = {
    from: monthUtils.format(
      first.month,
      isSameYear ? 'MMMM' : 'MMMM yyyy',
      locale,
    ),
    to: monthUtils.format(last.month, 'MMMM yyyy', locale),
  };
  if (isPrivacyMode) {
    return t('Net worth, {{from}} to {{to}}', period);
  }
  return t('Net worth, {{from}} to {{to}}, from {{start}} to {{end}}', {
    ...period,
    start: format(first.netWorth, 'financial'),
    end: format(last.netWorth, 'financial'),
  });
}
