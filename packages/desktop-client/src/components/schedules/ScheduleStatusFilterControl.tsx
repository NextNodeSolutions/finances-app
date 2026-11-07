import { useTranslation } from 'react-i18next';

import {
  ModeButton,
  ModeButtonGroup,
} from '@actual-app/components/mode-button';

import { SCHEDULE_STATUS_FILTERS } from './scheduleStatusFilter';
import type { ScheduleStatusFilter } from './scheduleStatusFilter';

type ScheduleStatusFilterControlProps = {
  value: ScheduleStatusFilter;
  onChange: (value: ScheduleStatusFilter) => void;
};

/** Segmented control: All | Upcoming | Missed | Completed. */
export function ScheduleStatusFilterControl({
  value,
  onChange,
}: ScheduleStatusFilterControlProps) {
  const { t } = useTranslation();
  const labels: Record<ScheduleStatusFilter, string> = {
    all: t('All'),
    upcoming: t('Upcoming'),
    missed: t('Missed'),
    completed: t('Completed'),
  };

  return (
    <ModeButtonGroup>
      {SCHEDULE_STATUS_FILTERS.map(filter => (
        <ModeButton
          key={filter}
          selected={value === filter}
          onSelect={() => onChange(filter)}
        >
          {labels[filter]}
        </ModeButton>
      ))}
    </ModeButtonGroup>
  );
}
