import { Trans } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { SettleRule } from '#components/common/SettleRule';
import { Amount } from '#components/overview/Amount';
import { HealthRow } from '#components/overview/HealthRow';
import { useSettled } from '#hooks/useSettled';
import { useSheetValue } from '#hooks/useSheetValue';
import { envelopeBudget } from '#spreadsheet/bindings';

import { MONTH_FIGURE_STYLE } from './monthFigureStyle';

/**
 * An envelope month's headline: what is left to budget, with the settle
 * rule at exactly 0.00. Must sit inside the month's SheetNameProvider.
 */
export function MobileEnvelopeMonthFigures() {
  const toBudget = useSheetValue<'envelope-budget', 'to-budget'>(
    envelopeBudget.toBudget,
  );
  const { isSettled, hasJustSettled } = useSettled(toBudget);
  const isOverbudgeted = toBudget !== null && toBudget < 0;

  return (
    <View style={{ gap: spacing.sm }}>
      <HealthRow
        label={
          isOverbudgeted ? (
            <Trans>Overbudgeted</Trans>
          ) : (
            <Trans>To budget</Trans>
          )
        }
        testId="overview-to-budget"
      >
        <Amount
          value={toBudget}
          tone="balance"
          style={{ ...styles.display, ...MONTH_FIGURE_STYLE }}
        />
      </HealthRow>
      <SettleRule isSettled={isSettled} hasJustSettled={hasJustSettled} />
    </View>
  );
}
