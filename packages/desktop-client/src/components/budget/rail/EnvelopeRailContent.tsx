import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import * as monthUtils from '@actual-app/core/shared/months';

import { TotalsList } from '#components/budget/envelope/budgetsummary/TotalsList';
import { useEnvelopeSheetValue } from '#components/budget/envelope/EnvelopeBudgetComponents';
import { PaceGauge } from '#components/common/PaceGauge';
import { useLocale } from '#hooks/useLocale';
import type { useOverspentCategories } from '#hooks/useOverspentCategories';
import { envelopeBudget } from '#spreadsheet/bindings';

import { DueThisMonth } from './DueThisMonth';
import { OverspentCard } from './OverspentCard';
import { RailSection } from './RailSection';
import { ToBudgetHeadline } from './ToBudgetHeadline';

type EnvelopeRailContentProps = {
  month: string;
  overspent: ReturnType<typeof useOverspentCategories>;
};

/**
 * To budget, the ledger behind it, pace, what is overspent and what is
 * still due. Needs the month's SheetNameProvider and a SchedulesProvider.
 */
export function EnvelopeRailContent({
  month,
  overspent,
}: EnvelopeRailContentProps) {
  const locale = useLocale();
  const totalSpent = useEnvelopeSheetValue(envelopeBudget.totalSpent) ?? 0;
  const totalBudgeted =
    useEnvelopeSheetValue(envelopeBudget.totalBudgeted) ?? 0;
  const prevMonthName = monthUtils.format(
    monthUtils.prevMonth(month),
    'MMM',
    locale,
  );

  return (
    <>
      <Text
        style={{ fontSize: 15, fontWeight: 600, color: theme.pageTextDark }}
      >
        {monthUtils.format(month, 'MMMM', locale)}
      </Text>
      <ToBudgetHeadline month={month} />
      <TotalsList prevMonthName={prevMonthName} />
      <RailSection>
        <PaceGauge
          spent={-totalSpent}
          budgeted={-totalBudgeted}
          month={month}
        />
      </RailSection>
      <OverspentCard month={month} overspent={overspent} />
      <DueThisMonth month={month} />
    </>
  );
}
