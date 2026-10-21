import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import type { useNetWorthHistory } from '#hooks/useNetWorthHistory';

import { NetWorthTrend, TREND_HEIGHT } from './NetWorthTrend';
import { Skeleton } from './Skeleton';
import type { TrendPoint } from './statement';

type TrendAreaProps = {
  history: Pick<
    ReturnType<typeof useNetWorthHistory>,
    'isLoading' | 'error' | 'retry'
  >;
  points: readonly TrendPoint[];
  pinnedMonth: string | null;
  onPin: (month: string | null) => void;
};

/**
 * The trend, or what stands in for it: a still placeholder while the history
 * builds, the error with a retry, or a single point before there is history.
 */
export function TrendArea({
  history,
  points,
  pinnedMonth,
  onPin,
}: TrendAreaProps) {
  if (history.error !== null) {
    return (
      <View
        style={{
          height: TREND_HEIGHT,
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.md,
        }}
      >
        <Text style={{ fontSize: 13, color: theme.pageTextSubdued }}>
          <Trans>Couldn't build the history.</Trans>
        </Text>
        <Button onPress={history.retry}>
          <Trans>Retry</Trans>
        </Button>
      </View>
    );
  }

  if (history.isLoading) {
    return <Skeleton height={TREND_HEIGHT} />;
  }

  const isBuilding =
    points.length <= 1 || points.every(point => point.netWorth === 0);
  if (!isBuilding) {
    return (
      <NetWorthTrend points={points} pinnedMonth={pinnedMonth} onPin={onPin} />
    );
  }

  return (
    <View style={{ gap: spacing.sm }}>
      <NetWorthTrend
        points={points.slice(-1)}
        pinnedMonth={pinnedMonth}
        onPin={onPin}
      />
      <Text
        style={{
          textAlign: 'center',
          fontSize: 12.5,
          color: theme.pageTextSubdued,
        }}
      >
        <Trans>History builds from your first month of transactions.</Trans>
      </Text>
    </View>
  );
}
