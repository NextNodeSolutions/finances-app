import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgCheveronDown } from '@actual-app/components/icons/v1';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { motion, radius, spacing } from '@actual-app/components/tokens';
import { isElectron } from '@actual-app/core/shared/environment';
import { css } from '@emotion/css';

import { useContextMenu } from '#hooks/useContextMenu';
import { useMetadataPref } from '#hooks/useMetadataPref';
import { useNavigate } from '#hooks/useNavigate';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { FileSwitcher, useFileSwitcherState } from './FileSwitcher';

type SidebarBudgetNameProps = {
  isEditing: boolean;
  onEditingChange: (isEditing: boolean) => void;
  /** Called before the file switcher opens on request (⌘O, the palette). */
  onFileSwitcherRequest?: () => void;
};

/**
 * The budget's name: a click opens the file switcher, a right-click the
 * file's menu (rename, settings, backups).
 */
export function SidebarBudgetName({
  isEditing,
  onEditingChange,
  onFileSwitcherRequest,
}: SidebarBudgetNameProps) {
  const { t } = useTranslation();
  const [budgetName, setBudgetNamePref] = useMetadataPref('budgetName');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useFileSwitcherState(
    onFileSwitcherRequest,
  );

  useContextMenu({
    triggerRef,
    items: [
      {
        name: 'rename',
        text: t('Rename budget'),
        onClick: () => onEditingChange(true),
      },
      {
        name: 'settings',
        text: t('Settings'),
        onClick: () => void navigate('/settings'),
      },
      isElectron() && {
        name: 'loadBackup',
        text: t('Load Backup…'),
        onClick: () =>
          dispatch(pushModal({ modal: { name: 'load-backup', options: {} } })),
      },
      {
        name: 'close',
        text: t('Switch file'),
        onClick: () => setIsSwitcherOpen(true),
      },
    ],
  });

  function saveBudgetName(newBudgetName: string) {
    if (newBudgetName.trim() !== '' && newBudgetName !== budgetName) {
      setBudgetNamePref(newBudgetName);
    }
    onEditingChange(false);
  }

  return (
    <>
      <Button
        ref={triggerRef}
        variant="bare"
        data-testid="budget-name"
        aria-haspopup="dialog"
        aria-expanded={isSwitcherOpen}
        onPress={() => setIsSwitcherOpen(!isSwitcherOpen)}
        className={css({
          justifyContent: 'flex-start',
          gap: spacing.xs,
          maxWidth: '100%',
          padding: '1px 4px',
          marginLeft: -4,
          borderRadius: radius.sm,
          backgroundColor: 'transparent',
          color: theme.sidebarHeaderText,
          visibility: isEditing ? 'hidden' : undefined,
          transition: `background-color ${motion.base} ${motion.ease}`,
          '&[data-hovered], &[data-pressed]': {
            backgroundColor: theme.sidebarItemBackgroundHover,
          },
          '&[data-focus-visible]': {
            outline: `2px solid ${theme.focusRing}`,
            outlineOffset: 1,
          },
        })}
      >
        <Text
          style={{
            ...styles.display,
            ...styles.ellipsisText,
            fontSize: 18,
            lineHeight: '22px',
          }}
        >
          {budgetName || t('Unnamed')}
        </Text>
        <SvgCheveronDown
          aria-hidden
          width={10}
          height={10}
          style={{ flexShrink: 0, color: theme.sidebarTextMuted }}
        />
      </Button>
      <FileSwitcher
        triggerRef={triggerRef}
        isOpen={isSwitcherOpen}
        onOpenChange={setIsSwitcherOpen}
      />
      {isEditing && (
        <InitialFocus>
          <Input
            aria-label={t('Budget name')}
            size="medium"
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              width: '100%',
              transform: 'translateY(-50%)',
              ...styles.display,
              fontSize: 15,
            }}
            defaultValue={budgetName}
            onEnter={saveBudgetName}
            onUpdate={saveBudgetName}
            onEscape={() => onEditingChange(false)}
          />
        </InitialFocus>
      )}
    </>
  );
}
