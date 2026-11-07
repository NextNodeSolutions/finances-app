import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { useOptionalFeature } from '#hooks/useOptionalFeature';
import * as bindings from '#spreadsheet/bindings';

import { AccountSearchField } from './AccountSearchField';
import { AccountsHeaderRow } from './AccountsHeaderRow';
import { AllAccountsRow } from './AllAccountsRow';
import { ClosedSection } from './ClosedSection';
import { SideGroup } from './SideGroup';
import {
  filterSidebarTree,
  useSidebarAccountTree,
} from './useSidebarAccountTree';
import { bucketKey, useSidebarCollapseState } from './useSidebarCollapseState';

export function AccountsSection() {
  const { t } = useTranslation();
  const tree = useSidebarAccountTree();
  const [isBankSyncOn] = useOptionalFeature('bankSync');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const trimmedQuery = query.trim().toLowerCase();
  const isSearching = trimmedQuery !== '';

  const collapse = useSidebarCollapseState({ tree, isSearching });

  const onToggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setQuery('');
  };

  const visibleTree = filterSidebarTree(tree, trimmedQuery);

  const showSyncDot =
    isBankSyncOn &&
    [...tree.onBudget.buckets, ...tree.offBudget.buckets].some(bucket =>
      bucket.accounts.some(account => account.bank !== null),
    );

  return (
    <View
      data-testid="sidebar-accounts"
      style={{
        flexGrow: 1,
        minHeight: 0,
        overflowY: 'auto',
        paddingInline: spacing.sm,
        paddingTop: spacing.lg + spacing.xxs,
      }}
    >
      <View style={{ flexShrink: 0 }}>
        <AccountsHeaderRow
          allOpen={collapse.allOpen}
          onToggleAll={collapse.toggleAll}
          isToggleAllDisabled={isSearching}
          isSearchOpen={isSearchOpen}
          onToggleSearch={onToggleSearch}
        />
        {isSearchOpen && (
          <AccountSearchField
            value={query}
            onChange={setQuery}
            onClose={onToggleSearch}
          />
        )}
        <AllAccountsRow />
        {tree.onBudget.buckets.length > 0 && (
          <SideGroup
            label={t('On budget')}
            side="on"
            isDragDisabled={isSearching}
            showSyncDot={showSyncDot}
            sideData={visibleTree.onBudget}
            totalBinding={bindings.onBudgetAccountBalance()}
            balanceTestId="sidebar-on-budget-balance"
            isOpen={collapse.isOpen('onbudget')}
            onToggle={() => collapse.toggle('onbudget')}
            isBucketOpen={bucket => collapse.isOpen(bucketKey('on', bucket))}
            onToggleBucket={bucket => collapse.toggle(bucketKey('on', bucket))}
          />
        )}
        {tree.offBudget.buckets.length > 0 && (
          <SideGroup
            label={t('Off budget')}
            side="off"
            isDragDisabled={isSearching}
            showSyncDot={showSyncDot}
            sideData={visibleTree.offBudget}
            totalBinding={bindings.offBudgetAccountBalance()}
            balanceTestId="sidebar-off-budget-balance"
            isOpen={collapse.isOpen('offbudget')}
            onToggle={() => collapse.toggle('offbudget')}
            isBucketOpen={bucket => collapse.isOpen(bucketKey('off', bucket))}
            onToggleBucket={bucket => collapse.toggle(bucketKey('off', bucket))}
          />
        )}
        <ClosedSection
          accounts={visibleTree.closed}
          isOpen={collapse.isOpen('closed')}
          onToggle={() => collapse.toggle('closed')}
          isDragDisabled={isSearching}
        />
        <View style={{ height: spacing.md }} />
      </View>
    </View>
  );
}
