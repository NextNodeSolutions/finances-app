import { useTranslation } from 'react-i18next';

import { css } from '@emotion/css';

import { chartTooltipSurface } from '#components/reports/chart-theme';

type PayloadItem = {
  payload: {
    year: number;
    age: number;
    count: number;
  };
};

type MonteCarloHistogramTooltipProps = {
  active?: boolean;
  payload?: PayloadItem[];
  simulationCount: number;
};

export function MonteCarloHistogramTooltip({
  active,
  payload,
  simulationCount,
}: MonteCarloHistogramTooltipProps) {
  const { t } = useTranslation();

  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div
        className={css({
          ...chartTooltipSurface,
        })}
      >
        {t(
          '{{failedCount}} of {{total}} scenarios ran out of money at age {{age}}',
          {
            failedCount: point.count,
            total: simulationCount,
            age: point.age,
          },
        )}
      </div>
    );
  }
  return null;
}
