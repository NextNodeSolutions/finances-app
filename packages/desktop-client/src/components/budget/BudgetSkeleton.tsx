import { useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { BudgetSkeletonRow } from './BudgetSkeletonRow';

// Three groups holding twelve categories, the shape of a small budget.
const SKELETON_GROUP_SIZES = [5, 4, 3];
const CATEGORY_ROW_HEIGHT = 32;
const GROUP_ROW_HEIGHT = 34;
// Relative widths of the name placeholders, cycled across rows.
const NAME_WIDTHS = ['46%', '62%', '38%', '54%', '42%'];

/** A still placeholder of the budget table while its months load. */
export function BudgetSkeleton() {
  const { t } = useTranslation();

  return (
    <View
      role="status"
      aria-label={t('Loading budget')}
      style={{ flex: 1, gap: spacing.md, paddingTop: spacing.sm }}
    >
      <View
        aria-hidden
        style={{
          width: 220,
          height: 28,
          borderRadius: radius.sm,
          backgroundColor: theme.hairline,
        }}
      />
      <View aria-hidden style={{ ...styles.tableContainer, flex: 'none' }}>
        <View
          style={{
            height: CATEGORY_ROW_HEIGHT,
            backgroundColor: theme.tableHeaderBackground,
            borderBottom: `1px solid ${theme.tableBorder}`,
          }}
        />
        {SKELETON_GROUP_SIZES.map((size, groupIndex) => (
          <View key={groupIndex}>
            <BudgetSkeletonRow
              height={GROUP_ROW_HEIGHT}
              nameWidth="30%"
              isGroup
            />
            {Array.from({ length: size }, (_, rowIndex) => (
              <BudgetSkeletonRow
                key={rowIndex}
                height={CATEGORY_ROW_HEIGHT}
                nameWidth={
                  NAME_WIDTHS[(groupIndex + rowIndex) % NAME_WIDTHS.length]
                }
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
