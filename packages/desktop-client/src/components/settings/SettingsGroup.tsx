import type { ReactNode } from 'react';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { elevation, radius, spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

// Headings of the settings and management sections: Inter 15/20 at 600.
export const sectionHeadingStyle = {
  ...styles.mediumText,
  lineHeight: '20px',
  fontWeight: 600,
  letterSpacing: '-0.005em',
  color: theme.pageText,
};

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
      <View style={{ gap: spacing.xs, paddingInline: spacing.xxs }}>
        <h2 style={{ ...sectionHeadingStyle, margin: 0 }}>{title}</h2>
        {description && (
          <Text
            style={{
              ...styles.smallText,
              lineHeight: '18px',
              color: theme.settingsCardTextSubdued,
            }}
          >
            {description}
          </Text>
        )}
      </View>
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
