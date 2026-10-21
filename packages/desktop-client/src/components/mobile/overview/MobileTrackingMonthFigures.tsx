import { Trans } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import * as monthUtils from '@actual-app/core/shared/months';

import { Amount } from '#components/overview/Amount';
import { HealthRow } from '#components/overview/HealthRow';
import { useSheetValue } from '#hooks/useSheetValue';
import { trackingBudget } from '#spreadsheet/bindings';

import { MONTH_FIGURE_STYLE } from './monthFigureStyle';

type MobileTrackingMonthFiguresProps = {
  month: string;
};

/**
 * A tracking month's headline: projected savings for the current and
 * coming months, Saved or Overspent once a month is over. Ink at or above
 * zero, garnet below, never amber. Must sit inside the month's
 * SheetNameProvider.
 */
export function MobileTrackingMonthFigures({
  month,
}: MobileTrackingMonthFiguresProps) {
  const projected = useSheetValue<'tracking-budget', 'total-saved'>(
    trackingBudget.totalBudgetedSaved,
  );
  const saved = useSheetValue<'tracking-budget', 'real-saved'>(
    trackingBudget.totalSaved,
  );
  const isPast = month < monthUtils.currentMonth();
  const value = isPast ? saved : projected;

  return (
    <HealthRow
      label={
        !isPast ? (
          <Trans>Projected savings</Trans>
        ) : value !== null && value < 0 ? (
          <Trans>Overspent</Trans>
        ) : (
          <Trans>Saved</Trans>
        )
      }
      testId="overview-savings"
    >
      <Amount
        value={value}
        tone="balance"
        style={{ ...styles.display, ...MONTH_FIGURE_STYLE }}
      />
    </HealthRow>
  );
}
