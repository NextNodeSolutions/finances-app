import { useEffect, useEffectEvent, useRef } from 'react';
import { useLocation } from 'react-router';

import { usePanels } from '#components/panels/PanelProvider';

import { isBudgetPanelRequest } from './panels/budgetPanelRequest';
import { describeBudgetPanel } from './panels/describeBudgetPanel';

type BudgetLocationStateOptions = {
  /** Show this month (from `state.month`). */
  onShowMonth: (month: string) => void;
  /** Show the current month (from `state.focusOverspent`). */
  onShowCurrentMonth: () => void;
};

/**
 * Acts once per arrival on the budget's location state: `month` shows that
 * month, `focusOverspent` the current one (OverspentCard then takes focus),
 * and `budgetPanel` opens the side panel asked for from another page.
 */
export function useBudgetLocationState({
  onShowMonth,
  onShowCurrentMonth,
}: BudgetLocationStateOptions): void {
  const location = useLocation();
  const { open } = usePanels();
  const handledKeyRef = useRef<string | null>(null);

  const onArrive = useEffectEvent((state: unknown) => {
    if (typeof state !== 'object' || state === null) {
      return;
    }
    if ('focusOverspent' in state && state.focusOverspent === true) {
      onShowCurrentMonth();
    } else if ('month' in state && typeof state.month === 'string') {
      onShowMonth(state.month);
    }
    if ('budgetPanel' in state && isBudgetPanelRequest(state.budgetPanel)) {
      open(describeBudgetPanel(state.budgetPanel));
    }
  });

  useEffect(() => {
    if (handledKeyRef.current === location.key) {
      return;
    }
    handledKeyRef.current = location.key;
    onArrive(location.state);
  }, [location.key, location.state]);
}
