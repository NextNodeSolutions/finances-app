import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
  SvgCog,
  SvgLibrary,
  SvgPiggyBank,
  SvgReports,
} from '@actual-app/components/icons/v1';
import { SvgHelp, SvgNotesPaperText } from '@actual-app/components/icons/v2';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { elevation, motion, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';
import { Command } from 'cmdk';

import { getSidebarMenuItemPath } from '#components/sidebar/sidebarMenu';
import { useSidebarMenuItemDetails } from '#components/sidebar/useSidebarMenuItemDetails';
import { useAccounts } from '#hooks/useAccounts';
import { useDashboardPages } from '#hooks/useDashboardPages';
import { useMetadataPref } from '#hooks/useMetadataPref';
import { useModalState } from '#hooks/useModalState';
import { useNavigate } from '#hooks/useNavigate';
import { useReports } from '#hooks/useReports';
import { useSidebarMenu } from '#hooks/useSidebarMenu';
import type { Binding, SheetFields, SheetNames } from '#spreadsheet';
import {
  accountBalance,
  allAccountBalance,
  offBudgetAccountBalance,
  onBudgetAccountBalance,
} from '#spreadsheet/bindings';

import { CellValue, CellValueText } from './spreadsheet/CellValue';
import { useTour } from './tour/TourProvider';

type SearchableItem = {
  id: string;
  /** The name to display and use for searching */
  name: string;
  /**
   * The item content to display. If not provided, {@link SearchableItem.name `name`} will be used.
   *
   * Meant for complex items that want to display more than just static text.
   */
  content?: ReactNode;
  Icon:
    | ComponentType<SVGProps<SVGElement>>
    | ComponentType<SVGProps<SVGSVGElement>>;
};

type SearchSection = {
  key: string;
  heading: string;
  items: Readonly<SearchableItem[]>;
  onSelect: (item: Pick<SearchableItem, 'id'>) => void;
};

function BalanceRow<
  SheetName extends SheetNames,
  FieldName extends SheetFields<SheetName>,
>({
  label,
  binding,
}: {
  label: string;
  binding: Binding<SheetName, FieldName>;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
      }}
    >
      <Text>{label}</Text>
      <CellValue binding={binding} type="financial">
        {props => (
          <CellValueText
            {...props}
            style={{
              ...styles.tnum,
              fontSize: 12.5,
              whiteSpace: 'nowrap',
              color: theme.pageTextLight,
            }}
          />
        )}
      </CellValue>
    </View>
  );
}

