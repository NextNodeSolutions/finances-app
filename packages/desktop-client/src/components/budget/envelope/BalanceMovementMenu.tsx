import { useBudgetPanels } from '#components/budget/panels/useBudgetPanels';

import { BalanceMenu } from './BalanceMenu';

type BalanceMovementMenuProps = {
  categoryId: string;
  month: string;
  onBudgetAction: (month: string, action: string, arg?: unknown) => void;
  onClose: () => void;
};

/**
 * The balance cell's menu. Transfer and cover open their side panels (the
 * mobile sheets on narrow screens); rollover applies at once.
 */
export function BalanceMovementMenu({
  categoryId,
  month,
  onBudgetAction,
  onClose,
}: BalanceMovementMenuProps) {
  const { openMoveMoney, openCover } = useBudgetPanels();

  return (
    <BalanceMenu
      categoryId={categoryId}
      onCarryover={carryover => {
        onBudgetAction(month, 'carryover', {
          category: categoryId,
          flag: carryover,
        });
        onClose();
      }}
      onTransfer={() => {
        onClose();
        openMoveMoney({ from: categoryId, month });
      }}
      onCover={() => {
        onClose();
        openCover({ categoryId, month });
      }}
    />
  );
}
