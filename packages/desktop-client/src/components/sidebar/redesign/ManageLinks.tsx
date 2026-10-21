import { Fragment } from 'react';
import { Trans } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { motion, radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { Link } from '#components/common/Link';
import { getSidebarMenuItemPath } from '#components/sidebar/sidebarMenu';
import { useSidebarMenuItemDetails } from '#components/sidebar/useSidebarMenuItemDetails';
import { useSidebarMenu } from '#hooks/useSidebarMenu';

/**
 * The pages the user placed in Settings, one click away: quieter than the
 * primary navigation, in their saved order.
 */
export function ManageLinks() {
  const { settingsItems } = useSidebarMenu();
  const itemDetails = useSidebarMenuItemDetails();

  if (settingsItems.length === 0) {
    return null;
  }

  return (
    <View
      data-testid="sidebar-manage"
      style={{
        flexShrink: 0,
        gap: spacing.xxs,
        padding: `${spacing.sm}px ${spacing.lg + 2}px ${spacing.md}px`,
      }}
    >
      <Text style={{ ...styles.monoLabel, color: theme.sidebarTextMuted }}>
        <Trans>Manage</Trans>
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          columnGap: spacing.xs,
        }}
      >
        {settingsItems.map((item, index) => (
          <Fragment key={item.id}>
            {index > 0 && (
              <Text aria-hidden style={{ color: theme.sidebarTextMuted }}>
                ·
              </Text>
            )}
            <Link
              variant="internal"
              to={getSidebarMenuItemPath(item.id, false)}
              style={{
                fontSize: 12.5,
                lineHeight: '20px',
                borderRadius: radius.xs,
                textDecoration: 'none',
                color: theme.sidebarTextSubdued,
                transition: `color ${motion.fast} ${motion.ease}`,
                ':hover': { color: theme.sidebarItemTextSelected },
                ':focus-visible': {
                  outline: `2px solid ${theme.focusRing}`,
                  outlineOffset: 2,
                },
              }}
              activeStyle={{ color: theme.sidebarItemTextSelected }}
            >
              {itemDetails[item.id].title}
            </Link>
          </Fragment>
        ))}
      </View>
    </View>
  );
}
