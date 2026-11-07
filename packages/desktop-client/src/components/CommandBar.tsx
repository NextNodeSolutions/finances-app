import { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { elevation, radius } from '@actual-app/components/tokens';
import { css } from '@emotion/css';
import { Command } from 'cmdk';

import { useModalState } from '#hooks/useModalState';

import { PaletteContent } from './titlebar/palette/PaletteContent';

const commandBarOpeners = new Set<() => void>();

/**
 * Opens the command palette from anywhere (the titlebar trigger, page
 * shortcuts). Like ⌘K, it does nothing while a modal is open.
 */
export function openCommandBar(): void {
  commandBarOpeners.forEach(open => open());
}

/**
 * The command palette (⌘K): pages, actions, accounts and, once the user
 * types, records, reports, files and amount-first entry. It opens over a
 * side panel but never over a modal.
 */
export function CommandBar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { modalStack } = useModalState();

  const requestOpen = useEffectEvent(() => {
    if (modalStack.length > 0) {
      return;
    }
    setIsOpen(true);
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        requestOpen();
      }
    };
    const onOpenRequest = () => requestOpen();

    document.addEventListener('keydown', onKeyDown);
    commandBarOpeners.add(onOpenRequest);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      commandBarOpeners.delete(onOpenRequest);
    };
  }, []);

  return (
    <Command.Dialog
      vimBindings
      open={isOpen}
      onOpenChange={setIsOpen}
      label={t('Command Bar')}
      aria-label={t('Command Bar')}
      shouldFilter={false}
      overlayClassName={overlayClassName}
      className={dialogClassName}
    >
      <PaletteContent onClose={() => setIsOpen(false)} />
    </Command.Dialog>
  );
}

const overlayClassName = css({
  position: 'fixed',
  inset: 0,
  backgroundColor: theme.overlayBackground,
  zIndex: 3000,
});

const dialogClassName = css({
  position: 'fixed',
  top: '30%',
  left: '50%',
  transform: 'translate(-50%, -30%)',
  width: '90%',
  maxWidth: 600,
  backgroundColor: theme.menuBackground,
  border: `1px solid ${theme.menuBorder}`,
  color: theme.pageText,
  borderRadius: radius.xl,
  boxShadow: elevation.modal,
  overflow: 'hidden',
  zIndex: 3001,
});
