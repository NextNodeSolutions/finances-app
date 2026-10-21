import {
  Button as AriaButton,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarMonthPicker,
  I18nProvider,
  RangeCalendar,
} from 'react-aria-components';

import { css } from '@emotion/css';
import { parseDate } from '@internationalized/date';

import { SvgCheveronLeft, SvgCheveronRight } from '#icons/v1';
import { styles } from '#styles';
import type { CSSProperties } from '#styles';
import { theme } from '#theme';
import { radius } from '#tokens';
import { View } from '#View';

import type { DateRangePickerLabels, FirstDayOfWeek } from './util';
import { YearSelect } from './YearSelect';

const calendarStyles: CSSProperties = {
  // A definite width so the header and the percentage-sized grid line up;
  // a 100%-wide table inside the shrink-to-fit popover blows up otherwise.
  width: 260,
  '& .calendar-header': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 10,
    '& button': {
      color: 'inherit',
      background: 'none',
      border: 'none',
      borderRadius: radius.sm,
      padding: 5,
      cursor: 'pointer',
      display: 'flex',
      '&:hover': { backgroundColor: theme.buttonBareBackgroundHover },
      '&[disabled]': { opacity: 0.4, cursor: 'default' },
      '&[data-focus-visible]': styles.focusRing,
    },
    '& select': {
      color: 'inherit',
      background: 'none',
      border: 'none',
      borderRadius: radius.sm,
      padding: 4,
      fontWeight: 600,
      fontSize: 13,
      cursor: 'pointer',
      '&:hover': { backgroundColor: theme.buttonBareBackgroundHover },
      // The open dropdown paints the browser's default (light) popup, so
      // inherited light text is invisible without explicit option colors.
      '& option': {
        backgroundColor: theme.tooltipBackground,
        color: theme.tooltipText,
      },
    },
  },
  '& .react-aria-CalendarGrid': {
    borderCollapse: 'collapse',
    // Stretch to the header's width (month/year selects) with equal columns.
    width: '100%',
    tableLayout: 'fixed',
  },
  '& .react-aria-CalendarHeaderCell': {
    color: theme.pageTextSubdued,
    fontSize: 11,
    fontWeight: 500,
    textAlign: 'center',
    padding: '2px 0 6px',
  },
  '& .react-aria-CalendarCell': {
    minWidth: 28,
    height: 28,
    lineHeight: '28px',
    textAlign: 'center',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    cursor: 'pointer',
    '&[data-outside-month]': {
      display: 'none',
    },
    '&[data-hovered]': {
      backgroundColor: theme.buttonBareBackgroundHover,
      borderRadius: radius.sm,
    },
    // Same current-day treatment as the month grid's GridButton.
    '&[data-today]': {
      fontWeight: 600,
      boxShadow: `inset 0 0 0 1px ${theme.hairlineStrong}`,
      borderRadius: radius.sm,
    },
    '&[data-selected]': {
      backgroundColor: theme.datePickerRangeBackground,
      boxShadow: 'none',
      borderRadius: 0,
    },
    '&[data-selection-start], &[data-selection-end]': {
      backgroundColor: theme.buttonPrimaryBackground,
      color: theme.buttonPrimaryText,
      fontWeight: 500,
    },
    '&[data-selection-start]': {
      borderRadius: `${radius.sm}px 0 0 ${radius.sm}px`,
    },
    '&[data-selection-end]': {
      borderRadius: `0 ${radius.sm}px ${radius.sm}px 0`,
    },
    '&[data-selection-start][data-selection-end]': {
      borderRadius: radius.sm,
    },
    '&[data-disabled]': {
      opacity: 0.4,
      cursor: 'default',
    },
    '&[data-focus-visible]': {
      outline: `2px solid ${theme.focusRing}`,
      outlineOffset: -2,
    },
  },
};

const calendarClassName = css(calendarStyles);

type DayRangeCalendarProps = {
  /** Inclusive day-shaped (`yyyy-MM-dd`) range and bounds. */
  start: string;
  end: string;
  min: string;
  max: string;
  firstDayOfWeek: FirstDayOfWeek;
  locale: string;
  labels: Pick<
    DateRangePickerLabels,
    'dateRange' | 'previousMonth' | 'nextMonth' | 'year'
  >;
  onChange: (start: string, end: string) => void;
};

/** Day-granularity range calendar with month/year dropdowns in the header. */
export function DayRangeCalendar({
  start,
  end,
  min,
  max,
  firstDayOfWeek,
  locale,
  labels,
  onChange,
}: DayRangeCalendarProps) {
  return (
    <View className={calendarClassName}>
      <I18nProvider locale={locale}>
        <RangeCalendar
          aria-label={labels.dateRange}
          value={{ start: parseDate(start), end: parseDate(end) }}
          minValue={parseDate(min)}
          maxValue={parseDate(max)}
          firstDayOfWeek={firstDayOfWeek}
          onChange={range =>
            onChange(range.start.toString(), range.end.toString())
          }
        >
          <View className="calendar-header">
            <AriaButton slot="previous" aria-label={labels.previousMonth}>
              <SvgCheveronLeft width={16} height={16} />
            </AriaButton>
            <CalendarMonthPicker format="long">
              {({ 'aria-label': ariaLabel, value, onChange, items }) => (
                <select
                  aria-label={ariaLabel}
                  value={value as number}
                  onChange={e => onChange(Number(e.target.value))}
                >
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.formatted}
                    </option>
                  ))}
                </select>
              )}
            </CalendarMonthPicker>
            <YearSelect label={labels.year} />
            <AriaButton slot="next" aria-label={labels.nextMonth}>
              <SvgCheveronRight width={16} height={16} />
            </AriaButton>
          </View>
          <CalendarGrid weekdayStyle="narrow">
            <CalendarGridHeader>
              {day => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
            </CalendarGridHeader>
            <CalendarGridBody>
              {date => <CalendarCell date={date} />}
            </CalendarGridBody>
          </CalendarGrid>
        </RangeCalendar>
      </I18nProvider>
    </View>
  );
}
