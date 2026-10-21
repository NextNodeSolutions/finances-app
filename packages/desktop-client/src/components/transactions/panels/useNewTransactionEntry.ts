import { useEffect, useEffectEvent, useState } from 'react';

import type { AccountEntity, PayeeEntity } from '@actual-app/core/types/models';

import { usePayees } from '#hooks/usePayees';

import { findPayeeByName } from './findPayeeByName';
import { createNewDraft } from './transactionDraft';
import type { DraftTransactions } from './transactionDraft';
import { useLastTransactionAccount } from './useLastTransactionAccount';
import { useTransactionDraft } from './useTransactionDraft';
import type { TransactionDraft } from './useTransactionDraft';
import type { NewTransactionPrefill } from './useTransactionPanels';

type Entry = {
  base: DraftTransactions;
  /** A typed payee with no match yet; created on save. */
  pendingPayeeName: string | null;
};

type NewTransactionEntry = {
  draft: TransactionDraft;
  pendingPayeeName: string | null;
  /** The opener named a payee: rules ran on open and the amount is next. */
  hasPrefilledPayee: boolean;
  clearPendingPayee: () => void;
  /** Starts the next entry on the same account and date. */
  startAnother: () => void;
};

/**
 * One new transaction being entered: the opener's prefill, the last-used
 * account when the opener names none, and the rules run once on open when
 * a payee is already known (the command palette relies on it).
 */
export function useNewTransactionEntry(
  prefill: NewTransactionPrefill,
): NewTransactionEntry {
  const [lastAccountId] = useLastTransactionAccount();
  const { data: payees = [] } = usePayees();
  const [entry, setEntry] = useState(() =>
    createEntry(prefill, prefill.accountId ?? lastAccountId, payees),
  );
  const draft = useTransactionDraft(entry.base, 'empty-fields');
  const hasPrefilledPayee = Boolean(prefill.payeeId || prefill.payeeName);

  const runOpeningRules = useEffectEvent(() => {
    void draft.fillFromRules(draft.parent);
  });
  useEffect(() => {
    if (hasPrefilledPayee) {
      runOpeningRules();
    }
  }, [hasPrefilledPayee]);

  return {
    draft,
    pendingPayeeName: entry.pendingPayeeName,
    hasPrefilledPayee,
    clearPendingPayee: () =>
      setEntry(current => ({ ...current, pendingPayeeName: null })),
    startAnother: () => {
      const { account, date } = draft.parent;
      setEntry(createEntry({ date }, account || undefined, payees));
      draft.discard();
    },
  };
}

function createEntry(
  prefill: NewTransactionPrefill,
  accountId: AccountEntity['id'] | undefined,
  payees: readonly PayeeEntity[],
): Entry {
  const typedName = prefill.payeeName?.trim() ?? '';
  const payeeId =
    prefill.payeeId ?? findPayeeByName(payees, typedName)?.id ?? null;

  return {
    base: createNewDraft(
      { ...prefill, payeeId: payeeId ?? undefined },
      accountId,
    ),
    pendingPayeeName: payeeId === null && typedName !== '' ? typedName : null,
  };
}
