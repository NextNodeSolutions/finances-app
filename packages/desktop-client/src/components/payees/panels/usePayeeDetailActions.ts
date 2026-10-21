import { useTranslation } from 'react-i18next';

import type { PayeeEntity } from '@actual-app/core/types/models';

import { usePayeeActions } from '#components/payees/usePayeeActions';
import { useNavigate } from '#hooks/useNavigate';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

type PayeeDetailActions = {
  viewTransactions: () => void;
  viewRules: () => void;
  createRule: () => void;
  /** Confirms, then merges this payee into `targetId`. */
  mergeInto: (targetId: PayeeEntity['id']) => void;
  /** Confirms, then deletes this payee. */
  remove: () => void;
};

/**
 * What the payee panel can do with its payee. `onGone` runs once a merge or
 * delete has removed the payee, so the panel can close.
 */
export function usePayeeDetailActions(
  payee: Pick<PayeeEntity, 'id' | 'name'>,
  onGone: () => void,
): PayeeDetailActions {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { onBatchChange, onMerge, onViewRules, onCreateRule } =
    usePayeeActions();

  const viewTransactions = () => {
    void navigate('/accounts', {
      state: {
        goBack: true,
        filterName: payee.name,
        filterConditions: [
          { field: 'payee', op: 'is', value: payee.id, type: 'id' },
        ],
      },
    });
  };

  const mergeInto = (targetId: PayeeEntity['id']) => {
    dispatch(
      pushModal({
        modal: {
          name: 'confirm-payees-merge',
          options: {
            payeeIds: [payee.id],
            targetPayeeId: targetId,
            onConfirm: async () => {
              await onMerge([targetId, payee.id]);
              onGone();
            },
          },
        },
      }),
    );
  };

  const remove = () => {
    dispatch(
      pushModal({
        modal: {
          name: 'confirm-delete',
          options: {
            message: t('Delete the payee {{name}}?', { name: payee.name }),
            onConfirm: async () => {
              await onBatchChange({
                deleted: [{ id: payee.id }],
                added: [],
                updated: [],
              });
              onGone();
            },
          },
        },
      }),
    );
  };

  return {
    viewTransactions,
    viewRules: () => onViewRules(payee.id),
    createRule: () => onCreateRule(payee.id),
    mergeInto,
    remove,
  };
}
