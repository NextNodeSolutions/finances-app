import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { q } from '@actual-app/core/shared/query';
import type { ScheduleEntity } from '@actual-app/core/types/models';

import { useSchedulePanel } from '#components/schedules/panels/useSchedulePanel';
import { useQuery } from '#hooks/useQuery';

import { PanelField } from './PanelField';

type TransactionScheduleFieldProps = {
  scheduleId: ScheduleEntity['id'] | undefined;
  onLinkSchedule: () => void;
};

/** The schedule a transaction belongs to, or a way to link one. */
export function TransactionScheduleField({
  scheduleId,
  onLinkSchedule,
}: TransactionScheduleFieldProps) {
  const { t } = useTranslation();
  const schedulePanel = useSchedulePanel();
  const { data: schedules } = useQuery<Pick<ScheduleEntity, 'id' | 'name'>>(
    () =>
      scheduleId
        ? q('schedules').filter({ id: scheduleId }).select(['id', 'name'])
        : null,
    [scheduleId],
  );
  const scheduleName = schedules?.[0]?.name;

  return (
    <PanelField label={t('Schedule')}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
      >
        <Text
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            color: scheduleId ? theme.pageText : theme.pageTextSubdued,
          }}
        >
          {scheduleId ? scheduleName || t('Unnamed schedule') : '—'}
        </Text>
        {scheduleId ? (
          <Button variant="bare" onPress={() => schedulePanel.open(scheduleId)}>
            <Trans>View schedule</Trans>
          </Button>
        ) : (
          <Button variant="bare" onPress={onLinkSchedule}>
            <Trans>Link schedule</Trans>
          </Button>
        )}
      </View>
    </PanelField>
  );
}
