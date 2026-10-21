import type { RefObject } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

type AccountHeaderHotkeys = {
  searchInputRef: RefObject<HTMLInputElement | null>;
  canSync: boolean;
  onAddTransaction: () => void;
  onImport: () => void;
  onSync: () => void;
};

/** ⌘F search, `t` add transaction, ⌘I import and ⌘B sync. */
export function useAccountHeaderHotkeys({
  searchInputRef,
  canSync,
  onAddTransaction,
  onImport,
  onSync,
}: AccountHeaderHotkeys): void {
  useHotkeys(
    'ctrl+f, cmd+f, meta+f',
    event => {
      const searchInput = searchInputRef.current;
      if (!searchInput) {
        return;
      }
      // Pressing search twice in a row falls through to the browser's find.
      if (document.activeElement === searchInput) {
        searchInput.blur();
        return;
      }
      event.preventDefault();
      searchInput.focus();
    },
    { enableOnFormTags: true, preventDefault: false, scopes: ['app'] },
    [searchInputRef],
  );
  useHotkeys(
    't',
    () => onAddTransaction(),
    {
      preventDefault: true,
      scopes: ['app'],
    },
    [onAddTransaction],
  );
  useHotkeys('ctrl+i, cmd+i, meta+i', () => onImport(), { scopes: ['app'] }, [
    onImport,
  ]);
  useHotkeys(
    'ctrl+b, cmd+b, meta+b',
    () => onSync(),
    { enabled: canSync, preventDefault: true, scopes: ['app'] },
    [onSync],
  );
}
