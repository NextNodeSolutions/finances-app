import React, { useMemo, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Trans, useTranslation } from 'react-i18next';

import { Button } from '@actual-app/components/button';
import { theme } from '@actual-app/components/theme';
import { spacing } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import { q } from '@actual-app/core/shared/query';

import { Search } from '#components/common/Search';
import { FeatureErrorFallback } from '#components/FeatureErrorFallback';
import { useSchedules } from '#hooks/useSchedules';
import { pushModal } from '#modals/modalsSlice';
import { useDispatch } from '#redux';

import { getScheduleCommitments } from './getScheduleCommitments';
import { runScheduleAction } from './panels/runScheduleAction';
import { useSchedulePanel } from './panels/useSchedulePanel';
import { ScheduleCommitmentStrip } from './ScheduleCommitmentStrip';
import { SchedulesEmptyState } from './SchedulesEmptyState';
import { SchedulesTable } from './SchedulesTable';
import { filterSchedulesByStatus } from './scheduleStatusFilter';
import type { ScheduleStatusFilter } from './scheduleStatusFilter';
import { ScheduleStatusFilterControl } from './ScheduleStatusFilterControl';

const toolbarRowStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  flexShrink: 0,
  gap: spacing.md,
} as const;

export function Schedules() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const schedulePanel = useSchedulePanel();
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ScheduleStatusFilter>('all');

  const onAdd = () => {
    dispatch(pushModal({ modal: { name: 'schedule-edit', options: {} } }));
  };
  const onDiscover = () => {
    dispatch(pushModal({ modal: { name: 'schedules-discover' } }));
  };
  const onChangeUpcomingLength = () => {
    dispatch(pushModal({ modal: { name: 'schedules-upcoming-length' } }));
  };

  // useSchedules re-subscribes whenever the query identity changes.
  const schedulesQuery = useMemo(() => q('schedules').select('*'), []);
  const { isLoading, schedules, statuses } = useSchedules({
    query: schedulesQuery,
  });
  const { committed, missedCount } = getScheduleCommitments(
    schedules,
    statuses,
  );
  const visibleSchedules = filterSchedulesByStatus(
    schedules,
    statuses,
    statusFilter,
  );
  const hasNoSchedules = !isLoading && schedules.length === 0;

  return (
    <ErrorBoundary FallbackComponent={FeatureErrorFallback}>
      <View
        style={{
          flex: 1,
          minHeight: 0,
          gap: spacing.lg,
          paddingBottom: spacing.xl,
        }}
      >
        <View style={toolbarRowStyle}>
          <ScheduleCommitmentStrip
            committed={committed}
            missedCount={missedCount}
          />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button onPress={onChangeUpcomingLength}>
              <Trans>Change upcoming length</Trans>
            </Button>
            {!hasNoSchedules && (
              <>
                <Button onPress={onDiscover}>
                  <Trans>Find schedules</Trans>
                </Button>
                <Button variant="primary" onPress={onAdd}>
                  <Trans>Add new schedule</Trans>
                </Button>
              </>
            )}
          </View>
        </View>

        {hasNoSchedules ? (
          <SchedulesEmptyState onAdd={onAdd} onDiscover={onDiscover} />
        ) : (
          <>
            <View style={toolbarRowStyle}>
              <ScheduleStatusFilterControl
                value={statusFilter}
                onChange={setStatusFilter}
              />
              <Search
                placeholder={t('Filter schedules…')}
                value={filter}
                onChange={setFilter}
              />
            </View>
            <SchedulesTable
              isLoading={isLoading}
              schedules={visibleSchedules}
              filter={filter}
              statuses={statuses}
              allowCompleted
              selectedId={schedulePanel.openScheduleId}
              emptyMessage={t('No schedules match.')}
              onSelect={schedulePanel.open}
              onAction={(action, id) => void runScheduleAction(action, id)}
              style={{ backgroundColor: theme.tableBackground }}
              // The card hugs its rows and only scrolls once they outgrow the page.
              tableStyle={{ flex: '0 1 auto' }}
            />
          </>
        )}
      </View>
    </ErrorBoundary>
  );
}