export function CommandBar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [budgetName] = useMetadataPref('budgetName');
  const { modalStack } = useModalState();
  const { startTour } = useTour();

  const { availableItems: menuItems } = useSidebarMenu();
  const menuItemDetails = useSidebarMenuItemDetails();

  const navigationItems = useMemo(
    () => [
      ...menuItems.map(item => ({
        id: item.id === 'reports' ? 'reports-nav' : item.id,
        name: menuItemDetails[item.id].title,
        path: getSidebarMenuItemPath(item.id, !item.hidden),
        Icon: menuItemDetails[item.id].Icon,
      })),
      { id: 'settings', name: t('Settings'), path: '/settings', Icon: SvgCog },
      {
        id: 'accounts',
        name: t('All Accounts'),
        path: '/accounts',
        content: (
          <BalanceRow<'account', 'accounts-balance'>
            label={t('All Accounts')}
            binding={allAccountBalance()}
          />
        ),
        Icon: SvgLibrary,
      },
    ],
    [t, menuItems, menuItemDetails],
  );

  useEffect(() => {
    // Reset search when closing
    if (!open) setSearch('');
  }, [open]);

  const { data: allAccounts = [] } = useAccounts();
  const { data: customReports = [] } = useReports();
  const { data: dashboardPages = [] } = useDashboardPages();

  const accounts = allAccounts.filter(acc => !acc.closed);

  const openEventListener = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // Do not open CommandBar if a modal is already open
        if (modalStack.length > 0) return;
        setOpen(true);
      }
    },
    [modalStack.length],
  );

  useEffect(() => {
    document.addEventListener('keydown', openEventListener);
    return () => document.removeEventListener('keydown', openEventListener);
  }, [openEventListener]);

  const handleNavigate = useCallback(
    (path: string) => {
      setOpen(false);
      void navigate(path);
    },
    [navigate],
  );

  const sections: SearchSection[] = [
    {
      key: 'navigation',
      heading: t('Navigation'),
      items: navigationItems,
      onSelect: ({ id }) => {
        const item = navigationItems.find(item => item.id === id);
        if (item) handleNavigate(item.path);
      },
    },
    {
      key: 'accounts',
      heading: t('Accounts'),
      items: [
        {
          id: 'onbudget',
          name: t('On Budget'),
          content: (
            <BalanceRow<'account', 'onbudget-accounts-balance'>
              label={t('On Budget')}
              binding={onBudgetAccountBalance()}
            />
          ),
          Icon: SvgLibrary,
        },
        {
          id: 'offbudget',
          name: t('Off Budget'),
          content: (
            <BalanceRow<'account', 'offbudget-accounts-balance'>
              label={t('Off Budget')}
              binding={offBudgetAccountBalance()}
            />
          ),
          Icon: SvgLibrary,
        },
        ...accounts.map(account => ({
          ...account,
          content: (
            <BalanceRow<'account', 'balance'>
              label={account.name}
              binding={accountBalance(account.id)}
            />
          ),
          Icon: SvgPiggyBank,
        })),
      ],
      onSelect: ({ id }) => handleNavigate(`/accounts/${id}`),
    },
    {
      key: 'reports',
      heading: t('Reports'),
      items: dashboardPages.map(dashboardPage => ({
        ...dashboardPage,
        Icon: SvgReports,
      })),
      onSelect: ({ id }) => handleNavigate(`/reports/${id}`),
    },
    {
      key: 'reports-custom',
      heading: t('Custom Reports'),
      items: customReports.map(report => ({
        ...report,
        Icon: SvgNotesPaperText,
      })),
      onSelect: ({ id }) => handleNavigate(`/reports/custom/${id}`),
    },
    {
      key: 'help',
      heading: t('Help'),
      items: [
        {
          id: 'start-tour',
          name: t('Take a tour of {{appName}}', { appName: 'Actual' }),
          Icon: SvgHelp,
        },
      ],
      onSelect: () => {
        setOpen(false);
        startTour();
      },
    },
  ];

  const searchLower = search.toLowerCase();
  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.name.toLowerCase().includes(searchLower),
    ),
  }));
  const hasResults = filteredSections.some(section => !!section.items.length);

  return (
    <Command.Dialog
      vimBindings
      open={open}
      onOpenChange={setOpen}
      label={t('Command Bar')}
      aria-label={t('Command Bar')}
      shouldFilter={false}
      overlayClassName={css({
        position: 'fixed',
        inset: 0,
        backgroundColor: theme.overlayBackground,
        zIndex: 3000,
      })}
      className={css({
        position: 'fixed',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -30%)',
        width: '90%',
        maxWidth: '600px',
        backgroundColor: theme.menuBackground,
        border: `1px solid ${theme.menuBorder}`,
        color: theme.pageText,
        borderRadius: radius.xl,
        boxShadow: elevation.modal,
        overflow: 'hidden',
        zIndex: 3001,
      })}
    >
      <Command.Input
        autoFocus
        placeholder={t('Search {{budgetName}}...', { budgetName })}
        value={search}
        onValueChange={setSearch}
        className={css({
          width: '100%',
          padding: '16px 20px',
          fontSize: 15,
          border: 'none',
          borderBottom: `1px solid ${theme.hairline}`,
          backgroundColor: 'transparent',
          color: theme.pageText,
          outline: 'none',
          '&::placeholder': {
            color: theme.formInputTextPlaceholder,
          },
        })}
      />
      <Command.List
        className={css({
          maxHeight: '340px',
          overflowY: 'auto',
          padding: '6px 0 8px',
          // Hide the scrollbar
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          // Ensure content is still scrollable
          msOverflowStyle: 'none',
        })}
      >
        {filteredSections.map(
          section =>
            !!section.items.length && (
              <Command.Group
                key={section.key}
                heading={section.heading}
                className={css({
                  padding: '0 6px',
                  '& [cmdk-group-heading]': {
                    padding: '10px 10px 4px',
                    fontSize: 11.5,
                    fontWeight: 500,
                    color: theme.menuItemTextHeader,
                  },
                })}
              >
                {section.items.map(({ id, name, Icon, content }) => (
                  <Command.Item
                    key={id}
                    onSelect={() => section.onSelect({ id })}
                    value={name}
                    className={css({
                      padding: '7px 10px',
                      cursor: 'pointer',
                      fontSize: 13,
                      borderRadius: radius.sm,
                      margin: '0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: theme.menuItemText,
                      transition: `background-color ${motion.fast} ${motion.ease}`,
                      '& > svg': {
                        color: theme.pageTextLight,
                        flexShrink: 0,
                      },
                      // Avoid showing mouse hover styles when using keyboard navigation
                      '[data-cmdk-list]:not([data-cmdk-list-nav-active]) &:hover':
                        {
                          backgroundColor: theme.menuItemBackgroundHover,
                          color: theme.menuItemTextHover,
                        },

                      "&[data-selected='true']": {
                        backgroundColor: theme.menuItemBackgroundHover,
                        color: theme.menuItemTextHover,
                      },
                    })}
                  >
                    <Icon width={15} height={15} />
                    {content || name}
                  </Command.Item>
                ))}
              </Command.Group>
            ),
        )}

        {!hasResults && (
          <Command.Empty
            className={css({
              padding: '20px 16px',
              textAlign: 'center',
              fontSize: 13,
              color: theme.pageTextSubdued,
            })}
          >
            <Trans>No results found</Trans>
          </Command.Empty>
        )}
      </Command.List>
    </Command.Dialog>
  );
}
