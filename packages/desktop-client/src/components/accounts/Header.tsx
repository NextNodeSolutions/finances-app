import { useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgAdd } from '@actual-app/components/icons/v1';
import { SvgDownloadThickBottom } from '@actual-app/components/icons/v2';
import { styles } from '@actual-app/components/styles';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type {
  AccountEntity,
  RuleConditionEntity,
  TransactionEntity,
} from '@actual-app/core/types/models';

import { FiltersStack } from '#components/filters/FiltersStack';
import { PageHeader } from '#components/Page';
import { useLocalPref } from '#hooks/useLocalPref';
import { useOptionalFeature } from '#hooks/useOptionalFeature';
import { useSplitsExpanded } from '#hooks/useSplitsExpanded';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { useSyncServerStatus } from '#hooks/useSyncServerStatus';

import type { TableRef } from './Account';
import { AccountMenu } from './AccountMenu';
import type { AccountMenuItem } from './AccountMenu';
import { AccountMenuButton } from './AccountMenuButton';
import type { AccountNameFieldProps } from './AccountNameField';
import { AccountTitle } from './AccountTitle';
import { AllAccountsMenu } from './AllAccountsMenu';
import { BalanceHistoryGraph } from './BalanceHistoryGraph';
import { headerLabelIconStyle } from './headerStyles';
import { HeadlineBalance } from './HeadlineBalance';
import { ImportAccountPicker } from './ImportAccountPicker';
import { InstrumentStrip } from './InstrumentStrip';
import { ReconcileButton } from './ReconcileButton';
import { ReconcileStrip } from './ReconcileStrip';
import type { ReconcileHandlers } from './ReconcileStrip';
import { RegisterToolbar } from './RegisterToolbar';
import { SyncButton } from './SyncButton';
import { useAccountHeaderHotkeys } from './useAccountHeaderHotkeys';
import type { BalanceQuery } from './useClearedBalances';

type FiltersStackProps = ComponentProps<typeof FiltersStack>;

type AccountHeaderProps = {
  tableRef: TableRef;
  isNameEditable: boolean;
  workingHard: boolean;
  accountName: string;
  accountId?: string;
  account?: AccountEntity;
  accountsSyncing: string[];
  accounts: AccountEntity[];
  showReconciled: boolean;
  showEmptyMessage: boolean;
  balanceQuery: BalanceQuery;
  /** The upcoming (preview) transactions the register already loaded. */
  upcomingTransactions: readonly TransactionEntity[];
  reconcile: ReconcileHandlers;
  isFiltered: boolean;
  filteredAmount?: number | null;
  isSorted: boolean;
  search: string;
  filterConditions: RuleConditionEntity[];
  filterConditionsOp: 'and' | 'or';
  onSearch: (newSearch: string) => void;
  onAddTransaction: () => void;
  onSaveName: AccountNameFieldProps['onSaveName'];
  saveNameError: AccountNameFieldProps['saveNameError'];
  onSync: () => void;
  onImport: () => void;
  /** Reloads the register, e.g. after an import from a multi-account view. */
  onRefetch: () => void;
  onMenuSelect: (item: AccountMenuItem) => void;
  onApplyFilter: (filter: RuleConditionEntity) => void;
} & Pick<
  FiltersStackProps,
  | 'filterId'
  | 'savedFilters'
  | 'onUpdateFilter'
  | 'onDeleteFilter'
  | 'onConditionsOpChange'
  | 'onClearFilters'
  | 'onReloadSavedFilter'
>;

/**
 * The register's statement header: title and actions, the headline
 * balance, the instrument strip, the reconcile strip, then search and
 * filters.
 */
