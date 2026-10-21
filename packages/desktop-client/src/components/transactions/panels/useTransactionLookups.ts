import type {
  AccountEntity,
  PayeeEntity,
  TransactionEntity,
} from '@actual-app/core/types/models';

import { useAccounts } from '#hooks/useAccounts';
import { usePayees } from '#hooks/usePayees';

export type TransactionLookups = {
  account: AccountEntity | undefined;
  payee: PayeeEntity | undefined;
  /** The other account of a transfer. */
  transferAccount: AccountEntity | undefined;
  /**
   * Off-budget accounts and transfers between on-budget accounts carry no
   * category (the server clears it). A transfer to an off-budget account
   * keeps one: that money leaves the budget.
   */
  hidesCategory: boolean;
};

export function useTransactionLookups(
  transaction: Pick<TransactionEntity, 'account' | 'payee'>,
): TransactionLookups {
  const { data: accounts = [] } = useAccounts();
  const { data: payees = [] } = usePayees();

  const account = accounts.find(item => item.id === transaction.account);
  const payee = payees.find(item => item.id === transaction.payee);
  const transferAccount = payee?.transfer_acct
    ? accounts.find(item => item.id === payee.transfer_acct)
    : undefined;

  return {
    account,
    payee,
    transferAccount,
    hidesCategory:
      account?.offbudget === 1 ||
      (transferAccount !== undefined && transferAccount.offbudget === 0),
  };
}
