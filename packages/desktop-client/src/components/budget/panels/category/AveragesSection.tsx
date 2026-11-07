import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { Amount } from '#components/budget/Amount';
import { useBudgetActionWithUndo } from '#components/budget/panels/useBudgetActionWithUndo';
import { useFormat } from '#hooks/useFormat';

import { AVERAGE_LENGTHS, getAverageBudget } from './categoryHistory';
import type { AverageLength, CategoryHistoryMonth } from './categoryHistory';

type AveragesSectionProps = {
  category: Pick<CategoryEntity, 'id' | 'name' | 'is_income'>;
  month: string;
  history: readonly CategoryHistoryMonth[];
};

const AVERAGE_ACTIONS = {
  3: 'set-single-3-avg',
  6: 'set-single-6-avg',
  12: 'set-single-12-avg',
} as const satisfies Record<AverageLength, string>;

/** 3, 6 and 12-month averages, previewed before one is applied. */
export function AveragesSection({
  category,
  month,
  history,
}: AveragesSectionProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const runWithUndo = useBudgetActionWithUndo();
  const [length, setLength] = useState<AverageLength>(3);
  const isIncome = Boolean(category.is_income);
  const selectedAverage = getAverageBudget(history, length, isIncome);

  return (
    <View style={{ gap: spacing.sm }}>
      <View
        role="group"
        aria-label={t('Average length')}
        style={{ flexDirection: 'row', gap: spacing.xs }}
      >
        {AVERAGE_LENGTHS.map(option => (
          <Button
            key={option}
            variant="bare"
            aria-pressed={option === length}
            onPress={() => setLength(option)}
            style={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: spacing.xxs,
              padding: `${spacing.xs}px ${spacing.sm}px`,
              borderRadius: radius.sm,
              border: `1px solid ${option === length ? theme.pageTextDark : theme.hairline}`,
            }}
          >
            <Text style={{ ...styles.monoLabel, color: theme.pageTextSubdued }}>
              <Trans>{{ months: option }} mo</Trans>
            </Text>
            <Amount value={getAverageBudget(history, option, isIncome)} />
          </Button>
        ))}
      </View>
      <View style={{ alignItems: 'flex-start' }}>
        <Button
          onPress={() =>
            runWithUndo(
              {
                month,
                type: AVERAGE_ACTIONS[length],
                args: { category: category.id },
              },
              t('Set {{category}} to {{amount}}', {
                category: category.name,
                amount: format(selectedAverage, 'financial'),
              }),
            )
          }
        >
          <Trans>Set budget to {{ months: length }}-month average</Trans>
          {' ('}
          <Amount value={selectedAverage} />)
        </Button>
      </View>
    </View>
  );
}
