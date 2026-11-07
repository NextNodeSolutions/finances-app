import { useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { Button } from '@actual-app/components/button';
import { Menu } from '@actual-app/components/menu';
import type { MenuItemObject } from '@actual-app/components/menu';
import { Popover } from '@actual-app/components/popover';

import { useSyncedPref } from '#hooks/useSyncedPref';

import { useBudgetMonthMenu as useEnvelopeMonthMenu } from './envelope/budgetsummary/BudgetMonthMenu';
import { useBudgetMonthMenu as useTrackingMonthMenu } from './tracking/budgetsummary/BudgetMonthMenu';
import { useMonthToolActions } from './useMonthToolActions';

export type MonthToolsExtraItem = {
  name: string;
  text: string;
  onSelect: () => void;
};

type MonthToolsMenuProps = {
  /** The month every action targets. */
  month: string;
  /** Accessible name of the trigger. */
  ariaLabel: string;
  /** What the trigger shows (a label with a chevron, or ⋯). */
  children: ReactNode;
  /** Items listed before the month actions, e.g. Month summary. */
  extraItems?: readonly MonthToolsExtraItem[];
  triggerStyle?: CSSProperties;
};

/** Month tools: copy, zero, averages and templates for `month` only. */
export function MonthToolsMenu({
  month,
  ariaLabel,
  children,
  extraItems = [],
  triggerStyle,
}: MonthToolsMenuProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [budgetType = 'envelope'] = useSyncedPref('budgetType');
  const actions = useMonthToolActions(month);
  const envelopeMenu = useEnvelopeMonthMenu(actions);
  const trackingMenu = useTrackingMonthMenu(actions);
  const monthMenu = budgetType === 'tracking' ? trackingMenu : envelopeMenu;
  const separator: Array<typeof Menu.line> =
    extraItems.length > 0 ? [Menu.line] : [];
  const items: Array<MenuItemObject<string> | typeof Menu.line> = [
    ...extraItems.map(({ name, text }) => ({ name, text })),
    ...separator,
    ...monthMenu.items,
  ];

  return (
    <>
      <Button
        ref={triggerRef}
        variant="bare"
        aria-label={ariaLabel}
        onPress={() => setIsOpen(true)}
        style={triggerStyle}
      >
        {children}
      </Button>
      <Popover
        triggerRef={triggerRef}
        isOpen={isOpen}
        onOpenChange={() => setIsOpen(false)}
        style={{ width: 240 }}
      >
        <Menu
          items={items}
          onMenuSelect={name => {
            setIsOpen(false);
            const extraItem = extraItems.find(item => item.name === name);
            if (extraItem) {
              extraItem.onSelect();
            } else {
              monthMenu.onMenuSelect(name);
            }
          }}
        />
      </Popover>
    </>
  );
}
