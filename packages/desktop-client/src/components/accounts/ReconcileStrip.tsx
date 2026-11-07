import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { IntegerAmount } from '@actual-app/core/shared/util';
import type { AccountEntity } from '@actual-app/core/types/models';

import { useSheetValue } from '#hooks/useSheetValue';

import { ReconcileProgress } from './ReconcileProgress';
import { recordValuation } from './recordValuation';
import { StatementBalanceForm } from './StatementBalanceForm';
import { useClearedBalances } from './useClearedBalances';
import type { BalanceQuery } from './useClearedBalances';
import { ValuationForm } from './ValuationForm';

/** The reconciliation state and handlers `AccountInternal` already owns. */
export type ReconcileHandlers = {
  /** The statement balance being reconciled to; null before step 2. */
  reconcileAmount: IntegerAmount | null;
  onReconcile: (amount: IntegerAmount | null) => void;
  onDone: () => void;
  onExit: () => void;
  onCreateTransaction: (difference: IntegerAmount) => void;
  /** Reloads the register after a valuation was recorded. */
  onValuationRecorded: () => void;
};

type ReconcileStripProps = {
  account: AccountEntity;
  balanceQuery: BalanceQuery;
  reconcile: ReconcileHandlers;
  /** Closes the strip before reconciling starts. */
  onClose: () => void;
};

/**
 * The inline reconcile strip under the instrument strip. On-budget accounts
 * reconcile to a statement balance; off-budget accounts record their
 * current value instead.
 */
export function ReconcileStrip({
  account,
  balanceQuery,
  reconcile,
  onClose,
}: ReconcileStripProps) {
  const { t } = useTranslation();
  const { cleared } = useClearedBalances(balanceQuery);
  const balance =
    useSheetValue<'balance', `balance-query-${string}`>(balanceQuery) ?? null;

  async function onRecordValuation(difference: IntegerAmount) {
    onClose();
    await recordValuation(account.id, difference);
    reconcile.onValuationRecorded();
  }

  return (
    <View
      role="region"
      aria-label={t('Reconcile')}
      data-testid="reconcile-strip"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 48,
        padding: `${spacing.sm}px ${spacing.sm}px ${spacing.sm}px ${spacing.lg}px`,
        backgroundColor: theme.tableBackground,
        border: `1px solid ${theme.hairline}`,
        borderRadius: radius.lg,
      }}
    >
      {account.offbudget ? (
        <ValuationForm
          balance={balance}
          onRecord={difference => void onRecordValuation(difference)}
          onCancel={onClose}
        />
      ) : reconcile.reconcileAmount != null ? (
        <ReconcileProgress
          clearedBalance={cleared ?? 0}
          statementBalance={reconcile.reconcileAmount}
          onDone={reconcile.onDone}
          onExit={reconcile.onExit}
          onCreateTransaction={reconcile.onCreateTransaction}
        />
      ) : (
        <StatementBalanceForm
          account={account}
          clearedBalance={cleared}
          onReconcile={reconcile.onReconcile}
          onCancel={onClose}
        />
      )}
    </View>
  );
}
