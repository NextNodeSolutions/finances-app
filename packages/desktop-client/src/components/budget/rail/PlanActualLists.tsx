import { Trans } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { useTrackingSheetValue } from '#components/budget/tracking/TrackingBudgetComponents';
import { trackingBudget } from '#spreadsheet/bindings';

import { FigureRow } from './FigureRow';

type PlanActualListsProps = {
  month: string;
};

const listLabelStyle = {
  ...styles.monoLabel,
  display: 'block',
  color: theme.pageTextSubdued,
  marginBottom: spacing.xs,
};

/** Tracking PLAN against ACTUAL for the month in the SheetNameProvider. */
export function PlanActualLists({ month }: PlanActualListsProps) {
  const isPast = month < monthUtils.currentMonth();
  const expectedIncome = useTrackingSheetValue(
    trackingBudget.totalBudgetedIncome,
  );
  const budgetedExpenses = useTrackingSheetValue(
    trackingBudget.totalBudgetedExpense,
  );
  const plannedSaving = useTrackingSheetValue(
    trackingBudget.totalBudgetedSaved,
  );
  const received = useTrackingSheetValue(trackingBudget.totalIncome);
  const spent = useTrackingSheetValue(trackingBudget.totalSpent);
  const saved = useTrackingSheetValue(trackingBudget.totalSaved);

  return (
    <View style={{ gap: spacing.lg }}>
      <View>
        <Text style={listLabelStyle}>
          <Trans>Plan</Trans>
        </Text>
        <FigureRow
          label={<Trans>Expected income</Trans>}
          value={expectedIncome}
        />
        <FigureRow
          label={<Trans>Budgeted expenses</Trans>}
          // `|| 0` keeps an empty plan from printing -0.00.
          value={budgetedExpenses === null ? null : -budgetedExpenses || 0}
        />
        <FigureRow
          label={<Trans>Planned saving</Trans>}
          value={plannedSaving}
        />
      </View>
      <View>
        <Text style={listLabelStyle}>
          <Trans>Actual</Trans>
        </Text>
        <FigureRow label={<Trans>Received</Trans>} value={received} />
        <FigureRow label={<Trans>Spent</Trans>} value={spent} />
        <FigureRow
          label={isPast ? <Trans>Saved</Trans> : <Trans>Saved so far</Trans>}
          value={saved}
        />
      </View>
    </View>
  );
}
