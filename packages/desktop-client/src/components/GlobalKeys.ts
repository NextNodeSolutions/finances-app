import { useEffect, useEffectEvent } from 'react';
import { useLocation } from 'react-router';

import * as Platform from '@actual-app/core/shared/platform';

import { closeBudget } from '#budgetfiles/budgetfilesSlice';
import { openFileSwitcher } from '#components/sidebar/redesign/FileSwitcher';
import { getSidebarMenuItemPath } from '#components/sidebar/sidebarMenu';
import type { SidebarMenuItemId } from '#components/sidebar/sidebarMenu';
import { useTransactionPanels } from '#components/transactions/panels/useTransactionPanels';
import {
  isRegisterSelectionActive,
  isTextEntryElement,
} from '#hooks/useHotkeyGuards';
import { useModalState } from '#hooks/useModalState';
import { useNavigate } from '#hooks/useNavigate';
import { useSidebarMenu } from '#hooks/useSidebarMenu';
import { useDispatch } from '#redux';

import { useDefaultTransactionAccountId } from './titlebar/palette/useDefaultTransactionAccountId';

/** A page a shortcut goes to: a menu page, or one of the fixed ones. */
type ShortcutTarget = SidebarMenuItemId | 'accounts' | 'settings';

const CHORD_PREFIX = 'g';
const CHORD_TIMEOUT_MS = 1000;
const NEW_TRANSACTION_KEY = 't';

// `g` then one of these keys.
const CHORD_TARGETS: Partial<Record<string, ShortcutTarget>> = {
  o: 'overview',
  b: 'budget',
  a: 'accounts',
  s: 'schedules',
  r: 'reports',
  p: 'payees',
  u: 'rules',
  ',': 'settings',
};

// ⌘ plus one of these keys, in the desktop app only.
const ELECTRON_TARGETS: Partial<Record<string, ShortcutTarget>> = {
  '0': 'overview',
  '1': 'budget',
  '2': 'reports',
  '3': 'accounts',
  '4': 'schedules',
  ...(Platform.OS === 'mac' ? { ',': 'settings' } : {}),
};

function isSwitchFileKey(event: KeyboardEvent): boolean {
  return (
    (event.metaKey || event.ctrlKey) &&
    !event.shiftKey &&
    !event.altKey &&
    event.key.toLowerCase() === 'o'
  );
}

function hasModifier(event: KeyboardEvent): boolean {
  return event.metaKey || event.ctrlKey || event.altKey || event.shiftKey;
}

/**
 * The app-wide keys: `g` chords, `t` for a new transaction, ⌘O for the file
 * switcher and the desktop app's ⌘0–⌘4. Single keys stand down while the
 * user types, while a modal is open, and (for chords) while a register
 * selection makes `g` its merge key.
 */
export function GlobalKeys() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { modalStack } = useModalState();
  const { availableItems } = useSidebarMenu();
  const transactionPanels = useTransactionPanels();
  const defaultAccountId = useDefaultTransactionAccountId();

  const getTargetPath = (target: ShortcutTarget): string | null => {
    if (target === 'accounts' || target === 'settings') {
      return `/${target}`;
    }
    const item = availableItems.find(({ id }) => id === target);
    return item ? getSidebarMenuItemPath(item.id, !item.hidden) : null;
  };

  const goTo = (target: ShortcutTarget, event: KeyboardEvent) => {
    const path = getTargetPath(target);
    if (path !== null) {
      event.preventDefault();
      void navigate(path);
    }
  };

  const isModalOpen = () => modalStack.length > 0;

  const onSwitchFile = useEffectEvent((event: KeyboardEvent) => {
    event.preventDefault();
    // Ahead of the document-level ⌘O that would close the file outright.
    event.stopImmediatePropagation();
    if (!isModalOpen() && !openFileSwitcher()) {
      void dispatch(closeBudget());
    }
  });

  const onNewTransaction = useEffectEvent((event: KeyboardEvent) => {
    // The register keeps its own inline `t`.
    if (pathname.startsWith('/accounts')) {
      return;
    }
    event.preventDefault();
    transactionPanels.openNew({ accountId: defaultAccountId });
  });

  const onElectronShortcut = useEffectEvent((event: KeyboardEvent) => {
    const target = ELECTRON_TARGETS[event.key];
    if (target) {
      goTo(target, event);
    }
  });

  const onChordKey = useEffectEvent((event: KeyboardEvent) => {
    const target = CHORD_TARGETS[event.key];
    if (target && !isRegisterSelectionActive()) {
      goTo(target, event);
    }
  });

  const isSingleKeyBlocked = useEffectEvent(
    () => isModalOpen() || isTextEntryElement(document.activeElement),
  );

  useEffect(() => {
    let chordStartedAt: number | null = null;

    const onCapturedKeyDown = (event: KeyboardEvent) => {
      if (isSwitchFileKey(event)) {
        onSwitchFile(event);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const isChordOpen =
        chordStartedAt !== null &&
        event.timeStamp - chordStartedAt <= CHORD_TIMEOUT_MS;
      chordStartedAt = null;

      if (event.defaultPrevented || event.repeat) {
        return;
      }
      if (event.metaKey && !Platform.isBrowser) {
        onElectronShortcut(event);
        return;
      }
      if (hasModifier(event) || isSingleKeyBlocked()) {
        return;
      }
      if (isChordOpen) {
        onChordKey(event);
      } else if (event.key === CHORD_PREFIX) {
        chordStartedAt = event.timeStamp;
      } else if (event.key === NEW_TRANSACTION_KEY) {
        onNewTransaction(event);
      }
    };

    window.addEventListener('keydown', onCapturedKeyDown, { capture: true });
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onCapturedKeyDown, {
        capture: true,
      });
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return null;
}
