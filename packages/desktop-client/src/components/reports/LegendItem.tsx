import React from 'react';
import type { CSSProperties } from 'react';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

export function LegendItem({
  color,
  label,
  style,
}: {
  color: string;
  label: string;
  style?: CSSProperties;
}) {
  return (
    <View
      style={{
        paddingTop: 5,
        paddingBottom: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        ...style,
      }}
    >
      <View
        style={{
          borderRadius: 2,
          width: 8,
          height: 8,
          flexShrink: 0,
          backgroundColor: color,
        }}
      />
      <Text
        style={{
          fontSize: 12.5,
          lineHeight: '18px',
          color: theme.pageTextLight,
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          flexShrink: 0,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
