import type { CategoryEntity } from '@actual-app/core/types/models';

import { TO_BUDGET_ID } from '#components/budget/panels/balanceCell';

import type { EnvelopeBalances } from './useEnvelopeBalances';

export type CoverCategory = {
  id: CategoryEntity['id'];
  name: string;
  /** Cents; negative for an overspent category. */
  balance: number;
};

export type CoverPlan = {
  /** Overspent categories without rollover, in table order. */
  overspent: CoverCategory[];
  /** To budget first when positive, then funded categories, richest first. */
  sources: CoverCategory[];
};

/**
 * Splits the month's envelopes into what needs covering and what can pay
 * for it. Hidden categories can be overspent but never act as a source,
 * as in the balance menu.
 */
export function getCoverPlan(
  categories: readonly Pick<CategoryEntity, 'id' | 'name' | 'hidden'>[],
  {
    balanceById,
    rolloverIds,
  }: Pick<EnvelopeBalances, 'balanceById' | 'rolloverIds'>,
  toBudgetName: string,
): CoverPlan {
  const withBalances = categories.map(category => ({
    id: category.id,
    name: category.name,
    hidden: Boolean(category.hidden),
    balance: balanceById[category.id] ?? 0,
  }));
  const toBudget = balanceById[TO_BUDGET_ID] ?? 0;

  const overspent = withBalances
    .filter(category => category.balance < 0 && !rolloverIds.has(category.id))
    .map(({ id, name, balance }) => ({ id, name, balance }));
  const fundedCategories = withBalances
    .filter(category => category.balance > 0 && !category.hidden)
    .sort((left, right) => right.balance - left.balance)
    .map(({ id, name, balance }) => ({ id, name, balance }));

  return {
    overspent,
    sources: [
      ...(toBudget > 0
        ? [{ id: TO_BUDGET_ID, name: toBudgetName, balance: toBudget }]
        : []),
      ...fundedCategories,
    ],
  };
}
