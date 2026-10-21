import React, { useEffect } from 'react';

import { listen } from '@actual-app/core/platform/client/connection';
import * as undo from '@actual-app/core/platform/client/undo';
import type { UndoState } from '@actual-app/core/server/undo';

import { useOrphanedPayees } from '#hooks/useOrphanedPayees';
import { usePayeeRuleCounts } from '#hooks/usePayeeRuleCounts';
import { usePayees } from '#hooks/usePayees';

import { ManagePayees } from './ManagePayees';
import { usePayeeActions } from './usePayeeActions';
import { usePayeeUsage } from './usePayeeUsage';

type ManagePayeesWithDataProps = {
  initialSelectedIds: string[];
};

export function ManagePayeesWithData({
  initialSelectedIds,
}: ManagePayeesWithDataProps) {
  const { data: payees = [], isPlaceholderData: isPayeesLoading } = usePayees();
  const { data: orphanedPayees = [], refetch: refetchOrphanedPayees } =
    useOrphanedPayees();
  const { data: ruleCounts = new Map(), refetch: refetchRuleCounts } =
    usePayeeRuleCounts();
  const usage = usePayeeUsage();
  const { onBatchChange, onMerge, onViewRules, onCreateRule } =
    usePayeeActions();

  useEffect(() => {
    const unlisten = listen('sync-event', async event => {
      if (event.type === 'applied') {
        if (
          event.tables.includes('rules') ||
          event.tables.includes('schedules')
        ) {
          await refetchRuleCounts();
        }
      }
    });

    return () => {
      unlisten();
    };
  }, [refetchRuleCounts]);

  useEffect(() => {
    async function onUndo({ tables, messages, meta }: UndoState) {
      if (!tables.includes('payees') && !tables.includes('payee_mapping')) {
        return;
      }

      await refetchOrphanedPayees();

      const targetId =
        meta && typeof meta === 'object' && 'targetId' in meta
          ? meta.targetId
          : null;

      if (targetId || messages.find(msg => msg.dataset === 'rules')) {
        await refetchRuleCounts();
      }

      undo.setUndoState('undoEvent', null);
    }

    const lastUndoEvent = undo.getUndoState('undoEvent');
    if (lastUndoEvent) {
      void onUndo(lastUndoEvent);
    }

    return listen('undo-event', onUndo);
  }, [refetchRuleCounts, refetchOrphanedPayees]);

  return (
    <ManagePayees
      payees={payees}
      isLoading={isPayeesLoading}
      ruleCounts={ruleCounts}
      usage={usage}
      orphanedPayees={orphanedPayees}
      initialSelectedIds={initialSelectedIds}
      onBatchChange={onBatchChange}
      onMerge={onMerge}
      onViewRules={onViewRules}
      onCreateRule={onCreateRule}
    />
  );
}
