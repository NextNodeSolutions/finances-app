import { useEffect, useEffectEvent, useState } from 'react';
import type { RefObject } from 'react';
import { Dialog } from 'react-aria-components';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Popover } from '@actual-app/components/popover';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { closeBudget } from '#budgetfiles/budgetfilesSlice';
import { BudgetFileSelection } from '#components/manager/BudgetFileSelection';
import { useDispatch } from '#redux';

const FILE_SWITCHER_WIDTH = 360;
const FILE_LIST_MAX_HEIGHT = 320;
// Drops the popover below the sync status line under the name, so the
// header still reads which file is open.
const POPOVER_OFFSET = 22;

const fileSwitcherOpeners = new Set<() => void>();

/**
 * Opens the sidebar's file switcher (⌘O, the command palette). Returns
 * false when no sidebar is mounted to show it, so the caller can fall back
 * to the file manager.
 */
export function openFileSwitcher(): boolean {
  fileSwitcherOpeners.forEach(open => open());
  return fileSwitcherOpeners.size > 0;
}

/**
 * Open state of the file switcher, answering {@link openFileSwitcher}
 * requests while mounted.
 */
export function useFileSwitcherState(
  onOpenRequest?: () => void,
): [isOpen: boolean, setIsOpen: (isOpen: boolean) => void] {
  const [isOpen, setIsOpen] = useState(false);

  const requestOpen = useEffectEvent(() => {
    onOpenRequest?.();
    setIsOpen(true);
  });

  useEffect(() => {
    const open = () => requestOpen();
    fileSwitcherOpeners.add(open);
    return () => {
      fileSwitcherOpeners.delete(open);
    };
  }, []);

  return [isOpen, setIsOpen];
}

type FileSwitcherProps = {
  triggerRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

/** The other budget files, one click away from the budget name. */
export function FileSwitcher({
  triggerRef,
  isOpen,
  onOpenChange,
}: FileSwitcherProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <Popover
      triggerRef={triggerRef}
      placement="bottom start"
      offset={POPOVER_OFFSET}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      style={{ width: FILE_SWITCHER_WIDTH, overflow: 'hidden' }}
    >
      <Dialog
        aria-label={t('Switch file')}
        style={{ outline: 'none' }}
        data-testid="file-switcher"
      >
        <Text
          style={{
            padding: '10px 16px 6px',
            fontSize: 11.5,
            fontWeight: 500,
            color: theme.menuItemTextHeader,
          }}
        >
          <Trans>Other files</Trans>
        </Text>
        <View
          style={{
            maxHeight: FILE_LIST_MAX_HEIGHT,
            overflowY: 'auto',
            // The list's quick-switch layout spaces itself for a page; the
            // popover supplies its own spacing.
            '&& > *': { marginTop: 0 },
          }}
        >
          <BudgetFileSelection quickSwitchMode showHeader={false} />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            padding: spacing.sm,
            borderTop: `1px solid ${theme.hairline}`,
          }}
        >
          <Button
            variant="bare"
            onPress={() => {
              onOpenChange(false);
              void dispatch(closeBudget());
            }}
          >
            <Trans>Close file</Trans>
          </Button>
        </View>
      </Dialog>
    </Popover>
  );
}
