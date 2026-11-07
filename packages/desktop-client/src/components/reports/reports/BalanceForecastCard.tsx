// oxlint-disable typescript-paths/absolute-parent-import
import { useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Block } from '@actual-app/components/block';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type {
  AccountEntity,
  BalanceForecastWidget,
} from '@actual-app/core/types/models';
import { css } from '@emotion/css';
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import {
  cardChartInset,
  cardHeaderStyle,
  cardHeadlineStyle,
  cardSupportingStyle,
  chartActiveDot,
  chartBaselineColor,
  chartLineWidth,
  chartTooltipSurface,
} from '#components/reports/chart-theme';
import { Container } from '#components/reports/Container';
import { DateRange } from '#components/reports/DateRange';
import { LoadingIndicator } from '#components/reports/LoadingIndicator';
import { ReportCard } from '#components/reports/ReportCard';
import { ReportCardName } from '#components/reports/ReportCardName';
import { calculateTimeRange } from '#components/reports/reportRanges';
import { useBalanceForecast } from '#hooks/useBalanceForecast';
import { useFormat } from '#hooks/useFormat';
import { useSyncedPref } from '#hooks/useSyncedPref';

import {
  buildBalanceForecastChartData,
  countForecastScheduledOccurrences,
  getLowestChartDataPoint,
  getZeroCrossingGradientOffset,
} from './balanceForecastChartData';

type BalanceForecastCardProps = {
  widgetId: string;
  isEditing?: boolean;
  accounts: AccountEntity[];
  meta?: BalanceForecastWidget['meta'];
  onMetaChange: (newMeta: BalanceForecastWidget['meta']) => void;
};

