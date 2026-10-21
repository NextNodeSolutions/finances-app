import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

const CATEGORY_COLUMN_WIDTH = 200;
const FIGURE_COLUMN_COUNT = 3;

type BudgetSkeletonRowProps = {
  height: number;
  nameWidth: string;
  isGroup?: boolean;
};

/** One placeholder row: a name bar and three figure bars. */
export function BudgetSkeletonRow({
  height,
  nameWidth,
  isGroup = false,
}: BudgetSkeletonRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height,
        borderBottom: `1px solid ${theme.tableBorder}`,
        backgroundColor: isGroup ? theme.tableRowHeaderBackground : undefined,
      }}
    >
      <View
        style={{
          width: CATEGORY_COLUMN_WIDTH,
          paddingLeft: isGroup ? spacing.md : 22,
        }}
      >
        <View
          style={{
            width: nameWidth,
            height: 8,
            borderRadius: radius.xs,
            backgroundColor: theme.hairline,
          }}
        />
      </View>
      {Array.from({ length: FIGURE_COLUMN_COUNT }, (_, cellIndex) => (
        <View
          key={cellIndex}
          style={{ flex: 1, alignItems: 'flex-end', paddingRight: spacing.md }}
        >
          <View
            style={{
              width: 56,
              height: 8,
              borderRadius: radius.xs,
              backgroundColor: theme.hairline,
            }}
          />
        </View>
      ))}
    </View>
  );
}
