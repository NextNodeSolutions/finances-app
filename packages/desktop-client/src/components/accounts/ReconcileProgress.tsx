import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type { IntegerAmount } from '@actual-app/core/shared/util';

import { SettleRule } from '#components/common/SettleRule';
import { useSettled } from '#hooks/useSettled';

import { reconcileFormStyle } from './reconcileStripStyles';
import { StripReading } from './StripReading';

type ReconcileProgressProps = {
  clearedBalance: IntegerAmount;
  statementBalance: IntegerAmount;
  /**
   * Ends reconciling: locks the cleared rows when they match the statement
   * and records the reconcile date.
   */
  onDone: () => void;
  /** Ends reconciling without locking anything. */
  onExit: () => void;
  onCreateTransaction: (difference: IntegerAmount) => void;
};

/**
 * Reconcile steps 2 and 3: the difference between the cleared rows and the
 * statement, live while rows are cleared, then the settle rule at 0.00.
 */
export function ReconcileProgress({
  clearedBalance,
  statementBalance,
  onDone,
  onExit,
  onCreateTransaction,
}: ReconcileProgressProps) {
  const { t } = useTranslation();
  const difference = statementBalance - clearedBalance;
  const { isSettled, hasJustSettled } = useSettled(difference);

  return (
    <View style={reconcileFormStyle}>
      <StripReading
        label={t('Cleared')}
        amount={clearedBalance}
        testId="reconcile-cleared"
      />
      <StripReading
        label={t('Statement')}
        amount={statementBalance}
        testId="reconcile-statement"
      />
      <StripReading
        label={t('Difference')}
        amount={difference}
        isSigned
        color={difference === 0 ? theme.pageTextSubdued : theme.numberNegative}
        testId="reconcile-difference"
      />
      <View style={{ flex: 1, minWidth: 80 }}>
        <SettleRule
          isSettled={isSettled}
          hasJustSettled={hasJustSettled}
          label={t('All reconciled!')}
        />
      </View>
      {isSettled ? (
        <Button variant="primary" onPress={onDone}>
          <Trans>Lock transactions</Trans>
        </Button>
      ) : (
        <Button onPress={() => onCreateTransaction(difference)}>
          <Trans>Create reconciliation transaction</Trans>
        </Button>
      )}
      <Button onPress={isSettled ? onExit : onDone}>
        <Trans>Exit reconciliation</Trans>
      </Button>
    </View>
  );
}
