import type { ReactNode } from 'react';

import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';

type ScheduleDetailLinkProps = {
  ariaLabel: string;
  onPress: () => void;
  children: ReactNode;
};

/** A value in the schedule panel that leads to its own page or panel. */
export function ScheduleDetailLink({
  ariaLabel,
  onPress,
  children,
}: ScheduleDetailLinkProps) {
  return (
    <Button
      variant="bare"
      aria-label={ariaLabel}
      onPress={onPress}
      style={{
        maxWidth: '100%',
        padding: '3px 6px',
        marginRight: -6,
        color: theme.pageTextLink,
        fontWeight: 500,
      }}
    >
      <Text style={styles.ellipsisText}>{children}</Text>
    </Button>
  );
}