export function AccountHeader({
  tableRef,
  isNameEditable,
  workingHard,
  accountName,
  accountId,
  account,
  filterId,
  savedFilters,
  accountsSyncing,
  accounts,
  showReconciled,
  showEmptyMessage,
  balanceQuery,
  upcomingTransactions,
  reconcile,
  isFiltered,
  filteredAmount,
  isSorted,
  search,
  filterConditions,
  filterConditionsOp,
  onSearch,
  onAddTransaction,
  onSaveName,
  saveNameError,
  onSync,
  onImport,
  onRefetch,
  onMenuSelect,
  onApplyFilter,
  onUpdateFilter,
  onClearFilters,
  onReloadSavedFilter,
  onConditionsOpChange,
  onDeleteFilter,
}: AccountHeaderProps) {
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const splitsExpanded = useSplitsExpanded();
  const syncServerStatus = useSyncServerStatus();
  const [isBankSyncOn] = useOptionalFeature('bankSync');
  const [, setExpandSplitsPref] = useLocalPref('expand-splits');
  const [showNetWorthChartPref] = useSyncedPref(
    `show-account-${accountId}-net-worth-chart`,
  );
  const showNetWorthChart = showNetWorthChartPref === 'true';
  const isServerOffline = syncServerStatus === 'offline';
  const isOpenAccount = !!account && !account.closed;
  const canSync =
    isBankSyncOn &&
    syncServerStatus !== 'no-server' &&
    (account
      ? !!account.account_id
      : accounts.some(candidate => !!candidate.account_id));
  const isReconcileShown =
    isOpenAccount && (isReconcileOpen || reconcile.reconcileAmount != null);
  const importableAccounts = getImportableAccounts(accounts, accountId);

  useAccountHeaderHotkeys({
    searchInputRef,
    canSync: canSync && !isServerOffline,
    onAddTransaction,
    onImport,
    onSync,
  });

  function onToggleSplits() {
    if (!tableRef.current) {
      return;
    }
    splitsExpanded.dispatch({
      type: 'switch-mode',
      id: tableRef.current.getScrolledItem(),
    });
    setExpandSplitsPref(!(splitsExpanded.state.mode === 'expand'));
  }

  function onToggleReconcile() {
    if (reconcile.reconcileAmount != null) {
      reconcile.onExit();
      return;
    }
    setIsReconcileOpen(!isReconcileOpen);
  }

  const stripReconcile: ReconcileHandlers = {
    ...reconcile,
    onReconcile: amount => {
      setIsReconcileOpen(false);
      reconcile.onReconcile(amount);
    },
  };

  return (
    <View style={{ flexShrink: 0 }}>
      <View data-testid="account-header">
        <PageHeader
          title={
            <AccountTitle
              account={account}
              accountName={accountName}
              accountsSyncing={accountsSyncing}
              isNameEditable={isNameEditable}
              saveNameError={saveNameError}
              onSaveName={onSaveName}
            />
          }
          actions={
            <>
              {canSync && !account?.closed && (
                <SyncButton
                  isSyncing={
                    account
                      ? accountsSyncing.includes(account.id)
                      : accountsSyncing.length > 0
                  }
                  isServerOffline={isServerOffline}
                  onSync={onSync}
                />
              )}
              {isOpenAccount && (
                <ReconcileButton
                  account={account}
                  isPressed={isReconcileShown}
                  onPress={onToggleReconcile}
                />
              )}
              {isOpenAccount && (
                <Button onPress={onImport} style={{ gap: 7 }}>
                  <SvgDownloadThickBottom style={headerLabelIconStyle} />
                  <Trans>Import</Trans>
                </Button>
              )}
              {!account && importableAccounts.length > 0 && (
                <ImportAccountPicker
                  accounts={importableAccounts}
                  onImported={onRefetch}
                />
              )}
              {!showEmptyMessage && !account?.closed && (
                <Button
                  variant="primary"
                  onPress={onAddTransaction}
                  style={{ gap: 7 }}
                >
                  <SvgAdd style={{ width: 10, height: 10, flexShrink: 0 }} />
                  <Trans>Add transaction</Trans>
                </Button>
              )}
              <AccountMenuButton>
                {account ? (
                  <AccountMenu
                    account={account}
                    canSync={canSync}
                    showNetWorthChart={showNetWorthChart}
                    isSorted={isSorted}
                    showReconciled={showReconciled}
                    onMenuSelect={onMenuSelect}
                  />
                ) : (
                  <AllAccountsMenu
                    isSorted={isSorted}
                    showNetWorthChart={showNetWorthChart}
                    onMenuSelect={onMenuSelect}
                  />
                )}
              </AccountMenuButton>
            </>
          }
          headline={<HeadlineBalance balanceQuery={balanceQuery} />}
          meta={
            <InstrumentStrip
              balanceQuery={balanceQuery}
              account={account}
              upcomingTransactions={upcomingTransactions}
              isFiltered={isFiltered}
              filteredAmount={filteredAmount}
            />
          }
          style={{ marginBottom: spacing.lg }}
        />
      </View>
      <View
        style={{ ...styles.pageContent, gap: spacing.md, paddingBottom: 14 }}
      >
        <BalanceHistoryGraph
          accountId={accountId}
          style={{
            height: 'calc(5vh + 5vw)',
            margin: 0,
            display: showNetWorthChart ? 'flex' : 'none',
          }}
        />
        {isReconcileShown && account && (
          <ReconcileStrip
            account={account}
            balanceQuery={balanceQuery}
            reconcile={stripReconcile}
            onClose={() => setIsReconcileOpen(false)}
          />
        )}
        <RegisterToolbar
          searchInputRef={searchInputRef}
          search={search}
          isWorking={workingHard}
          areSplitsCollapsed={splitsExpanded.state.mode === 'collapse'}
          onSearch={onSearch}
          onApplyFilter={onApplyFilter}
          onToggleSplits={onToggleSplits}
          onManageColumns={() => onMenuSelect('manage-columns')}
        />
        {filterConditions.length > 0 && (
          <FiltersStack
            conditions={filterConditions}
            conditionsOp={filterConditionsOp}
            onUpdateFilter={onUpdateFilter}
            onDeleteFilter={onDeleteFilter}
            onClearFilters={onClearFilters}
            onReloadSavedFilter={onReloadSavedFilter}
            filterId={filterId}
            savedFilters={savedFilters}
            onConditionsOpChange={onConditionsOpChange}
          />
        )}
      </View>
    </View>
  );
}

/** The open accounts a multi-account register can import into. */
function getImportableAccounts(
  accounts: readonly AccountEntity[],
  accountId: string | undefined,
): AccountEntity[] {
  const openAccounts = accounts.filter(account => !account.closed);
  switch (accountId) {
    case undefined:
      return openAccounts;
    case 'onbudget':
      return openAccounts.filter(account => !account.offbudget);
    case 'offbudget':
      return openAccounts.filter(account => account.offbudget);
    default:
      return [];
  }
}
