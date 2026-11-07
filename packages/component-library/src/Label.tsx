import { forwardRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { styles } from './styles';
import { Text } from './Text';
import { theme } from './theme';

type LabelProps = {
  title: ReactNode;
  style?: CSSProperties;
};

export const Label = forwardRef<HTMLSpanElement, LabelProps>(
  ({ title, style }: LabelProps, ref) => {
    return (
      <Text
        ref={ref}
        style={{
          ...styles.text,
          color: theme.formLabelText,
          textAlign: 'right',
          fontSize: 13,
          fontWeight: 500,
          lineHeight: '18px',
          marginBottom: 4,
          ...style,
        }}
      >
        {title}
      </Text>
    );
  },
);

Label.displayName = 'Label';
