import type { ReactNode } from 'react';

import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type ScheduleDetailRowProps = {
  label: ReactNode;
  /** The value; a dash stands in when there is none. */
  children?: ReactNode;
};

/** A label and its value on one line of the schedule panel. */
export function ScheduleDetailRow({ label, children }: ScheduleDetailRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
        minHeight: 30,
      }}
    >
      <Text
        style={{ flexShrink: 0, fontSize: 12.5, color: theme.pageTextSubdued }}
      >
        {label}
      </Text>
      <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-end' }}>
        {children ?? <Text style={{ color: theme.pageTextSubdued }}>—</Text>}
      </View>
    </View>
  );
}
