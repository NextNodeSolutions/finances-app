import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgTime } from '@actual-app/components/icons/v1';
import { SvgPencil1 } from '@actual-app/components/icons/v2';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { motion, radius, spacing } from '@actual-app/components/tokens';
import { Tooltip } from '@actual-app/components/tooltip';
import { View } from '@actual-app/components/view';
import { isElectron } from '@actual-app/core/shared/environment';
import { css, cx } from '@emotion/css';

import { useMetadataPref } from '#hooks/useMetadataPref';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

type SidebarBudgetNameProps = {
  isEditing: boolean;
  onEditingChange: (isEditing: boolean) => void;
};

export function SidebarBudgetName({
  isEditing,
  onEditingChange,
}: SidebarBudgetNameProps) {
  const { t } = useTranslation();
  const [budgetName, setBudgetNamePref] = useMetadataPref('budgetName');
  const dispatch = useDispatch();

  const iconButtonClassName = cx(
    'hover-visible',
    css({
      width: 20,
      height: 20,
      padding: 0,
      borderRadius: radius.sm,
      backgroundColor: 'transparent',
      color: theme.sidebarTextMuted,
      transition: `opacity ${motion.base} ${motion.ease}, background-color ${motion.base} ${motion.ease}`,
      '&[data-hovered], &[data-focus-visible]': {
        backgroundColor: theme.sidebarItemBackgroundHover,
        color: theme.sidebarItemTextSelected,
      },
    }),
  );

  function saveBudgetName(newBudgetName: string) {
    if (newBudgetName.trim() !== '' && newBudgetName !== budgetName) {
      setBudgetNamePref(newBudgetName);
    }
    onEditingChange(false);
  }

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xxs,
          minWidth: 0,
          visibility: isEditing ? 'hidden' : undefined,
          '& .hover-visible': {
            opacity: 0,
          },
          '&:hover .hover-visible, & .hover-visible[data-focus-visible]': {
            opacity: 1,
          },
        }}
      >
        <Text
          data-testid="budget-name"
          style={{
            ...styles.display,
            color: theme.sidebarHeaderText,
            fontSize: 17,
            lineHeight: '21px',
            ...styles.ellipsisText,
          }}
        >
          {budgetName || t('Unnamed')}
        </Text>
        <Button
          variant="bare"
          className={iconButtonClassName}
          aria-label={t('Rename budget')}
          onPress={() => onEditingChange(true)}
        >
          <SvgPencil1 width={10} height={10} />
        </Button>
        {isElectron() && (
          <Tooltip
            content={t('Load Backup…')}
            placement="bottom start"
            style={styles.tooltip}
            triggerProps={{ delay: 500 }}
          >
            <Button
              variant="bare"
              className={iconButtonClassName}
              aria-label={t('Load Backup…')}
              onPress={() =>
                dispatch(
                  pushModal({ modal: { name: 'load-backup', options: {} } }),
                )
              }
            >
              <SvgTime width={10} height={10} />
            </Button>
          </Tooltip>
        )}
      </View>
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
