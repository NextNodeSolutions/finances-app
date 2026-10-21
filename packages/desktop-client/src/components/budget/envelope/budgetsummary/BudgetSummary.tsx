import React, { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Popover } from '@actual-app/components/popover';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { useEnvelopeBudget } from '#components/budget/envelope/EnvelopeBudgetContext';
import { OverflowMenuIcon } from '#components/budget/OverflowMenuIcon';
import {
  summaryBodyStyle,
  SummaryCard,
  summaryCollapsedAmountStyle,
  summaryCollapsedRowStyle,
  summaryHeadlineAmountStyle,
  summaryHeadlineRowStyle,
  summaryIconButtonStyle,
} from '#components/budget/SummaryCard';
import { SummaryHeader } from '#components/budget/SummaryHeader';
import { useLocale } from '#hooks/useLocale';
import { SheetNameProvider } from '#hooks/useSheetName';
import { useUndo } from '#hooks/useUndo';

import { BudgetMonthMenu } from './BudgetMonthMenu';
import { ToBudget } from './ToBudget';
import { TotalsList } from './TotalsList';

type BudgetSummaryProps = {
  month: string;
};
export const BudgetSummary = memo(({ month }: BudgetSummaryProps) => {
  const locale = useLocale();
  const {
    currentMonth,
    summaryCollapsed: collapsed,
    onBudgetAction,
    onToggleSummaryCollapse,
  } = useEnvelopeBudget();

  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef(null);
  const { showUndoNotification } = useUndo();

  function onMenuOpen() {
    setMenuOpen(true);
  }

  function onMenuClose() {
    setMenuOpen(false);
  }

  const prevMonthName = monthUtils.format(
    monthUtils.prevMonth(month),
    'MMM',
    locale,
  );

  const displayMonth = monthUtils.format(month, "MMMM ''yy", locale);
  const { t } = useTranslation();

  return (
    <SummaryCard
      month={month}
      isCurrentMonth={month === currentMonth}
      isCollapsed={collapsed}
    >
      <SheetNameProvider name={monthUtils.sheetForMonth(month)}>
        <SummaryHeader
          month={month}
          isCollapsed={collapsed}
          onToggleCollapse={onToggleSummaryCollapse}
        >
          <View>
            <Button
              ref={triggerRef}
              variant="bare"
              aria-label={t('Menu')}
              onPress={onMenuOpen}
              style={summaryIconButtonStyle}
            >
              <OverflowMenuIcon />
            </Button>

            <Popover
              triggerRef={triggerRef}
              isOpen={menuOpen}
              onOpenChange={onMenuClose}
            >
              <BudgetMonthMenu
                onCopyLastMonthBudget={() => {
                  onBudgetAction(month, 'copy-last');
                  onMenuClose();
                  showUndoNotification({
                    message: t(
                      "{{displayMonth}} budgets have all been set to last month's budgeted amounts.",
                      { displayMonth },
                    ),
                  });
                }}
                onSetBudgetsToZero={() => {
                  onBudgetAction(month, 'set-zero');
                  onMenuClose();
                  showUndoNotification({
                    message: t(
                      '{{displayMonth}} budgets have all been set to zero.',
                      { displayMonth },
                    ),
                  });
                }}
                onSetMonthsAverage={numberOfMonths => {
                  onBudgetAction(month, `set-${numberOfMonths}-avg`);
                  onMenuClose();
                  showUndoNotification({
                    message:
                      numberOfMonths === 12
                        ? t(
                            `${displayMonth} budgets have all been set to yearly average.`,
                          )
                        : t(
                            `${displayMonth} budgets have all been set to ${numberOfMonths} month average.`,
                          ),
                  });
                }}
                onCheckTemplates={() => {
                  onBudgetAction(month, 'check-templates');
                  onMenuClose();
                }}
                onApplyBudgetTemplates={() => {
                  onBudgetAction(month, 'apply-goal-template');
                  onMenuClose();
                  showUndoNotification({
                    message: t(
                      '{{displayMonth}} budget templates have been applied.',
                      { displayMonth },
                    ),
                  });
                }}
                onOverwriteWithBudgetTemplates={() => {
                  onBudgetAction(month, 'overwrite-goal-template');
                  onMenuClose();
                  showUndoNotification({
                    message: t(
                      '{{displayMonth}} budget templates have been overwritten.',
                      { displayMonth },
                    ),
                  });
                }}
                onEndOfMonthCleanup={() => {
                  onBudgetAction(month, 'cleanup-goal-template');
                  onMenuClose();
                  showUndoNotification({
                    message: t(
                      '{{displayMonth}} end-of-month cleanup templates have been applied.',
                      { displayMonth },
                    ),
                  });
                }}
              />
            </Popover>
          </View>
        </SummaryHeader>

        {collapsed ? (
          <ToBudget
            prevMonthName={prevMonthName}
            month={month}
            onBudgetAction={onBudgetAction}
            style={summaryCollapsedRowStyle}
            amountStyle={summaryCollapsedAmountStyle}
            isCollapsed
          />
        ) : (
          <View style={summaryBodyStyle}>
            <TotalsList prevMonthName={prevMonthName} />
            <ToBudget
              prevMonthName={prevMonthName}
              month={month}
              onBudgetAction={onBudgetAction}
              style={summaryHeadlineRowStyle}
              amountStyle={summaryHeadlineAmountStyle}
            />
          </View>
        )}
      </SheetNameProvider>
    </SummaryCard>
  );
});

BudgetSummary.displayName = 'EnvelopeBudgetSummary';
