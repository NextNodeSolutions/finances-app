import React from 'react';
import { useTranslation } from 'react-i18next';

import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { sheetForMonth } from '@actual-app/core/shared/months';

import { PlanActualLists } from '#components/budget/rail/PlanActualLists';
import { MobileSheet } from '#components/mobile/MobileSheet';
import { SheetNameProvider } from '#hooks/useSheetName';
import type { Modal as ModalType } from '#modals/modalsSlice';

type TrackingBudgetSummaryModalProps = Extract<
  ModalType,
  { name: 'tracking-budget-summary' }
>['options'];

export function TrackingBudgetSummaryModal({
  month,
}: TrackingBudgetSummaryModalProps) {
  const { t } = useTranslation();
  return (
    <MobileSheet name="tracking-budget-summary" title={t('Budget Summary')}>
      <View
        style={{ padding: `${spacing.xs}px ${spacing.lg}px ${spacing.lg}px` }}
      >
        <SheetNameProvider name={sheetForMonth(month)}>
          <PlanActualLists month={month} />
        </SheetNameProvider>
      </View>
    </MobileSheet>
  );
}
