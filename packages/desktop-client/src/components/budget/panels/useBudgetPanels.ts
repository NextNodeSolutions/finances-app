import { useLocation } from 'react-router';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { usePanels } from '#components/panels/PanelProvider';
import { useNavigate } from '#hooks/useNavigate';
import { useSyncedPref } from '#hooks/useSyncedPref';

import type { BudgetPanelRequest } from './budgetPanelRequest';
import { describeBudgetPanel } from './describeBudgetPanel';
import { useNarrowBudgetFallbacks } from './useNarrowBudgetFallbacks';

export type BudgetPanels = {
  /** Inspect one category; `month` defaults to the current month. */
  openCategory: (id: CategoryEntity['id'], month?: string) => void;
  /** Move money out of `from`, or out of To budget when `from` is absent. */
  openMoveMoney: (options: {
    from?: CategoryEntity['id'];
    month: string;
  }) => void;
  /** Cover one category, or walk through every overspent one. */
  openCover: (options: {
    categoryId?: CategoryEntity['id'];
    month: string;
  }) => void;
};

/**
 * Opens the budget side panels (category, move money, cover overspending).
 * Called away from `/budget`, it goes to the budget first and the panel
 * opens there. On narrow screens it falls back to the mobile pages and
 * sheets. Move money and cover exist only in envelope budgeting.
 */
export function useBudgetPanels(): BudgetPanels {
  const { open } = usePanels();
  const { isNarrowWidth } = useResponsive();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const openNarrowFallback = useNarrowBudgetFallbacks();
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');

  const request = (panel: BudgetPanelRequest) => {
    if (isNarrowWidth) {
      openNarrowFallback(panel);
    } else if (pathname !== '/budget') {
      void navigate('/budget', {
        state: { month: panel.month, budgetPanel: panel },
      });
    } else {
      open(describeBudgetPanel(panel));
    }
  };

  return {
    openCategory: (categoryId, month = monthUtils.currentMonth()) =>
      request({ type: 'category', categoryId, month }),
    openMoveMoney: ({ from, month }) => {
      if (budgetType === 'envelope') {
        request({ type: 'move-money', from, month });
      }
    },
    openCover: ({ categoryId, month }) => {
      if (budgetType === 'envelope') {
        request({ type: 'cover', categoryId, month });
      }
    },
  };
}
