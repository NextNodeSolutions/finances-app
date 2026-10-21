import { useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import { useSyncServerStatus } from '#hooks/useSyncServerStatus';
import { useSyncStatus } from '#hooks/useSyncStatus';
import type { SyncState } from '#hooks/useSyncStatus';

import { getSyncDotStyle } from './SyncDot';
import type { SyncDotStatus } from './SyncDot';

type SyncPresentation = {
  dot: SyncDotStatus;
  label: string;
};

export function SyncStatusLine() {
  const { t } = useTranslation();
  const serverStatus = useSyncServerStatus();
  const { isSyncing, syncState } = useSyncStatus();

  const presentations: Record<
    'no-server' | 'syncing' | 'synced' | Exclude<SyncState, null>,
    SyncPresentation
  > = {
    'no-server': { dot: 'unlinked', label: t('Local only') },
    syncing: { dot: 'pending', label: t('Syncing…') },
    error: { dot: 'error', label: t('Sync error') },
    offline: { dot: 'unlinked', label: t('Offline') },
    local: { dot: 'unlinked', label: t('Local file') },
    disabled: { dot: 'unlinked', label: t('Sync disabled') },
    synced: { dot: 'synced', label: t('Synced') },
  };

  const statusKey =
    serverStatus === 'no-server'
      ? 'no-server'
      : isSyncing
        ? 'syncing'
        : (syncState ?? 'synced');
  const { dot, label } = presentations[statusKey];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 1,
      }}
    >
      <View aria-hidden style={getSyncDotStyle(dot)} />
      <Text
        style={{
          fontSize: 11.5,
          lineHeight: '14px',
          color: dot === 'error' ? theme.signalText : theme.sidebarTextSubdued,
          ...styles.ellipsisText,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
