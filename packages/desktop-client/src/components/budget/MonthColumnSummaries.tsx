import { View } from '@actual-app/components/view';

import { useLocalPref } from '#hooks/useLocalPref';

import { MonthColumnSummary } from './MonthColumnSummary';

type MonthColumnSummariesProps = {
  months: readonly string[];
  budgetType: 'envelope' | 'tracking';
  focusedMonth: string;
  onFocusMonth: (month: string) => void;
  /** Leading space matching the category column. */
  categoryWidth: number;
};

/**
 * One compact summary per month column. Details open together, from the
 * saved preference, or by default when two months or fewer show.
 */
export function MonthColumnSummaries({
  months,
  budgetType,
  focusedMonth,
  onFocusMonth,
  categoryWidth,
}: MonthColumnSummariesProps) {
  const [summaryCollapsed, setSummaryCollapsed] = useLocalPref(
    'budget.summaryCollapsed',
  );
  const isDetailsOpen =
    summaryCollapsed === undefined ? months.length <= 2 : !summaryCollapsed;

  return (
    <View style={{ flexDirection: 'row', flexShrink: 0 }}>
      <View style={{ width: categoryWidth, flexShrink: 0 }} />
      {months.map(month => (
        <MonthColumnSummary
          key={month}
          month={month}
          budgetType={budgetType}
          isFocused={month === focusedMonth}
          isDetailsOpen={isDetailsOpen}
          onFocus={onFocusMonth}
          onToggleDetails={() => setSummaryCollapsed(isDetailsOpen)}
        />
      ))}
    </View>
  );
}
