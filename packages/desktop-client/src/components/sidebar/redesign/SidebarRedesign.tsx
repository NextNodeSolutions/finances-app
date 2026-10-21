import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import { css, cx } from '@emotion/css';

import { useSidebar } from '#components/sidebar/SidebarProvider';
import { SidebarShell } from '#components/sidebar/SidebarShell';
import { ToggleButton } from '#components/sidebar/ToggleButton';
import { useGlobalPref } from '#hooks/useGlobalPref';

import { AccountsSection } from './AccountsSection';
import { ManageLinks } from './ManageLinks';
import { PrimaryNav } from './PrimaryNav';
import { SidebarFooter } from './SidebarFooter';
import { SidebarHeader } from './SidebarHeader';

const DEFAULT_SIDEBAR_WIDTH = 240;

export function SidebarRedesign() {
  const { t } = useTranslation();
  const sidebar = useSidebar();
  const [isFloating = false, setFloatingSidebarPref] =
    useGlobalPref('floatingSidebar');

  const onFloat = () => {
    setFloatingSidebarPref(!isFloating);
  };

  return (
    <SidebarShell
      defaultWidth={DEFAULT_SIDEBAR_WIDTH}
      // The light palette file draws this border too; declaring it here gives
      // dark and midnight the same hairline edge.
      className={cx(
        'sidebar-redesign',
        css({ borderRight: `1px solid ${theme.sidebarBorder}` }),
      )}
    >
      <View
        role="navigation"
        aria-label={t('Sidebar')}
        style={{ flex: 1, minHeight: 0 }}
      >
        <SidebarHeader>
          {!sidebar.alwaysFloats && (
            <ToggleButton isFloating={isFloating} onFloat={onFloat} />
          )}
        </SidebarHeader>

        <PrimaryNav />

        <AccountsSection />

        <ManageLinks />

        <SidebarFooter />
      </View>
    </SidebarShell>
  );
}
