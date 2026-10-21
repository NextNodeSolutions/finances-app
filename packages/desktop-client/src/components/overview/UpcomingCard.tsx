import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { getUpcomingDays } from '@actual-app/core/shared/schedules';

import { SchedulesProvider } from '#hooks/useCachedSchedules';
import { useNavigate } from '#hooks/useNavigate';
import { getSchedulesQuery } from '#hooks/useSchedules';
import { useSyncedPref } from '#hooks/useSyncedPref';

import { CardAction } from './CardAction';
import { OverviewCard } from './OverviewCard';
import { UpcomingList } from './UpcomingList';

/**
 * What is about to leave the accounts: scheduled transactions due within
 * the upcoming window set in Schedules (7 days by default).
 */
export function UpcomingCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [upcomingLength] = useSyncedPref('upcomingScheduledTransactionLength');
  const days = getUpcomingDays(upcomingLength);
  // The provider subscribes to its query, so it must keep one identity.
  const [schedulesQuery] = useState(() => getSchedulesQuery());

  return (
    <OverviewCard
      title={
        days === 1
          ? t('Coming up · 1 day')
          : t('Coming up · {{count}} days', { count: days })
      }
      testId="overview-upcoming"
      action={
        <CardAction onPress={() => navigate('/schedules')}>
          <Trans>Schedule</Trans>
        </CardAction>
      }
    >
      <SchedulesProvider query={schedulesQuery}>
        <UpcomingList />
      </SchedulesProvider>
    </OverviewCard>
  );
}
