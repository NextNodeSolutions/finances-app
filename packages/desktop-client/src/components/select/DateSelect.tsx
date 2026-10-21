import {
  forwardRef,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  ChangeEvent,
  ComponentProps,
  JSX,
  KeyboardEvent,
  Ref,
} from 'react';
import {
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Heading,
  I18nProvider,
} from 'react-aria-components';
import { Trans, useTranslation } from 'react-i18next';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import {
  SvgCheveronLeft,
  SvgCheveronRight,
} from '@actual-app/components/icons/v1';
import { Input } from '@actual-app/components/input';
import { Popover } from '@actual-app/components/popover';
import { styles } from '@actual-app/components/styles';
import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import {
  currentDate,
  getDayMonthFormat,
  getDayMonthRegex,
  getShortYearFormat,
  getShortYearRegex,
} from '@actual-app/core/shared/months';
import { css } from '@emotion/css';
import { CalendarDate } from '@internationalized/date';
import { addDays, format, isValid, parse, parseISO, subDays } from 'date-fns';

import { LabeledCheckbox } from '#components/forms/LabeledCheckbox';
import { InputField } from '#components/mobile/MobileForms';
import { useLanguage } from '#hooks/useLocale';
import { useMergedRefs } from '#hooks/useMergedRefs';
import { useSyncedPref } from '#hooks/useSyncedPref';

import { getFirstDayOfWeek } from './getFirstDayOfWeek';
import type { FirstDayOfWeek } from './getFirstDayOfWeek';

function toCalendarDate(date: Date): CalendarDate {
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}

function fromCalendarDate(date: CalendarDate): Date {
  return new Date(date.year, date.month - 1, date.day);
}

type CalendarTitleProps = {
  date: CalendarDate;
  locale: string;
};

// The visible month and year in the locale's own order, with the year set
// apart so it can take the mono label face.
function CalendarTitle({ date, locale }: CalendarTitleProps) {
  const parts = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).formatToParts(fromCalendarDate(date));

  return (
    <>
      {parts.map(part =>
        part.type === 'year' ? (
          <span key="year" className="calendar-header-year">
            {part.value}
          </span>
        ) : (
          part.value
        ),
      )}
    </>
  );
}

// The calendar is white paper: no tiles behind the days, ink for the
// chosen day, a hairline ring for today. Its frame comes from the popover
// (or from the embedding surface), so the calendar itself stays flat.
const pickerStyles: CSSProperties = {
  '& .react-aria-Calendar': {
    color: theme.calendarText,
    background: theme.calendarBackground,
    borderRadius: styles.menuBorderRadius,
    padding: 12,
  },
  '& .calendar-header': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    '& button': {
      color: theme.pageTextLight,
      background: 'none',
      border: 'none',
      borderRadius: radius.sm,
      padding: 5,
      cursor: 'pointer',
      display: 'flex',
      '&:hover': {
        backgroundColor: theme.buttonBareBackgroundHover,
        color: theme.calendarText,
      },
    },
  },
  // Month engraved in the display serif with the year as a quiet mono
  // label, like the budget's month headings.
  '& .calendar-header-title': {
    ...styles.display,
    fontSize: 16,
    lineHeight: '22px',
    margin: 0,
    color: theme.calendarText,
    backgroundColor: theme.calendarBackground,
  },
  '& .calendar-header-year': {
    ...styles.monoLabel,
    marginInline: 3,
    color: theme.tableHeaderText,
  },
  '& .react-aria-CalendarGrid': {
    borderCollapse: 'separate',
    borderSpacing: 2,
  },
  '& .react-aria-CalendarHeaderCell': {
    ...styles.monoLabel,
    color: theme.tableHeaderText,
    textAlign: 'center',
    padding: '0 0 4px',
  },
  '& .react-aria-CalendarCell': {
    width: 28,
    height: 28,
    lineHeight: '28px',
    textAlign: 'center',
    fontSize: 12.5,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    cursor: 'pointer',
    borderRadius: radius.sm,
    color: theme.calendarItemText,

    '&[data-hovered]': {
      backgroundColor: theme.buttonBareBackgroundHover,
    },
    '&[data-outside-month]': {
      color: theme.tableTextSubdued,
    },
    '&[data-today]': {
      fontWeight: 600,
      boxShadow: `inset 0 0 0 1px ${theme.hairlineStrong}`,
    },
    '&[data-selected]': {
      backgroundColor: theme.buttonPrimaryBackground,
      color: theme.buttonPrimaryText,
      fontWeight: 500,
      boxShadow: 'none',
    },
    '&[data-disabled]': {
      opacity: 0.4,
      cursor: 'default',
    },
    '&[data-focus-visible]': {
      outline: `2px solid ${theme.focusRing}`,
      outlineOffset: 1,
    },
  },
};

