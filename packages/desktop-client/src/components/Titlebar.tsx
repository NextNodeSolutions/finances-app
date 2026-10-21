import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { isDevelopmentEnvironment } from '@actual-app/core/shared/environment';
import * as Platform from '@actual-app/core/shared/platform';

import { SharedArrayBufferWarning } from '#components/SharedArrayBufferWarning';
import { useGlobalPref } from '#hooks/useGlobalPref';
import { useIsTestEnv } from '#hooks/useIsTestEnv';

import { HelpMenu } from './HelpMenu';
import { LoggedInUser } from './LoggedInUser';
import { useServerURL } from './ServerContext';
import { ThemeSelector } from './ThemeSelector';
import { AttentionButton } from './titlebar/AttentionButton';
import { PaletteTrigger } from './titlebar/PaletteTrigger';
import { PrivacyButton } from './titlebar/PrivacyButton';
import { ServerSyncButton } from './titlebar/ServerSyncButton';
import { TitlebarLeading } from './titlebar/TitlebarLeading';
import { titlebarIconButtonStyle } from './titlebar/titlebarStyles';

// The frame's top bar. The sidebar header shares this height so both bottom
// hairlines meet in one line across the window.
export const TITLEBAR_HEIGHT = 44;

type TitlebarProps = {
  style?: CSSProperties;
};

export function Titlebar({ style }: TitlebarProps) {
  const { isNarrowWidth } = useResponsive();
  const serverURL = useServerURL();
  const [floatingSidebar] = useGlobalPref('floatingSidebar');
  const isTestEnv = useIsTestEnv();

  return isNarrowWidth ? null : (
    <View
      style={{
        display: 'grid',
        // The palette trigger sits at the true centre, whatever the width of
        // the clusters on either side.
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
        alignItems: 'center',
        columnGap: spacing.md,
        flexShrink: 0,
        height: TITLEBAR_HEIGHT,
        padding: '0 20px 0 28px',
        backgroundColor: theme.titlebarBackground,
        borderBottom: `1px solid ${theme.titlebarBorder}`,
        ...(!Platform.isBrowser && Platform.OS === 'mac' && floatingSidebar
          ? { paddingLeft: 80 }
          : {}),
        ...style,
      }}
    >
      <TitlebarLeading />
      <PaletteTrigger />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 2,
        }}
      >
        <AttentionButton />
        {isDevelopmentEnvironment() && !isTestEnv && (
          <ThemeSelector style={titlebarIconButtonStyle} />
        )}
        <PrivacyButton style={titlebarIconButtonStyle} />
        {serverURL ? (
          <ServerSyncButton style={titlebarIconButtonStyle} />
        ) : null}
        <SharedArrayBufferWarning />
        <View
          aria-hidden
          style={{
            width: 1,
            height: 16,
            marginInline: spacing.sm,
            backgroundColor: theme.titlebarBorder,
          }}
        />
        <LoggedInUser />
        <HelpMenu />
      </View>
    </View>
  );
}
