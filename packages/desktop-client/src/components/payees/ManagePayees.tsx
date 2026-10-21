import { useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { getNormalisedString } from '@actual-app/core/shared/normalisation';
import { groupById } from '@actual-app/core/shared/util';
import type { Diff } from '@actual-app/core/shared/util';
import type { PayeeEntity } from '@actual-app/core/types/models';

import { Search } from '#components/common/Search';
import { SegmentedControl } from '#components/rules/SegmentedControl';
import { SegmentedControlItem } from '#components/rules/SegmentedControlItem';
import { SelectedProvider, useSelected } from '#hooks/useSelected';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { usePayeePanel } from './panels/usePayeePanel';
import { PayeeSelectionBar } from './PayeeSelectionBar';
import { PayeesEmptyMessage } from './PayeesEmptyMessage';
import type { PayeeView } from './PayeesEmptyMessage';
import { PayeeTable } from './PayeeTable';
import { PayeeTableHeader } from './PayeeTableHeader';
import type { usePayeeUsage } from './usePayeeUsage';

type PayeeFilter = {
  text: string;
  view: PayeeView;
  isUnused: (payee: PayeeEntity) => boolean;
  transferPrefix: string;
};

function filterPayees(payees: PayeeEntity[], filter: PayeeFilter) {
  const needle = getNormalisedString(filter.text);
  return payees.filter(
    payee =>
      (filter.view === 'all' || filter.isUnused(payee)) &&
      getNormalisedString(
        (payee.transfer_acct ? filter.transferPrefix : '') + payee.name,
      ).includes(needle),
  );
}

type ManagePayeesProps = {
  payees: PayeeEntity[];
  isLoading: boolean;
  ruleCounts: ComponentProps<typeof PayeeTable>['ruleCounts'];
  usage: ReturnType<typeof usePayeeUsage>;
  orphanedPayees: Array<Pick<PayeeEntity, 'id'>>;
  initialSelectedIds: string[];
  onBatchChange: (diff: Diff<PayeeEntity>) => Promise<void>;
  onViewRules: ComponentProps<typeof PayeeTable>['onViewRules'];
  onCreateRule: ComponentProps<typeof PayeeTable>['onCreateRule'];
  onMerge: (ids: string[]) => Promise<void>;
};

export function ManagePayees({
  payees,
  isLoading,
  ruleCounts,
  usage,
  orphanedPayees,
  initialSelectedIds,
  onBatchChange,
  onViewRules,
  onCreateRule,
  onMerge,
}: ManagePayeesProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const payeePanel = usePayeePanel();
  const table = useRef(null);
  const [filter, setFilter] = useState('');
  const [view, setView] = useState<PayeeView>('all');

  const orphanIds = new Set(orphanedPayees.map(orphan => orphan.id));
  // Until the counts arrive, the server's list of orphans stands in.
  const isUnused = (payee: PayeeEntity) =>
    payee.transfer_acct == null &&
    (usage.isLoading
      ? orphanIds.has(payee.id)
      : (usage.counts.get(payee.id) ?? 0) === 0);

  const filteredPayees = filterPayees(payees, {
    text: filter,
    view,
    isUnused,
    transferPrefix: t('Transfer: '),
  });
  const payeesById = groupById(payees);
  const selected = useSelected('payees', filteredPayees, initialSelectedIds);
  const selectedIds = [...selected.items];

  const onUpdate = <T extends 'name' | 'favorite' | 'learn_categories'>(
    id: PayeeEntity['id'],
    name: T,
    value: PayeeEntity[T],
  ) => {
    const payee = payeesById[id];
    if (payee && payee[name] !== value) {
      void onBatchChange({
        updated: [{ id, [name]: value }],
        added: [],
        deleted: [],
      });
    }
  };

  const getSelectableIds = () =>
    Promise.resolve(
      filteredPayees.filter(p => p.transfer_acct == null).map(p => p.id),
    );

  function onDelete(ids?: Array<{ id: string }>) {
    void onBatchChange({
      deleted: ids ?? selectedIds.map(id => ({ id })),
      updated: [],
      added: [],
    });
    if (!ids) selected.dispatch({ type: 'select-none' });
  }

  // Toggles a flag on every selected payee: all on turns it off, else on.
  function onToggleSelected(field: 'favorite' | 'learn_categories') {
    const isOn = !selectedIds.every(id => payeesById[id]?.[field]);
    void onBatchChange({
      updated: selectedIds.map(id => ({ id, [field]: isOn })),
      added: [],
      deleted: [],
    });
    selected.dispatch({ type: 'select-none' });
  }

  async function onMergeSelected() {
    if (selectedIds.length < 2) return;

    const [targetPayeeId] = selectedIds;
    dispatch(
      pushModal({
        modal: {
          name: 'confirm-payees-merge',
          options: {
            payeeIds: selectedIds.filter(id => id !== targetPayeeId),
            targetPayeeId,
            onConfirm: async () => {
              await onMerge(selectedIds);
              selected.dispatch({ type: 'select-none' });
            },
          },
        },
      }),
    );
  }

  return (
    <View style={{ height: '100%' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingBottom: spacing.lg,
          flexShrink: 0,
        }}
      >
        <Search
          placeholder={t('Filter payees...')}
          value={filter}
          onChange={setFilter}
        />
        <SegmentedControl>
          <SegmentedControlItem
            isSelected={view === 'all'}
            onPress={() => setView('all')}
          >
            <Trans>All</Trans>
          </SegmentedControlItem>
          <SegmentedControlItem
            isSelected={view === 'unused'}
            onPress={() => setView('unused')}
          >
            <Trans>Unused</Trans>
          </SegmentedControlItem>
        </SegmentedControl>
        <View style={{ flex: 1 }} />
        <Button
          variant="bare"
          style={{ color: theme.pageTextLight }}
          onPress={() =>
            dispatch(pushModal({ modal: { name: 'payee-category-learning' } }))
          }
        >
          <Trans>Category learning settings</Trans>
        </Button>
      </View>

      <SelectedProvider instance={selected} fetchAllIds={getSelectableIds}>
        <View style={styles.tableContainer}>
          <PayeeTableHeader />
          {filteredPayees.length === 0 ? (
            <PayeesEmptyMessage
              isLoading={isLoading}
              hasPayees={payees.length > 0}
              view={view}
            />
          ) : (
            <PayeeTable
              ref={table}
              payees={filteredPayees}
              ruleCounts={ruleCounts}
              transactionCounts={usage.isLoading ? null : usage.counts}
              onUpdate={onUpdate}
              onViewRules={onViewRules}
              onCreateRule={onCreateRule}
              onOpenDetails={payeePanel.open}
              onDelete={ids => onDelete(ids.map(id => ({ id })))}
            />
          )}
        </View>
        {selected.items.size > 0 && (
          <PayeeSelectionBar
            payeesById={payeesById}
            selectedPayees={selected.items}
            onDelete={() => onDelete()}
            onMerge={onMergeSelected}
            onFavorite={() => onToggleSelected('favorite')}
            onLearn={() => onToggleSelected('learn_categories')}
          />
        )}
      </SelectedProvider>
    </View>
  );
}
