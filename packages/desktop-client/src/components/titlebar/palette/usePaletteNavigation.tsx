import { useTranslation } from 'react-i18next';

import {
  SvgCog,
  SvgLibrary,
  SvgPiggyBank,
} from '@actual-app/components/icons/v1';

import { getSidebarMenuItemPath } from '#components/sidebar/sidebarMenu';
import { useSidebarMenuItemDetails } from '#components/sidebar/useSidebarMenuItemDetails';
import { useAccounts } from '#hooks/useAccounts';
import { useNavigate } from '#hooks/useNavigate';
import { useSidebarMenu } from '#hooks/useSidebarMenu';
import {
  accountBalance,
  allAccountBalance,
  offBudgetAccountBalance,
  onBudgetAccountBalance,
} from '#spreadsheet/bindings';

import { PaletteBalanceRow } from './PaletteBalanceRow';
import type { PaletteItem, PaletteSection } from './paletteTypes';

type NavigateItem = PaletteItem & { path: string };

/**
 * Navigate (every available page in the user's order, then Settings and All
 * accounts) and Accounts. Pages switched off (tags, bank sync) are not
 * available, so they never show.
 */
export function usePaletteNavigation(): {
  navigate: PaletteSection;
  accounts: PaletteSection;
} {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { availableItems } = useSidebarMenu();
  const menuItemDetails = useSidebarMenuItemDetails();
  const { data: allAccounts = [] } = useAccounts();

  const navigateItems: NavigateItem[] = [
    ...availableItems.map(item => ({
      // Keeps the page apart from a report dashboard called "Reports".
      id: item.id === 'reports' ? 'reports-nav' : item.id,
      name: menuItemDetails[item.id].title,
      path: getSidebarMenuItemPath(item.id, !item.hidden),
      Icon: menuItemDetails[item.id].Icon,
    })),
    { id: 'settings', name: t('Settings'), path: '/settings', Icon: SvgCog },
    {
      id: 'accounts',
      name: t('All accounts'),
      path: '/accounts',
      content: (
        <PaletteBalanceRow<'account', 'accounts-balance'>
          label={t('All accounts')}
          binding={allAccountBalance()}
        />
      ),
      Icon: SvgLibrary,
    },
  ];

  const openAccounts = allAccounts.filter(account => !account.closed);

  return {
    navigate: {
      key: 'navigate',
      heading: t('Navigate'),
      items: navigateItems,
      onSelect: id => {
        const item = navigateItems.find(navigateItem => navigateItem.id === id);
        if (item) {
          void navigate(item.path);
        }
      },
    },
    accounts: {
      key: 'accounts',
      heading: t('Accounts'),
      items: [
        {
          id: 'onbudget',
          name: t('On budget'),
          content: (
            <PaletteBalanceRow<'account', 'onbudget-accounts-balance'>
              label={t('On budget')}
              binding={onBudgetAccountBalance()}
            />
          ),
          Icon: SvgLibrary,
        },
        {
          id: 'offbudget',
          name: t('Off budget'),
          content: (
            <PaletteBalanceRow<'account', 'offbudget-accounts-balance'>
              label={t('Off budget')}
              binding={offBudgetAccountBalance()}
            />
          ),
          Icon: SvgLibrary,
        },
        ...openAccounts.map(account => ({
          id: account.id,
          name: account.name,
          content: (
            <PaletteBalanceRow<'account', 'balance'>
              label={account.name}
              binding={accountBalance(account.id)}
            />
          ),
          Icon: SvgPiggyBank,
        })),
      ],
      onSelect: id => void navigate(`/accounts/${id}`),
    },
  };
}
