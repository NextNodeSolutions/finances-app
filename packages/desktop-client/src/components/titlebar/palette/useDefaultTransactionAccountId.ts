import type { AccountEntity } from '@actual-app/core/types/models';

import { useLastTransactionAccount } from '#components/transactions/panels/useLastTransactionAccount';
import { useAccounts } from '#hooks/useAccounts';

/**
 * The account a new transaction starts in when the caller knows none: the
 * one the last new transaction went to while it is still open, else the
 * first open on-budget account. Shared with the new-transaction panel's
 * own default through the same local pref.
 */
export function useDefaultTransactionAccountId():
  | AccountEntity['id']
  | undefined {
  const [lastAccountId] = useLastTransactionAccount();
  const { data: accounts = [] } = useAccounts();
  const openAccounts = accounts.filter(account => !account.closed);

  return (
    openAccounts.find(account => account.id === lastAccountId)?.id ??
    openAccounts.find(account => !account.offbudget)?.id
  );
}
