import React from 'react';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';

type SubLabelProps = {
  title: string;
};

export function SubLabel({ title }: SubLabelProps) {
  return (
    <Text
      style={{
        marginBottom: spacing.xs,
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 500,
        color: theme.formLabelText,
      }}
    >
      {title}
    </Text>
  );
}
