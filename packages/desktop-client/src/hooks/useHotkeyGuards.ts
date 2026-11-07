import { useEffect } from 'react';

// Number of mounted registers that currently hold a transaction selection.
// Module state on purpose: the global `g` navigation chords read it from a
// key handler, outside React, and must stand down while the register's own
// `g` (merge) selection key is live.
let activeRegisterSelections = 0;

/**
 * Called by a register with whether it has selected transactions, so global
 * shortcuts that reuse selection keys stay quiet while a selection exists.
 */
export function useReportRegisterSelection(isActive: boolean): void {
  useEffect(() => {
    if (!isActive) {
      return;
    }
    activeRegisterSelections += 1;
    return () => {
      activeRegisterSelections -= 1;
    };
  }, [isActive]);
}

export function isRegisterSelectionActive(): boolean {
  return activeRegisterSelections > 0;
}

const TEXT_ENTRY_SELECTOR =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="combobox"]';

/**
 * True when keyboard input on this element is meant as typing, so single-key
 * shortcuts must not fire.
 */
export function isTextEntryElement(element: Element | null): boolean {
  return element?.closest(TEXT_ENTRY_SELECTOR) != null;
}
