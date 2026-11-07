import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import { q } from '@actual-app/core/shared/query';

import { EnvelopeBudgetProvider } from '#components/budget/envelope/EnvelopeBudgetContext';
import { EnvelopeRailContent } from '#components/budget/rail/EnvelopeRailContent';
import { TrackingRailContent } from '#components/budget/rail/TrackingRailContent';
import { SidePanel } from '#components/common/SidePanel';
import { usePanels } from '#components/panels/PanelProvider';
import { SchedulesProvider } from '#hooks/useCachedSchedules';
import { useLocale } from '#hooks/useLocale';
import { useOverspentCategories } from '#hooks/useOverspentCategories';
import { SheetNameProvider } from '#hooks/useSheetName';
import { useSyncedPref } from '#hooks/useSyncedPref';

type MonthSummaryPanelProps = {
  month: string;
  /** The page's budget action handler, for the To budget menu. */
  onBudgetAction: (month: string, action: string, arg?: unknown) => void;
};

/**
 * The rail of one month, for compare mode where the rail is hidden: the
 * same figures, beside the table.
 */
export function MonthSummaryPanel({
  month,
  onBudgetAction,
}: MonthSummaryPanelProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const { close } = usePanels();
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  const [schedulesQuery] = useState(() => q('schedules').select('*'));
  const overspent = useOverspentCategories({ month });

  return (
    <SidePanel
      testId="month-summary-panel"
      title={t('{{month}} summary', {
        month: monthUtils.format(month, 'MMMM yyyy', locale),
      })}
      onClose={close}
    >
      <SheetNameProvider name={monthUtils.sheetForMonth(month)}>
        <SchedulesProvider query={schedulesQuery}>
          <EnvelopeBudgetProvider
            summaryCollapsed={false}
            onBudgetAction={onBudgetAction}
            onToggleSummaryCollapse={() => undefined}
          >
            <View style={{ gap: spacing.lg }}>
              {budgetType === 'tracking' ? (
                <TrackingRailContent month={month} overspent={overspent} />
              ) : (
                <EnvelopeRailContent month={month} overspent={overspent} />
              )}
            </View>
          </EnvelopeBudgetProvider>
        </SchedulesProvider>
      </SheetNameProvider>
    </SidePanel>
  );
}
