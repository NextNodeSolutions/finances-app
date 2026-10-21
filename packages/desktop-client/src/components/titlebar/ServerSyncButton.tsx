import { useHotkeys } from 'react-hotkeys-hook';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgAlertTriangle } from '@actual-app/components/icons/v2';
import type { CSSProperties } from '@actual-app/components/styles';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { Tooltip } from '@actual-app/components/tooltip';
import { css } from '@emotion/css';

import { sync } from '#app/appSlice';
import { AnimatedRefresh } from '#components/AnimatedRefresh';
import { useSyncStatus } from '#hooks/useSyncStatus';
import { useDispatch } from '#redux';

type ServerSyncButtonProps = {
  style?: CSSProperties;
  isMobile?: boolean;
};
export function ServerSyncButton({
  style,
  isMobile = false,
}: ServerSyncButtonProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // Give the layout some time to apply the starting animation so we
  // always finish it correctly even if the sync is almost instant
  const { isSyncing: syncing, syncState } = useSyncStatus({
    syncingEndDelayMs: 200,
  });

  const mobileColor =
    syncState === 'error'
      ? theme.errorText
      : syncState === 'disabled' ||
          syncState === 'offline' ||
          syncState === 'local'
        ? theme.mobileHeaderTextSubdued
        : theme.mobileHeaderText;
  const desktopColor =
    syncState === 'error'
      ? theme.signalText
      : syncState === 'disabled' ||
          syncState === 'offline' ||
          syncState === 'local'
        ? theme.buttonBareDisabledText
        : theme.pageTextLight;

  const activeStyle = isMobile
    ? {
        color: mobileColor,
      }
    : {};

  const hoveredStyle = isMobile
    ? {
        color: mobileColor,
        background: theme.mobileHeaderTextHover,
      }
    : {};

  const mobileIconStyle = {
    color: mobileColor,
    justifyContent: 'center',
    margin: 10,
    paddingLeft: 5,
    paddingRight: 3,
  };

  const mobileTextStyle = {
    ...styles.text,
    fontWeight: 500,
    marginLeft: 2,
    marginRight: 5,
  };

  const onSync = () => dispatch(sync());

  useHotkeys(
    'ctrl+s, cmd+s, meta+s',
    onSync,
    {
      enableOnFormTags: true,
      preventDefault: true,
      scopes: ['app'],
    },
    [onSync],
  );

  const tooltipContent =
    syncState === 'error' ? (
      <Trans>Sync error — click to retry</Trans>
    ) : syncState === 'offline' ? (
      <Trans>Offline — will sync when reconnected</Trans>
    ) : syncState === 'local' ? (
      <Trans>Local file, not connected to a server</Trans>
    ) : syncState === 'disabled' ? (
      <Trans>Syncing disabled for this file</Trans>
    ) : (
      <Trans>
        Sync with your server to back up this file and access it on other
        devices
      </Trans>
    );

  return (
    <Tooltip placement="bottom end" content={tooltipContent}>
      <Button
        variant="bare"
        aria-label={t('Server Sync')}
        className={css({
          ...(isMobile
            ? {
                ...style,
                WebkitAppRegion: 'none',
                ...mobileIconStyle,
              }
            : {
                ...style,
                WebkitAppRegion: 'none',
                color: desktopColor,
              }),
          '&[data-hovered]': hoveredStyle,
          '&[data-pressed]': activeStyle,
        })}
        onPress={onSync}
        isDisabled={syncState === 'offline'}
        aria-disabled={syncState === 'offline'}
      >
        {isMobile ? (
          syncState === 'error' ? (
            <SvgAlertTriangle width={14} height={14} />
          ) : (
            <AnimatedRefresh width={18} height={18} animating={syncing} />
          )
        ) : syncState === 'error' ? (
          <SvgAlertTriangle width={14} height={14} />
        ) : (
          <AnimatedRefresh animating={syncing} />
        )}
        <Text style={isMobile ? { ...mobileTextStyle } : null}>
          {syncState === 'disabled' ? ` ${t('Disabled')}` : null}
        </Text>
      </Button>
    </Tooltip>
  );
}
