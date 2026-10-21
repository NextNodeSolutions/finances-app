import { Trans, useTranslation } from 'react-i18next';

import { FormError } from '@actual-app/components/form-error';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { IntegerAmount } from '@actual-app/core/shared/util';

import { SettleRule } from '#components/common/SettleRule';
import { FinancialText } from '#components/FinancialText';
import { useFormat } from '#hooks/useFormat';
import { useSettled } from '#hooks/useSettled';

type SplitRemainingProps = {
  /** What is left to allocate, in the transaction's direction. */
  remaining: IntegerAmount;
};

/** The split's remainder; at exactly 0.00 the Settle rule draws. */
export function SplitRemaining({ remaining }: SplitRemainingProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { isSettled, hasJustSettled } = useSettled(remaining);

  return (
    <View style={{ gap: spacing.xs, marginTop: spacing.sm }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ ...styles.monoLabel, color: theme.tableHeaderText }}>
          <Trans>Remaining</Trans>
        </Text>
        <FinancialText
          data-testid="split-remaining"
          style={{ fontSize: 13, fontWeight: 500, color: theme.pageTextDark }}
        >
          {format(remaining, 'financial')}
        </FinancialText>
      </View>
      <SettleRule
        isSettled={isSettled}
        hasJustSettled={hasJustSettled}
        label={t('Balanced')}
      />
      {!isSettled && (
        <FormError style={{ textAlign: 'right' }}>
          <Trans>Split lines must add up to the total.</Trans>
        </FormError>
      )}
    </View>
  );
}
