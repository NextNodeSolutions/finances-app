import { useEffect, useEffectEvent } from 'react';
import { useLocation } from 'react-router';

import { PAYEE_PANEL_STATE_KEY, usePayeePanel } from './usePayeePanel';

function getRequestedPayeeId(state: unknown): string | null {
  if (typeof state !== 'object' || state === null) {
    return null;
  }
  const requested: unknown = Reflect.get(state, PAYEE_PANEL_STATE_KEY);
  return typeof requested === 'string' ? requested : null;
}

/**
 * Opens the payee panel that `usePayeePanel().open` asked for from another
 * page, once the payees page is showing.
 */
export function useRequestedPayeePanel(): void {
  const location = useLocation();
  const payeePanel = usePayeePanel();
  const requestedId = getRequestedPayeeId(location.state);

  const openRequested = useEffectEvent((id: string) => payeePanel.open(id));

  useEffect(() => {
    if (requestedId !== null) {
      openRequested(requestedId);
    }
  }, [requestedId, location.key]);
}
