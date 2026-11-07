import { Trans } from 'react-i18next';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { Link } from '#components/common/Link';
import * as bindings from '#spreadsheet/bindings';

import { SidebarBalance } from './SidebarBalance';
import {
  rowTransition,
  sectionLabelStyle,
  TREE_COLUMN_GAP,
  TREE_LEAD_COLUMN,
  TREE_ROW_PADDING_LEFT,
  TREE_ROW_PADDING_RIGHT,
  treeFocusRing,
} from './styles';

const ALL_ACCOUNTS_PATH = '/accounts';

/** Every account in one register: the first row of the accounts tree. */
export function AllAccountsRow() {
  return (
    <Link
      variant="internal"
      to={ALL_ACCOUNTS_PATH}
      isExactPathMatch
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: TREE_COLUMN_GAP,
        height: 30,
        paddingLeft: TREE_ROW_PADDING_LEFT,
        paddingRight: TREE_ROW_PADDING_RIGHT,
        borderRadius: radius.md,
        textDecoration: 'none',
        color: theme.sidebarHeaderText,
        transition: rowTransition,
        ':hover': {
          backgroundColor: theme.sidebarItemBackgroundHover,
          color: theme.sidebarItemTextSelected,
        },
        ':focus-visible': treeFocusRing,
      }}
      activeStyle={{
        backgroundColor: theme.sidebarItemBackgroundSelected,
        color: theme.sidebarItemTextSelected,
        ':hover': { backgroundColor: theme.sidebarItemBackgroundSelected },
      }}
    >
      <View style={{ width: TREE_LEAD_COLUMN, flexShrink: 0 }} />
      <Text style={{ ...sectionLabelStyle, flex: 1 }}>
        <Trans>All accounts</Trans>
      </Text>
      <SidebarBalance
        binding={bindings.allAccountBalance()}
        testId="sidebar-all-accounts-balance"
        style={{ fontWeight: 500, color: 'inherit' }}
      />
    </Link>
  );
}
