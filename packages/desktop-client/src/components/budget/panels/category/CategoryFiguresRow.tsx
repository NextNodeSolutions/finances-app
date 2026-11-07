import { useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { Amount } from '#components/budget/Amount';
import { useLocale } from '#hooks/useLocale';

import type { CategoryFigures } from './useCategoryFigures';

type CategoryFiguresRowProps = {
  month: string;
  figures: CategoryFigures;
  /** Tracking budgets call the balance "Remaining". */
  isTracking: boolean;
};

/** OCTOBER · BUDGETED · SPENT · BALANCE, as in the table row. */
export function CategoryFiguresRow({
  month,
  figures,
  isTracking,
}: CategoryFiguresRowProps) {
  const { t } = useTranslation();
  const locale = useLocale();
  const columns = [
    { label: t('Budgeted'), value: figures.budgeted, isBalance: false },
    { label: t('Spent'), value: figures.spent, isBalance: false },
    {
      label: isTracking ? t('Remaining') : t('Balance'),
      value: figures.balance,
      isBalance: true,
    },
  ];

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md }}
    >
      <Text
        style={{
          ...styles.monoLabel,
          flex: 1,
          color: theme.pageTextSubdued,
          paddingBottom: 2,
        }}
      >
        {monthUtils.format(month, 'MMMM', locale)}
      </Text>
      {columns.map(column => (
        <View
          key={column.label}
          style={{ alignItems: 'flex-end', gap: spacing.xxs }}
        >
          <Text style={{ ...styles.monoLabel, color: theme.pageTextSubdued }}>
            {column.label}
          </Text>
          <Amount
            value={column.value}
            style={{
              fontSize: 14,
              color:
                column.isBalance && column.value !== null && column.value < 0
                  ? theme.numberNegative
                  : theme.pageTextDark,
            }}
          />
        </View>
      ))}
    </View>
  );
}