type DatePickerProps = {
  value: string;
  dateFormat: string;
  locale: string;
  firstDayOfWeek: FirstDayOfWeek;
  onUpdate: (selectedDate: Date) => void;
  onSelect: (selectedDate: Date) => void;
  attached?: boolean;
  embedded?: boolean;
};

type DatePickerForwardedRef = {
  handleInputKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
};
const DatePicker = forwardRef<DatePickerForwardedRef, DatePickerProps>(
  (
    {
      value,
      dateFormat,
      locale,
      firstDayOfWeek,
      onUpdate,
      onSelect,
      attached,
      embedded,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const parsedValue = value ? parse(value, dateFormat, currentDate()) : null;
    const focusedCalendarDate = toCalendarDate(
      parsedValue && isValid(parsedValue) ? parsedValue : currentDate(),
    );

    // Controlled so the header arrows can change the visible month without
    // involving focus: react-aria's own prev/next buttons steal focus from
    // the text input on press, whose blur closes the picker.
    const [focusedDate, setFocusedDate] = useState(focusedCalendarDate);
    const focusedKey = focusedCalendarDate.toString();
    const [prevFocusedKey, setPrevFocusedKey] = useState(focusedKey);
    if (prevFocusedKey !== focusedKey) {
      setPrevFocusedKey(focusedKey);
      setFocusedDate(focusedCalendarDate);
    }

    useImperativeHandle(
      ref,
      () => ({
        handleInputKeyDown(e) {
          const jsDate = fromCalendarDate(focusedCalendarDate);

          let newDate = null;
          switch (e.key) {
            case 'ArrowLeft':
              e.preventDefault();
              newDate = subDays(jsDate, 1);
              break;
            case 'ArrowUp':
              e.preventDefault();
              newDate = subDays(jsDate, 7);
              break;
            case 'ArrowRight':
              e.preventDefault();
              newDate = addDays(jsDate, 1);
              break;
            case 'ArrowDown':
              e.preventDefault();
              newDate = addDays(jsDate, 7);
              break;
            default:
          }

          if (newDate) {
            onUpdate(newDate);
          }
        },
      }),
      [focusedCalendarDate, onUpdate],
    );

    return (
      <View
        className={css([
          pickerStyles,
          attached && {
            '& .react-aria-Calendar': {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          },
          // Embedded: stretch the grid to the container with equal columns
          // (same technique as DayRangeCalendar). The container must have a
          // definite width — a 100%-wide table blows up shrink-to-fit boxes.
          embedded && {
            '& .react-aria-Calendar': {
              width: '100%',
              border: '1px solid ' + theme.hairline,
            },
            '& .react-aria-CalendarGrid': {
              width: '100%',
              tableLayout: 'fixed',
            },
            '& .react-aria-CalendarCell': { width: 'auto' },
          },
          { flex: 1 },
        ])}
        data-date-picker
        onMouseDown={e => e.preventDefault()}
      >
        <I18nProvider locale={locale}>
          <Calendar
            value={focusedCalendarDate}
            focusedValue={focusedDate}
            onFocusChange={setFocusedDate}
            firstDayOfWeek={firstDayOfWeek}
            onChange={date => onSelect(fromCalendarDate(date))}
          >
            <View className="calendar-header">
              <button
                type="button"
                tabIndex={-1}
                aria-label={t('Previous month')}
                onClick={() => setFocusedDate(d => d.subtract({ months: 1 }))}
              >
                <SvgCheveronLeft width={16} height={16} />
              </button>
              <Heading className="calendar-header-title">
                <CalendarTitle date={focusedDate} locale={locale} />
              </Heading>
              <button
                type="button"
                tabIndex={-1}
                aria-label={t('Next month')}
                onClick={() => setFocusedDate(d => d.add({ months: 1 }))}
              >
                <SvgCheveronRight width={16} height={16} />
              </button>
            </View>
            <CalendarGrid>
              <CalendarGridHeader>
                {day => (
                  <CalendarHeaderCell>{day.slice(0, 2)}</CalendarHeaderCell>
                )}
              </CalendarGridHeader>
              <CalendarGridBody>
                {date => <CalendarCell date={date} />}
              </CalendarGridBody>
            </CalendarGrid>
          </Calendar>
        </I18nProvider>
      </View>
    );
  },
);

DatePicker.displayName = 'DatePicker';

function defaultShouldSaveFromKey(e: KeyboardEvent<HTMLInputElement>) {
  return e.key === 'Enter';
}

type DateSelectProps = {
  id?: string;
  containerProps?: ComponentProps<typeof View>;
  inputProps?: ComponentProps<typeof Input>;
  value: string;
  isOpen?: boolean;
  embedded?: boolean;
  dateFormat: string;
  openOnFocus?: boolean;
  ref?: Ref<HTMLInputElement>;
  shouldSaveFromKey?: (e: KeyboardEvent<HTMLInputElement>) => boolean;
  clearOnBlur?: boolean;
  onUpdate?: (selectedDate: string) => void;
  onSelect: (selectedDate: string) => void;
  transferDateSyncChecked?: boolean;
  onTransferDateSyncChange?: (checked: boolean) => void;
};

function DateSelectDesktop({
  id,
  containerProps,
  inputProps,
  value: defaultValue,
  isOpen,
  embedded,
  dateFormat = 'yyyy-MM-dd',
  openOnFocus = true,
  ref,
  shouldSaveFromKey = defaultShouldSaveFromKey,
  clearOnBlur = true,
  onUpdate,
  onSelect,
  transferDateSyncChecked,
  onTransferDateSyncChange,
}: DateSelectProps) {
  const parsedDefaultValue = useMemo(() => {
    if (defaultValue) {
      const date = parseISO(defaultValue);
      if (isValid(date)) {
        return format(date, dateFormat);
      }
    }
    return '';
  }, [defaultValue, dateFormat]);

  const picker = useRef<DatePickerForwardedRef | null>(null);
  const [value, setValue] = useState(parsedDefaultValue);
  const [open, setOpen] = useState(embedded || isOpen || false);
  const innerRef = useRef<HTMLInputElement | null>(null);
  const mergedRef = useMergedRefs<HTMLInputElement>(innerRef, ref);

  const [selectedValue, setSelectedValue] = useState(value);

  const [_firstDayOfWeekIdx] = useSyncedPref('firstDayOfWeekIdx');
  const firstDayOfWeek = getFirstDayOfWeek(_firstDayOfWeekIdx);

  const locale = useLanguage();

  useEffect(() => setValue(parsedDefaultValue), [parsedDefaultValue]);

  const onUpdateEffect = useEffectEvent((newValue: string) => {
    if (getDayMonthRegex(dateFormat).test(newValue)) {
      // Support only entering the month and day (4/5). This is complex
      // because of the various date formats - we need to derive
      // the right day/month format from it
      const test = parse(newValue, getDayMonthFormat(dateFormat), new Date());
      if (isValid(test)) {
        onUpdate?.(format(test, 'yyyy-MM-dd'));
        setSelectedValue(format(test, dateFormat));
      }
    } else if (getShortYearRegex(dateFormat).test(newValue)) {
      // Support entering the year as only two digits (4/5/19)
      const test = parse(newValue, getShortYearFormat(dateFormat), new Date());
      if (isValid(test)) {
        onUpdate?.(format(test, 'yyyy-MM-dd'));
        setSelectedValue(format(test, dateFormat));
      }
    } else {
      const test = parse(newValue, dateFormat, new Date());
      if (isValid(test)) {
        const date = format(test, 'yyyy-MM-dd');
        onUpdate?.(date);
        setSelectedValue(newValue);
      }
    }
  });

  useEffect(() => {
    onUpdateEffect(value);
  }, [value]);

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (
      ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) &&
      !e.shiftKey &&
      !e.metaKey &&
      !e.altKey &&
      open
    ) {
      picker.current?.handleInputKeyDown(e);
    } else if (e.key === 'Escape') {
      setValue(parsedDefaultValue);
      setSelectedValue(parsedDefaultValue);

      if (parsedDefaultValue === value) {
        if (open) {
          if (!embedded) {
            e.stopPropagation();
          }

          setOpen(false);
        }
      } else {
        setOpen(true);
        onUpdate?.(defaultValue);
      }
    } else if (shouldSaveFromKey(e)) {
      if (selectedValue) {
        setValue(selectedValue);
        const date = parse(selectedValue, dateFormat, new Date());
        onSelect(format(date, 'yyyy-MM-dd'));
      }

      setOpen(false);

      if (open && e.key === 'Enter') {
        // This stops the event from propagating up
        e.stopPropagation();
        e.preventDefault();
      }

      const { onKeyDown } = inputProps || {};
      onKeyDown?.(e);
    } else if (!open) {
      setOpen(true);
      if (innerRef.current) {
        innerRef.current.setSelectionRange(0, 10000);
      }
    }
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
  }

  const maybeWrapTooltip = (content: JSX.Element) => {
    if (embedded) {
      return open ? content : null;
    }

    return (
      <Popover
        triggerRef={innerRef}
        placement="bottom start"
        offset={2}
        isOpen={open}
        isNonModal
        onOpenChange={() => setOpen(false)}
        style={styles.popover}
        data-testid="date-select-tooltip"
      >
        {content}
      </Popover>
    );
  };

  return (
    <View {...containerProps}>
      <Input
        id={id}
        {...inputProps}
        ref={mergedRef}
        value={value}
        onPointerUp={() => {
          if (!embedded) {
            setOpen(true);
          }
        }}
        onKeyDown={onKeyDown}
        onChange={onChange}
        onFocus={e => {
          if (!embedded && openOnFocus) {
            setOpen(true);
          }
          inputProps?.onFocus?.(e);
        }}
        onBlur={e => {
          // react-aria moves focus into the calendar when it's clicked; keep
          // the picker open and pull focus back so keyboard entry still works.
          if (
            e.relatedTarget instanceof Element &&
            e.relatedTarget.closest('[data-date-picker]')
          ) {
            innerRef.current?.focus();
            return;
          }
          if (!embedded) {
            setOpen(false);
          }
          inputProps?.onBlur?.(e);

          if (clearOnBlur) {
            // If value is empty, reset to previously selected value
            // instead of saving an empty date (which the server rejects).
            if (value === '') {
              if (selectedValue) {
                setValue(selectedValue);
                const date = parse(selectedValue, dateFormat, new Date());
                if (date instanceof Date && !isNaN(date.valueOf())) {
                  onSelect(format(date, 'yyyy-MM-dd'));
                }
              }
            } else {
              setValue(selectedValue || '');

              const date = parse(selectedValue, dateFormat, new Date());
              if (date instanceof Date && !isNaN(date.valueOf())) {
                onSelect(format(date, 'yyyy-MM-dd'));
              }
            }
          }
        }}
      />
      {maybeWrapTooltip(
        <View
          style={
            onTransferDateSyncChange
              ? { borderRadius: styles.menuBorderRadius, overflow: 'hidden' }
              : undefined
          }
        >
          <DatePicker
            ref={picker}
            value={selectedValue}
            dateFormat={dateFormat}
            locale={locale}
            firstDayOfWeek={firstDayOfWeek}
            attached={!!onTransferDateSyncChange}
            embedded={embedded}
            onUpdate={date => {
              setSelectedValue(format(date, dateFormat));
              onUpdate?.(format(date, 'yyyy-MM-dd'));
            }}
            onSelect={date => {
              setValue(format(date, dateFormat));
              onSelect(format(date, 'yyyy-MM-dd'));
              setOpen(false);
            }}
          />
          {onTransferDateSyncChange && (
            <LabeledCheckbox
              id={`${id ?? 'date-select'}-transfer-date-sync`}
              checked={transferDateSyncChecked}
              onChange={e => onTransferDateSyncChange(e.target.checked)}
              onMouseDown={e => e.preventDefault()}
              style={{
                padding: '6px 12px',
                borderTop: '1px solid ' + theme.hairline,
                backgroundColor: theme.calendarBackground,
                color: theme.calendarText,
              }}
            >
              <Trans>Sync both transfer dates</Trans>
            </LabeledCheckbox>
          )}
        </View>,
      )}
    </View>
  );
}

function DateSelectMobile(props: DateSelectProps) {
  const { style: inputStyle, ...restInputProps } = props.inputProps ?? {};
  return (
    <View>
      <InputField
        id={props.id}
        type="date"
        value={props.value ?? ''}
        onChange={event => {
          props.onSelect(event.target.value);
        }}
        style={{ height: 28, ...inputStyle }}
        {...restInputProps}
      />
    </View>
  );
}

export function DateSelect(props: DateSelectProps) {
  const { isNarrowWidth } = useResponsive();

  if (isNarrowWidth) {
    return <DateSelectMobile {...props} />;
  }

  return <DateSelectDesktop {...props} />;
}
