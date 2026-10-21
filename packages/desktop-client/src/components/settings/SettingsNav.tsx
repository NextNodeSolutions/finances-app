import { useTranslation } from 'react-i18next';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { SvgCog, SvgPylon } from '@actual-app/components/icons/v1';
import { SvgSettingsSliderAlternate } from '@actual-app/components/icons/v2';
import { theme } from '@actual-app/components/theme';
import { elevation, radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import {
  getDefaultSidebarMenuItems,
  getSidebarMenuItemPath,
  isInMobileSettingsNav,
  isSettingsSection,
} from '#components/sidebar/sidebarMenu';
import { useSidebarMenuItemDetails } from '#components/sidebar/useSidebarMenuItemDetails';
import { useSidebarMenu } from '#hooks/useSidebarMenu';

import { SettingsNavLink } from './SettingsNavLink';

// The wide nav is a tray holding the selected page as a white pill; its
// corner follows the pill's radius plus the tray padding.
const TRAY_PADDING = 5;

export function SettingsNav() {
  const { t } = useTranslation();
  const { isNarrowWidth } = useResponsive();
  const { settingsItems, isItemAvailable } = useSidebarMenu();
  const itemDetails = useSidebarMenuItemDetails();

  const menuItems = isNarrowWidth
    ? getDefaultSidebarMenuItems().filter(
        item =>
          isSettingsSection(item.id) &&
          isInMobileSettingsNav(item.id) &&
          isItemAvailable(item.id),
      )
    : settingsItems;

  return (
    <View
      role="navigation"
      aria-label={t('Settings')}
      style={
        isNarrowWidth
          ? {
              flexShrink: 0,
              backgroundColor: theme.settingsCardBackground,
              border: `1px solid ${theme.settingsCardBorder}`,
              borderRadius: radius.lg,
              boxShadow: elevation.card,
              overflow: 'hidden',
            }
          : {
              width: 196,
              flexShrink: 0,
              alignSelf: 'flex-start',
              gap: spacing.xxs,
              padding: TRAY_PADDING,
              backgroundColor: theme.trayBackground,
              border: `1px solid ${theme.trayBorder}`,
              borderRadius: radius.md + TRAY_PADDING,
            }
      }
    >
      <SettingsNavLink
        title={t('General')}
        Icon={SvgCog}
        to="/settings/general"
      />
      {menuItems.map(item => (
        <SettingsNavLink
          key={item.id}
          title={itemDetails[item.id].title}
          Icon={itemDetails[item.id].Icon}
          to={getSidebarMenuItemPath(item.id, false)}
        />
      ))}
      <SettingsNavLink
        title={t('Advanced')}
        Icon={SvgSettingsSliderAlternate}
        to="/settings/advanced"
      />
      <SettingsNavLink
        title={t('Experimental')}
        Icon={SvgPylon}
        to="/settings/experimental"
      />
    </View>
  );
}
