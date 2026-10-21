import { useState } from 'react';

import { send } from '@actual-app/core/platform/client/connection';
import { q } from '@actual-app/core/shared/query';
import type {
  AccountEntity,
  TransactionEntity,
} from '@actual-app/core/types/models';

import { usePanels } from '#components/panels/PanelProvider';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { useTransactionBatchActions } from '#hooks/useTransactionBatchActions';
import { pushModal } from '#modals/modalsSlice';
import { aqlQuery } from '#queries/aqlQuery';
import { useDispatch } from '#redux';

import { withDateSortOrder } from './transactionDraft';
import type { DraftTransactions } from './transactionDraft';
import type { TransactionDraft } from './useTransactionDraft';

type TransactionDetailActions = {
  save: () => Promise<void>;
  remove: () => void;
  duplicate: () => void;
  linkSchedule: () => void;
  /** Asks first, then lets the draft edit a reconciled transaction. */
  unlock: () => void;
  isSaving: boolean;
};

/**
 * What the detail panel's buttons do. Save, Delete and Duplicate close the
 * panel when they succeed, so the register behind it refetches.
 */
export function useTransactionDetailActions(
  draft: TransactionDraft,
  account: AccountEntity | undefined,
): TransactionDetailActions {
  const dispatch = useDispatch();
  const { close } = usePanels();
  const batchActions = useTransactionBatchActions();
  const [learnCategories = 'true'] = useSyncedPref('learn-categories');
  const [isSaving, setIsSaving] = useState(false);
  const ids = [draft.parent.id];

  const commit = async () => {
    setIsSaving(true);
    try {
      await send('transactions-batch-update', {
        ...withDateSortOrder(draft.changes, draft.parent.id, Date.now()),
        learnCategories: String(learnCategories) === 'true',
      });
    } finally {
      setIsSaving(false);
    }
    close();
  };

  const confirmEdit = (
    confirmReason: 'unlockReconciled' | 'batchEditWithReconciledTransfer',
    onConfirm: () => void,
  ) =>
    dispatch(
      pushModal({
        modal: {
          name: 'confirm-transaction-edit',
          options: { confirmReason, onConfirm },
        },
      }),
    );

  return {
    save: async () => {
      if (await hasReconciledTransfer(draft.transactions)) {
        confirmEdit('batchEditWithReconciledTransfer', () => void commit());
        return;
      }
      await commit();
    },
    remove: () => void batchActions.onBatchDelete({ ids, onSuccess: close }),
    duplicate: () =>
      void batchActions.onBatchDuplicate({ ids, onSuccess: close }),
    linkSchedule: () => void batchActions.onBatchLinkSchedule({ ids, account }),
    unlock: () =>
      confirmEdit('unlockReconciled', () =>
        draft.setFields({ reconciled: false }),
      ),
    isSaving,
  };
}

/** Editing one side of a transfer whose other side is reconciled warns first. */
async function hasReconciledTransfer(
  transactions: DraftTransactions,
): Promise<boolean> {
  const transferIds = transactions
    .map(transaction => transaction.transfer_id)
    .filter((id): id is TransactionEntity['id'] => id != null);
  if (transferIds.length === 0) {
    return false;
  }
  const { data } = await aqlQuery(
    q('transactions')
      .filter({ id: { $oneof: transferIds }, reconciled: true })
      .select('id'),
  );
  return Array.isArray(data) && data.length > 0;
}
