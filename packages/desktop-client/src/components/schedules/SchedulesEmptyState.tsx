import { Trans } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

type SchedulesEmptyStateProps = {
  onAdd: () => void;
  onDiscover: () => void;
};

/** A budget with no schedules: what they are for, and the two ways in. */
export function SchedulesEmptyState({
  onAdd,
  onDiscover,
}: SchedulesEmptyStateProps) {
  return (
    <View
      style={{
        ...styles.tableContainer,
        flex: '0 0 auto',
        alignItems: 'flex-start',
        gap: spacing.lg,
        padding: spacing.xl,
      }}
    >
      <Text style={{ fontSize: 13, lineHeight: '20px', color: theme.pageText }}>
        <Trans>
          No schedules yet. Schedules keep recurring bills visible before they
          arrive.
        </Trans>
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Button variant="primary" onPress={onAdd}>
          <Trans>Add new schedule</Trans>
        </Button>
        <Button onPress={onDiscover}>
          <Trans>Find schedules</Trans>
        </Button>
      </View>
    </View>
  );
}
