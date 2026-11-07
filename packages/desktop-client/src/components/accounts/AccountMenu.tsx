import { useTranslation } from 'react-i18next';

import { Menu } from '@actual-app/components/menu';
import type { AccountEntity } from '@actual-app/core/types/models';

import { useFeatureFlag } from '#hooks/useFeatureFlag';
import { useOptionalFeature } from '#hooks/useOptionalFeature';
import { useSyncServerStatus } from '#hooks/useSyncServerStatus';

export type AccountMenuItem =
  | 'link'
  | 'unlink'
  | 'close'
  | 'reopen'
  | 'export'
  | 'remove-sorting'
  | 'toggle-reconciled'
  | 'toggle-net-worth-chart'
  | 'manage-columns'
  | 'account-group';

type AccountMenuProps = {
  account: AccountEntity;
  canSync: boolean;
  showNetWorthChart: boolean;
  showReconciled: boolean;
  isSorted: boolean;
  onMenuSelect: (item: AccountMenuItem) => void;
};

/** The `⋯` menu of a single account. */
export function AccountMenu({
  account,
  canSync,
  showNetWorthChart,
  showReconciled,
  isSorted,
  onMenuSelect,
}: AccountMenuProps) {
  const { t } = useTranslation();
  const syncServerStatus = useSyncServerStatus();
  const newSidebarUIEnabled = useFeatureFlag('newSidebarUI');
  const [isBankSyncOn] = useOptionalFeature('bankSync');
  const canLink = isBankSyncOn && syncServerStatus === 'online';

  return (
    <Menu
      slot="close"
      onMenuSelect={item => {
        onMenuSelect(item);
      }}
      items={[
        ...(isSorted
          ? [
              {
                name: 'remove-sorting',
                text: t('Remove all sorting'),
              } as const,
            ]
          : []),
        {
          name: 'toggle-net-worth-chart',
          text: showNetWorthChart
            ? t('Hide balance chart')
            : t('Show balance chart'),
        },
        {
          name: 'manage-columns',
          text: t('Manage table columns'),
        },
        ...(newSidebarUIEnabled
          ? [
              {
                name: 'account-group',
                text: t('Set account group'),
              } as const,
            ]
          : []),
        {
          name: 'toggle-reconciled',
          text: showReconciled
            ? t('Hide reconciled transactions')
            : t('Show reconciled transactions'),
        },
        { name: 'export', text: t('Export') },
        ...(!account.closed
          ? canSync
            ? [
                {
                  name: 'unlink',
                  text: t('Unlink account'),
                } as const,
              ]
            : canLink
              ? [
                  {
                    name: 'link',
                    text: t('Link account'),
                  } as const,
                ]
              : []
          : []),

        ...(account.closed
          ? [{ name: 'reopen', text: t('Reopen account') } as const]
          : [{ name: 'close', text: t('Close account') } as const]),
      ]}
    />
  );
}
