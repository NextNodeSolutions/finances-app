// @ts-strict-ignore
import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import {
  SvgCheveronLeft,
  SvgCheveronRight,
} from '@actual-app/components/icons/v1';
import { SvgCalendar } from '@actual-app/components/icons/v2';
import { styles } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import { motion, radius } from '@actual-app/components/tokens';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';

import { Link } from '#components/common/Link';
import { useLocale } from '#hooks/useLocale';
import { useResizeObserver } from '#hooks/useResizeObserver';

import type { MonthBounds } from './MonthsContext';

type MonthPickerProps = {
  startMonth: string;
  numDisplayed: number;
  monthBounds: MonthBounds;
  style: CSSProperties;
  onSelect: (month: string) => void;
};

export const MonthPicker = ({
  startMonth,
  numDisplayed,
  monthBounds,
  style,
  onSelect,
}: MonthPickerProps) => {
  const locale = useLocale();
  const { t } = useTranslation();
  const [hoverId, setHoverId] = useState(null);
  const [targetMonthCount, setTargetMonthCount] = useState(12);

  const currentMonth = monthUtils.currentMonth();
  const firstSelectedMonth = startMonth;

  const lastSelectedMonth = monthUtils.addMonths(
    firstSelectedMonth,
    numDisplayed - 1,
  );

  const range = monthUtils.rangeInclusive(
    monthUtils.subMonths(
      firstSelectedMonth,
      Math.floor(targetMonthCount / 2 - numDisplayed / 2),
    ),
    monthUtils.addMonths(
      lastSelectedMonth,
      Math.floor(targetMonthCount / 2 - numDisplayed / 2),
    ),
  );

  const firstSelectedIndex =
    Math.floor(range.length / 2) - Math.floor(numDisplayed / 2);
  const lastSelectedIndex = firstSelectedIndex + numDisplayed - 1;

  const [size, setSize] = useState('small');
  const containerRef = useResizeObserver(rect => {
    setSize(rect.width <= 400 ? 'small' : 'big');
    setTargetMonthCount(
      Math.min(Math.max(Math.floor(rect.width / 50), 12), 24),
    );
  });

  const yearHeadersShown = [];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...style,
      }}
    >
      <View
        innerRef={containerRef}
        style={{
          flexDirection: 'row',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Link
          variant="button"
          buttonVariant="bare"
          onPress={() => onSelect(currentMonth)}
          style={{ ...arrowButtonStyle, marginRight: 4 }}
        >
          <View title={t('Today')}>
            <SvgCalendar style={{ width: 14, height: 14 }} />
          </View>
        </Link>
        <Link
          variant="button"
          buttonVariant="bare"
          onPress={() => onSelect(monthUtils.prevMonth(startMonth))}
          style={{ ...arrowButtonStyle, marginRight: 8 }}
        >
          <View title={t('Previous month')}>
            <SvgCheveronLeft style={{ width: 14, height: 14 }} />
          </View>
        </Link>
        {range.map((month, idx) => {
          const monthName = monthUtils.format(month, 'MMM', locale);
          const selected =
            idx >= firstSelectedIndex && idx <= lastSelectedIndex;

          const lastHoverId = hoverId + numDisplayed - 1;
          const hovered =
            hoverId === null ? false : idx >= hoverId && idx <= lastHoverId;

          const current = currentMonth === month;
          const year = monthUtils.getYear(month);

          let showYearHeader = false;

          if (!yearHeadersShown.includes(year)) {
            yearHeadersShown.push(year);
            showYearHeader = true;
          }

          const isMonthBudgeted =
            month >= monthBounds.start && month <= monthBounds.end;

          return (
            <View
              key={month}
              data-testid={selected ? 'selected-budget-month' : undefined}
              data-month={selected ? month : undefined}
              style={getMonthCellStyle({
                width: size === 'big' ? 35 : 20,
                isSelected: selected,
                isHovered: hovered,
                isCurrent: current,
                isBudgeted: isMonthBudgeted,
                isRangeStart:
                  idx === firstSelectedIndex || (idx === hoverId && !selected),
                isRangeEnd:
                  idx === lastSelectedIndex ||
                  (idx === lastHoverId && !selected),
              })}
              onClick={() => onSelect(month)}
              onMouseEnter={() => setHoverId(idx)}
              onMouseLeave={() => setHoverId(null)}
            >
              <View>
                {size === 'small' ? monthName[0] : monthName}
                {showYearHeader && (
                  <View
                    style={{
                      ...styles.tnum,
                      position: 'absolute',
                      top: -17,
                      left: 0,
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                      color: isMonthBudgeted
                        ? theme.pageTextLight
                        : theme.pageTextSubdued,
                    }}
                  >
                    {year}
                  </View>
                )}
              </View>
            </View>
          );
        })}
        <Link
          variant="button"
          buttonVariant="bare"
          onPress={() => onSelect(monthUtils.nextMonth(startMonth))}
          style={{ ...arrowButtonStyle, marginLeft: 8 }}
        >
          <View title={t('Next month')}>
            <SvgCheveronRight style={{ width: 14, height: 14 }} />
          </View>
        </Link>
        {/*Keep range centered*/}
        <span style={{ width: 26, marginLeft: 4 }} />
      </View>
    </View>
  );
};

const arrowButtonStyle: CSSProperties = {
  width: 26,
  height: 26,
  padding: 0,
  borderRadius: radius.md,
  color: theme.pageTextLight,
};

type MonthCellState = {
  width: number;
  isSelected: boolean;
  isHovered: boolean;
  isCurrent: boolean;
  isBudgeted: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
};

function getMonthCellBackground({
  isSelected,
  isHovered,
}: Pick<MonthCellState, 'isSelected' | 'isHovered'>) {
  if (isSelected) {
    return isHovered
      ? theme.buttonPrimaryBackgroundHover
      : theme.buttonPrimaryBackground;
  }
  return isHovered ? theme.buttonBareBackgroundHover : 'transparent';
}

// Selected months read as one ink pill; the hovered range previews the
// next selection; today carries a hairline ring.
function getMonthCellStyle({
  width,
  isSelected,
  isHovered,
  isCurrent,
  isBudgeted,
  isRangeStart,
  isRangeEnd,
}: MonthCellState): CSSProperties {
  const isInRange = isSelected || isHovered;
  const startRadius = !isInRange || isRangeStart ? radius.sm : 0;
  const endRadius = !isInRange || isRangeEnd ? radius.sm : 0;

  return {
    alignItems: 'center',
    justifyContent: 'center',
    width,
    height: 24,
    textAlign: 'center',
    userSelect: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: isCurrent ? 600 : 500,
    color: isBudgeted ? theme.pageTextLight : theme.pageTextSubdued,
    ...(!isBudgeted && {
      textDecoration: 'line-through',
      textDecorationThickness: 1,
    }),
    ...(isHovered && { color: theme.pageText }),
    ...(isSelected && { color: theme.buttonPrimaryText }),
    backgroundColor: getMonthCellBackground({ isSelected, isHovered }),
    boxShadow:
      isCurrent && !isInRange
        ? 'inset 0 0 0 1px ' + theme.hairlineStrong
        : 'none',
    borderTopLeftRadius: startRadius,
    borderBottomLeftRadius: startRadius,
    borderTopRightRadius: endRadius,
    borderBottomRightRadius: endRadius,
    transition: `background-color ${motion.fast} ${motion.ease}, color ${motion.fast} ${motion.ease}`,
  };
}
