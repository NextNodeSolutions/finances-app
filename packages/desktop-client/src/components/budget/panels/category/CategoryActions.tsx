import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { Amount } from '#components/budget/Amount';
import { CoverOverspendingPanel } from '#components/budget/panels/CoverOverspendingPanel';
import { MoveMoneyPanel } from '#components/budget/panels/MoveMoneyPanel';
import { BUDGET_PANEL_KEYS } from '#components/budget/panels/panelKeys';
import { useBudgetActionWithUndo } from '#components/budget/panels/useBudgetActionWithUndo';
import { usePanels } from '#components/panels/PanelProvider';
import { useFormat } from '#hooks/useFormat';

import type { CategoryFigures } from './useCategoryFigures';

type CategoryActionsProps = {
  category: Pick<CategoryEntity, 'id' | 'name'>;
  month: string;
  figures: CategoryFigures;
  isTracking: boolean;
};

/**
 * Envelope: cover an overspent balance or move a funded one. Tracking:
 * raise the budget to what was spent once the category is over.
 */
export function CategoryActions({
  category,
  month,
  figures,
  isTracking,
}: CategoryActionsProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { open } = usePanels();
  const runWithUndo = useBudgetActionWithUndo();
  const balance = figures.balance ?? 0;
  const spentAmount = -(figures.spent ?? 0);
  const isOverBudget = spentAmount > (figures.budgeted ?? 0);

  if (isTracking) {
    if (!isOverBudget) {
      return null;
    }
    return (
      <View style={{ flexDirection: 'row', marginTop: spacing.md }}>
        <Button
          onPress={() =>
            runWithUndo(
              {
                month,
                type: 'budget-amount',
                args: { category: category.id, amount: spentAmount },
              },
              t('Raised {{category}} to {{amount}}', {
                category: category.name,
                amount: format(spentAmount, 'financial'),
              }),
            )
          }
        >
          <Trans>Raise to</Trans>&nbsp;
          <Amount value={spentAmount} />
        </Button>
      </View>
    );
  }

  if (balance === 0) {
    return null;
  }

  return (
    <View
      style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}
    >
      {balance < 0 && (
        <Button
          variant="primary"
          onPress={() =>
            open({
              key: BUDGET_PANEL_KEYS.cover,
              element: (
                <CoverOverspendingPanel
                  categoryId={category.id}
                  month={month}
                />
              ),
            })
          }
        >
          <Trans>Cover overspending</Trans>
        </Button>
      )}
      {balance > 0 && (
        <Button
          onPress={() =>
            open({
              key: BUDGET_PANEL_KEYS.moveMoney,
              element: <MoveMoneyPanel from={category.id} month={month} />,
            })
          }
        >
          <Trans>Move money</Trans>
        </Button>
      )}
    </View>
  );
}
