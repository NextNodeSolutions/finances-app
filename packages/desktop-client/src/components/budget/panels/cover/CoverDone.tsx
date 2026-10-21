import { Trans } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { IntegerAmount } from '@actual-app/core/shared/util';

import { Amount } from '#components/budget/Amount';
import { SettleRule } from '#components/common/SettleRule';
import { useSettled } from '#hooks/useSettled';

type CoverDoneProps = {
  /** What the walk leaves overspent, positive cents; 0 once all covered. */
  uncoveredTotal: IntegerAmount;
  /** A step was skipped or covered in part, so the walk cannot settle. */
  hasLeftOverspending: boolean;
};

/**
 * The last step. The heading follows what the user did, so it does not
 * flicker while the last cover reaches the spreadsheet; the Settle rule
 * draws once the figures really balance.
 */
export function CoverDone({
  uncoveredTotal,
  hasLeftOverspending,
}: CoverDoneProps) {
  const { isSettled, hasJustSettled } = useSettled(uncoveredTotal);

  return (
    <View style={{ gap: spacing.md, paddingTop: spacing.sm }}>
      <Text
        style={{ fontSize: 15, fontWeight: 600, color: theme.pageTextDark }}
      >
        {!hasLeftOverspending ? (
          <Trans>All overspending covered</Trans>
        ) : (
          <Trans>Some overspending is left</Trans>
        )}
      </Text>
      {hasLeftOverspending && (
        <Amount
          value={-uncoveredTotal}
          style={{ color: theme.numberNegative }}
        />
      )}
      <SettleRule isSettled={isSettled} hasJustSettled={hasJustSettled} />
    </View>
  );
}
