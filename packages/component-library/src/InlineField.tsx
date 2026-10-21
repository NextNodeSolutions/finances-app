import type { ReactNode } from 'react';

import { css } from '@emotion/css';

import type { CSSProperties } from './styles';
import { theme } from './theme';

type InlineFieldProps = {
  label: ReactNode;
  labelWidth?: number;
  children?: ReactNode;
  width: number | string;
  style?: CSSProperties;
};

export function InlineField({
  label,
  labelWidth,
  children,
  width,
  style,
}: InlineFieldProps) {
  return (
    <label
      className={css([
        {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          margin: '8px 0',
          width,
        },
        style,
      ])}
    >
      <div
        style={{
          width: labelWidth || 75,
          flexShrink: 0,
          textAlign: 'right',
          paddingRight: 12,
          fontWeight: 500,
          color: theme.formLabelText,
        }}
      >
        {label}:
      </div>
      {children}
    </label>
  );
}
