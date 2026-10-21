import { currentDay } from '@actual-app/core/shared/months';
import {
  addSplitTransaction,
  deleteTransaction,
  makeChild,
  realizeTempTransactions,
  splitTransaction,
  updateTransaction,
} from '@actual-app/core/shared/transactions';
import { diffItems } from '@actual-app/core/shared/util';
import type { Diff, IntegerAmount } from '@actual-app/core/shared/util';
import type {
  AccountEntity,
  TransactionEntity,
} from '@actual-app/core/types/models';

import type { NewTransactionPrefill } from './useTransactionPanels';

/**
 * A transaction the way the register keeps it: the parent row first, then
 * its split lines. Every loot-core split helper works on this flat shape.
 */
export type DraftTransactions = readonly [
  TransactionEntity,
  ...TransactionEntity[],
];

export type AmountDirection = 'payment' | 'deposit';

/** The id loot-core gives a transaction that is not saved yet. */
export const NEW_TRANSACTION_ID = 'temp';

export const NO_CHANGES: Diff<TransactionEntity> = {
  added: [],
  updated: [],
  deleted: [],
};

export function toDraft(
  transactions: readonly TransactionEntity[],
): DraftTransactions {
  const [parent, ...lines] = transactions;
  if (!parent) {
    throw new Error(
      'A transaction draft needs its parent row, but the list was empty.',
    );
  }
  return [parent, ...lines];
}

/** A blank transaction to enter, filled with what the opener knows. */
export function createNewDraft(
  prefill: Omit<NewTransactionPrefill, 'payeeName'>,
  accountId: AccountEntity['id'] | undefined,
): DraftTransactions {
  return [
    {
      id: NEW_TRANSACTION_ID,
      // An empty account is the "not chosen yet" state; saving requires one.
      account: accountId ?? '',
      date: prefill.date ?? currentDay(),
      amount: prefill.amount ?? 0,
      payee: prefill.payeeId ?? null,
      category: prefill.categoryId,
      notes: prefill.notes ?? '',
      cleared: false,
    },
  ];
}

export function getDirection(amount: IntegerAmount): AmountDirection {
  return amount > 0 ? 'deposit' : 'payment';
}

/** Turns a typed figure into an amount signed for the direction. */
export function signAmount(
  figure: IntegerAmount,
  direction: AmountDirection,
): IntegerAmount {
  const signed = direction === 'deposit' ? figure : -figure;
  // Keep a plain 0 (never -0) so it formats without a sign.
  return signed === 0 ? 0 : signed;
}

export function updateParent(
  draft: DraftTransactions,
  patch: Partial<TransactionEntity>,
): DraftTransactions {
  const [parent] = draft;
  return toDraft(updateTransaction(draft, { ...parent, ...patch }).data);
}

export function updateLine(
  draft: DraftTransactions,
  lineId: TransactionEntity['id'],
  patch: Partial<TransactionEntity>,
): DraftTransactions {
  const line = draft.find(transaction => transaction.id === lineId);
  if (!line) {
    throw new Error(`Split line ${lineId} is not part of this transaction.`);
  }
  return toDraft(updateTransaction(draft, { ...line, ...patch }).data);
}

/**
 * Splits into two empty lines. The first keeps the chosen category; the
 * payee stays on the parent (loot-core alone would move it to the lines).
 */
export function splitIntoLines(draft: DraftTransactions): DraftTransactions {
  const [parent] = draft;
  const split = splitTransaction(draft, parent.id, createFirstLines);
  return updateParent(toDraft(split.data), { payee: parent.payee });
}

function createFirstLines(parent: TransactionEntity): TransactionEntity[] {
  return [
    makeChild(parent, { sort_order: -1 }),
    makeChild(parent, { sort_order: -2, category: undefined }),
  ];
}

export function addSplitLine(draft: DraftTransactions): DraftTransactions {
  const [parent] = draft;
  return toDraft(addSplitTransaction(draft, parent.id).data);
}

/** Removing the last line turns the split back into a plain transaction. */
export function removeSplitLine(
  draft: DraftTransactions,
  lineId: TransactionEntity['id'],
): DraftTransactions {
  return toDraft(deleteTransaction([...draft], lineId).data);
}

/** Flips a payment into a deposit (or back), split lines included. */
export function negateAmounts(draft: DraftTransactions): DraftTransactions {
  const [parent, ...lines] = draft;
  return toDraft(
    updateTransaction(draft, {
      ...parent,
      amount: signAmount(parent.amount, 'payment'),
      subtransactions: lines.map(line => ({
        ...line,
        amount: signAmount(line.amount, 'payment'),
      })),
    }).data,
  );
}

/**
 * What is still to allocate across the split lines, counted in the
 * transaction's direction (a payment of 84.12 with 60.00 allocated leaves
 * 24.12). Null when the transaction is not split.
 */
export function getSplitRemaining(
  draft: DraftTransactions,
  direction: AmountDirection,
): IntegerAmount | null {
  const [parent, ...lines] = draft;
  if (!parent.is_parent) {
    return null;
  }
  const allocated = lines.reduce((total, line) => total + line.amount, 0);
  return signAmount(parent.amount - allocated, direction);
}

/** The rows to add for a new transaction, with real ids. */
export function realizeDraft(draft: DraftTransactions): TransactionEntity[] {
  return realizeTempTransactions([...draft]).map(stripDisplayFields);
}

/**
 * What changed since editing started, ready for
 * `transactions-batch-update`. Display-only fields are left out.
 */
export function getDraftChanges(
  original: DraftTransactions,
  draft: DraftTransactions,
): Diff<TransactionEntity> {
  const diff = diffItems([...original], [...draft]);
  return {
    added: diff.added.map(stripDisplayFields),
    updated: diff.updated
      .map(stripDisplayFields)
      .filter(update => Object.keys(update).some(field => field !== 'id'))
      .map(toSendableUpdate),
    deleted: diff.deleted,
  };
}

export function hasChanges(changes: Diff<TransactionEntity>): boolean {
  return (
    changes.added.length > 0 ||
    changes.updated.length > 0 ||
    changes.deleted.length > 0
  );
}

/**
 * A new date moves the transaction to the top of that day, like an edit in
 * the register.
 */
export function withDateSortOrder(
  changes: Diff<TransactionEntity>,
  parentId: TransactionEntity['id'],
  now: number,
): Diff<TransactionEntity> {
  return {
    ...changes,
    updated: changes.updated.map(update =>
      update.id === parentId && update.date !== undefined
        ? { ...update, sort_order: now }
        : update,
    ),
  };
}

function stripDisplayFields<T extends Partial<TransactionEntity>>(
  transaction: T,
): Omit<T, 'error' | 'subtransactions' | '_unmatched' | '_deleted'> {
  const {
    error: _error,
    subtransactions: _subtransactions,
    _unmatched,
    _deleted,
    ...fields
  } = transaction;
  return fields;
}

/**
 * loot-core types an emptied field as `undefined`, which JSON drops on the
 * way to the server; only `null` clears it there (an emptied category).
 */
function toSendableUpdate(
  update: Partial<TransactionEntity>,
): Partial<TransactionEntity> {
  const sendable = { ...update };
  for (const [field, value] of Object.entries(update)) {
    if (value === undefined) {
      Reflect.set(sendable, field, null);
    }
  }
  return sendable;
}
