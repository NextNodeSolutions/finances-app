import { useEffect } from 'react';
import { useHotkeys, useHotkeysContext } from 'react-hotkeys-hook';

import { SIDE_PANEL_SELECTOR } from '#components/panels/PanelProvider';
import { isTextEntryElement } from '#hooks/useHotkeyGuards';
import { useSelector } from '#redux';

import type { Rewind } from './useRewind';

/** Hotkeys scope active while the Overview is on screen. */
export const OVERVIEW_HOTKEY_SCOPE = 'overview';

// Widgets that use the arrow keys (or Esc) themselves: a key pressed inside
// one belongs to it, not to the page.
const KEY_OWNER_SELECTOR = [
  SIDE_PANEL_SELECTOR,
  '[role="dialog"]',
  '[role="grid"]',
  '[role="treegrid"]',
  '[role="tree"]',
  '[role="listbox"]',
  '[role="menu"]',
  '[role="menubar"]',
  '[role="radiogroup"]',
  '[role="slider"]',
  '[role="spinbutton"]',
  '[role="tablist"]',
  '[role="toolbar"]',
].join(', ');

/**
 * ← / → step the Overview one month-end back or forward; Esc returns to
 * today. Quiet while typing, inside widgets that own those keys, and while
 * a modal is open.
 */
export function useRewindHotkeys({
  asOfMonth,
  setAsOf,
  stepBack,
  stepForward,
}: Rewind): void {
  const { enableScope, disableScope } = useHotkeysContext();
  const isModalOpen = useSelector(state => state.modals.modalStack.length > 0);

  useEffect(() => {
    enableScope(OVERVIEW_HOTKEY_SCOPE);
    return () => disableScope(OVERVIEW_HOTKEY_SCOPE);
  }, [enableScope, disableScope]);

  const options = {
    scopes: [OVERVIEW_HOTKEY_SCOPE],
    enabled: !isModalOpen,
    preventDefault: true,
    ignoreEventWhen: isKeyHandledElsewhere,
  };

  useHotkeys('left', stepBack, options);
  useHotkeys('right', stepForward, options);
  useHotkeys('esc', () => setAsOf(null), {
    ...options,
    enabled: !isModalOpen && asOfMonth !== null,
  });
}

function isKeyHandledElsewhere(event: KeyboardEvent): boolean {
  if (event.defaultPrevented) {
    return true;
  }
  const target = event.target instanceof Element ? event.target : null;
  return (
    isTextEntryElement(target) || target?.closest(KEY_OWNER_SELECTOR) != null
  );
}