export function BalanceForecastCard({
  widgetId,
  isEditing,
  accounts,
  meta,
  onMetaChange,
}: BalanceForecastCardProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const [budgetTypePref] = useSyncedPref('budgetType');
  const budgetType = budgetTypePref === 'tracking' ? 'tracking' : 'envelope';
  const source =
    meta?.source === 'tracking-budget' && budgetType === 'tracking'
      ? 'tracking-budget'
      : 'schedules';
  const isTrackingBudgetForecast = source === 'tracking-budget';
  const granularity = meta?.granularity || 'Monthly';

  const [nameMenuOpen, setNameMenuOpen] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);

  const defaultTimeFrame = {
    start: monthUtils.currentMonth(),
    end: monthUtils.addMonths(monthUtils.currentMonth(), 11),
    mode: 'static' as const,
  };

  const [start, end] = calculateTimeRange(meta?.timeFrame, defaultTimeFrame);

  const selectedAccountIds = useMemo(
    () => meta?.accounts ?? accounts.map(a => a.id),
    [accounts, meta?.accounts],
  );

  // `start` may be `yyyy-MM` or `yyyy-MM-dd`; `firstDayOfMonth` handles both.
  const startDate = monthUtils.firstDayOfMonth(start);
  const endDate = monthUtils.lastDayOfMonth(end);

  const {
    data: forecastData,
    error,
    isFetching,
    isPlaceholderData,
    isPending: isLoading,
  } = useBalanceForecast({
    accountIds: isTrackingBudgetForecast ? undefined : selectedAccountIds,
    conditions: isTrackingBudgetForecast ? undefined : meta?.conditions,
    conditionsOp: isTrackingBudgetForecast ? undefined : meta?.conditionsOp,
    startDate,
    endDate,
    includeAccountlessSchedules: isTrackingBudgetForecast
      ? undefined
      : meta?.accounts === undefined,
    source,
  });
  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? t('Failed to load forecast')
        : null;
  const normalizedForecastData = forecastData ?? null;
  const committedChartRange = useRef({ start, end });

  const onCardHover = () => setIsCardHovered(true);
  const onCardHoverEnd = () => setIsCardHovered(false);

  const chartRange = isPlaceholderData
    ? committedChartRange.current
    : { start, end };
  useEffect(() => {
    if (normalizedForecastData && !isPlaceholderData) {
      committedChartRange.current = { start, end };
    }
  }, [end, isPlaceholderData, normalizedForecastData, start]);

  const chartData = buildBalanceForecastChartData({
    forecastData: normalizedForecastData,
    start: chartRange.start,
    end: chartRange.end,
    granularity,
  });
  const endingPoint = chartData.at(-1);
  const lowestPoint = getLowestChartDataPoint(chartData);
  const hasNegativeEndingBalance = endingPoint && endingPoint.balance < 0;
  const hasNegativeBalance = chartData.some(d => d.balance < 0);
  const zeroCrossingGradientOffset = getZeroCrossingGradientOffset(chartData);
  const gradientId = `balance-forecast-card-line-gradient-${widgetId}`;
  const isUpdatingForecast = isFetching && isPlaceholderData;
  const todayReferenceDate = monthUtils.currentMonth();
  const showsTodayReferenceLine = chartData.some(
    dataPoint => dataPoint.date === todayReferenceDate,
  );

  const scheduledOccurrenceCount = countForecastScheduledOccurrences({
    forecastData: normalizedForecastData,
    start: chartRange.start,
    end: chartRange.end,
    granularity,
  });
  const hasFilters =
    !isTrackingBudgetForecast && (meta?.conditions?.length ?? 0) > 0;

  return (
    <ReportCard
      widgetId={widgetId}
      isEditing={isEditing}
      disableClick={nameMenuOpen}
      to={`/reports/forecast/${widgetId}`}
      onRename={() => setNameMenuOpen(true)}
    >
      <View
        style={{ flex: 1 }}
        onPointerEnter={onCardHover}
        onPointerLeave={onCardHoverEnd}
      >
        <View style={cardHeaderStyle}>
          <View style={{ flex: 1 }}>
            <ReportCardName
              name={meta?.name || t('Balance Forecast')}
              isEditing={nameMenuOpen}
              onChange={newName => {
                onMetaChange({
                  ...meta,
                  name: newName,
                });
                setNameMenuOpen(false);
              }}
              onClose={() => setNameMenuOpen(false)}
            />
            <DateRange start={start} end={end} />
          </View>
          {endingPoint && (
            <View style={{ textAlign: 'right' }}>
              <Block
                style={{
                  marginBottom: 2,
                  color: hasNegativeEndingBalance
                    ? theme.reportsNumberNegative
                    : theme.pageText,
                }}
              >
                <PrivacyFilter activationFilters={[!isCardHovered]}>
                  <span style={cardSupportingStyle}>
                    <Trans>Ending</Trans>:
                  </span>{' '}
                  <FinancialText style={cardHeadlineStyle}>
                    {format(endingPoint.balance, 'financial')}
                  </FinancialText>
                </PrivacyFilter>
              </Block>
              <PrivacyFilter activationFilters={[!isCardHovered]}>
                <Block style={cardSupportingStyle}>{endingPoint.date}</Block>
              </PrivacyFilter>
              {lowestPoint && lowestPoint.date !== endingPoint.date ? (
                <PrivacyFilter activationFilters={[!isCardHovered]}>
                  <Block style={{ ...cardSupportingStyle, marginTop: 2 }}>
                    <Trans>Low</Trans>:{' '}
                    <FinancialText>
                      {format(lowestPoint.balance, 'financial')}
                    </FinancialText>
                  </Block>
                </PrivacyFilter>
              ) : null}
            </View>
          )}
        </View>

        {isLoading && !normalizedForecastData ? (
          <LoadingIndicator />
        ) : errorMessage ? (
          <View style={{ height: 120, padding: 20 }}>
            <Block
              style={{
                fontSize: 13,
                color: theme.errorText,
                textAlign: 'center',
              }}
            >
              {errorMessage}
            </Block>
          </View>
        ) : forecastData && forecastData.dataPoints.length > 0 ? (
          <>
            <Container style={{ height: 'auto', flex: 1, ...cardChartInset }}>
              {(width, height) => (
                <ResponsiveContainer>
                  <LineChart
                    width={width}
                    height={height}
                    data={chartData}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id={gradientId}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        {zeroCrossingGradientOffset == null ? (
                          <stop
                            offset="0%"
                            stopColor={
                              hasNegativeBalance
                                ? theme.reportsNumberNegative
                                : theme.reportsChartFill
                            }
                          />
                        ) : (
                          <>
                            <stop
                              offset={`${zeroCrossingGradientOffset}%`}
                              stopColor={theme.reportsChartFill}
                            />
                            <stop
                              offset={`${zeroCrossingGradientOffset}%`}
                              stopColor={theme.reportsNumberNegative}
                            />
                          </>
                        )}
                      </linearGradient>
                    </defs>
                    <Tooltip
                      isAnimationActive={false}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className={css(chartTooltipSurface)}>
                              <div style={{ marginBottom: 5 }}>
                                <strong>{payload[0].payload.date}</strong>
                              </div>
                              <FinancialText as="div">
                                {format(
                                  payload[0].value as number,
                                  'financial',
                                )}
                              </FinancialText>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {showsTodayReferenceLine && (
                      <ReferenceLine
                        x={todayReferenceDate}
                        stroke={theme.accent}
                        strokeDasharray="3 3"
                      />
                    )}
                    {hasNegativeBalance && (
                      <ReferenceLine y={0} stroke={chartBaselineColor} />
                    )}
                    <Line
                      type="monotone"
                      dataKey="balance"
                      stroke={`url(#${gradientId})`}
                      strokeWidth={chartLineWidth}
                      dot={false}
                      activeDot={chartActiveDot}
                      opacity={isUpdatingForecast ? 0.45 : 1}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Container>
            <Block style={{ ...cardSupportingStyle, padding: '0 20px 16px' }}>
              {isTrackingBudgetForecast ? (
                <Trans>
                  Forecast = starting balance + budgeted income - budgeted
                  expenses
                </Trans>
              ) : scheduledOccurrenceCount === 0 ? (
                hasFilters ? (
                  <Trans>
                    Filtered running total only; no scheduled occurrences in
                    this range
                  </Trans>
                ) : (
                  <Trans>No scheduled transactions in this range</Trans>
                )
              ) : (
                <>
                  <Trans count={scheduledOccurrenceCount}>
                    {{ count: scheduledOccurrenceCount }} scheduled transactions
                    included
                  </Trans>
                  {hasFilters ? (
                    <>
                      {' '}
                      <Trans>(filtered running total)</Trans>
                    </>
                  ) : null}
                </>
              )}
              {isUpdatingForecast ? (
                <>
                  {' '}
                  <Trans>Updating...</Trans>
                </>
              ) : null}
            </Block>
          </>
        ) : (
          <View style={{ height: 120, padding: 20 }}>
            <Block
              style={{
                fontSize: 13,
                color: theme.pageTextLight,
                textAlign: 'center',
              }}
            >
              <Trans>
                No transactions are included in this report. Adjust your
                filters, accounts, or date range to see a balance projection.
              </Trans>
            </Block>
          </View>
        )}
      </View>
    </ReportCard>
  );
}
