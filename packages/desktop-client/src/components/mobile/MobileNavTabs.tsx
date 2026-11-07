import { useState } from 'react';
import type { ComponentType, CSSProperties, SVGProps } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router';

import { Button } from '@actual-app/components/button';
import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import {
  SvgAdd,
  SvgChartPie,
  SvgDotsHorizontalTriple,
  SvgPiggyBank,
  SvgWallet,
} from '@actual-app/components/icons/v1';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { motion, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { isMorePath, MobileMoreSheet } from './MobileMoreSheet';

/** Height of the bottom bar, without the bottom safe-area inset. */
export const MOBILE_NAV_HEIGHT = 56;
/** Space a page leaves under its content so the bar never covers it. */
export const MOBILE_NAV_INSET = `calc(${MOBILE_NAV_HEIGHT}px + env(safe-area-inset-bottom))`;

const ADD_BUTTON_SIZE = 44;
const TAB_ICON_SIZE = 20;

type TabIcon =
  | ComponentType<SVGProps<SVGElement>>
  | ComponentType<SVGProps<SVGSVGElement>>;

/**
 * The one bottom bar of the narrow layout: Overview, Budget, a new
 * transaction, Accounts, and More for every secondary page.
 */
export function MobileNavTabs() {
  const { t } = useTranslation();
  const { isNarrowWidth } = useResponsive();
  const { pathname } = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <View
      role="navigation"
      aria-label={t('Main')}
      data-navbar-state={isMoreOpen ? 'open' : 'default'}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        flexDirection: 'row',
        alignItems: 'stretch',
        height: MOBILE_NAV_INSET,
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        backgroundColor: theme.mobileNavBackground,
        borderTop: `1px solid ${theme.hairline}`,
        ...(!isNarrowWidth && { display: 'none' }),
      }}
    >
      <NavTab name={t('Overview')} path="/overview" Icon={SvgChartPie} />
      <NavTab name={t('Budget')} path="/budget" Icon={SvgWallet} />
      <AddTransactionTab name={t('Transaction')} />
      <NavTab name={t('Accounts')} path="/accounts" Icon={SvgPiggyBank} />
      <Button
        variant="bare"
        aria-haspopup="dialog"
        aria-expanded={isMoreOpen}
        onPress={() => setIsMoreOpen(true)}
        style={{
          ...getTabStyle(isMorePath(pathname)),
          borderRadius: 0,
          padding: 0,
        }}
      >
        <SvgDotsHorizontalTriple
          width={TAB_ICON_SIZE}
          height={TAB_ICON_SIZE}
          style={{ flexShrink: 0 }}
        />
        <Trans>More</Trans>
      </Button>
      {isMoreOpen && (
        <MobileMoreSheet
          onNavigate={() => setIsMoreOpen(false)}
          onClose={() => setIsMoreOpen(false)}
        />
      )}
    </View>
  );
}

function getTabStyle(isActive: boolean): CSSProperties {
  return {
    ...styles.noTapHighlight,
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: isActive ? 600 : 500,
    letterSpacing: '0.01em',
    color: isActive ? theme.mobileNavItemSelected : theme.mobileNavItem,
    backgroundColor: 'transparent',
    textDecoration: 'none',
    userSelect: 'none',
    transition: `color ${motion.base} ${motion.ease}`,
  };
}

type NavTabProps = {
  name: string;
  path: string;
  Icon: TabIcon;
};

function NavTab({ name, path, Icon }: NavTabProps) {
  return (
    <NavLink to={path} style={({ isActive }) => getTabStyle(isActive)}>
      <Icon
        width={TAB_ICON_SIZE}
        height={TAB_ICON_SIZE}
        style={{ flexShrink: 0 }}
      />
      {name}
    </NavLink>
  );
}

// The middle slot: an ink disc, the one primary action of the bar.
function AddTransactionTab({ name }: { name: string }) {
  return (
    <NavLink
      to="/transactions/new"
      aria-label={name}
      style={{
        ...getTabStyle(false),
        // The disc is the whole control; the label lives in aria-label.
        gap: 0,
      }}
    >
      <View
        style={{
          width: ADD_BUTTON_SIZE,
          height: ADD_BUTTON_SIZE,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.buttonPrimaryBackground,
          color: theme.buttonPrimaryText,
        }}
      >
        <SvgAdd width={16} height={16} />
      </View>
    </NavLink>
  );
}
