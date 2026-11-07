import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { ScheduleEntity } from '@actual-app/core/types/models';

import { SidePanel } from '#components/common/SidePanel';
import { usePanels } from '#components/panels/PanelProvider';

import { LoadedSchedulePanel } from './LoadedSchedulePanel';
import { SCHEDULE_PANEL_TEST_ID } from './schedulePanelTestId';
import { useSchedule } from './useSchedule';

type SchedulePanelProps = {
  id: ScheduleEntity['id'];
};

/**
 * A schedule's details beside the schedules page (or any page): amount,
 * recurrence, next dates and linked transactions, with its actions.
 */
export function SchedulePanel({ id }: SchedulePanelProps) {
  const { t } = useTranslation();
  const { close } = usePanels();
  const result = useSchedule(id);

  if (result.state === 'loading') {
    return (
      <SidePanel
        title={t('Schedule')}
        onClose={close}
        testId={SCHEDULE_PANEL_TEST_ID}
      >
        <View aria-busy style={{ gap: spacing.sm }}>
          {[70, 45, 85].map(width => (
            <View
              key={width}
              style={{
                height: 18,
                width: `${width}%`,
                borderRadius: 4,
                backgroundColor: theme.tableRowBackgroundHover,
              }}
            />
          ))}
        </View>
      </SidePanel>
    );
  }

  if (result.state === 'missing') {
    return (
      <SidePanel
        title={t('Schedule')}
        onClose={close}
        testId={SCHEDULE_PANEL_TEST_ID}
        footer={
          <Button onPress={close}>
            <Trans>Close</Trans>
          </Button>
        }
      >
        <Text style={{ color: theme.pageTextSubdued }}>
          <Trans>This schedule no longer exists.</Trans>
        </Text>
      </SidePanel>
    );
  }

  return (
    <LoadedSchedulePanel
      schedule={result.schedule}
      status={result.status}
      onClose={close}
    />
  );
}
