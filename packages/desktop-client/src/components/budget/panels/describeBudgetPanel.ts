import { createElement } from 'react';

import type { PanelDescriptor } from '#components/panels/PanelProvider';

import type { BudgetPanelRequest } from './budgetPanelRequest';
import { CategoryPanel } from './CategoryPanel';
import { CoverOverspendingPanel } from './CoverOverspendingPanel';
import { MoveMoneyPanel } from './MoveMoneyPanel';
import { BUDGET_PANEL_KEYS } from './panelKeys';

/**
 * The side panel for a request, keyed as in the panels-versus-modals table.
 * The element key changes with the target so a different category or month
 * starts the panel afresh instead of keeping the previous one's state.
 */
export function describeBudgetPanel(
  request: BudgetPanelRequest,
): PanelDescriptor<object> {
  switch (request.type) {
    case 'category':
      return {
        key: BUDGET_PANEL_KEYS.category,
        element: createElement(CategoryPanel, {
          key: `${request.categoryId}-${request.month}`,
          categoryId: request.categoryId,
          month: request.month,
        }),
      };
    case 'move-money':
      return {
        key: BUDGET_PANEL_KEYS.moveMoney,
        element: createElement(MoveMoneyPanel, {
          key: `${request.from ?? 'to-budget'}-${request.month}`,
          from: request.from,
          month: request.month,
        }),
      };
    case 'cover':
      return {
        key: BUDGET_PANEL_KEYS.cover,
        element: createElement(CoverOverspendingPanel, {
          key: `${request.categoryId ?? 'all'}-${request.month}`,
          categoryId: request.categoryId,
          month: request.month,
        }),
      };
    default:
      throw new Error(`Unknown budget panel: ${JSON.stringify(request)}`);
  }
}
