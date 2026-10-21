import type { IntegerAmount } from '@actual-app/core/shared/util';
import type { CategoryEntity } from '@actual-app/core/types/models';

import type { CoverStepperState } from './coverStepperReducer';
import type { CoverCategory, CoverPlan } from './getCoverPlan';

export type CoverStep = {
  category: CoverCategory;
  /** 1-based position among the categories of this walk. */
  position: number;
  total: number;
  source: CoverCategory | null;
  amount: IntegerAmount;
  /** The previous source, offered when it can still cover this step. */
  reuseSource: CoverCategory | null;
};

/**
 * The step to show: the first overspent category of the walk (or the one
 * target) not yet covered or skipped, or `null` once nothing is left.
 */
export function describeCoverStep(
  plan: CoverPlan,
  state: CoverStepperState,
  targetId?: CategoryEntity['id'],
): CoverStep | null {
  const targetIds = targetId ? [targetId] : plan.overspent.map(c => c.id);
  const pendingIds = targetIds.filter(id => !state.handledIds.includes(id));
  const category = plan.overspent.find(c => c.id === pendingIds[0]);
  if (!category) {
    return null;
  }

  const overspentAmount = -category.balance;
  const source = plan.sources.find(s => s.id === state.sourceId) ?? null;
  const position = state.handledIds.length + 1;

  return {
    category,
    position,
    total: state.handledIds.length + pendingIds.length,
    source,
    amount:
      state.typedAmount ??
      (source ? Math.min(overspentAmount, source.balance) : overspentAmount),
    reuseSource: findReusableSource(plan, state, overspentAmount),
  };
}

/** What the walk still leaves overspent, as a positive total in cents. */
export function getUncoveredTotal(
  plan: CoverPlan,
  targetId?: CategoryEntity['id'],
): IntegerAmount {
  return plan.overspent
    .filter(c => !targetId || c.id === targetId)
    .reduce((total, c) => total - c.balance, 0);
}

function findReusableSource(
  plan: CoverPlan,
  state: CoverStepperState,
  overspentAmount: IntegerAmount,
): CoverCategory | null {
  if (state.lastSourceId === null || state.lastSourceId === state.sourceId) {
    return null;
  }
  return (
    plan.sources.find(
      s => s.id === state.lastSourceId && s.balance >= overspentAmount,
    ) ?? null
  );
}
