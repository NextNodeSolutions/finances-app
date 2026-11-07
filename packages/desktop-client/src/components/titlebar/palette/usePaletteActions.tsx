import { useTranslation } from 'react-i18next';
import { useMatch } from 'react-router';

import {
  SvgAdd,
  SvgAddOutline,
  SvgExplore,
  SvgFolder,
  SvgKeyboard,
} from '@actual-app/components/icons/v1';
import {
  SvgDownloadThickBottom,
  SvgViewHide,
} from '@actual-app/components/icons/v2';
import * as Platform from '@actual-app/core/shared/platform';

import { closeBudget } from '#budgetfiles/budgetfilesSlice';
import { useImportTransactionsFlow } from '#components/accounts/useImportTransactionsFlow';
import { openFileSwitcher } from '#components/sidebar/redesign/FileSwitcher';
import { useTour } from '#components/tour/TourProvider';
import { useTransactionPanels } from '#components/transactions/panels/useTransactionPanels';
import { useAccounts } from '#hooks/useAccounts';
import { useNavigate } from '#hooks/useNavigate';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { pushModal, replaceModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { PaletteKeyRow } from './PaletteKeyRow';
import type { PaletteItem, PaletteSection } from './paletteTypes';
import { useDefaultTransactionAccountId } from './useDefaultTransactionAccountId';

type ActionItem = PaletteItem & { run: () => void };

/** The palette's Actions section, each with the shortcut that does the same. */
export function usePaletteActions(): PaletteSection {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { startTour } = useTour();
  const transactionPanels = useTransactionPanels();
  const defaultAccountId = useDefaultTransactionAccountId();
  const importTransactions = useImportTransactionsFlow();
  const [isPrivacyEnabled, setPrivacyEnabled] =
    useSyncedPref('isPrivacyEnabled');
  const { data: accounts = [] } = useAccounts();
  const routeAccountId = useMatch('/accounts/:id')?.params.id;

  const isMac = Platform.OS === 'mac';
  // The open account page's account, else the default one.
  const importAccountId =
    accounts.find(account => account.id === routeAccountId && !account.closed)
      ?.id ?? defaultAccountId;

  const action = (
    id: string,
    name: string,
    Icon: PaletteItem['Icon'],
    run: () => void,
    keys?: string,
  ): ActionItem => ({
    id,
    name,
    Icon,
    run,
    content: <PaletteKeyRow label={name} keys={keys} />,
  });

  const items: ActionItem[] = [
    action(
      'new-transaction',
      t('New transaction'),
      SvgAdd,
      () => transactionPanels.openNew({ accountId: defaultAccountId }),
      'T',
    ),
    action('add-account', t('Add account'), SvgAddOutline, () =>
      dispatch(replaceModal({ modal: { name: 'add-account', options: {} } })),
    ),
    ...(importAccountId
      ? [
          action(
            'import-transactions',
            t('Import transactions…'),
            SvgDownloadThickBottom,
            () => {
              if (importAccountId !== routeAccountId) {
                void navigate(`/accounts/${importAccountId}`);
              }
              void importTransactions(importAccountId, () => {
                // Nothing to refresh: the register's live query shows the
                // imported transactions.
              });
            },
          ),
        ]
      : []),
    action(
      'switch-file',
      t('Switch file'),
      SvgFolder,
      () => {
        if (!openFileSwitcher()) {
          void dispatch(closeBudget());
        }
      },
      isMac ? '⌘O' : 'Ctrl O',
    ),
    action(
      'toggle-privacy',
      t('Toggle privacy'),
      SvgViewHide,
      () => setPrivacyEnabled(String(String(isPrivacyEnabled) !== 'true')),
      isMac ? '⇧⌘P' : 'Ctrl Shift P',
    ),
    action(
      'keyboard-shortcuts',
      t('Keyboard shortcuts'),
      SvgKeyboard,
      () => dispatch(pushModal({ modal: { name: 'keyboard-shortcuts' } })),
      '?',
    ),
    action('start-tour', t('Start tour'), SvgExplore, startTour),
  ];

  return {
    key: 'actions',
    heading: t('Actions'),
    items,
    onSelect: id => items.find(item => item.id === id)?.run(),
  };
}
