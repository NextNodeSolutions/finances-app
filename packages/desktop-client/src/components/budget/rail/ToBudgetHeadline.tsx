import { Trans } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { Amount } from '#components/budget/Amount';
import { ToBudget } from '#components/budget/envelope/budgetsummary/ToBudget';
import { useEnvelopeSheetValue } from '#components/budget/envelope/EnvelopeBudgetComponents';
import { useEnvelopeBudget } from '#components/budget/envelope/EnvelopeBudgetContext';
import { SettleRule } from '#components/common/SettleRule';
import { useSettled } from '#hooks/useSettled';
import { envelopeBudget } from '#spreadsheet/bindings';

import { StatusPill } from './StatusPill';

type ToBudgetHeadlineProps = {
  month: string;
  /** Display size of the figure: 34 in the rail, smaller in a column. */
  fontSize?: number;
};

/**
 * TO BUDGET and its figure, which opens the To budget menu. Negative reads
 * Overbudgeted; exactly zero draws the Settle rule.
 */
export function ToBudgetHeadline({
  month,
  fontSize = 34,
}: ToBudgetHeadlineProps) {
  const { onBudgetAction } = useEnvelopeBudget();
  const toBudget = useEnvelopeSheetValue(envelopeBudget.toBudget);
  const { isSettled, hasJustSettled } = useSettled(toBudget);
  const isNegative = toBudget !== null && toBudget < 0;

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={{ ...styles.monoLabel, color: theme.pageTextSubdued }}>
        <Trans>To budget</Trans>
      </Text>
      <ToBudget month={month} onBudgetAction={onBudgetAction}>
        <Amount
          testId="to-budget-amount"
          value={toBudget}
          style={{
            ...styles.display,
            fontSize,
            lineHeight: 1.15,
            color: isNegative ? theme.numberNegative : theme.pageTextDark,
          }}
        />
      </ToBudget>
      {isNegative && (
        <StatusPill>
          <Trans>Overbudgeted</Trans>
        </StatusPill>
      )}
      <SettleRule isSettled={isSettled} hasJustSettled={hasJustSettled} />
    </View>
  );
}
