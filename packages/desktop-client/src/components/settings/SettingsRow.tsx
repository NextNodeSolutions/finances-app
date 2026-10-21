import type { ReactNode } from 'react';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

// A touch more air than the table rows: settings read as a statement, not
// a grid.
const ROW_PADDING = `${spacing.md + spacing.xxs}px ${spacing.lg + spacing.xs}px`;

type SettingsRowProps = {
  title: ReactNode;
  description?: ReactNode;
  control?: ReactNode;
  htmlFor?: string;
  isNested?: boolean;
  children?: ReactNode;
};

export function SettingsRow({
  title,
  description,
  control,
  htmlFor,
  isNested = false,
  children,
}: SettingsRowProps) {
  const titleStyle = {
    ...styles.smallText,
    lineHeight: '18px',
    fontWeight: 500,
    color: theme.settingsCardText,
  };

  return (
    <View
      style={{
        flexShrink: 0,
        gap: spacing.md,
        padding: isNested ? `0 0 0 ${spacing.lg}px` : ROW_PADDING,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: `${spacing.sm}px ${spacing.lg}px`,
        }}
      >
        <View style={{ flex: '1 1 160px', minWidth: 0, gap: spacing.xxs }}>
          {htmlFor != null ? (
            <label htmlFor={htmlFor} style={titleStyle}>
              {title}
            </label>
          ) : (
            <Text style={titleStyle}>{title}</Text>
          )}
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
        {control != null && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexShrink: 0,
              maxWidth: '100%',
            }}
          >
            {control}
          </View>
        )}
      </View>
      {children}
    </View>
  );
}
