import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { motion, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { Amount } from '#components/overview/Amount';
import type { AccountRow } from '#components/overview/balanceSheetRows';
import { CARD_GUTTER } from '#components/overview/OverviewCard';

// Each level of the side / group tree indents the name by this much.
const DEPTH_INDENT = 12;
const ROW_HEIGHT = 44;

const rowClassName = css({
  ...styles.noTapHighlight,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.md,
  minHeight: ROW_HEIGHT,
  paddingRight: CARD_GUTTER,
  borderTop: `1px solid ${theme.tableBorder}`,
  textDecoration: 'none',
  color: theme.tableText,
  fontSize: 14,
  transition: `background-color ${motion.fast} ${motion.ease}`,
  '&:active': { backgroundColor: theme.tableRowBackgroundHover },
  '&:focus-visible': {
    outline: `2px solid ${theme.focusRing}`,
    outlineOffset: -2,
  },
});

type MobileAccountRowProps = {
  row: AccountRow;
};

/** One account and its balance at the statement date; opens the account. */
export function MobileAccountRow({ row }: MobileAccountRowProps) {
  const { t } = useTranslation();
  const { account } = row;

  return (
    <View role="listitem">
      <Link
        to={`/accounts/${account.id}`}
        aria-label={t('Open {{name}}', { name: account.name })}
        className={rowClassName}
        style={{ paddingLeft: CARD_GUTTER + (row.depth - 1) * DEPTH_INDENT }}
      >
        <Text style={{ ...styles.ellipsisText, flex: 1, minWidth: 0 }}>
          {account.name}
        </Text>
        <Amount value={row.balance} tone="balance" style={{ fontSize: 13 }} />
      </Link>
    </View>
  );
}
