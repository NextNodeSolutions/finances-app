import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { AccountEntity } from '@actual-app/core/types/models';

import { StripReading } from '#components/accounts/StripReading';
import { SettleRule } from '#components/common/SettleRule';
import { mobileCardStyle } from '#components/mobile/utils';
import { useSettled } from '#hooks/useSettled';
import { useSheetValue } from '#hooks/useSheetValue';
import * as bindings from '#spreadsheet/bindings';

const BUTTON_STYLE: CSSProperties = {
  flex: 1,
  minHeight: 44,
  borderRadius: radius.md,
};

type ReconcilingBannerProps = {
  account: AccountEntity;
  targetBalance: number;
  /** Ends reconciling: locks the cleared rows when they match. */
  onDone: () => Promise<void>;
  /** Ends reconciling without locking anything. */
  onExit: () => void;
  onCreateTransaction: (targetDiff: number) => Promise<void>;
};

/**
 * The reconcile strip of the narrow register: cleared, statement and their
 * difference, then the settle rule once the difference reaches 0.00.
 */
export function ReconcilingBanner({
  account,
  targetBalance,
  onDone,
  onExit,
  onCreateTransaction,
}: ReconcilingBannerProps) {
  const { t } = useTranslation();
  const cleared = useSheetValue<'account', 'balanceCleared'>(
    bindings.accountBalanceCleared(account.id),
  );
  const targetDiff = cleared == null ? null : targetBalance - cleared;
  const { isSettled, hasJustSettled } = useSettled(targetDiff);
  const [isUpdating, setIsUpdating] = useState(false);

  if (cleared == null || targetDiff == null) {
    return null;
  }

  const runAction = async (action: () => Promise<void>) => {
    setIsUpdating(true);
    try {
      await action();
    } finally {
      setIsUpdating(false);
    }
  };

  // Both states stay rendered so the banner keeps the height of the taller.
  return (
    <View
      data-testid="reconciling-banner"
      style={{
        flexShrink: 0,
        gap: spacing.md,
        ...mobileCardStyle,
        overflow: 'visible',
        margin: '10px 12px 0',
        padding: 12,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: spacing.lg,
          rowGap: spacing.xs,
        }}
      >
        <StripReading
          label={t('Cleared')}
          amount={cleared}
          testId="reconciling-cleared"
        />
        <StripReading
          label={t('Statement')}
          amount={targetBalance}
          testId="reconciling-statement"
        />
        <StripReading
          label={t('Difference')}
          amount={targetDiff}
          isSigned
          color={isSettled ? theme.pageTextSubdued : theme.numberNegative}
          testId="reconciling-difference"
        />
      </View>
      <View style={{ display: 'grid' }}>
        <View
          style={{
            gridArea: '1 / 1',
            justifyContent: 'center',
            gap: 10,
            ...(!isSettled && { visibility: 'hidden' }),
          }}
        >
          <SettleRule
            isSettled={isSettled}
            hasJustSettled={hasJustSettled}
            label={t('All reconciled!')}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              isDisabled={isUpdating}
              style={BUTTON_STYLE}
              onPress={onExit}
            >
              <Trans>Exit reconciliation</Trans>
            </Button>
            <Button
              variant="primary"
              isDisabled={isUpdating}
              style={BUTTON_STYLE}
              onPress={() => runAction(onDone)}
            >
              <Trans>Lock transactions</Trans>
            </Button>
          </View>
        </View>
        <View
          style={{
            gridArea: '1 / 1',
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: 10,
            ...(isSettled && { visibility: 'hidden' }),
          }}
        >
          <Button
            isDisabled={isUpdating}
            style={BUTTON_STYLE}
            onPress={() => runAction(() => onCreateTransaction(targetDiff))}
          >
            <Trans>Create reconciliation transaction</Trans>
          </Button>
          <Button
            variant="primary"
            isDisabled={isUpdating}
            style={BUTTON_STYLE}
            onPress={() => runAction(onDone)}
          >
            <Trans>Exit reconciliation</Trans>
          </Button>
        </View>
      </View>
    </View>
  );
}
