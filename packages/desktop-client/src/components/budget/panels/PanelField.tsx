import type { ReactNode } from 'react';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type PanelFieldProps = {
  /** A short mono label such as FROM, TO, AMOUNT or AFTER. */
  label: ReactNode;
  children: ReactNode;
};

const LABEL_WIDTH = 64;
const FIELD_MIN_HEIGHT = 32;

/** One labelled line of a money form inside a side panel. */
export function PanelField({ label, children }: PanelFieldProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: FIELD_MIN_HEIGHT,
      }}
    >
      <Text
        style={{
          ...styles.monoLabel,
          width: LABEL_WIDTH,
          flexShrink: 0,
          color: theme.pageTextSubdued,
        }}
      >
        {label}
      </Text>
      <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
    </View>
  );
}
