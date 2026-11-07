import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

const SKELETON_ROW_COUNT = 12;
const ROW_HEIGHT = 32;
// Relative widths of the placeholder cells: date, payee, category, amount.
const CELL_WIDTHS = ['8%', '22%', '16%', '9%'];

/** A still placeholder of 12 register rows while transactions load. */
export function RegisterSkeleton() {
  const { t } = useTranslation();

  return (
    <View role="status" aria-label={t('Loading transactions')}>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
        <View
          key={rowIndex}
          aria-hidden
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: ROW_HEIGHT,
            paddingInline: spacing.lg,
            borderBottom: `1px solid ${theme.tableBorder}`,
          }}
        >
          {CELL_WIDTHS.map((width, cellIndex) => (
            <View
              key={cellIndex}
              style={{
                width,
                height: 8,
                borderRadius: radius.xs,
                backgroundColor: theme.hairline,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
