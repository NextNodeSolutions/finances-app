import { Trans, useTranslation } from 'react-i18next';
import { useMatch } from 'react-router';

import { SvgAdd, SvgCheveronUpDown } from '@actual-app/components/icons/v1';
import { SvgSearchAlternate } from '@actual-app/components/icons/v2';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { motion, radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { Link } from '#components/common/Link';
import { replaceModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';
import * as bindings from '#spreadsheet/bindings';

import { SidebarBalance } from './SidebarBalance';
import { SidebarIconButton } from './SidebarIconButton';

const ROW_HEIGHT = 28;

// The row's actions stay out of the instrument line until the row is
// hovered or holds focus, so they remain reachable from the keyboard.
// A plain class: emotion merges its own classes, so they cannot be
// targeted from the row.
const ACTIONS_CLASS = 'sidebar-accounts-actions';

type AccountsHeaderRowProps = {
  allOpen: boolean;
  onToggleAll: () => void;
  isToggleAllDisabled: boolean;
  isSearchOpen: boolean;
  onToggleSearch: () => void;
};

export function AccountsHeaderRow({
  allOpen,
  onToggleAll,
  isToggleAllDisabled,
  isSearchOpen,
  onToggleSearch,
}: AccountsHeaderRowProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isActive = useMatch({ path: '/accounts', end: true }) !== null;

  const onAddAccount = () => {
    dispatch(replaceModal({ modal: { name: 'add-account', options: {} } }));
  };

  return (
    <View
      className={css({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xxs,
        height: ROW_HEIGHT,
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: spacing.xxs,
        borderRadius: radius.md,
        backgroundColor: isActive
          ? theme.sidebarItemBackgroundSelected
          : 'transparent',
        transition: `background-color ${motion.base} ${motion.ease}`,
        [`&:hover .${ACTIONS_CLASS}, &:focus-within .${ACTIONS_CLASS}`]: {
          opacity: 1,
        },
      })}
    >
      <Link
        variant="internal"
        to="/accounts"
        isExactPathMatch
        style={{
          ...styles.monoLabel,
          marginRight: spacing.xs,
          borderRadius: radius.xs,
          textDecoration: 'none',
          color: theme.sidebarTextMuted,
          transition: `color ${motion.base} ${motion.ease}`,
          ':hover': { color: theme.sidebarItemTextSelected },
          ':focus-visible': {
            outline: `2px solid ${theme.focusRing}`,
            outlineOffset: 2,
          },
        }}
        activeStyle={{ color: theme.sidebarItemTextSelected }}
      >
        <Trans>Accounts</Trans>
      </Link>
      <View
        className={ACTIONS_CLASS}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xxs,
          // The open search keeps its pressed toggle in view; touch
          // screens have no hover, so there the actions always show.
          opacity: isSearchOpen ? 1 : 0,
          transition: `opacity ${motion.base} ${motion.ease}`,
          '@media (hover: none)': { opacity: 1 },
        }}
      >
        <SidebarIconButton
          Icon={SvgCheveronUpDown}
          label={allOpen ? t('Collapse all groups') : t('Expand all groups')}
          isDisabled={isToggleAllDisabled}
          onPress={onToggleAll}
        />
        <SidebarIconButton
          Icon={SvgSearchAlternate}
          label={t('Find account')}
          isToggledOn={isSearchOpen}
          onPress={onToggleSearch}
        />
        <SidebarIconButton
          Icon={SvgAdd}
          label={t('Add account')}
          onPress={onAddAccount}
        />
      </View>
      <View style={{ flex: 1 }} />
      <Link
        variant="internal"
        to="/accounts"
        isExactPathMatch
        style={{
          textDecoration: 'none',
          color: theme.sidebarTextSubdued,
          borderRadius: radius.xs,
          transition: `color ${motion.base} ${motion.ease}`,
          ':hover': { color: theme.sidebarItemTextSelected },
          ':focus-visible': {
            outline: `2px solid ${theme.focusRing}`,
            outlineOffset: 2,
          },
        }}
        activeStyle={{ color: theme.sidebarItemTextSelected }}
      >
        <SidebarBalance
          binding={bindings.allAccountBalance()}
          testId="sidebar-all-accounts-balance"
          style={{ fontWeight: 500, color: 'inherit' }}
        />
      </Link>
    </View>
  );
}
