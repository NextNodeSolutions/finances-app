import type { ComponentType, SVGProps } from 'react';
import { NavLink } from 'react-router';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { SvgCheveronRight } from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import {
  elevation,
  motion,
  radius,
  spacing,
} from '@actual-app/components/tokens';
import { css } from '@emotion/css';

const NAV_ITEM_HEIGHT = 32;

type SettingsNavLinkProps = {
  title: string;
  Icon:
    | ComponentType<SVGProps<SVGElement>>
    | ComponentType<SVGProps<SVGSVGElement>>;
  to: string;
};

export function SettingsNavLink({ title, Icon, to }: SettingsNavLinkProps) {
  const { isNarrowWidth } = useResponsive();

  if (isNarrowWidth) {
    return (
      <NavLink
        to={to}
        className={css({
          ...styles.mediumText,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.md,
          minHeight: styles.mobileMinHeight,
          paddingInline: spacing.lg,
          textDecoration: 'none',
          color: theme.settingsCardText,
          '& + &': { borderTop: `1px solid ${theme.hairlineSubtle}` },
          '&:focus-visible': {
            outline: `2px solid ${theme.focusRing}`,
            outlineOffset: -2,
          },
        })}
      >
        <Icon width={16} height={16} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1 }}>{title}</span>
        <SvgCheveronRight
          width={18}
          height={18}
          style={{ flexShrink: 0, color: theme.pageTextSubdued }}
        />
      </NavLink>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        css({
          ...styles.smallText,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.sm,
          height: NAV_ITEM_HEIGHT,
          paddingInline: 10,
          borderRadius: radius.md,
          border: '1px solid transparent',
          textDecoration: 'none',
          fontWeight: 500,
          color: isActive
            ? theme.settingsNavItemTextSelected
            : theme.settingsNavItemText,
          backgroundColor: isActive
            ? theme.settingsNavItemBackgroundSelected
            : 'transparent',
          transition: ['background-color', 'color', 'box-shadow']
            .map(property => `${property} ${motion.base} ${motion.ease}`)
            .join(', '),
          ...(isActive && {
            borderColor: theme.hairline,
            boxShadow: elevation.xs,
          }),
          ':hover': {
            color: theme.settingsNavItemTextSelected,
            backgroundColor: isActive
              ? theme.settingsNavItemBackgroundSelected
              : theme.settingsNavItemBackgroundHover,
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.focusRing}`,
            outlineOffset: 1,
          },
        })
      }
    >
      <Icon width={14} height={14} style={{ flexShrink: 0 }} />
      {title}
    </NavLink>
  );
}
