import { Trans, useTranslation } from 'react-i18next';
import { Route, Routes, useLocation } from 'react-router';

import { Button } from '@actual-app/components/button';
import { SvgArrowLeft } from '@actual-app/components/icons/v1';
import { SvgNavigationMenu } from '@actual-app/components/icons/v2';
import { theme } from '@actual-app/components/theme';
import { radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { AccountSyncCheck } from '#components/accounts/AccountSyncCheck';
import { useSidebar } from '#components/sidebar/SidebarProvider';
import { useGlobalPref } from '#hooks/useGlobalPref';
import { useNavigate } from '#hooks/useNavigate';
import { useOptionalFeature } from '#hooks/useOptionalFeature';

import {
  TITLEBAR_ICON_BUTTON_SIZE,
  titlebarIconButtonStyle,
} from './titlebarStyles';

/**
 * The titlebar's left cluster: the sidebar toggle while the sidebar floats,
 * the back crumb, and the page's own slot.
 */
export function TitlebarLeading() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const sidebar = useSidebar();
  const [floatingSidebar] = useGlobalPref('floatingSidebar');
  const [isBankSyncOn] = useOptionalFeature('bankSync');

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {(floatingSidebar || sidebar.alwaysFloats) && (
        <Button
          aria-label={t('Sidebar menu')}
          variant="bare"
          style={{ ...titlebarIconButtonStyle, marginRight: spacing.sm }}
          onHoverStart={e => {
            if (e.pointerType === 'mouse') {
              sidebar.setHidden(false);
            }
          }}
          onPress={e => {
            if (e.pointerType !== 'mouse') {
              sidebar.setHidden(!sidebar.hidden);
            }
          }}
        >
          <SvgNavigationMenu
            className="menu"
            style={{ width: 15, height: 15, left: 0 }}
          />
        </Button>
      )}

      {location.state?.goBack && (
        <Button
          variant="bare"
          style={{
            height: TITLEBAR_ICON_BUTTON_SIZE,
            padding: '0 10px 0 8px',
            gap: 6,
            borderRadius: radius.md,
            fontWeight: 500,
            color: theme.pageTextLight,
          }}
          onPress={() => navigate(-1)}
        >
          <SvgArrowLeft width={10} height={10} />
          <Trans>Back</Trans>
        </Button>
      )}

      {isBankSyncOn && (
        <Routes>
          <Route path="/accounts/:id" element={<AccountSyncCheck />} />
          <Route path="*" element={null} />
        </Routes>
      )}
    </View>
  );
}
