import { useTranslation } from 'react-i18next';

import { Menu } from '@actual-app/components/menu';

import type { AccountMenuItem } from './AccountMenu';

type AllAccountsMenuProps = {
  isSorted: boolean;
  showNetWorthChart: boolean;
  onMenuSelect: (item: AccountMenuItem) => void;
};

/** The `⋯` menu of a multi-account register. */
export function AllAccountsMenu({
  isSorted,
  showNetWorthChart,
  onMenuSelect,
}: AllAccountsMenuProps) {
  const { t } = useTranslation();

  return (
    <Menu
      slot="close"
      onMenuSelect={onMenuSelect}
      items={[
        ...(isSorted
          ? [
              {
                name: 'remove-sorting',
                text: t('Remove all sorting'),
              } as const,
            ]
          : []),
        { name: 'export', text: t('Export') },
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
      ]}
    />
  );
}
