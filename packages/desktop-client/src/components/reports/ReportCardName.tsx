import React from 'react';

import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';

import { NON_DRAGGABLE_AREA_CLASS_NAME } from './constants';

const cardTitleStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: '18px',
  fontWeight: 600,
  letterSpacing: '-0.005em',
  color: theme.pageText,
};

type ReportCardNameProps = {
  name: string;
  isEditing: boolean;
  onChange: (newName: string) => void;
  onClose: () => void;
};

export const ReportCardName = ({
  name,
  isEditing,
  onChange,
  onClose,
}: ReportCardNameProps) => {
  if (isEditing) {
    return (
      <InitialFocus>
        <Input
          className={NON_DRAGGABLE_AREA_CLASS_NAME}
          defaultValue={name}
          onEnter={onChange}
          onUpdate={onChange}
          onEscape={onClose}
          style={{
            ...cardTitleStyle,
            marginTop: -6,
            marginBottom: -1,
            marginLeft: -6,
            width: Math.max(20, name.length) + 'ch',
          }}
        />
      </InitialFocus>
    );
  }

  return (
    <h2
      style={{
        display: 'block',
        margin: 0,
        padding: 0,
        ...cardTitleStyle,
        marginBottom: 2,
      }}
    >
      {name}
    </h2>
  );
};
