import { useLocation } from 'react-router';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import type { PayeeEntity } from '@actual-app/core/types/models';

import { usePanels } from '#components/panels/PanelProvider';
import { getSidebarMenuItemPath } from '#components/sidebar/sidebarMenu';
import { useNavigate } from '#hooks/useNavigate';
import { useSidebarMenu } from '#hooks/useSidebarMenu';

import { PayeeDetailPanel } from './PayeeDetailPanel';

/** Route state that asks the payees page to open a payee's panel. */
export const PAYEE_PANEL_STATE_KEY = 'payeePanelId';

type PayeePanelOpener = {
  /** Shows the payee's details beside the payees page. */
  open: (id: PayeeEntity['id']) => void;
};

/**
 * Opens a payee's details in the side panel, going to the payees page first
 * when needed. Narrow screens have no side panel, so they go to the existing
 * mobile payee page instead.
 */
export function usePayeePanel(): PayeePanelOpener {
  const { isNarrowWidth } = useResponsive();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const panels = usePanels();
  const { sidebarItems } = useSidebarMenu();
  const payeesPath = getSidebarMenuItemPath(
    'payees',
    sidebarItems.some(item => item.id === 'payees'),
  );

  const open = (id: PayeeEntity['id']) => {
    if (isNarrowWidth) {
      void navigate(`/payees/${id}`);
      return;
    }
    if (pathname === payeesPath) {
      panels.open({
        key: 'payee',
        Component: PayeeDetailPanel,
        props: { payeeId: id },
      });
      return;
    }
    // A panel belongs to the page it opens on: the payees page opens it on
    // arrival (`useRequestedPayeePanel`).
    void navigate(payeesPath, { state: { [PAYEE_PANEL_STATE_KEY]: id } });
  };

  return { open };
}
