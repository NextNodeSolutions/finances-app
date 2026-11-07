import { useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { SvgPencil1 } from '@actual-app/components/icons/v2';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { motion, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { AccountEntity } from '@actual-app/core/types/models';

import { NotesButton } from '#components/NotesButton';

const titleStyle = {
  ...styles.display,
  fontSize: 28,
  lineHeight: '34px',
  color: theme.pageText,
};

export type AccountNameFieldProps = {
  account?: AccountEntity;
  accountName: string;
  isNameEditable: boolean;
  saveNameError?: ReactNode;
  /** Shown right after the name, before its hover-only buttons. */
  trailing?: ReactNode;
  onSaveName: (newName: string) => void;
};

/** The register title; editable in place for a single account. */
export function AccountNameField({
  account,
  accountName,
  isNameEditable,
  saveNameError,
  trailing,
  onSaveName,
}: AccountNameFieldProps) {
  const { t } = useTranslation();
  const [isEditingName, setIsEditingName] = useState(false);

  const handleSave = (newName: string) => {
    onSaveName(newName);
    setIsEditingName(false);
  };

  if (isEditingName) {
    return (
      <View style={{ flexShrink: 0 }}>
        <InitialFocus>
          <Input
            defaultValue={accountName}
            onEnter={handleSave}
            onUpdate={handleSave}
            onEscape={() => setIsEditingName(false)}
            style={{
              ...titleStyle,
              marginTop: -3,
              marginBottom: -3,
              marginLeft: -9,
              paddingTop: 1,
              paddingBottom: 1,
              paddingLeft: 8,
              paddingRight: 8,
              borderRadius: radius.md,
              width: Math.max(20, accountName.length) + 'ch',
            }}
          />
        </InitialFocus>
        {saveNameError && (
          <View style={{ color: theme.warningText }}>{saveNameError}</View>
        )}
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        minWidth: 0,
        gap: 3,
        '& .hover-visible': {
          opacity: 0,
          transition: `opacity ${motion.base} ${motion.ease}`,
        },
        '&:hover .hover-visible, & .hover-visible[data-focus-visible]': {
          opacity: 1,
        },
      }}
    >
      <View
        style={{ ...titleStyle, ...styles.ellipsisText, marginRight: 6 }}
        data-testid="account-name"
      >
        {accountName}
      </View>
      {trailing}
      {isNameEditable && account && (
        <NotesButton
          id={`account-${account.id}`}
          defaultColor={theme.pageTextSubdued}
        />
      )}
      {isNameEditable && (
        <Button
          variant="bare"
          aria-label={t('Edit account name')}
          className="hover-visible"
          onPress={() => setIsEditingName(true)}
        >
          <SvgPencil1
            style={{ width: 11, height: 11, color: theme.pageTextSubdued }}
          />
        </Button>
      )}
    </View>
  );
}
