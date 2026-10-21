import type { CategoryEntity } from '@actual-app/core/types/models';

/**
 * A budget side panel to open. Carried in `location.state.budgetPanel` when
 * the opener runs away from `/budget`, so the panel opens once the budget
 * page is shown (a panel closes on route change).
 */
export type BudgetPanelRequest =
  | { type: 'category'; categoryId: CategoryEntity['id']; month: string }
  | { type: 'move-money'; from?: CategoryEntity['id']; month: string }
  | { type: 'cover'; categoryId?: CategoryEntity['id']; month: string };

export function isBudgetPanelRequest(
  value: unknown,
): value is BudgetPanelRequest {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (!('type' in value) || !('month' in value)) {
    return false;
  }
  if (typeof value.month !== 'string') {
    return false;
  }
  return (
    value.type === 'category' ||
    value.type === 'move-money' ||
    value.type === 'cover'
  );
}
