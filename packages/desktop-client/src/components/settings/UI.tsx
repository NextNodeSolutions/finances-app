import React from 'react';
import type { ReactNode } from 'react';

import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { elevation, radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { css } from '@emotion/css';

type SettingProps = {
  primaryAction?: ReactNode;
  style?: CSSProperties;
  children: ReactNode;
};

export const Setting = ({ primaryAction, style, children }: SettingProps) => {
  return (
    <View
      className={css([
        {
          backgroundColor: theme.settingsCardBackground,
          alignSelf: 'flex-start',
          alignItems: 'flex-start',
          padding: `${spacing.lg}px ${spacing.lg + spacing.xs}px`,
          borderRadius: radius.lg,
          border: '1px solid ' + theme.settingsCardBorder,
          boxShadow: elevation.card,
          color: theme.settingsCardText,
          width: '100%',
        },
        style,
      ])}
    >
      <View
        style={{
          marginBottom: primaryAction ? spacing.md : 0,
          lineHeight: 1.5,
          gap: spacing.sm,
        }}
      >
        {children}
      </View>
      {primaryAction || null}
    </View>
  );
};
