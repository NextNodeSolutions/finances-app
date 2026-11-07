import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { motion } from '@actual-app/components/tokens';
import { css } from '@emotion/css';

import { Amount } from './Amount';
import type { AccountRow } from './balanceSheetRows';

type HoldingsRowProps = {
  row: AccountRow;
};

const INDENT_STEP = 16;

const rowClassName = css({
  position: 'relative',
  transition: `background-color ${motion.fast} ${motion.ease}`,
  ':hover': { backgroundColor: theme.tableRowBackgroundHover },
});

// The link's box is stretched over the whole row, so the row is one target
// while the table keeps its cells for screen readers.
const linkClassName = css({
  ...styles.ellipsisText,
  display: 'block',
  color: theme.tableText,
  textDecoration: 'none',
  '::after': { content: '""', position: 'absolute', inset: 0 },
  ':focus-visible': { outline: 'none' },
  ':focus-visible::after': {
    outline: `2px solid ${theme.focusRing}`,
    outlineOffset: -2,
    borderRadius: 2,
  },
});

/**
 * One account of the balance sheet. Activating it opens the register; its
 * name reads "Open {{name}}" so it never starts with the account name the
 * sidebar's account links are found by.
 */
export function HoldingsRow({ row }: HoldingsRowProps) {
  const { t } = useTranslation();
  const { account, depth, balance, change } = row;

  return (
    <tr className={rowClassName}>
      <td style={{ paddingLeft: 20 + INDENT_STEP * (depth - 1) + 4 }}>
        <Link
          to={`/accounts/${account.id}`}
          aria-label={t('Open {{name}}', { name: account.name })}
          className={linkClassName}
        >
          {account.name}
        </Link>
      </td>
      <td>
        <Amount value={balance} tone="balance" />
      </td>
      <td>
        <Amount value={change === 0 ? null : change} tone="change" />
      </td>
    </tr>
  );
}
