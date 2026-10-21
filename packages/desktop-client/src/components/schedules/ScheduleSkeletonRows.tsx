import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

const SKELETON_ROWS = 3;
const BLOCK_WIDTHS = ['22%', '18%', '14%', '10%'];

type ScheduleSkeletonRowsProps = {
  rowHeight: number;
};

/** Still placeholder rows at the table's row height while schedules load. */
export function ScheduleSkeletonRows({ rowHeight }: ScheduleSkeletonRowsProps) {
  const { t } = useTranslation();

  return (
    <View aria-busy aria-label={t('Loading schedules')}>
      {Array.from({ length: SKELETON_ROWS }, (_, row) => (
        <View
          key={row}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xl,
            height: rowHeight,
            padding: `0 ${spacing.lg}px`,
            borderBottom: `1px solid ${theme.tableBorder}`,
          }}
        >
          {BLOCK_WIDTHS.map(width => (
            <View
              key={width}
              style={{
                width,
                height: 12,
                borderRadius: 4,
                backgroundColor: theme.tableRowBackgroundHover,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
