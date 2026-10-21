import React from 'react';
import { useTranslation } from 'react-i18next';

import { theme } from '@actual-app/components/theme';
import { elevation, motion, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';

import { useBudgetMonthCount } from './BudgetMonthCountContext';

const GLYPH_WIDTH = 16;
const GLYPH_HEIGHT = 12;
// Half the 1px stroke, so the frame sits inside the glyph box.
const STROKE_INSET = 0.5;

// The budget table in miniature: a frame split into as many columns as
// the option shows months, drawn in a 1px stroke.
function MonthColumnsGlyph({ count }: { count: number }) {
  const innerWidth = GLYPH_WIDTH - 2 * STROKE_INSET;
  const dividers = Array.from(
    { length: count - 1 },
    (_, index) => STROKE_INSET + (innerWidth * (index + 1)) / count,
  );

  return (
    <svg
      width={GLYPH_WIDTH}
      height={GLYPH_HEIGHT}
      viewBox={`0 0 ${GLYPH_WIDTH} ${GLYPH_HEIGHT}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      <rect
        x={STROKE_INSET}
        y={STROKE_INSET}
        width={innerWidth}
        height={GLYPH_HEIGHT - 2 * STROKE_INSET}
        rx={1.5}
      />
      {dividers.map(x => (
        <line
          key={x}
          x1={x}
          x2={x}
          y1={STROKE_INSET}
          y2={GLYPH_HEIGHT - STROKE_INSET}
        />
      ))}
    </svg>
  );
}

type MonthCountOptionProps = {
  count: number;
  isChosen: boolean;
  onClick: () => void;
};

// One segment of the tray: the chosen count sits on a white pill in ink,
// the others recede.
function MonthCountOption({ count, isChosen, onClick }: MonthCountOptionProps) {
  return (
    <View
      onClick={onClick}
      style={{
        width: 28,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.sm,
        cursor: 'pointer',
        color: isChosen ? theme.pageText : theme.pageTextSubdued,
        backgroundColor: isChosen
          ? theme.buttonNormalBackground
          : 'transparent',
        boxShadow: isChosen ? elevation.xs : 'none',
        transition: `background-color ${motion.base} ${motion.ease}, color ${motion.base} ${motion.ease}`,
        ':hover': { color: theme.pageText },
      }}
    >
      <MonthColumnsGlyph count={count} />
    </View>
  );
}

type MonthCountSelectorProps = {
  maxMonths: number;
  onChange: (value: number) => void;
};

export function MonthCountSelector({
  maxMonths,
  onChange,
}: MonthCountSelectorProps) {
  const { t } = useTranslation();

  const { displayMax } = useBudgetMonthCount();

  // It doesn't make sense to show anything if we can only fit one
  // month
  if (displayMax <= 1) {
    return null;
  }

  const options = [];
  for (let count = 1; count <= displayMax; count++) {
    options.push(
      <MonthCountOption
        key={count}
        count={count}
        isChosen={maxMonths === count}
        onClick={() => onChange(count)}
      />,
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        padding: 2,
        marginRight: 20,
        backgroundColor: theme.trayBackground,
        border: '1px solid ' + theme.trayBorder,
        borderRadius: radius.md,
        WebkitAppRegion: 'no-drag',
      }}
      title={t('Choose the number of months shown at a time')}
    >
      {options}
    </View>
  );
}
