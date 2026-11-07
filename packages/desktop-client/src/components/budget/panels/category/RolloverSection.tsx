import { useId } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { useBudgetActions } from '#budget';
import { useSheetValues } from '#components/budget/useSheetValues';
import { Checkbox } from '#components/forms';

import { PanelSection } from './PanelSection';

type RolloverSectionProps = {
  categoryId: CategoryEntity['id'];
  month: string;
};

/** Envelope only: carry overspending into next month instead of covering. */
export function RolloverSection({ categoryId, month }: RolloverSectionProps) {
  const { t } = useTranslation();
  const checkboxId = useId();
  const budgetActions = useBudgetActions();
  const values = useSheetValues([
    {
      key: 'carryover',
      sheetName: monthUtils.sheetForMonth(month),
      name: `carryover-${categoryId}`,
    },
  ]);
  const isRollingOver = values.carryover === 1;

  return (
    <PanelSection label={t('Rollover')}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Checkbox
          id={checkboxId}
          checked={isRollingOver}
          disabled={!('carryover' in values)}
          onChange={() =>
            budgetActions.mutate({
              month,
              type: 'carryover',
              args: { category: categoryId, flag: !isRollingOver },
            })
          }
        />
        <label htmlFor={checkboxId} style={{ color: theme.pageText }}>
          <Trans>Roll overspending over</Trans>
        </label>
      </View>
    </PanelSection>
  );
}
