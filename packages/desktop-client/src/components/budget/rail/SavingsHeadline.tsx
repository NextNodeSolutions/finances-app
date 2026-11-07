import { Trans } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { Amount } from '#components/budget/Amount';
import { useTrackingSheetValue } from '#components/budget/tracking/TrackingBudgetComponents';
import { trackingBudget } from '#spreadsheet/bindings';

type SavingsHeadlineProps = {
  month: string;
  fontSize?: number;
};

/**
 * Projected savings for the current and coming months; Saved or Overspent
 * once a month is over. Never amber or signal on a figure at or above 0.
 */
export function SavingsHeadline({
  month,
  fontSize = 34,
}: SavingsHeadlineProps) {
  const isPast = month < monthUtils.currentMonth();
  const projected = useTrackingSheetValue(trackingBudget.totalBudgetedSaved);
  const saved = useTrackingSheetValue(trackingBudget.totalSaved);
  const value = isPast ? saved : projected;
  const isNegative = value !== null && value < 0;

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={{ ...styles.monoLabel, color: theme.pageTextSubdued }}>
        {!isPast ? (
          <Trans>Projected savings</Trans>
        ) : isNegative ? (
          <Trans>Overspent</Trans>
        ) : (
          <Trans>Saved</Trans>
        )}
      </Text>
      <Amount
        testId="savings-headline"
        value={value}
        style={{
          ...styles.display,
          fontSize,
          lineHeight: 1.15,
          color: isNegative ? theme.numberNegative : theme.pageTextDark,
        }}
      />
    </View>
  );
}
