import { Trans, useTranslation } from 'react-i18next';

import { SvgAdd, SvgCheveronUpDown } from '@actual-app/components/icons/v1';
import { SvgSearchAlternate } from '@actual-app/components/icons/v2';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { motion, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

import { replaceModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { SidebarIconButton } from './SidebarIconButton';

const ROW_HEIGHT = 28;

// Collapse-all and search stay out of the instrument line until the row is
// hovered or holds focus, so they remain reachable from the keyboard. Add
// account is the section's primary action and always shows.
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
        paddingRight: 6,
        marginBottom: spacing.xxs,
        [`&:hover .${ACTIONS_CLASS}, &:focus-within .${ACTIONS_CLASS}`]: {
          opacity: 1,
        },
      })}
    >
      <Text style={{ ...styles.monoLabel, color: theme.sidebarTextMuted }}>
        <Trans>Accounts</Trans>
      </Text>
      <View style={{ flex: 1 }} />
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
      </View>
      <SidebarIconButton
        Icon={SvgAdd}
        label={t('Add account')}
        onPress={onAddAccount}
        testId="sidebar-add-account"
      />
    </View>
  );
}
