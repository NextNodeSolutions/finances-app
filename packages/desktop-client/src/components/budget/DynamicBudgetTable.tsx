import React, { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AutoSizer } from 'react-virtualized-auto-sizer';

import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import { q } from '@actual-app/core/shared/query';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { FeatureErrorFallback } from '#components/FeatureErrorFallback';
import { usePanels } from '#components/panels/PanelProvider';
import { SchedulesProvider } from '#hooks/useCachedSchedules';
import { useFeatureFlag } from '#hooks/useFeatureFlag';
import { useGlobalPref } from '#hooks/useGlobalPref';
import { useOverspentCategories } from '#hooks/useOverspentCategories';

import { BudgetHeader } from './BudgetHeader';
import { useBudgetMonthCount } from './BudgetMonthCountContext';
import {
  clampStartMonth,
  getCategoryColumnWidth,
  getCurrentMonthStart,
  getNumPossibleMonths,
  getVisibleMonths,
  resolveFocusedMonth,
} from './budgetMonths';
import { BudgetTable } from './BudgetTable';
import { BUDGET_RAIL_WIDTH } from './rail/BudgetRail';
import { EnvelopeRail } from './rail/EnvelopeRail';
import { TrackingRail } from './rail/TrackingRail';
import { useBudgetHotkeys } from './useBudgetHotkeys';
import { useBudgetLocationState } from './useBudgetLocationState';

// The rail and the gap before it.
const RAIL_SPACE = BUDGET_RAIL_WIDTH + spacing.lg;
// The narrowest month column the rail may sit beside.
const MIN_MONTH_WIDTH_BESIDE_RAIL = 340;
// Below this content width an open panel hides the rail.
const RAIL_WITH_PANEL_MIN_WIDTH = 1100;
const MONTH_COLUMN_MAX_WIDTH = 500;

type DynamicBudgetTableProps = {
  width: number;
  height: number;
} & AutoSizingBudgetTableProps;

function DynamicBudgetTable({
  type,
  width,
  height,
  startMonth,
  maxMonths = 3,
  monthBounds,
  onMonthSelect,
  onBudgetAction,
  onApplyBudgetTemplatesInGroup,
  ...props
}: DynamicBudgetTableProps) {
  const { setDisplayMax } = useBudgetMonthCount();
  const { current: openPanel } = usePanels();
  const [categoryExpandedStatePref] = useGlobalPref('categoryExpandedState');
  const isGoalTemplatesEnabled = useFeatureFlag('goalTemplatesEnabled');
  const [schedulesQuery] = useState(() => q('schedules').select('*'));
  const [requestedFocus, setRequestedFocus] = useState<string | null>(null);
  const budgetType = type === 'tracking' ? 'tracking' : 'envelope';

  const categoryWidth = getCategoryColumnWidth(categoryExpandedStatePref ?? 0);
  const numPossible = getNumPossibleMonths(width, categoryWidth);
  const numMonths = Math.min(numPossible, maxMonths);
  const hasRail =
    numMonths === 1 &&
    width - RAIL_SPACE >= categoryWidth + MIN_MONTH_WIDTH_BESIDE_RAIL &&
    !(openPanel !== null && width < RAIL_WITH_PANEL_MIN_WIDTH);
  const maxWidth =
    categoryWidth +
    MONTH_COLUMN_MAX_WIDTH * numMonths +
    (hasRail ? RAIL_SPACE : 0);

  const visibleMonths = getVisibleMonths(startMonth, numMonths);
  const focusedMonth = resolveFocusedMonth(requestedFocus, visibleMonths);
  const overspent = useOverspentCategories({ month: focusedMonth });

  useEffect(() => {
    setDisplayMax(numPossible);
  }, [setDisplayMax, numPossible]);

  const selectMonth = (month: string) => {
    onMonthSelect(clampStartMonth(month, monthBounds, numMonths), numMonths);
  };

  useBudgetHotkeys({
    startMonth,
    numMonths,
    budgetType,
    focusedMonth,
    isGoalTemplatesEnabled,
    onMonthSelect: selectMonth,
    onOverwriteTemplates: month =>
      onBudgetAction(month, 'overwrite-goal-template', null),
  });

  useBudgetLocationState({
    onShowMonth: month => {
      setRequestedFocus(month);
      selectMonth(month);
    },
    onShowCurrentMonth: () => {
      setRequestedFocus(monthUtils.currentMonth());
      selectMonth(getCurrentMonthStart(budgetType, numMonths));
    },
  });

  return (
    <View
      style={{
        width,
        height,
        alignItems: 'center',
        opacity: width <= 0 || height <= 0 ? 0 : 1,
      }}
    >
      <View style={{ width: '100%', maxWidth, flex: 1, minHeight: 0 }}>
        <ErrorBoundary FallbackComponent={FeatureErrorFallback}>
          <BudgetHeader
            startMonth={startMonth}
            numMonths={numMonths}
            monthBounds={monthBounds}
            focusedMonth={focusedMonth}
            budgetType={budgetType}
            onMonthSelect={selectMonth}
          />
          <SchedulesProvider query={schedulesQuery}>
            <BudgetTable
              type={type}
              startMonth={startMonth}
              numMonths={numMonths}
              monthBounds={monthBounds}
              onBudgetAction={onBudgetAction}
              onApplyBudgetTemplatesInGroup={categoryIds =>
                onApplyBudgetTemplatesInGroup(categoryIds, focusedMonth)
              }
              focusedMonth={focusedMonth}
              onFocusMonth={setRequestedFocus}
              overspent={overspent}
              hasColumnSummaries={!hasRail}
              aside={
                hasRail &&
                (budgetType === 'tracking' ? (
                  <TrackingRail month={focusedMonth} overspent={overspent} />
                ) : (
                  <EnvelopeRail month={focusedMonth} overspent={overspent} />
                ))
              }
              {...props}
            />
          </SchedulesProvider>
        </ErrorBoundary>
      </View>
    </View>
  );
}

type AutoSizingBudgetTableProps = Omit<
  ComponentProps<typeof BudgetTable>,
  | 'numMonths'
  | 'focusedMonth'
  | 'onFocusMonth'
  | 'overspent'
  | 'hasColumnSummaries'
  | 'aside'
  | 'onApplyBudgetTemplatesInGroup'
> & {
  maxMonths: number;
  /** Applies the group's templates to the focused month. */
  onApplyBudgetTemplatesInGroup: (
    categoryIds: Array<CategoryEntity['id']>,
    month: string,
  ) => void;
  onMonthSelect: (month: string, numMonths: number) => void;
};

export function AutoSizingBudgetTable(props: AutoSizingBudgetTableProps) {
  return (
    <AutoSizer
      renderProp={({ width = 0, height = 0 }) => {
        if (width === 0 || height === 0) {
          return null;
        }

        return <DynamicBudgetTable width={width} height={height} {...props} />;
      }}
    />
  );
}
