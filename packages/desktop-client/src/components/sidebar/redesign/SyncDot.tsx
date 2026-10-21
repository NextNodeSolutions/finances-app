import { useTranslation } from 'react-i18next';

import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

export type SyncDotStatus = 'synced' | 'error' | 'pending' | 'unlinked';

const DOT_SIZE = 6;

export function useSyncDotLabel(status: SyncDotStatus): string {
  const { t } = useTranslation();

  const labels: Record<SyncDotStatus, string> = {
    synced: t('Synced'),
    error: t('Sync error'),
    pending: t('Syncing'),
    unlinked: t('Not linked'),
  };

  return labels[status];
}

// Jade when the link is healthy, signal orange when it needs the user,
// quiet neutrals otherwise: a filled dot while syncing, a ring when the
// account has no bank link.
const statusFills: Record<SyncDotStatus, CSSProperties> = {
  synced: { backgroundColor: theme.sidebarItemBackgroundPositive },
  error: { backgroundColor: theme.signal },
  pending: { backgroundColor: theme.sidebarTextMuted },
  unlinked: { border: `1px solid ${theme.sidebarTextMuted}` },
};

export function getSyncDotStyle(status: SyncDotStatus): CSSProperties {
  return {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radius.pill,
    flexShrink: 0,
    ...statusFills[status],
  };
}

type SyncDotProps = {
  status: SyncDotStatus;
};

export function SyncDot({ status }: SyncDotProps) {
  const label = useSyncDotLabel(status);

  return <View aria-hidden title={label} style={getSyncDotStyle(status)} />;
}
