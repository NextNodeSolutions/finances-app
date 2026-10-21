import React, { useCallback, useEffect, useState } from 'react';

import { Button } from '@actual-app/components/button';
import { SvgPencil1 } from '@actual-app/components/icons/v2';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { motion, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type EditablePageHeaderTitleProps = {
  title: string;
  onSave: (newValue: string) => void;
};

export function EditablePageHeaderTitle({
  title: initialTitle,
  onSave,
}: EditablePageHeaderTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => setTitle(initialTitle), [initialTitle]);

  const onSaveValue = useCallback(
    (newValue: string) => {
      onSave(newValue);
      setTitle(newValue);
      setIsEditing(false);
    },
    [onSave],
  );

  if (isEditing) {
    return (
      <InitialFocus>
        <Input
          defaultValue={title}
          onEnter={onSaveValue}
          onUpdate={onSaveValue}
          onEscape={() => setIsEditing(false)}
          style={{
            ...styles.display,
            fontSize: 28,
            lineHeight: '34px',
            marginTop: -3,
            marginBottom: -3,
            marginLeft: -9,
            paddingTop: 1,
            paddingBottom: 1,
            width: Math.max(20, title.length) + 'ch',
          }}
        />
      </InitialFocus>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        '& .hover-visible': {
          opacity: 0,
          transition: `opacity ${motion.base} ${motion.ease}`,
        },
        '&:hover .hover-visible, & .hover-visible[data-focus-visible]': {
          opacity: 1,
        },
      }}
    >
      {title}

      <Button
        variant="bare"
        className="hover-visible"
        style={{ width: 26, height: 26, padding: 0, borderRadius: radius.md }}
        onPress={() => setIsEditing(true)}
      >
        <SvgPencil1
          style={{
            width: 12,
            height: 12,
            color: theme.pageTextLight,
          }}
        />
      </Button>
    </View>
  );
}
