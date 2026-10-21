import { useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Popover } from '@actual-app/components/popover';

import { CoverMenu } from '#components/budget/envelope/CoverMenu';
import { useEnvelopeSheetValue } from '#components/budget/envelope/EnvelopeBudgetComponents';
import { HoldMenu } from '#components/budget/envelope/HoldMenu';
import { useBudgetPanels } from '#components/budget/panels/useBudgetPanels';
import { useFormat } from '#hooks/useFormat';
import { envelopeBudget } from '#spreadsheet/bindings';

import { ToBudgetMenu } from './ToBudgetMenu';

type ToBudgetProps = {
  month: string;
  onBudgetAction: (month: string, action: string, arg?: unknown) => void;
  /** The To budget figure the menu opens from. */
  children: ReactNode;
  style?: CSSProperties;
};

type MenuStep = 'actions' | 'buffer' | 'cover';

/**
 * The To budget figure as a button opening its menu: move to a category
 * (in the side panel), hold for next month, reset the buffer, or cover an
 * overbudget from a category.
 */
export function ToBudget({
  month,
  onBudgetAction,
  children,
  style,
}: ToBudgetProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const { openMoveMoney } = useBudgetPanels();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuStep, setMenuStep] = useState<MenuStep>('actions');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toBudget = useEnvelopeSheetValue(envelopeBudget.toBudget) ?? 0;

  const closeMenu = () => {
    setMenuStep('actions');
    setIsMenuOpen(false);
  };

  return (
    <>
      <Button
        ref={triggerRef}
        variant="bare"
        aria-label={t('To budget menu')}
        onPress={() => setIsMenuOpen(true)}
        style={{ padding: 0, justifyContent: 'flex-start', ...style }}
      >
        {children}
      </Button>
      <Popover
        triggerRef={triggerRef}
        placement="bottom start"
        isOpen={isMenuOpen}
        onOpenChange={closeMenu}
        style={{ width: 200, margin: 1 }}
        isNonModal
      >
        {menuStep === 'actions' && (
          <ToBudgetMenu
            month={month}
            onBudgetAction={onBudgetAction}
            onTransfer={() => {
              closeMenu();
              openMoveMoney({ month });
            }}
            onCover={() => setMenuStep('cover')}
            onHoldBuffer={() => setMenuStep('buffer')}
            onResetHoldBuffer={() => {
              onBudgetAction(month, 'reset-hold');
              closeMenu();
            }}
          />
        )}
        {menuStep === 'buffer' && (
          <HoldMenu
            onClose={closeMenu}
            onSubmit={amount => onBudgetAction(month, 'hold', { amount })}
          />
        )}
        {menuStep === 'cover' && (
          <CoverMenu
            showToBeBudgeted={false}
            initialAmount={toBudget}
            onClose={closeMenu}
            onSubmit={(amount, categoryId) =>
              onBudgetAction(month, 'cover-overbudgeted', {
                category: categoryId,
                amount,
                currencyCode: format.currency.code,
              })
            }
          />
        )}
      </Popover>
    </>
  );
}
