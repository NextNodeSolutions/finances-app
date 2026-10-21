import { send } from '@actual-app/core/platform/client/connection';
import { applyChanges } from '@actual-app/core/shared/util';
import type { Diff } from '@actual-app/core/shared/util';
import type { NewRuleEntity, PayeeEntity } from '@actual-app/core/types/models';
import { useQueryClient } from '@tanstack/react-query';

import { useOrphanedPayees } from '#hooks/useOrphanedPayees';
import { usePayeeRuleCounts } from '#hooks/usePayeeRuleCounts';
import { usePayees } from '#hooks/usePayees';
import { pushModal } from '#modals/modalsSlice';
import { payeeQueries } from '#payees';
import { useDispatch } from '#redux';

type PayeeId = PayeeEntity['id'];

export type PayeeActions = {
  onBatchChange: (changes: Diff<PayeeEntity>) => Promise<void>;
  /** Merges every payee after the first into the first. */
  onMerge: (ids: PayeeId[]) => Promise<void>;
  onViewRules: (id: PayeeId) => void;
  onCreateRule: (id: PayeeId) => void;
};

function getOrphansAfterMerge(
  orphans: Array<Pick<PayeeEntity, 'id'>>,
  targetId: PayeeId,
  mergeIds: PayeeId[],
) {
  const orphanIds = new Set(orphans.map(orphan => orphan.id));
  const mergedOrphanCount = mergeIds.filter(id => orphanIds.has(id)).length;
  // Merging a payee that is in use into an orphan puts the orphan to use.
  const isTargetNowUsed =
    orphanIds.has(targetId) && mergedOrphanCount !== mergeIds.length;

  return orphans.filter(
    orphan =>
      !mergeIds.includes(orphan.id) &&
      !(isTargetNowUsed && orphan.id === targetId),
  );
}

function makePayeeRule(id: PayeeId): NewRuleEntity {
  return {
    stage: null,
    conditionsOp: 'and',
    conditions: [{ field: 'payee', op: 'is', value: id, type: 'id' }],
    actions: [{ op: 'set', field: 'category', value: null, type: 'id' }],
  };
}

/**
 * The edits the payees page and the payee panel share: rename, favourite,
 * delete, merge, and the rule shortcuts.
 */
export function usePayeeActions(): PayeeActions {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { refetch: refetchPayees } = usePayees();
  const { data: orphanedPayees = [] } = useOrphanedPayees();
  const { refetch: refetchRuleCounts } = usePayeeRuleCounts();

  const onBatchChange = async (changes: Diff<PayeeEntity>) => {
    await send('payees-batch-change', changes);
    queryClient.setQueryData(payeeQueries.listOrphaned().queryKey, existing =>
      applyChanges(changes, existing ?? []),
    );
  };

  const onMerge = async ([targetId, ...mergeIds]: PayeeId[]) => {
    await send('payees-merge', { targetId, mergeIds });
    await refetchRuleCounts();
    void refetchPayees();
    queryClient.setQueryData(
      payeeQueries.listOrphaned().queryKey,
      getOrphansAfterMerge(orphanedPayees, targetId, mergeIds),
    );
  };

  const onViewRules = (id: PayeeId) => {
    dispatch(
      pushModal({ modal: { name: 'manage-rules', options: { payeeId: id } } }),
    );
  };

  const onCreateRule = (id: PayeeId) => {
    dispatch(
      pushModal({
        modal: { name: 'edit-rule', options: { rule: makePayeeRule(id) } },
      }),
    );
  };

  return { onBatchChange, onMerge, onViewRules, onCreateRule };
}
