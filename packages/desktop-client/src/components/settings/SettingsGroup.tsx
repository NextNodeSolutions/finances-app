import type { ReactNode } from 'react';

import { theme } from '@actual-app/components/theme';
import { elevation, radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { SettingsGroupHeading } from './SettingsGroupHeading';

export { sectionHeadingStyle } from './SettingsGroupHeading';

type SettingsGroupProps = {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
};

export function SettingsGroup({
  title,
  description,
  children,
}: SettingsGroupProps) {
  return (
    <View style={{ flexShrink: 0, gap: spacing.md }}>
      <SettingsGroupHeading title={title} description={description} />
      <View
        style={{
          color: theme.settingsCardText,
          backgroundColor: theme.settingsCardBackground,
          border: `1px solid ${theme.settingsCardBorder}`,
          borderRadius: radius.lg,
          boxShadow: elevation.card,
          '&& > * + *': {
            borderTop: `1px solid ${theme.hairlineSubtle}`,
          },
        }}
      >
        {children}
      </View>
    </View>
  );
}
