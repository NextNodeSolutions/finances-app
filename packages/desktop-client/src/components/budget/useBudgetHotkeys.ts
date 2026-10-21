import { useHotkeys } from 'react-hotkeys-hook';

import * as monthUtils from '@actual-app/core/shared/months';

import { getCurrentMonthStart } from './budgetMonths';

type BudgetHotkeysOptions = {
  startMonth: string;
  numMonths: number;
  budgetType: string;
  /** The month ⇧T acts on: the focused column, not the first one. */
  focusedMonth: string;
  isGoalTemplatesEnabled: boolean;
  onMonthSelect: (month: string) => void;
  onOverwriteTemplates: (month: string) => void;
};

const HOTKEY_OPTIONS = { preventDefault: true, scopes: ['app'] };

/** ← and → move a month, 0 returns to this month, ⇧T overwrites templates. */
export function useBudgetHotkeys({
  startMonth,
  numMonths,
  budgetType,
  focusedMonth,
  isGoalTemplatesEnabled,
  onMonthSelect,
  onOverwriteTemplates,
}: BudgetHotkeysOptions): void {
  useHotkeys(
    'left',
    () => onMonthSelect(monthUtils.prevMonth(startMonth)),
    HOTKEY_OPTIONS,
    [onMonthSelect, startMonth],
  );
  useHotkeys(
    'right',
    () => onMonthSelect(monthUtils.nextMonth(startMonth)),
    HOTKEY_OPTIONS,
    [onMonthSelect, startMonth],
  );
  useHotkeys(
    '0',
    () => onMonthSelect(getCurrentMonthStart(budgetType, numMonths)),
    HOTKEY_OPTIONS,
    [onMonthSelect, budgetType, numMonths],
  );
  useHotkeys(
    'shift+t',
    () => onOverwriteTemplates(focusedMonth),
    { ...HOTKEY_OPTIONS, enabled: isGoalTemplatesEnabled },
    [onOverwriteTemplates, focusedMonth, isGoalTemplatesEnabled],
  );
}
