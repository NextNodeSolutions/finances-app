import { Trans } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { PaceGauge } from '#components/common/PaceGauge';
import { SettleRule } from '#components/common/SettleRule';
import { useOverspentCategories } from '#hooks/useOverspentCategories';
import { useSettled } from '#hooks/useSettled';
import { useSheetValue } from '#hooks/useSheetValue';
import { envelopeBudget } from '#spreadsheet/bindings';

import { Amount } from './Amount';
import { HealthRow } from './HealthRow';
import { OfAmount } from './OfAmount';
import { OverspentFigure } from './OverspentFigure';

type EnvelopeMonthHealthProps = {
  month: string;
  /** A past month read as a closed statement: it adds what was saved. */
  isStatement: boolean;
};

/**
 * An envelope month in a few lines: what is left to budget, spending
 * against the plan and the month's pace, income, and overspending. Read
 * from the month's sheet, so it must sit inside its SheetNameProvider.
 */
export function EnvelopeMonthHealth({
  month,
  isStatement,
}: EnvelopeMonthHealthProps) {
  const toBudget = useSheetValue<'envelope-budget', 'to-budget'>(
    envelopeBudget.toBudget,
  );
  const totalBudgeted = useSheetValue<'envelope-budget', 'total-budgeted'>(
    envelopeBudget.totalBudgeted,
  );
  const totalSpent = useSheetValue<'envelope-budget', 'total-spent'>(
    envelopeBudget.totalSpent,
  );
  const totalIncome = useSheetValue<'envelope-budget', 'total-income'>(
    envelopeBudget.totalIncome,
  );
  const settled = useSettled(toBudget);
  const { amountsByCategory, totalAmount } = useOverspentCategories({ month });

  // Spent and budgeted are stored as negative totals.
  const spent = totalSpent === null ? null : -totalSpent;
  const budgeted = totalBudgeted === null ? null : -totalBudgeted;
  const saved =
    totalIncome === null || totalSpent === null
      ? null
      : totalIncome + totalSpent;
  const isOverbudgeted = toBudget !== null && toBudget < 0;

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ gap: spacing.sm }}>
        <HealthRow label={<Trans>To budget</Trans>} testId="overview-to-budget">
          {isOverbudgeted && (
            <Text
              style={{
                padding: '1px 6px',
                borderRadius: radius.sm,
                fontSize: 11.5,
                fontWeight: 500,
                color: theme.signalText,
                backgroundColor: theme.signalSubtle,
              }}
            >
              <Trans>Overbudgeted</Trans>
            </Text>
          )}
          <Amount value={toBudget} tone="balance" />
        </HealthRow>
        <SettleRule
          isSettled={settled.isSettled}
          hasJustSettled={settled.hasJustSettled}
        />
      </View>
      <View style={{ gap: spacing.sm }}>
        <HealthRow label={<Trans>Spent</Trans>}>
          <OfAmount value={spent} of={budgeted} />
        </HealthRow>
        <PaceGauge
          spent={Math.max(0, spent ?? 0)}
          budgeted={Math.max(0, budgeted ?? 0)}
          month={month}
        />
      </View>
      <HealthRow label={<Trans>Income</Trans>}>
        <Amount value={totalIncome} />
      </HealthRow>
      {isStatement && (
        <HealthRow label={<Trans>Saved</Trans>}>
          <Amount value={saved} tone="balance" />
        </HealthRow>
      )}
      {amountsByCategory.size > 0 && (
        <HealthRow label={<Trans>Overspent</Trans>}>
          <OverspentFigure
            count={amountsByCategory.size}
            amount={totalAmount}
          />
        </HealthRow>
      )}
    </View>
  );
}
