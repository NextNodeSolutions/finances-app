import { useBudgetActions } from '#budget';

import { useUndoToast } from './useUndoToast';

export type BudgetActionPayload = Parameters<
  ReturnType<typeof useBudgetActions>['mutateAsync']
>[0];

/**
 * Runs a budget action and, once it has landed, shows `message` with Undo.
 * The toast does not depend on the caller staying mounted, so a panel can
 * close straight away. Failures are reported by `useBudgetActions` itself.
 */
export function useBudgetActionWithUndo(): (
  payload: BudgetActionPayload,
  message: string,
) => void {
  const budgetActions = useBudgetActions();
  const showUndoToast = useUndoToast();

  return (payload, message) => {
    void budgetActions.mutateAsync(payload).then(
      () => showUndoToast(message),
      () => undefined,
    );
  };
}
