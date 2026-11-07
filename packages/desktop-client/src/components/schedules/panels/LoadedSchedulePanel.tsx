import { useTranslation } from 'react-i18next';

import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import type { ScheduleStatusType } from '@actual-app/core/shared/schedules';
import type { ScheduleEntity } from '@actual-app/core/types/models';

import { SidePanel } from '#components/common/SidePanel';
import { usePayee } from '#hooks/usePayee';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { runScheduleAction } from './runScheduleAction';
import type { ScheduleItemAction } from './runScheduleAction';
import { ScheduleAmountHeadline } from './ScheduleAmountHeadline';
import { ScheduleDetails } from './ScheduleDetails';
import { ScheduleNextDates } from './ScheduleNextDates';
import { SchedulePanelActions } from './SchedulePanelActions';
import { SCHEDULE_PANEL_TEST_ID } from './schedulePanelTestId';
import { ScheduleRecentTransactions } from './ScheduleRecentTransactions';
import { useRecurrenceDescription } from './useRecurrenceDescription';

type LoadedSchedulePanelProps = {
  schedule: ScheduleEntity;
  status: ScheduleStatusType | undefined;
  onClose: () => void;
};

/** The schedule panel once its schedule has loaded. */
export function LoadedSchedulePanel({
  schedule,
  status,
  onClose,
}: LoadedSchedulePanelProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { data: payee } = usePayee(schedule._payee);
  const recurrence = useRecurrenceDescription(schedule._date);

  const onAction = (action: ScheduleItemAction) => {
    if (action === 'delete') {
      onClose();
    }
    void runScheduleAction(action, schedule.id);
  };

  const onEdit = () => {
    dispatch(
      pushModal({
        modal: { name: 'schedule-edit', options: { id: schedule.id } },
      }),
    );
  };

  return (
    <SidePanel
      title={schedule.name || payee?.name || t('Schedule')}
      subtitle={recurrence}
      headline={
        <ScheduleAmountHeadline
          amount={schedule._amount}
          op={schedule._amountOp}
        />
      }
      footer={
        <SchedulePanelActions
          status={status}
          onAction={onAction}
          onEdit={onEdit}
        />
      }
      onClose={onClose}
      testId={SCHEDULE_PANEL_TEST_ID}
    >
      <ScheduleDetails schedule={schedule} status={status} />
      <View style={{ gap: spacing.lg }}>
        <ScheduleNextDates date={schedule._date} />
        <ScheduleRecentTransactions scheduleId={schedule.id} />
      </View>
    </SidePanel>
  );
}
