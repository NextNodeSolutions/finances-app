import type { ReactNode } from 'react';

import { Button } from '#Button';
import { theme } from '#theme';
import { radius } from '#tokens';

import type { RangePosition } from './util';

type GridButtonProps = {
  selected: boolean;
  disabled: boolean;
  /** Marks the current month/day so it stands out even when not selected. */
  isToday?: boolean;
  /** Where the cell falls in the range band (or the hover preview). */
  position?: RangePosition;
  /** Full accessible name (e.g. the complete localized date). */
  label: string;
  onSelect: () => void;
  /** Called on pointer-enter to preview the range band. */
  onHover?: () => void;
  children: ReactNode;
};

export function GridButton({
  selected,
  disabled,
  isToday = false,
  position = null,
  label,
  onSelect,
  onHover,
  children,
}: GridButtonProps) {
  const inRange = position != null;
  const rangeEdge = position === 'middle' || position == null ? null : position;
  return (
    <Button
      variant={selected ? 'primary' : 'bare'}
      isDisabled={disabled}
      aria-label={label}
      aria-pressed={selected}
      onPress={onSelect}
      onHoverStart={onHover}
      style={{
        padding: '7px 4px',
        fontSize: 12,
        fontWeight: selected ? 500 : 400,
        minWidth: 0,
        // Match the selected (primary) variant's 1px border so selecting a
        // cell doesn't resize the grid.
        ...(!selected && { border: '1px solid transparent' }),
        ...(isToday && {
          fontWeight: 600,
          // A quiet inset hairline marks the current period without
          // shifting layout or competing with the selection.
          ...(!selected && {
            boxShadow: `inset 0 0 0 1px ${theme.hairlineStrong}`,
            color: theme.pageText,
          }),
        }),
        ...(inRange &&
          !selected && {
            backgroundColor: theme.datePickerRangeBackground,
            borderRadius:
              rangeEdge === 'start'
                ? `${radius.sm}px 0 0 ${radius.sm}px`
                : rangeEdge === 'end'
                  ? `0 ${radius.sm}px ${radius.sm}px 0`
                  : 0,
          }),
      }}
    >
      {children}
    </Button>
  );
}
