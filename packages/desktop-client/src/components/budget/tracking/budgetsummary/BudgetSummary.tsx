// @ts-strict-ignore
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Popover } from '@actual-app/components/popover';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { OverflowMenuIcon } from '#components/budget/OverflowMenuIcon';
import {
  summaryBodyStyle,
  SummaryCard,
  summaryCollapsedAmountStyle,
  summaryCollapsedRowStyle,
  summaryHeadlineAmountStyle,
  summaryHeadlineRowStyle,
  summaryIconButtonStyle,
  summaryLedgerStyle,
} from '#components/budget/SummaryCard';
import { SummaryHeader } from '#components/budget/SummaryHeader';
import { useTrackingBudget } from '#components/budget/tracking/TrackingBudgetContext';
import { useLocale } from '#hooks/useLocale';
import { SheetNameProvider } from '#hooks/useSheetName';
import { useUndo } from '#hooks/useUndo';

import { BudgetMonthMenu } from './BudgetMonthMenu';
import { ExpenseTotal } from './ExpenseTotal';
import { IncomeTotal } from './IncomeTotal';
import { Saved } from './Saved';

// One ruled line of the ledger: progress dot, label, then its figures.
const totalLineStyle = { padding: '6px 0' };

type BudgetSummaryProps = {
  month: string;
};
export function BudgetSummary({ month }: BudgetSummaryProps) {
  const locale = useLocale();
  const { t } = useTranslation();
  const {
    currentMonth,
    summaryCollapsed: collapsed,
    onBudgetAction,
    onToggleSummaryCollapse,
  } = useTrackingBudget();

  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef(null);
  const { showUndoNotification } = useUndo();

  function onMenuOpen() {
    setMenuOpen(true);
  }

  function onMenuClose() {
    setMenuOpen(false);
  }

  const displayMonth = monthUtils.format(month, "MMMM ''yy", locale);

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
              />
            </Popover>
          </View>
        </SummaryHeader>

        {collapsed ? (
          <Saved
            projected={month >= currentMonth}
            style={summaryCollapsedRowStyle}
            amountStyle={summaryCollapsedAmountStyle}
          />
        ) : (
          <View style={summaryBodyStyle}>
            <View style={summaryLedgerStyle}>
              <IncomeTotal style={totalLineStyle} />
              <ExpenseTotal style={totalLineStyle} />
            </View>
            <Saved
              projected={month >= currentMonth}
              style={summaryHeadlineRowStyle}
              amountStyle={summaryHeadlineAmountStyle}
            />
          </View>
        )}
      </SheetNameProvider>
    </SummaryCard>
  );
}
