import { send } from '@actual-app/core/platform/client/connection';
import { currentDay } from '@actual-app/core/shared/months';
import { realizeTempTransactions } from '@actual-app/core/shared/transactions';
import type { IntegerAmount } from '@actual-app/core/shared/util';
import type { AccountEntity } from '@actual-app/core/types/models';
import { t } from 'i18next';

/**
 * Records a change in an off-budget account's value as one cleared
 * transaction for `difference`, noted `Valuation adjustment`. It mirrors
 * `createReconciliationTransaction` (`#accounts/reconciliation`), which
 * hardcodes its own note, and never locks anything.
 */
export async function recordValuation(
  accountId: AccountEntity['id'],
  difference: IntegerAmount,
): Promise<void> {
  const adjustments = realizeTempTransactions([
    {
      id: 'temp',
      account: accountId,
      cleared: true,
      reconciled: false,
      amount: difference,
      date: currentDay(),
      notes: t('Valuation adjustment'),
    },
  ]);

  const ruledAdjustments = await Promise.all(
    adjustments.map(transaction => send('rules-run', { transaction })),
  );

  await send('transactions-batch-update', {
    added: ruledAdjustments.filter(transaction => !transaction.tombstone),
    deleted: ruledAdjustments.filter(transaction => transaction.tombstone),
  });
}
