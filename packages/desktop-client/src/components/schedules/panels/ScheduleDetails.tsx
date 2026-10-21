import { Trans, useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import type { ScheduleStatusType } from '@actual-app/core/shared/schedules';
import type { ScheduleEntity } from '@actual-app/core/types/models';

import { usePayeePanel } from '#components/payees/panels/usePayeePanel';
import { StatusBadge } from '#components/schedules/StatusBadge';
import { useAccount } from '#hooks/useAccount';
import { useDateFormat } from '#hooks/useDateFormat';
import { useNavigate } from '#hooks/useNavigate';
import { usePayee } from '#hooks/usePayee';

import { ScheduleDetailLink } from './ScheduleDetailLink';
import { ScheduleDetailRow } from './ScheduleDetailRow';

type ScheduleDetailsProps = {
  schedule: ScheduleEntity;
  status: ScheduleStatusType | undefined;
};

/** Payee and account (each a way in), next date and status. */
export function ScheduleDetails({ schedule, status }: ScheduleDetailsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const payeePanel = usePayeePanel();
  const dateFormat = useDateFormat() || 'MM/dd/yyyy';
  const { data: payee } = usePayee(schedule._payee);
  const account = useAccount(schedule._account);

  return (
    <View style={{ gap: spacing.xs, paddingBottom: spacing.lg }}>
      <ScheduleDetailRow label={<Trans>Payee</Trans>}>
        {payee && (
          <ScheduleDetailLink
            ariaLabel={t('Open payee {{name}}', { name: payee.name })}
            onPress={() => payeePanel.open(payee.id)}
          >
            {payee.name}
          </ScheduleDetailLink>
        )}
      </ScheduleDetailRow>
      <ScheduleDetailRow label={<Trans>Account</Trans>}>
        {account && (
          <ScheduleDetailLink
            ariaLabel={t('Open account {{name}}', { name: account.name })}
            onPress={() => void navigate(`/accounts/${account.id}`)}
          >
            {account.name}
          </ScheduleDetailLink>
        )}
      </ScheduleDetailRow>
      <ScheduleDetailRow label={<Trans>Next date</Trans>}>
        {schedule.next_date && (
          <Text style={styles.tnum}>
            {monthUtils.format(schedule.next_date, dateFormat)}
          </Text>
        )}
      </ScheduleDetailRow>
      <ScheduleDetailRow label={<Trans>Status</Trans>}>
        {status && <StatusBadge status={status} />}
      </ScheduleDetailRow>
    </View>
  );
}
