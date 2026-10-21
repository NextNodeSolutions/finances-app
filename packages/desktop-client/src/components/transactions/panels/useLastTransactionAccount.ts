import type { AccountEntity } from '@actual-app/core/types/models';

import { useLocalPref } from '#hooks/useLocalPref';

type LastTransactionAccount = [
  AccountEntity['id'] | undefined,
  (accountId: AccountEntity['id']) => void,
];

/**
 * The account the last new transaction went to, per budget file.
 */
export function useLastTransactionAccount(): LastTransactionAccount {
  const [accountId, setAccountId] = useLocalPref('ui.lastTransactionAccount');

  return [
    typeof accountId === 'string' ? accountId : undefined,
    id => setAccountId(id),
  ];
}
