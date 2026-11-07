import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { groupById } from '@actual-app/core/shared/util';

import { useCategories } from '#hooks/useCategories';
import { useFormat } from '#hooks/useFormat';
import { useSheetValue } from '#hooks/useSheetValue';
import { useUndo } from '#hooks/useUndo';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';
import { envelopeBudget } from '#spreadsheet/bindings';

import { BUDGET_BANNER_ACTION_STYLE, BudgetBanner } from './BudgetBanner';

type OverbudgetedBannerProps = {
  month: string;
  onBudgetAction: (month: string, action: string, args: unknown) => void;
};

/**
 * Envelope only: more budgeted than there is to budget in the viewed month.
 * Cover opens the cover sheet with no source preselected. Reads the month's
 * sheet, so it sits inside its SheetNameProvider.
 */
export function OverbudgetedBanner({
  month,
  onBudgetAction,
}: OverbudgetedBannerProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const format = useFormat();
  const { showUndoNotification } = useUndo();
  const { data: categoryData } = useCategories();
  const categories = categoryData?.list ?? [];
  const toBudget = useSheetValue<'envelope-budget', 'to-budget'>(
    envelopeBudget.toBudget,
  );

  if (toBudget === null || toBudget >= 0) {
    return null;
  }

  const openCoverSheet = () => {
    const categoriesById = groupById(categories);
    dispatch(
      pushModal({
        modal: {
          name: 'cover',
          options: {
            title: t('Cover overbudgeted'),
            month,
            amount: toBudget,
            showToBeBudgeted: false,
            onSubmit: (amount, categoryId) => {
              onBudgetAction(month, 'cover-overbudgeted', {
                category: categoryId,
                amount,
                currencyCode: format.currency.code,
              });
              showUndoNotification({
                message: t('Covered overbudgeted from {{categoryName}}', {
                  categoryName: categoriesById[categoryId]?.name ?? '',
                }),
              });
            },
          },
        },
      }),
    );
  };

  return (
    <BudgetBanner
      severity="signal"
      label={t('You have budgeted more than your available funds')}
      action={
        <Button onPress={openCoverSheet} style={BUDGET_BANNER_ACTION_STYLE}>
          <Trans>Cover</Trans>
        </Button>
      }
    />
  );
}
