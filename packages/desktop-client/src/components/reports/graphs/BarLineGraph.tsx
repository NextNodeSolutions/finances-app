// @ts-strict-ignore
import React from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { AlignedText } from '@actual-app/components/aligned-text';
import { theme } from '@actual-app/components/theme';
import { css } from '@emotion/css';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { PrivacyFilter } from '#components/PrivacyFilter';
import {
  chartBarRadius,
  chartEndMargin,
  chartGrid,
  chartLineWidth,
  chartTooltipSurface,
  chartXAxis,
  chartYAxis,
  useRechartsAnimation,
} from '#components/reports/chart-theme';
import { Container } from '#components/reports/Container';
import { numberFormatterTooltip } from '#components/reports/numberFormatter';
import { useFormat } from '#hooks/useFormat';

type PayloadItem = {
  payload: {
    date: string;
    assets: number | string;
    debt: number | string;
    networth: number | string;
    change: number | string;
  };
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: PayloadItem[];
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  const { t } = useTranslation();

  if (active && payload && payload.length) {
    return (
      <div
        className={css({
          ...chartTooltipSurface,
        })}
      >
        <div>
          <div style={{ marginBottom: 10 }}>
            <strong>{payload[0].payload.date}</strong>
          </div>
          <div style={{ lineHeight: 1.5 }}>
            <PrivacyFilter>
              <AlignedText
                left={t('Assets:')}
                right={payload[0].payload.assets}
              />
              <AlignedText left={t('Debt:')} right={payload[0].payload.debt} />
              <AlignedText
                left={t('Change:')}
                right={<strong>{payload[0].payload.change}</strong>}
              />
            </PrivacyFilter>
          </div>
        </div>
      </div>
    );
  }
};

type BarLineGraphProps = {
  style?: CSSProperties;
  data;
  compact?: boolean;
  showTooltip?: boolean;
};

export function BarLineGraph({
  style,
  data,
  compact,
  showTooltip = true,
}: BarLineGraphProps) {
  const format = useFormat();
  const animationProps = useRechartsAnimation();
  const tickFormatter = tick => {
    return `${format(Math.round(tick), 'financial')}`; // Formats the tick values as strings with commas
  };

  return (
    <Container
      style={{
        ...style,
        ...(compact && { height: 'auto' }),
      }}
    >
      {(width, height) =>
        data && (
          <div>
            {!compact && <div style={{ marginTop: '15px' }} />}
            <ComposedChart
              responsive
              width={width}
              height={height}
              data={data.data}
              margin={{
                top: 0,
                right: compact ? 0 : chartEndMargin,
                left: 0,
                bottom: 0,
              }}
            >
              {showTooltip && (
                <Tooltip
                  content={<CustomTooltip />}
                  formatter={numberFormatterTooltip}
                  isAnimationActive={false}
                />
              )}
              {!compact && <CartesianGrid {...chartGrid} />}
              {!compact && <XAxis {...chartXAxis} dataKey="x" />}
              {!compact && (
                <YAxis
                  {...chartYAxis}
                  dataKey="y"
                  tickFormatter={tickFormatter}
                />
              )}
              <Bar
                type="monotone"
                dataKey="y"
                fill={theme.reportsChartFill}
                radius={chartBarRadius}
                {...animationProps}
              />
              <Line
                type="monotone"
                dataKey="y"
                stroke={theme.pageTextLight}
                strokeWidth={chartLineWidth}
                dot={false}
                {...animationProps}
              />
            </ComposedChart>
          </div>
        )
      }
    </Container>
  );
}
