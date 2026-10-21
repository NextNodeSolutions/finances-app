import { useState } from 'react';

import { updateTransaction } from '@actual-app/core/shared/transactions';
import type { Diff, IntegerAmount } from '@actual-app/core/shared/util';
import type {
  CategoryEntity,
  PayeeEntity,
  TransactionEntity,
} from '@actual-app/core/types/models';

import { applyRulesToTransaction } from '#components/transactions/applyRulesToTransaction';

import {
  addSplitLine,
  getDirection,
  getDraftChanges,
  getSplitRemaining,
  hasChanges,
  negateAmounts,
  NO_CHANGES,
  removeSplitLine,
  signAmount,
  splitIntoLines,
  toDraft,
  updateLine,
  updateParent,
} from './transactionDraft';
import type { AmountDirection, DraftTransactions } from './transactionDraft';
import { useRunRules } from './useRunRules';

/**
 * What a rules run may fill once the payee is chosen: every empty field (a
 * new transaction, like the register's new row) or only the category (an
 * existing one, so its notes are never rewritten).
 */
export type RuleFill = 'empty-fields' | 'category';

type DraftState = {
  /** Null until the first edit; the panel shows the base until then. */
  edit: { original: DraftTransactions; transactions: DraftTransactions } | null;
  /** The category the last rules run filled in, for "Set by a rule". */
  ruleCategoryId: CategoryEntity['id'] | null;
  /** The direction picked while the amount is still 0. */
  directionOverride: AmountDirection | null;
};

const CLEAN_STATE: DraftState = {
  edit: null,
  ruleCategoryId: null,
  directionOverride: null,
};

export type TransactionDraft = {
  transactions: DraftTransactions;
  parent: TransactionEntity;
  lines: TransactionEntity[];
  direction: AmountDirection;
  /** Null when not split; otherwise what is left to allocate. */
  remaining: IntegerAmount | null;
  isCategoryFromRule: boolean;
  changes: Diff<TransactionEntity>;
  isDirty: boolean;
  setFields: (patch: Partial<TransactionEntity>) => void;
  setPayee: (payeeId: PayeeEntity['id'] | null) => void;
  setAmount: (figure: IntegerAmount) => void;
  setDirection: (direction: AmountDirection) => void;
  split: () => void;
  addLine: () => void;
  removeLine: (lineId: TransactionEntity['id']) => void;
  setLine: (
    lineId: TransactionEntity['id'],
    patch: Partial<TransactionEntity>,
  ) => void;
  /** Runs the rules over `transaction` and fills what they suggest. */
  fillFromRules: (transaction: TransactionEntity) => Promise<void>;
  discard: () => void;
};

/**
 * The editable copy of a transaction and its split lines. Edits apply the
 * register's loot-core helpers; until the first edit the draft follows
 * `base`, so a live transaction stays current while nobody touches it.
 */
export function useTransactionDraft(
  base: DraftTransactions,
  ruleFill: RuleFill,
): TransactionDraft {
  const [state, setState] = useState<DraftState>(CLEAN_STATE);
  const runRules = useRunRules();

  const transactions = state.edit?.transactions ?? base;
  const [parent, ...lines] = transactions;
  const direction =
    parent.amount === 0
      ? (state.directionOverride ?? 'payment')
      : getDirection(parent.amount);
  const changes = state.edit
    ? getDraftChanges(state.edit.original, state.edit.transactions)
    : NO_CHANGES;

  const edit = (change: (current: DraftTransactions) => DraftTransactions) =>
    setState(previous => ({
      ...previous,
      edit: {
        original: previous.edit?.original ?? base,
        transactions: change(previous.edit?.transactions ?? base),
      },
    }));

  const fillFromRules = async (transaction: TransactionEntity) => {
    const afterRules = await runRules(transaction);
    setState(previous =>
      withRuleResult(previous, base, transaction, afterRules, ruleFill),
    );
  };

  const setFields = (patch: Partial<TransactionEntity>) =>
    edit(current => updateParent(current, patch));

  return {
    transactions,
    parent,
    lines,
    direction,
    remaining: getSplitRemaining(transactions, direction),
    isCategoryFromRule:
      state.ruleCategoryId !== null && parent.category === state.ruleCategoryId,
    changes,
    isDirty: hasChanges(changes),
    setFields,
    setPayee: payeeId => {
      setFields({ payee: payeeId });
      if (payeeId && !parent.category && !parent.is_parent) {
        void fillFromRules({ ...parent, payee: payeeId });
      }
    },
    setAmount: figure => setFields({ amount: signAmount(figure, direction) }),
    setDirection: next => {
      setState(previous => ({ ...previous, directionOverride: next }));
      if (next !== direction) {
        edit(negateAmounts);
      }
    },
    split: () => edit(splitIntoLines),
    addLine: () => edit(addSplitLine),
    removeLine: lineId => edit(current => removeSplitLine(current, lineId)),
    setLine: (lineId, patch) =>
      edit(current => updateLine(current, lineId, patch)),
    fillFromRules,
    discard: () => setState(CLEAN_STATE),
  };
}

/**
 * Merges a rules run into the latest draft, unless the user moved on while
 * it ran (another payee, a split, a category of their own).
 */
function withRuleResult(
  previous: DraftState,
  base: DraftTransactions,
  ruleInput: TransactionEntity,
  afterRules: TransactionEntity,
  ruleFill: RuleFill,
): DraftState {
  const current = previous.edit?.transactions ?? base;
  const [latest] = current;
  if (latest.payee !== ruleInput.payee || latest.is_parent || latest.category) {
    return previous;
  }

  const merged = applyRulesToTransaction(latest, afterRules, 'payee');
  const patch =
    ruleFill === 'empty-fields'
      ? merged
      : { ...latest, category: merged.category };
  const transactions = toDraft(updateTransaction(current, patch).data);

  return {
    ...previous,
    edit: { original: previous.edit?.original ?? base, transactions },
    ruleCategoryId: transactions[0].category ?? null,
  };
}
