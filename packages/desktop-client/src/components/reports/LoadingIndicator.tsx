import React from 'react';

import { Block } from '@actual-app/components/block';
import { AnimatedLoading } from '@actual-app/components/icons/AnimatedLoading';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

type LoadingIndicatorProps = {
  message?: string;
};

export const LoadingIndicator = ({ message }: LoadingIndicatorProps) => {
  return (
    <View
      style={{
        flex: 1,
        gap: 16,
        justifyContent: 'center',
        alignItems: 'center',
        ...styles.delayedFadeIn,
      }}
    >
      {message && (
        <Block
          style={{
            ...styles.display,
            fontSize: 20,
            fontWeight: 300,
            color: theme.pageTextLight,
          }}
        >
          {message}
        </Block>
      )}
      <AnimatedLoading
        style={{ width: 18, height: 18, color: theme.pageTextSubdued }}
      />
    </View>
  );
};
