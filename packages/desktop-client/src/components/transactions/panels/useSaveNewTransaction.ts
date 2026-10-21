import { useTranslation } from 'react-i18next';

import { send } from '@actual-app/core/platform/client/connection';
import type { AccountEntity } from '@actual-app/core/types/models';

import { useNavigate } from '#hooks/useNavigate';
import { usePayees } from '#hooks/usePayees';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { addNotification } from '#notifications/notificationsSlice';
import { useCreatePayeeMutation } from '#payees';
import { useDispatch } from '#redux';

import { findPayeeByName } from './findPayeeByName';
import { realizeDraft, updateParent } from './transactionDraft';
import type { DraftTransactions } from './transactionDraft';
import { useLastTransactionAccount } from './useLastTransactionAccount';

type SaveNewTransaction = (
  transactions: DraftTransactions,
  account: AccountEntity,
  /** A payee to create first, when it was only typed (the palette). */
  pendingPayeeName: string | null,
) => Promise<boolean>;

/**
 * Adds a new transaction (and its split lines) the way the register does,
 * then remembers the account and offers to show it. Resolves to whether it
 * was saved.
 */
export function useSaveNewTransaction(): SaveNewTransaction {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const createPayee = useCreatePayeeMutation();
  const { data: payees = [] } = usePayees();
  const [, setLastAccountId] = useLastTransactionAccount();
  const [learnCategories = 'true'] = useSyncedPref('learn-categories');

  const withPayee = async (
    transactions: DraftTransactions,
    pendingPayeeName: string | null,
  ) => {
    if (pendingPayeeName === null) {
      return transactions;
    }
    const payeeId =
      findPayeeByName(payees, pendingPayeeName)?.id ??
      (await createPayee.mutateAsync({ name: pendingPayeeName }));
    return updateParent(transactions, { payee: payeeId });
  };

  return async (transactions, account, pendingPayeeName) => {
    try {
      const ready = await withPayee(transactions, pendingPayeeName);
      await send('transactions-batch-update', {
        added: realizeDraft(ready),
        learnCategories: String(learnCategories) === 'true',
      });
    } catch (error) {
      console.error('Failed to add the transaction', error);
      dispatch(
        addNotification({
          notification: {
            type: 'error',
            message: t('The transaction could not be saved. Try again.'),
          },
        }),
      );
      return false;
    }

    setLastAccountId(account.id);
    dispatch(
      addNotification({
        notification: {
          type: 'message',
          message: t('Transaction added to {{account}}', {
            account: account.name,
          }),
          button: {
            title: t('View'),
            action: () => navigate(`/accounts/${account.id}`),
          },
        },
      }),
    );
    return true;
  };
}
