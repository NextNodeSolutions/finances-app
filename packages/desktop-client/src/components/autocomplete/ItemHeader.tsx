import React from 'react';
import type { CSSProperties } from 'react';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';

type ItemHeaderProps = {
  title: string;
  style?: CSSProperties;
  type?: string;
};

export function ItemHeader({ title, style, type, ...props }: ItemHeaderProps) {
  const { isNarrowWidth } = useResponsive();
  const sizeStyle = isNarrowWidth
    ? {
        ...styles.largeText,
        padding: '10px 9px',
      }
    : {
        fontSize: 11.5,
        fontWeight: 500,
        lineHeight: '14px',
        padding: '8px 10px 4px',
      };

  return (
    <div
      style={{
        color: theme.menuAutoCompleteTextHeader,
        ...sizeStyle,
        ...style,
      }}
      data-testid={`${title}-${type}-item-group`}
      {...props}
    >
      {title}
    </div>
  );
}
