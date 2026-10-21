import { useTranslation } from 'react-i18next';

import * as monthUtils from '@actual-app/core/shared/months';

import { useBudgetActions } from '#budget';
import { useLocale } from '#hooks/useLocale';
import { useUndo } from '#hooks/useUndo';

import type { BudgetMonthMenuActions } from './envelope/budgetsummary/BudgetMonthMenu';

const AVERAGE_ACTIONS = {
  3: 'set-3-avg',
  6: 'set-6-avg',
  12: 'set-12-avg',
} as const;

/**
 * The month-wide budget actions (copy, zero, averages, templates) for one
 * month, each followed by the message the summary menu always showed.
 */
export function useMonthToolActions(month: string): BudgetMonthMenuActions {
  const { t } = useTranslation();
  const locale = useLocale();
  const { mutate } = useBudgetActions();
  const { showUndoNotification } = useUndo();
  const displayMonth = monthUtils.format(month, "MMMM ''yy", locale);
  const notify = (message: string) => showUndoNotification({ message });

  return {
    onCopyLastMonthBudget: () => {
      mutate({ month, type: 'copy-last' });
      notify(
        t(
          "{{displayMonth}} budgets have all been set to last month's budgeted amounts.",
          { displayMonth },
        ),
      );
    },
    onSetBudgetsToZero: () => {
      mutate({ month, type: 'set-zero' });
      notify(
        t('{{displayMonth}} budgets have all been set to zero.', {
          displayMonth,
        }),
      );
    },
    onSetMonthsAverage: numberOfMonths => {
      if (
        numberOfMonths !== 3 &&
        numberOfMonths !== 6 &&
        numberOfMonths !== 12
      ) {
        return;
      }
      mutate({ month, type: AVERAGE_ACTIONS[numberOfMonths] });
      notify(
        numberOfMonths === 12
          ? t('{{displayMonth}} budgets have all been set to yearly average.', {
              displayMonth,
            })
          : t(
              '{{displayMonth}} budgets have all been set to {{numberOfMonths}} month average.',
              { displayMonth, numberOfMonths },
            ),
      );
    },
    onCheckTemplates: () => mutate({ type: 'check-templates' }),
    onApplyBudgetTemplates: () => {
      mutate({ month, type: 'apply-goal-template' });
      notify(
        t('{{displayMonth}} budget templates have been applied.', {
          displayMonth,
        }),
      );
    },
    onOverwriteWithBudgetTemplates: () => {
      mutate({ month, type: 'overwrite-goal-template' });
      notify(
        t('{{displayMonth}} budget templates have been overwritten.', {
          displayMonth,
        }),
      );
    },
    onEndOfMonthCleanup: () => {
      mutate({ month, type: 'cleanup-goal-template' });
      notify(
        t(
          '{{displayMonth}} end-of-month cleanup templates have been applied.',
          {
            displayMonth,
          },
        ),
      );
    },
  };
}
