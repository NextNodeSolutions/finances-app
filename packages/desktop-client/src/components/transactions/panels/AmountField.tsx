import { useId } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { IntegerAmount } from '@actual-app/core/shared/util';

import { SegmentedControl } from '#components/rules/SegmentedControl';
import { SegmentedControlItem } from '#components/rules/SegmentedControlItem';

import { PanelAmountInput } from './PanelAmountInput';
import { PanelField } from './PanelField';
import type { AmountDirection } from './transactionDraft';

type AmountFieldProps = {
  /** Signed cents. */
  amount: IntegerAmount;
  direction: AmountDirection;
  onChangeDirection: (direction: AmountDirection) => void;
  /** The typed figure; the direction gives it its sign. */
  onChangeFigure: (figure: IntegerAmount) => void;
  autoFocus?: boolean;
  isDisabled?: boolean;
};

/** `Payment | Deposit` and the figure, the way the register splits them. */
export function AmountField({
  amount,
  direction,
  onChangeDirection,
  onChangeFigure,
  autoFocus,
  isDisabled,
}: AmountFieldProps) {
  const { t } = useTranslation();
  const id = useId();

  return (
    <PanelField label={t('Amount')} htmlFor={id}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.sm,
        }}
      >
        {isDisabled ? (
          <Text style={{ fontSize: 13, color: theme.pageTextSubdued }}>
            {direction === 'payment' ? t('Payment') : t('Deposit')}
          </Text>
        ) : (
          <SegmentedControl>
            <SegmentedControlItem
              isSelected={direction === 'payment'}
              onPress={() => onChangeDirection('payment')}
            >
              <Trans>Payment</Trans>
            </SegmentedControlItem>
            <SegmentedControlItem
              isSelected={direction === 'deposit'}
              onPress={() => onChangeDirection('deposit')}
            >
              <Trans>Deposit</Trans>
            </SegmentedControlItem>
          </SegmentedControl>
        )}
        <PanelAmountInput
          id={id}
          amount={Math.abs(amount)}
          onChangeAmount={figure => onChangeFigure(Math.abs(figure))}
          autoFocus={autoFocus}
          isDisabled={isDisabled}
        />
      </View>
    </PanelField>
  );
}
