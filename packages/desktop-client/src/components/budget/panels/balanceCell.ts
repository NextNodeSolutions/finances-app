import type { CategoryEntity } from '@actual-app/core/types/models';

/** The pseudo category the budget uses for To budget in money moves. */
export const TO_BUDGET_ID = 'to-budget';

/** The envelope cell holding what `id` has available this month. */
export function getBalanceCellName(id: CategoryEntity['id']): string {
  return id === TO_BUDGET_ID ? 'to-budget' : `leftover-${id}`;
}
