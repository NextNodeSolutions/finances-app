import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { SvgLogo } from '@actual-app/components/icons/logo';
import { theme } from '@actual-app/components/theme';
import { motion, radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { Link } from '#components/common/Link';
import { useSidebar } from '#components/sidebar/SidebarProvider';
import { hasMacOSWindowButtons } from '#components/sidebar/SidebarShell';
import { TITLEBAR_HEIGHT } from '#components/Titlebar';

import { SidebarBudgetName } from './SidebarBudgetName';
import { SyncStatusLine } from './SyncStatusLine';

const MAC_WINDOW_BUTTONS_INSET = spacing.xl + spacing.md;
const LOGO_TILE_SIZE = 26;
const LOGO_GLYPH_SIZE = 14;

type SidebarHeaderProps = {
  children?: ReactNode;
};

export function SidebarHeader({ children }: SidebarHeaderProps) {
  const { t } = useTranslation();
  const sidebar = useSidebar();
  const [isEditingName, setIsEditingName] = useState(false);
  const hasWindowButtons = hasMacOSWindowButtons();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        // Same height as the titlebar so both bottom hairlines line up.
        height: hasWindowButtons ? undefined : TITLEBAR_HEIGHT,
        padding: `0 ${spacing.sm}px 0 ${spacing.md}px`,
        paddingTop: hasWindowButtons ? MAC_WINDOW_BUTTONS_INSET : 0,
        paddingBottom: hasWindowButtons ? spacing.sm : 0,
        borderBottom: `1px solid ${theme.sidebarBorder}`,
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <Link
        variant="internal"
        to="/overview"
        style={{
          display: 'flex',
          flexShrink: 0,
          borderRadius: radius.md,
          transition: `opacity ${motion.base} ${motion.ease}`,
          ':hover': { opacity: 0.82 },
          ':focus-visible': {
            outline: `2px solid ${theme.focusRing}`,
            outlineOffset: 2,
          },
        }}
      >
        <View
          aria-label={t('{{appName}} home', { appName: 'Actual' })}
          role="img"
          style={{
            width: LOGO_TILE_SIZE,
            height: LOGO_TILE_SIZE,
            borderRadius: radius.md - 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.sidebarBrand,
            color: theme.sidebarBackground,
          }}
        >
          <SvgLogo width={LOGO_GLYPH_SIZE} height={LOGO_GLYPH_SIZE} />
        </View>
      </Link>
      <View style={{ position: 'relative', minWidth: 0, flex: 1 }}>
        <SidebarBudgetName
          isEditing={isEditingName}
          onEditingChange={setIsEditingName}
          // A floating sidebar slides in so the switcher has its anchor.
          onFileSwitcherRequest={() => sidebar.setHidden(false)}
        />
        <View style={{ visibility: isEditingName ? 'hidden' : undefined }}>
          <SyncStatusLine />
        </View>
      </View>
      {!isEditingName && children}
    </View>
  );
}
