import { ModeButton, ModeButtonGroup } from '#ModeButton';

import type { DateRangeGranularity } from './util';

const segmentStyle = { fontSize: 12, padding: '3px 12px' };

type GranularityToggleProps = {
  value: DateRangeGranularity;
  monthLabel: string;
  dayLabel: string;
  onChange: (value: DateRangeGranularity) => void;
};

export function GranularityToggle({
  value,
  monthLabel,
  dayLabel,
  onChange,
}: GranularityToggleProps) {
  return (
    <ModeButtonGroup>
      <ModeButton
        selected={value === 'month'}
        onSelect={() => onChange('month')}
        style={segmentStyle}
      >
        {monthLabel}
      </ModeButton>
      <ModeButton
        selected={value === 'day'}
        onSelect={() => onChange('day')}
        style={segmentStyle}
      >
        {dayLabel}
      </ModeButton>
    </ModeButtonGroup>
  );
}
