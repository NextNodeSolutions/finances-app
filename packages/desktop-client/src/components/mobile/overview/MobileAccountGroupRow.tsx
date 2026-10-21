import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { Amount } from '#components/overview/Amount';
import type { SubtotalRow } from '#components/overview/balanceSheetRows';
import { CARD_GUTTER } from '#components/overview/OverviewCard';

type MobileAccountGroupRowProps = {
  row: SubtotalRow;
};

/**
 * A side (On budget, Off budget, Closed) or one of the user's account
 * groups, with its subtotal at the statement date.
 */
export function MobileAccountGroupRow({ row }: MobileAccountGroupRowProps) {
  const isSide = row.level === 'side';

  return (
    <View
      role="listitem"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
        minHeight: isSide ? 36 : 40,
        padding: `0 ${CARD_GUTTER}px`,
        borderTop: `1px solid ${theme.tableBorder}`,
        backgroundColor: isSide ? theme.tableHeaderBackground : undefined,
      }}
    >
      <Text
        style={{
          ...(isSide
            ? { ...styles.monoLabel, color: theme.tableHeaderText }
            : { fontSize: 13, fontWeight: 600, color: theme.pageTextDark }),
          ...styles.ellipsisText,
          minWidth: 0,
        }}
      >
        {row.label}
      </Text>
      <Amount
        value={row.balance}
        tone="balance"
        style={{ fontSize: 13, fontWeight: isSide ? 500 : 600 }}
      />
    </View>
  );
}
