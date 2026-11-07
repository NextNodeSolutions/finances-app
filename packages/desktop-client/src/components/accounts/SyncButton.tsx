import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';

import { AnimatedRefresh } from '#components/AnimatedRefresh';

type SyncButtonProps = {
  isSyncing: boolean;
  isServerOffline: boolean;
  onSync: () => void;
};

/** Downloads from the bank (⌘B); shown only when bank sync can run. */
export function SyncButton({
  isSyncing,
  isServerOffline,
  onSync,
}: SyncButtonProps) {
  const { t } = useTranslation();

  return (
    <Button onPress={onSync} isDisabled={isServerOffline} style={{ gap: 7 }}>
      <AnimatedRefresh width={12} height={12} animating={isSyncing} />
      {isServerOffline ? t('Sync offline') : t('Sync')}
    </Button>
  );
}
