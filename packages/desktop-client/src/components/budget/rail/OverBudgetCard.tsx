import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { Amount } from '#components/budget/Amount';
import { useBudgetActionWithUndo } from '#components/budget/panels/useBudgetActionWithUndo';
import { useSheetValues } from '#components/budget/useSheetValues';
import { useFormat } from '#hooks/useFormat';
import type { useOverspentCategories } from '#hooks/useOverspentCategories';

import { RailSection } from './RailSection';

type OverBudgetCardProps = {
  month: string;
  overspent: ReturnType<typeof useOverspentCategories>;
};

const CATEGORIES_SHOWN = 4;

/**
 * Tracking: categories that spent more than budgeted, each with an explicit
 * Raise to button that sets the budget to what was spent.
 */
export function OverBudgetCard({ month, overspent }: OverBudgetCardProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const runWithUndo = useBudgetActionWithUndo();
  const shown = overspent.categories.slice(0, CATEGORIES_SHOWN);
  const sheetName = monthUtils.sheetForMonth(month);
  const spentById = useSheetValues(
    shown.map(category => ({
      key: category.id,
      sheetName,
      name: `sum-amount-${category.id}`,
    })),
  );

  if (shown.length === 0) {
    return null;
  }

  return (
    <RailSection testId="over-budget-card">
      <Text style={{ fontWeight: 600, color: theme.pageTextDark }}>
        <Trans>Over budget</Trans>
      </Text>
      {shown.map(category => {
        const spentAmount = Math.abs(spentById[category.id] ?? 0);
        return (
          <View key={category.id} style={{ gap: spacing.xs }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                fontSize: 12.5,
              }}
            >
              <Text style={{ color: theme.pageTextLight }}>
                {category.name}
              </Text>
              <Amount
                value={overspent.amountsByCategory.get(category.id) ?? null}
                style={{ color: theme.numberNegative }}
              />
            </View>
            <View style={{ alignItems: 'flex-start' }}>
              <Button
                isDisabled={!(category.id in spentById)}
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
          </View>
        );
      })}
    </RailSection>
  );
}
